<?php

namespace App\Exports;

use App\Models\VoucherDeltamas;
use Carbon\Carbon;
use Illuminate\Support\Facades\DB;
use Maatwebsite\Excel\Concerns\FromCollection;
use Maatwebsite\Excel\Concerns\WithHeadings;
use Maatwebsite\Excel\Concerns\ShouldAutoSize;
use Maatwebsite\Excel\Concerns\WithStyles;
use Maatwebsite\Excel\Concerns\WithMapping;
use PhpOffice\PhpSpreadsheet\Worksheet\Worksheet;

class VoucherDeltamasExport implements 
    FromCollection, 
    WithHeadings, 
    ShouldAutoSize, 
    WithStyles, 
    WithMapping
{
    private $startDate;
    private $endDate;
    private $extraInfos = []; // lookup array

    public function __construct($startDate, $endDate)
    {
        $this->startDate = $startDate;
        $this->endDate = $endDate;
        $this->loadExtraInfos();
    }

    /**
     * Load extra information from external databases
     */
    private function loadExtraInfos()
    {
        $voucherDeltamas = VoucherDeltamas::with([
            'purchasedPacket.car',
            'purchasedPacket.vouchers'
        ])
        ->whereBetween('date', [$this->startDate, $this->endDate])
        ->get();
        
        $plateNumbers = [];
        foreach ($voucherDeltamas as $deltamas) {
            $car = $deltamas->purchasedPacket?->car;
            if ($car && $car->plate_number) {
                $plateNumbers[] = $car->plate_number;
            }
        }
        
        $plates = collect($plateNumbers)
            ->filter()
            ->map(fn($plate) => preg_replace('/\s+/', '', $plate))
            ->unique();

        if ($plates->isNotEmpty()) {
            $adminResults = DB::connection('admin')
                ->table('car_stock_plats')
                ->join('car_stocks', 'car_stocks.id', '=', 'car_stock_plats.car_stock_id')
                ->join('detail_pre_delivery_centres', 'detail_pre_delivery_centres.id', '=', 'car_stocks.detail_pre_delivery_centre_id')
                ->leftJoin('matchings', 'matchings.car_stock_id', '=', 'car_stocks.id')
                ->leftJoin('spk_registration', 'spk_registration.id', '=', 'matchings.spk_registration_id')
                ->leftJoin('delivery_orders', 'delivery_orders.car_stock_id', '=', 'car_stocks.id')
                ->whereIn('car_stock_plats.nopol', $plates)
                ->select(
                    'car_stock_plats.nopol',
                    'detail_pre_delivery_centres.chassis_number', 
                    'spk_registration.no as spk_no',
                    'delivery_orders.date as tanggal_do'
                )
                ->get();

            $lookup = $adminResults->mapWithKeys(function ($row) {
                $plateKey = preg_replace('/\s+/', '', $row->nopol);
                return [
                    $plateKey => [
                        'chassis' => $row->chassis_number,
                        'spk_no' => $row->spk_no,
                        'tanggal_do' => $row->tanggal_do,
                    ],
                ];
            });

            // Step 2: spk DB lookup
            $spkNos = $lookup->pluck('spk_no')->filter()->unique();
            $spkInfos = [];
            if ($spkNos->isNotEmpty()) {
                $spkInfos = DB::connection('sales')
                    ->table('spks')
                    ->whereIn('nota', $spkNos)
                    ->select('nota', 'sales_code', 'spv_code')
                    ->get()
                    ->mapWithKeys(fn($row) => [
                        $row->nota => [
                            'sales_code' => $row->sales_code,
                            'spv_code' => $row->spv_code,
                        ],
                    ])
                    ->toArray();
            }

            $this->extraInfos = $lookup->map(function ($row) use ($spkInfos) {
                $spkData = $row['spk_no'] && isset($spkInfos[$row['spk_no']])
                    ? $spkInfos[$row['spk_no']]
                    : ['sales_code' => '-', 'spv_code' => '-'];

                return [
                    'chassis' => $row['chassis'] ?? '-',
                    'spk_no' => $row['spk_no'] ?? '-',
                    'sales_code' => $spkData['sales_code'],
                    'spv_code' => $spkData['spv_code'],
                    'tanggal_do' => $row['tanggal_do'] ?? '-',
                ];
            })->toArray();
        }
    }

    /**
     * Get the collection of voucher deltamas for export
     */
    public function collection()
    {
        $vouchers = VoucherDeltamas::with([
            'purchasedPacket.customer',
            'purchasedPacket.car',
            'purchasedPacket.vouchers'
        ])
        ->whereBetween('date', [$this->startDate, $this->endDate])
        ->get();

        // Sort by Nota SPK for grouping
        $sortedVouchers = $vouchers->sortBy('nota_spk');

        $rows = collect();

        foreach ($sortedVouchers as $voucherDeltamas) {
            $purchasedPacket = $voucherDeltamas->purchasedPacket;
            $car = $purchasedPacket?->car;
            $customer = $purchasedPacket?->customer;
            $vouchers = $purchasedPacket?->vouchers ?? collect();

            $plateRaw = $car ? $car->plate_number : '';
            $plateClean = $plateRaw ? preg_replace('/\s+/', '', $plateRaw) : null;
            
            $extra = $plateClean && isset($this->extraInfos[$plateClean])
                ? $this->extraInfos[$plateClean]
                : ['chassis' => '-', 'spk_no' => '-', 'sales_code' => '-', 'spv_code' => '-', 'tanggal_do' => '-'];

            foreach ($vouchers as $voucher) {
                $rows->push([
                    'tanggal' => $voucherDeltamas->date ? Carbon::parse($voucherDeltamas->date)->format('d/m/Y') : '-',
                    'voucher_serial' => $voucher->serial_number,
                    'status' => $voucher->status, // Sold / Active / Used
                    'redeemed_at' => $voucher->usage_date ? Carbon::parse($voucher->usage_date)->format('d/m/Y H:i') : '-',
                    'nota_spk' => $voucherDeltamas->nota_spk ?? '-',
                    'customer_name' => $customer?->name ?? '-',
                    'plate_number' => $plateRaw,
                    'expired_at' => $purchasedPacket?->expired_at ? Carbon::parse($purchasedPacket->expired_at)->format('d/m/Y') : '-',
                    'sales_code_deltamas' => $voucherDeltamas->sales_code ?? '-',
                    'chassis' => $extra['chassis'],
                    'spk_no' => $extra['spk_no'],
                    'sales_code' => $extra['sales_code'],
                    'spv_code' => $extra['spv_code'],
                    'tanggal_do' => $extra['tanggal_do'],
                ]);
            }

            // If no vouchers found (shouldn't happen but good fallback), show one row with empty voucher data
            if ($vouchers->isEmpty()) {
                 $rows->push([
                    'tanggal' => $voucherDeltamas->date ? Carbon::parse($voucherDeltamas->date)->format('d/m/Y') : '-',
                    'voucher_serial' => '-',
                    'status' => '-',
                    'redeemed_at' => '-',
                    'nota_spk' => $voucherDeltamas->nota_spk ?? '-',
                    'customer_name' => $customer?->name ?? '-',
                    'plate_number' => $plateRaw,
                    'expired_at' => $purchasedPacket?->expired_at ? Carbon::parse($purchasedPacket->expired_at)->format('d/m/Y') : '-',
                    'sales_code_deltamas' => $voucherDeltamas->sales_code ?? '-',
                    'chassis' => $extra['chassis'],
                    'spk_no' => $extra['spk_no'],
                    'sales_code' => $extra['sales_code'],
                    'spv_code' => $extra['spv_code'],
                    'tanggal_do' => $extra['tanggal_do'],
                ]);
            }
        }

        return $rows;
    }

    /**
     * Map each row into spreadsheet format
     * Since we prepare the data in collection(), we just return the row here or remove WithMapping if returning array from collection.
     * But WithMapping is useful if we return objects. Here we return arrays.
     */
    public function map($row): array
    {
        return array_values($row);
    }

    /**
     * Column headings
     */
    public function headings(): array
    {
        return [
            'Tanggal',
            'Serial Number Voucher',
            'Status',
            'Redeemed At',
            'Nota SPK',
            'Nama Pelanggan',
            'Plat Nomor',
            'Kadaluarsa Pada',
            'Sales Code (Deltamas)',
            'Chassis Number',
            'SPK No',
            'Sales Code',
            'SPV Code',
            'Tanggal DO'
        ];
    }

    /**
     * Style header row
     */
    public function styles(Worksheet $sheet)
    {
        return [
            1 => ['font' => ['bold' => true]],
        ];
    }
}
