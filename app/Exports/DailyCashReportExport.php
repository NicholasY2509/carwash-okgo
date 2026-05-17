<?php

namespace App\Exports;

use App\Models\DailyCashLog;
use Carbon\Carbon;
use Illuminate\Support\Facades\Log;
use Maatwebsite\Excel\Concerns\FromCollection;
use Maatwebsite\Excel\Concerns\WithHeadings;
use Maatwebsite\Excel\Concerns\ShouldAutoSize;
use Maatwebsite\Excel\Concerns\WithStyles;
use PhpOffice\PhpSpreadsheet\Worksheet\Worksheet;

class DailyCashReportExport implements FromCollection, WithHeadings, ShouldAutoSize, WithStyles
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
        Log::info('DailyCashReportExport: Starting data collection', [
            'start_date' => $this->startDate->toISOString(),
            'end_date' => $this->endDate->toISOString(),
            'user_id' => auth()->id()
        ]);

        try {
            $query = DailyCashLog::with(['user'])
                ->whereBetween('date', [$this->startDate, $this->endDate])
                ->orderBy('date', 'desc');

            Log::info('DailyCashReportExport: Query executed', [
                'sql' => $query->toSql(),
                'bindings' => $query->getBindings(),
                'user_id' => auth()->id()
            ]);

            $logs = $query->get();

            Log::info('DailyCashReportExport: Data retrieved', [
                'record_count' => $logs->count(),
                'user_id' => auth()->id()
            ]);

            $data = $logs->map(function ($log) {
                return [
                    'Tanggal' => $log->date->format('d/m/Y'),
                    'Status' => $log->is_open ? 'Dibuka' : 'Ditutup',
                    'Kas Awal' => number_format($log->opening_amount, 0, ',', '.'),
                    'Kas Akhir' => number_format($log->closing_amount, 0, ',', '.'),
                    'Total Transaksi' => $log->total_transactions,
                    'Total Pendapatan' => number_format($log->total_income, 0, ',', '.'),
                    'Dibuka Oleh' => $log->user?->name ?? '-',
                    'Dibuka Pada' => $log->opened_at?->format('d/m/Y H:i') ?? '-',
                    'Ditutup Pada' => $log->closed_at?->format('d/m/Y H:i') ?? '-',
                    'Catatan' => $log->notes ?? '-',
                ];
            });

            Log::info('DailyCashReportExport: Data processed', [
                'processed_records' => $data->count(),
                'user_id' => auth()->id()
            ]);

            return $data;

        } catch (\Exception $e) {
            Log::error('DailyCashReportExport: Data collection failed', [
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
            'Status',
            'Kas Awal',
            'Kas Akhir',
            'Total Transaksi',
            'Total Pendapatan',
            'Dibuka Oleh',
            'Dibuka Pada',
            'Ditutup Pada',
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
