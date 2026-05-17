<?php

namespace App\Exports;

use App\Models\SalesTransaction;
use Carbon\Carbon;
use Illuminate\Support\Facades\Log;
use Maatwebsite\Excel\Concerns\FromCollection;
use Maatwebsite\Excel\Concerns\WithHeadings;
use Maatwebsite\Excel\Concerns\ShouldAutoSize;
use Maatwebsite\Excel\Concerns\WithStyles;
use PhpOffice\PhpSpreadsheet\Worksheet\Worksheet;

class TransactionsReportExport implements FromCollection, WithHeadings, ShouldAutoSize, WithStyles
{
    private $startDate;
    private $endDate;

    public function __construct($startDate, $endDate)
    {
        $this->startDate = $startDate;
        $this->endDate = $endDate;
    }

    /**
     * @return \Illuminate\Support\Collection
     */
    public function collection()
    {
        Log::info('TransactionsReportExport: Starting data collection', [
            'start_date' => $this->startDate->toISOString(),
            'end_date' => $this->endDate->toISOString(),
            'user_id' => auth()->id()
        ]);

        try {
            $query = SalesTransaction::with(['customer', 'car', 'serviceRecords.stall'])
                ->whereBetween('transaction_date', [$this->startDate, $this->endDate])
                ->orderBy('transaction_date', 'desc');

            Log::info('TransactionsReportExport: Query executed', [
                'sql' => $query->toSql(),
                'bindings' => $query->getBindings(),
                'user_id' => auth()->id()
            ]);

            $transactions = $query->get();

            Log::info('TransactionsReportExport: Data retrieved', [
                'record_count' => $transactions->count(),
                'user_id' => auth()->id()
            ]);

            $data = $transactions->map(function ($transaction) {
                return [
                    'Tanggal' => $transaction->transaction_date->format('d/m/Y H:i'),
                    'Tipe Transaksi' => $transaction->transaction_type,
                    'Nomor Plat' => $transaction->car?->plate_number ?? '-',
                    'Pelanggan' => $transaction->customer?->name ?? '-',
                    'Metode Pembayaran' => $transaction->payment_method,
                    'Total' => number_format($transaction->total_amount, 0, ',', '.'),
                    'Stall' => $transaction->serviceRecords->first()?->stall?->name ?? '-',
                    'Catatan' => $transaction->notes ?? '-',
                ];
            });

            Log::info('TransactionsReportExport: Data processed', [
                'processed_records' => $data->count(),
                'user_id' => auth()->id()
            ]);

            return $data;

        } catch (\Exception $e) {
            Log::error('TransactionsReportExport: Data collection failed', [
                'error_message' => $e->getMessage(),
                'error_code' => $e->getCode(),
                'error_file' => $e->getFile(),
                'error_line' => $e->getLine(),
                'start_date' => $this->startDate->toISOString(),
                'end_date' => $this->endDate->toISOString(),
                'user_id' => auth()->id()
            ]);
            throw $e;
        }
    }

    /**
     * @return array
     */
    public function headings(): array
    {
        return [
            'Tanggal',
            'Tipe Transaksi',
            'Nomor Plat',
            'Pelanggan',
            'Metode Pembayaran',
            'Total',
            'Stall',
            'Catatan'
        ];
    }

    /**
     * @param Worksheet $sheet
     */
    public function styles(Worksheet $sheet)
    {
        return [
            1 => ['font' => ['bold' => true]],
        ];
    }
}
