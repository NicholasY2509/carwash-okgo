<?php

namespace App\Http\Controllers;

use App\Models\Incentive;
use App\Models\ServiceRecord;
use App\Models\Staff;
use App\Models\StallAssignment; // Pastikan model ini diimpor
use Carbon\Carbon;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\DB;
use Inertia\Inertia;

class StaffPerformanceController extends Controller
{
    public function index(Request $request)
    {
        $requestedYear = $request->input('year', Carbon::now()->year);
        $requestedMonth = $request->input('month', Carbon::now()->month);

        $date = Carbon::createFromDate($requestedYear, $requestedMonth, 1);
        $currentMonth = $date->month;
        $currentYear = $date->year;

        $carsWashedByStall = ServiceRecord::query()
            ->join('stalls', 'service_records.stall_id', '=', 'stalls.id')
            ->whereYear('service_records.service_date', $currentYear)
            ->whereMonth('service_records.service_date', $currentMonth)
            ->select('stalls.name as stall_name', DB::raw('count(service_records.id) as total_washes'))
            ->groupBy('stalls.name')
            ->get();

        $carWashedTotal = $carsWashedByStall->sum('total_washes');

        $incentive = Incentive::first();

        $staffReport = Staff::query()
            ->whereHas('assignments', function ($query) use ($currentYear, $currentMonth) {
                $query->whereYear('start_time', $currentYear)
                      ->whereMonth('start_time', $currentMonth);
            })
            ->addSelect([
                'car_washes_count' => ServiceRecord::query()
                    ->selectRaw('count(*)')
                    ->whereYear('service_records.service_date', $currentYear)
                    ->whereMonth('service_records.service_date', $currentMonth)
                    ->join('stall_assignments', function ($join) {
                        $join->on('service_records.stall_id', '=', 'stall_assignments.stall_id')
                             ->whereRaw(
                                "(
                                    (stall_assignments.end_time IS NOT NULL AND service_records.service_date BETWEEN stall_assignments.start_time AND stall_assignments.end_time)
                                    OR
                                    (stall_assignments.end_time IS NULL AND service_records.service_date >= stall_assignments.start_time)
                                )"
                             );
                    })
                    ->whereColumn('stall_assignments.staff_id', 'staffs.id'),
                'hari_kerja' => StallAssignment::query()
                    ->selectRaw('count(distinct DATE(start_time))')
                    ->whereColumn('staff_id', 'staffs.id')
                    ->whereYear('start_time', $currentYear)
                    ->whereMonth('start_time', $currentMonth)

            ])
            ->get();

        return Inertia::render("staff_performance/index", [
            'carWashedTotal' => $carWashedTotal,
            'carsWashedByStall' => $carsWashedByStall,
            'staffReport' => $staffReport,
            'incentive' => $incentive,
            'filters' => [
                'year' => $currentYear,
                'month' => $currentMonth,
            ]
        ]);
    }
}
