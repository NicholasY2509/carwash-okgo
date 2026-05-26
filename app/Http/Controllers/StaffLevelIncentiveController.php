<?php

namespace App\Http\Controllers;

use App\Models\StaffIncentiveTier;
use App\Models\Staff;
use App\Models\ServiceRecord;
use Carbon\Carbon;
use Illuminate\Http\Request;
use Inertia\Inertia;

class StaffLevelIncentiveController extends Controller
{
    public function index(Request $request)
    {
        $startDate = $request->input('start_date', Carbon::now()->startOfMonth()->toDateString());
        $endDate = $request->input('end_date', Carbon::now()->toDateString());

        $startDateTime = Carbon::parse($startDate)->startOfDay();
        $endDateTime = Carbon::parse($endDate)->endOfDay();

        $tiers = StaffIncentiveTier::orderBy('min_cars', 'asc')->get();

        $staffReport = Staff::query()
            ->withCount(['serviceRecords as car_washes_count' => function ($query) use ($startDateTime, $endDateTime) {
                $query->whereBetween('service_date', [$startDateTime, $endDateTime])
                      ->where('status', '!=', 'cancelled');
            }])
            ->withSum(['serviceRecords as gross_income' => function ($query) use ($startDateTime, $endDateTime) {
                $query->whereBetween('service_date', [$startDateTime, $endDateTime])
                      ->where('status', '!=', 'cancelled');
            }], 'price')
            ->orderBy('car_washes_count', 'desc')
            ->get();

        $staffReport = $staffReport->map(function ($staff) use ($tiers) {
            $count = $staff->car_washes_count ?? 0;
            $grossIncome = (float) ($staff->gross_income ?? 0);

            $totalIncentive = 0;
            $matchingTierName = 'Tanpa Tier';

            // Find the correct tier
            $achievedTier = null;
            foreach ($tiers as $tier) {
                if ($count >= $tier->min_cars && ($tier->max_cars === null || $count <= $tier->max_cars)) {
                    $achievedTier = $tier;
                }
            }

            if ($achievedTier) {
                $totalIncentive = $achievedTier->flat_amount;
                $matchingTierName = $achievedTier->name;
            }

            $staff->tier_name = $matchingTierName;
            $staff->total_incentive = $totalIncentive;
            $staff->gross_income = $grossIncome;
            
            return $staff;
        });

        $staffReport = $staffReport->filter(function ($staff) {
            return $staff->total_incentive > 0;
        });

        $staffReport = $staffReport->sortByDesc('car_washes_count')->values();
        $totalWashes = $staffReport->sum('car_washes_count');
        $totalIncentiveSum = $staffReport->sum('total_incentive');
        $totalGrossIncome = $staffReport->sum('gross_income');

        return Inertia::render('staff_level_incentives/index', [
            'staffReport' => $staffReport,
            'tiers' => $tiers,
            'totalWashes' => $totalWashes,
            'totalIncentive' => $totalIncentiveSum,
            'totalGrossIncome' => $totalGrossIncome,
            'filters' => [
                'start_date' => $startDate,
                'end_date' => $endDate,
            ]
        ]);
    }
}
