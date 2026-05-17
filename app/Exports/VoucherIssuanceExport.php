<?php

namespace App\Exports;

use App\Models\VoucherIssuance;
use Carbon\Carbon;
use Illuminate\Support\Facades\DB;
use Maatwebsite\Excel\Concerns\FromCollection;
use Maatwebsite\Excel\Concerns\WithHeadings;
use Maatwebsite\Excel\Concerns\ShouldAutoSize;
use Maatwebsite\Excel\Concerns\WithStyles;
use Maatwebsite\Excel\Concerns\WithMapping;
use PhpOffice\PhpSpreadsheet\Worksheet\Worksheet;

class VoucherIssuanceExport implements 
    FromCollection, 
    WithHeadings, 
    ShouldAutoSize, 
    WithStyles, 
    WithMapping
{
    private $voucherIssuance;
    private $extraInfos = []; // lookup array

    public function __construct(VoucherIssuance $voucherIssuance)
    {
        $this->voucherIssuance = $voucherIssuance;
        $this->loadExtraInfos();
    }

    /**
     * Load extra information from external databases
     */
    private function loadExtraInfos()
    {
        $vouchers = $this->voucherIssuance->vouchers()->with([
            'voucher.salesTransaction.car',
            'voucher.salesTransactionByDate.car'
        ])->get();
        
        $plateNumbers = [];
        foreach ($vouchers as $voucherIssuanceVoucher) {
            $voucher = $voucherIssuanceVoucher->voucher;
            $car = null;
            
            if ($voucher->salesTransaction && $voucher->salesTransaction->car) {
                $car = $voucher->salesTransaction->car;
            }
            elseif ($voucher->salesTransactionByDate && $voucher->salesTransactionByDate->car) {
                $car = $voucher->salesTransactionByDate->car;
            }
            
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
     * Get the collection of vouchers for export
     */
    public function collection()
    {
        $vouchers = $this->voucherIssuance->vouchers()->with([
            'voucher.salesTransaction.car',
            'voucher.salesTransactionByDate.car'
        ])->get();

        $totalVouchers = $vouchers->count();
        $amountPerVoucher = $totalVouchers > 0 ? $this->voucherIssuance->billed_amount / $totalVouchers : 0;

        // Add a "Total" indicator to the last item or append a new row
        $vouchers->push((object)[
            'is_summary' => true,
            'total_amount' => $this->voucherIssuance->billed_amount
        ]);

        return $vouchers;
    }

    /**
     * Map each row into spreadsheet format
     */
    public function map($voucherIssuanceVoucher): array
    {
        if (isset($voucherIssuanceVoucher->is_summary)) {
            return [
                'TOTAL',
                '',
                '',
                '',
                '',
                '',
                '',
                '',
                '',
                '',
                '',
                $voucherIssuanceVoucher->total_amount,
            ];
        }

        $voucher = $voucherIssuanceVoucher->voucher;
        
        // Try to get car from either relationship
        $car = null;
        if ($voucher->salesTransaction && $voucher->salesTransaction->car) {
            $car = $voucher->salesTransaction->car;
        } elseif ($voucher->salesTransactionByDate && $voucher->salesTransactionByDate->car) {
            $car = $voucher->salesTransactionByDate->car;
        }
        
        $plateRaw = $car ? $car->plate_number : '';

        // Get extra information
        $plateClean = $plateRaw ? preg_replace('/\s+/', '', $plateRaw) : null;
        $extra = $plateClean && isset($this->extraInfos[$plateClean])
            ? $this->extraInfos[$plateClean]
            : ['chassis' => '-', 'spk_no' => '-', 'sales_code' => '-', 'spv_code' => '-', 'tanggal_do' => '-'];

        $totalVouchers = $this->voucherIssuance->vouchers->count();
        $amount = $totalVouchers > 0 ? $this->voucherIssuance->billed_amount / $totalVouchers : 0;

        return [
            $voucher->created_at->format('d/m/Y H:i'),
            $voucher->serial_number,
            $voucher->status,
            $plateRaw,  // Plate Number
            $voucher->redeemed_at ? Carbon::parse($voucher->redeemed_at)->format('d/m/Y') : '',
            $voucherIssuanceVoucher->status,
            $extra['chassis'],
            $extra['spk_no'],
            $extra['sales_code'],
            $extra['spv_code'],
            $extra['tanggal_do'],
            $amount,
        ];
    }

    /**
     * Column headings
     */
    public function headings(): array
    {
        return [
            'Tanggal Input',
            'Serial Number',
            'Voucher Status',
            'Plate Number',
            'Redeemed At',
            'Issuance Status',
            'Chassis Number',
            'SPK No',
            'Sales Code',
            'SPV Code',
            'Tanggal DO',
            'Amount'
        ];
    }

    /**
     * Style header row
     */
    public function styles(Worksheet $sheet)
    {
        $highestRow = $sheet->getHighestRow();
        return [
            1 => ['font' => ['bold' => true]],
            $highestRow => ['font' => ['bold' => true]],
        ];
    }
}