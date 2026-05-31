<?php

namespace App\Http\Controllers\Reports;

use App\Http\Controllers\Controller;
use App\Models\ServiceRecord;
use Carbon\Carbon;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\DB;
use Inertia\Inertia;

class QueueReportController extends Controller
{
    public function index(Request $request)
    {
        $reportType = $request->input('report_type', 'daily');
        $startDate = $request->input('start_date', Carbon::now('Asia/Jakarta')->startOfMonth()->format('Y-m-d'));
        $endDate = $request->input('end_date', Carbon::now('Asia/Jakarta')->format('Y-m-d'));

        $baseQuery = ServiceRecord::whereIn('queue_status', ['finished', 'settled'])
            ->whereBetween('created_at', [
                Carbon::parse($startDate)->startOfDay(),
                Carbon::parse($endDate)->endOfDay(),
            ]);

        // Summary statistics
        $summaryQuery = clone $baseQuery;
        $totalCars = (clone $summaryQuery)->count();
        $totalQueueTimeMinutes = (clone $summaryQuery)->select(DB::raw('SUM(TIMESTAMPDIFF(MINUTE, created_at, queue_ongoing_at)) as total_time'))->first()->total_time ?? 0;
        $totalProcessTimeMinutes = (clone $summaryQuery)->select(DB::raw('SUM(TIMESTAMPDIFF(MINUTE, queue_ongoing_at, queue_finished_at)) as total_time'))->first()->total_time ?? 0;
        $totalAllTimeMinutes = (clone $summaryQuery)->select(DB::raw('SUM(TIMESTAMPDIFF(MINUTE, created_at, queue_finished_at)) as total_time'))->first()->total_time ?? 0;
        
        $avgQueueTime = $totalCars > 0 ? round($totalQueueTimeMinutes / $totalCars) : 0;
        $avgProcessTime = $totalCars > 0 ? round($totalProcessTimeMinutes / $totalCars) : 0;
        $avgTotalTime = $totalCars > 0 ? round($totalAllTimeMinutes / $totalCars) : 0;

        $summary = [
            'total_cars' => $totalCars,
            'avg_queue_time' => $avgQueueTime,
            'avg_process_time' => $avgProcessTime,
            'avg_total_time' => $avgTotalTime,
        ];

        if ($reportType === 'daily') {
            $data = ServiceRecord::with(['car'])
                ->whereIn('queue_status', ['finished', 'settled'])
                ->whereBetween('created_at', [
                    Carbon::parse($startDate)->startOfDay(),
                    Carbon::parse($endDate)->endOfDay(),
                ])
                ->orderBy('created_at', 'desc')
                ->paginate(20)
                ->withQueryString()
                ->through(function ($row) {
                    $waitTimeMinutes = $row->queue_ongoing_at ? $row->created_at->diffInMinutes($row->queue_ongoing_at) : null;
                    $processTimeMinutes = ($row->queue_finished_at && $row->queue_ongoing_at) ? $row->queue_ongoing_at->diffInMinutes($row->queue_finished_at) : null;
                    $totalTimeMinutes = $row->queue_finished_at ? $row->created_at->diffInMinutes($row->queue_finished_at) : null;
                    
                    return [
                        'id' => $row->id,
                        'service_date' => $row->created_at->toIso8601String(),
                        'plate_number' => $row->car?->plate_number ?? 'N/A',
                        'car_type' => $row->car?->car_type ?? 'Unknown',
                        'queue_status' => $row->queue_status,
                        'wait_time_minutes' => $waitTimeMinutes,
                        'process_time_minutes' => $processTimeMinutes,
                        'total_time_minutes' => $totalTimeMinutes,
                        'finished_at' => $row->queue_finished_at ? $row->queue_finished_at->toIso8601String() : $row->updated_at->toIso8601String(),
                    ];
                });
        } else {
            $data = ServiceRecord::select(
                    DB::raw("DATE_FORMAT(created_at, '%Y-%m') as month"),
                    DB::raw('COUNT(*) as total_cars'),
                    DB::raw('AVG(TIMESTAMPDIFF(MINUTE, created_at, queue_ongoing_at)) as avg_wait_time'),
                    DB::raw('AVG(TIMESTAMPDIFF(MINUTE, queue_ongoing_at, queue_finished_at)) as avg_process_time'),
                    DB::raw('AVG(TIMESTAMPDIFF(MINUTE, created_at, queue_finished_at)) as avg_total_time')
                )
                ->whereIn('queue_status', ['finished', 'settled'])
                ->whereBetween('created_at', [
                    Carbon::parse($startDate)->startOfDay(),
                    Carbon::parse($endDate)->endOfDay(),
                ])
                ->groupBy(DB::raw("DATE_FORMAT(created_at, '%Y-%m')"))
                ->orderBy('month', 'desc')
                ->paginate(20)
                ->withQueryString()
                ->through(function ($row) {
                    return [
                        'month' => $row->month,
                        'total_cars' => (int) $row->total_cars,
                        'avg_wait_time' => (int) round($row->avg_wait_time),
                    ];
                });
        }

        return Inertia::render('reports/queue', [
            'reportData' => $data,
            'summary' => $summary,
            'filters' => [
                'report_type' => $reportType,
                'start_date' => $startDate,
                'end_date' => $endDate,
            ],
        ]);
    }
}
