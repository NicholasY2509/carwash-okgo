<?php

namespace App\Exports;

use App\Models\Staff;
use App\Models\StallAssignment;
use Carbon\Carbon;
use Illuminate\Support\Facades\Log;
use Maatwebsite\Excel\Concerns\FromCollection;
use Maatwebsite\Excel\Concerns\WithHeadings;
use Maatwebsite\Excel\Concerns\ShouldAutoSize;
use Maatwebsite\Excel\Concerns\WithStyles;
use PhpOffice\PhpSpreadsheet\Worksheet\Worksheet;

class StaffReportExport implements FromCollection, WithHeadings, ShouldAutoSize, WithStyles
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
        Log::info('StaffReportExport: Starting data collection', [
            'start_date' => $this->startDate->toISOString(),
            'end_date' => $this->endDate->toISOString(),
            'user_id' => auth()->id()
        ]);

        try {
            // Get staff assignments
            $assignmentsQuery = StallAssignment::with(['staff', 'stall', 'workPosition'])
                ->whereBetween('created_at', [$this->startDate, $this->endDate])
                ->orderBy('created_at', 'desc');

            Log::info('StaffReportExport: Assignments query executed', [
                'sql' => $assignmentsQuery->toSql(),
                'bindings' => $assignmentsQuery->getBindings(),
                'user_id' => auth()->id()
            ]);

            $assignments = $assignmentsQuery->get();

            // Get all staff
            $staffQuery = Staff::with(['workPosition'])
                ->orderBy('name', 'asc');

            Log::info('StaffReportExport: Staff query executed', [
                'sql' => $staffQuery->toSql(),
                'bindings' => $staffQuery->getBindings(),
                'user_id' => auth()->id()
            ]);

            $staff = $staffQuery->get();

            Log::info('StaffReportExport: Data retrieved', [
                'assignments_count' => $assignments->count(),
                'staff_count' => $staff->count(),
                'user_id' => auth()->id()
            ]);

            $data = collect();

            // Add staff assignments data
            foreach ($assignments as $assignment) {
                $data->push([
                    'Tanggal' => $assignment->created_at->format('d/m/Y H:i'),
                    'Tipe' => 'Penugasan',
                    'Nama Staff' => $assignment->staff?->name ?? '-',
                    'Posisi' => $assignment->workPosition?->name ?? '-',
                    'Stall' => $assignment->stall?->name ?? '-',
                    'Status' => $assignment->is_active ? 'Aktif' : 'Tidak Aktif',
                    'Catatan' => $assignment->notes ?? '-',
                ]);
            }

            // Add staff info data
            foreach ($staff as $staffMember) {
                $data->push([
                    'Tanggal' => $staffMember->created_at->format('d/m/Y H:i'),
                    'Tipe' => 'Data Staff',
                    'Nama Staff' => $staffMember->name,
                    'Posisi' => $staffMember->workPosition?->name ?? '-',
                    'Stall' => '-',
                    'Status' => $staffMember->is_active ? 'Aktif' : 'Tidak Aktif',
                    'Catatan' => $staffMember->notes ?? '-',
                ]);
            }

            // Sort by date
            $data = $data->sortByDesc('Tanggal')->values();

            Log::info('StaffReportExport: Data processed', [
                'processed_records' => $data->count(),
                'user_id' => auth()->id()
            ]);

            return $data;

        } catch (\Exception $e) {
            Log::error('StaffReportExport: Data collection failed', [
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
            'Tipe',
            'Nama Staff',
            'Posisi',
            'Stall',
            'Status',
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
