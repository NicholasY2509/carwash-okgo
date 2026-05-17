<?php

namespace App\Exports;

use App\Models\Voucher;
use Carbon\Carbon;
use Illuminate\Support\Facades\DB;
use Illuminate\Support\Facades\Log;
use Maatwebsite\Excel\Concerns\FromQuery;
use Maatwebsite\Excel\Concerns\WithHeadings;
use Maatwebsite\Excel\Concerns\ShouldAutoSize;
use Maatwebsite\Excel\Concerns\WithStyles;
use Maatwebsite\Excel\Concerns\WithMapping;
use Maatwebsite\Excel\Concerns\WithChunkReading;
use PhpOffice\PhpSpreadsheet\Worksheet\Worksheet;

class VouchersReportExport implements 
    FromQuery, 
    WithHeadings, 
    ShouldAutoSize, 
    WithStyles, 
    WithMapping, 
    WithChunkReading
{
    private $startDate;
    private $endDate;
    private $voucher_type;
    private $extraInfos = []; // lookup array

    public function __construct($startDate, $endDate, $voucher_type)
    {
        $this->startDate = $startDate;
        $this->endDate   = $endDate;
        $this->voucher_type = $voucher_type;
    }

    /**
     * Build the query for vouchers
     */
    public function query()
    {
        Log::info('VouchersReportExport: Starting query', [
            'start_date' => $this->startDate->toISOString(),
            'end_date'   => $this->endDate->toISOString(),
            'user_id'    => auth()->id(),
        ]);

        $query = Voucher::with([
                'salesTransactionByDate.customer',
                'salesTransactionByDate.car',
            ])
            ->whereBetween('created_at', [$this->startDate, $this->endDate])
            ->where('voucher_type_id', $this->voucher_type)
            ->orderBy('serial_number', 'asc');

        $plates = $query->get()
            ->pluck('salesTransactionByDate.car.plate_number')
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
                        'spk_no'  => $row->spk_no,
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
                            'spv_code'   => $row->spv_code,
                        ],
                    ])
                    ->toArray();
            }

            $this->extraInfos = $lookup->map(function ($row) use ($spkInfos) {
                $spkData = $row['spk_no'] && isset($spkInfos[$row['spk_no']])
                    ? $spkInfos[$row['spk_no']]
                    : ['sales_code' => '-', 'spv_code' => '-'];

                return [
                    'chassis'    => $row['chassis'] ?? '-',
                    'spk_no'     => $row['spk_no'] ?? '-',
                    'sales_code' => $spkData['sales_code'],
                    'spv_code'   => $spkData['spv_code'],
                    'tanggal_do' => $row['tanggal_do'] ?? '-',
                ];
            })->toArray();
        }

        return $query;
    }

    /**
     * Map each row into spreadsheet format
     */
    public function map($voucher): array
    {
        $plateRaw = optional($voucher->salesTransactionByDate?->car)->plate_number;
        $plate    = $plateRaw ? preg_replace('/\s+/', '', $plateRaw) : null;

        $extra = $plate && isset($this->extraInfos[$plate])
            ? $this->extraInfos[$plate]
            : ['chassis' => '-', 'spk_no' => '-', 'sales_code' => '-', 'spv_code' => '-', 'tanggal_do' => '-'];

        return [
            $voucher->created_at->format('d/m/Y H:i'),
            $voucher->serial_number,
            $voucher->status,
            optional($voucher->salesTransactionByDate?->customer)->name,
            $plateRaw,
            $voucher->redeemed_at 
                ? Carbon::parse($voucher->redeemed_at)->format('d/m/Y') 
                : ' ',
            $extra['chassis'],
            $extra['spk_no'],
            $extra['sales_code'],
            $extra['spv_code'],
            $extra['tanggal_do'],
        ];
    }

    /**
     * Column headings
     */
    public function headings(): array
    {
        return [
            'Tanggal Input',
            'Kode',
            'Status',
            'Customer',
            'Nomor Plat',
            'Redeemed At',
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

    /**
     * Chunk size for large datasets
     */
    public function chunkSize(): int
    {
        return 1000;
    }
}
