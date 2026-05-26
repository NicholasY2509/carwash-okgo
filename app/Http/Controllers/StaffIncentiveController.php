<?php

namespace App\Http\Controllers;

use App\Models\IncentiveTier;
use App\Models\Staff;
use App\Models\ServiceRecord;
use Carbon\Carbon;
use Illuminate\Http\Request;
use Inertia\Inertia;

class StaffIncentiveController extends Controller
{
    public function index(Request $request)
    {
        // Default to the current month's start and end dates
        $startDate = $request->input('start_date', Carbon::now()->startOfMonth()->toDateString());
        $endDate = $request->input('end_date', Carbon::now()->toDateString()); // default up to today

        $startDateTime = Carbon::parse($startDate)->startOfDay();
        $endDateTime = Carbon::parse($endDate)->endOfDay();

        // Get all configured incentive tiers ordered by minimum cars
        $tiers = IncentiveTier::orderBy('min_cars', 'asc')->get();

        // Get the total number of non-cancelled car washes in the date range
        $count = \App\Models\ServiceRecord::whereBetween('service_date', [$startDateTime, $endDateTime])
            ->where('status', '!=', 'cancelled')
            ->count();

        // Create a single dummy SPV staff to receive the combined total
        $spv = new \stdClass();
        $spv->id = 1;
        $spv->full_name = 'Supervisor';
        $spv->car_washes_count = $count;

        $totalIncentive = 0;
        $tierBreakdowns = [];
        $matchingTierName = 'Tanpa Tier';

        // Find lowest tier's min_cars for eligibility
        $lowestTier = $tiers->first();
        $eligible = $lowestTier && ($count >= $lowestTier->min_cars);

        if ($eligible) {
            $lowerBoundary = 0;
            foreach ($tiers as $index => $tier) {
                $upperBoundary = $tier->max_cars;
                if ($upperBoundary === null) {
                    $upperBoundary = $count;
                }
                $carsInTier = max(0, min($count, $upperBoundary) - $lowerBoundary);
                $tierCommission = $carsInTier * $tier->commission;
                
                $totalIncentive += $tierCommission;
                $tierBreakdowns[$tier->id] = $tierCommission;

                if ($carsInTier > 0) {
                    $matchingTierName = $tier->name;
                }
                $lowerBoundary = $upperBoundary;
            }
        } else {
            foreach ($tiers as $tier) {
                $tierBreakdowns[$tier->id] = 0;
            }
        }

        $spv->tier_name = $matchingTierName;
        $spv->commission_rate = 0;
        $spv->total_incentive = $totalIncentive;
        $spv->tier_breakdowns = $tierBreakdowns;

        $staffReport = collect([$spv]);

        // Filter to only those who have incentive > 0
        $staffReport = $staffReport->filter(function ($staff) {
            return $staff->total_incentive > 0;
        });

        $staffReport = $staffReport->values();

        $totalWashes = $staffReport->sum('car_washes_count');
        $totalIncentiveSum = $staffReport->sum('total_incentive');

        return Inertia::render('staff_incentives/index', [
            'staffReport' => $staffReport,
            'tiers' => $tiers,
            'totalWashes' => $totalWashes,
            'totalIncentive' => $totalIncentiveSum,
            'filters' => [
                'start_date' => $startDate,
                'end_date' => $endDate,
            ]
        ]);
    }

    public function summary(Request $request)
    {
        // Default to today
        $startDate = $request->input('start_date', Carbon::now()->toDateString());
        $endDate = $request->input('end_date', Carbon::now()->toDateString());

        $startDateTime = Carbon::parse($startDate)->startOfDay();
        $endDateTime = Carbon::parse($endDate)->endOfDay();

        $tiers = IncentiveTier::orderBy('min_cars', 'asc')->get();

        $staffReport = Staff::query()
            ->withCount(['serviceRecords as car_washes_count' => function ($query) use ($startDateTime, $endDateTime) {
                $query->whereBetween('service_date', [$startDateTime, $endDateTime])
                      ->where('status', '!=', 'cancelled');
            }])
            ->withSum(['serviceRecords as gross_income' => function ($query) use ($startDateTime, $endDateTime) {
                $query->whereBetween('service_date', [$startDateTime, $endDateTime])
                      ->where('status', '!=', 'cancelled');
            }], 'price')
            ->get();

        $staffReport = $staffReport->map(function ($staff) use ($tiers) {
            $count = $staff->car_washes_count ?? 0;
            $grossIncome = (float) ($staff->gross_income ?? 0);
            $totalIncentive = 0;

            $lowestTier = $tiers->first();
            $eligible = $lowestTier && ($count >= $lowestTier->min_cars);

            if ($eligible) {
                $lowerBoundary = 0;
                foreach ($tiers as $tier) {
                    $upperBoundary = $tier->max_cars ?? $count;
                    $carsInTier = max(0, min($count, $upperBoundary) - $lowerBoundary);
                    $totalIncentive += $carsInTier * $tier->commission;
                    $lowerBoundary = $upperBoundary;
                }
            }

            return [
                'id' => $staff->id,
                'full_name' => $staff->full_name,
                'gross_income' => $grossIncome,
                'total_incentive' => $totalIncentive,
            ];
        });

        // Filter to only those who have incentive
        $staffReport = $staffReport->filter(function ($staff) {
            return $staff['total_incentive'] > 0;
        })->values();

        return Inertia::render('staff_incentives/summary', [
            'staffReport' => $staffReport,
            'filters' => [
                'start_date' => $startDate,
                'end_date' => $endDate,
            ]
        ]);
    }
}
