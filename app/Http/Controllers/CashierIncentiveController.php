<?php

namespace App\Http\Controllers;

use App\Models\CashierIncentiveTier;
use App\Models\Staff;
use App\Models\PurchasedPacket;
use Carbon\Carbon;
use Illuminate\Http\Request;
use Inertia\Inertia;

class CashierIncentiveController extends Controller
{
    public function index(Request $request)
    {
        $startDate = $request->input('start_date', Carbon::now()->startOfMonth()->toDateString());
        $endDate = $request->input('end_date', Carbon::now()->toDateString());

        $startDateTime = Carbon::parse($startDate)->startOfDay();
        $endDateTime = Carbon::parse($endDate)->endOfDay();

        $tiers = CashierIncentiveTier::orderBy('min_packets', 'asc')->get();

        $staffReport = Staff::query()
            ->select('staffs.*')
            ->addSelect([
                'packets_sold_count' => PurchasedPacket::selectRaw('count(*)')
                    ->join('sales_transactions', 'sales_transactions.id', '=', 'purchased_packets.sales_transaction_id')
                    ->whereColumn('sales_transactions.staff_id', 'staffs.id')
                    ->whereBetween('sales_transactions.transaction_date', [$startDateTime, $endDateTime])
                    ->where('sales_transactions.status', '!=', 'cancelled'),
                'gross_income' => PurchasedPacket::selectRaw('sum(purchased_packets.price)')
                    ->join('sales_transactions', 'sales_transactions.id', '=', 'purchased_packets.sales_transaction_id')
                    ->whereColumn('sales_transactions.staff_id', 'staffs.id')
                    ->whereBetween('sales_transactions.transaction_date', [$startDateTime, $endDateTime])
                    ->where('sales_transactions.status', '!=', 'cancelled')
            ])
            ->orderBy('packets_sold_count', 'desc')
            ->get();

        $staffReport = $staffReport->map(function ($staff) use ($tiers) {
            $count = $staff->packets_sold_count ?? 0;
            $grossIncome = (float) ($staff->gross_income ?? 0);

            $totalIncentive = 0;
            $matchingTierName = 'Tanpa Tier';

            // Find the correct tier
            $achievedTier = null;
            foreach ($tiers as $tier) {
                if ($count >= $tier->min_packets && ($tier->max_packets === null || $count <= $tier->max_packets)) {
                    $achievedTier = $tier;
                }
            }

            if ($achievedTier) {
                $totalIncentive = $count * $achievedTier->commission_per_packet;
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

        $staffReport = $staffReport->sortByDesc('packets_sold_count')->values();
        $totalPackets = $staffReport->sum('packets_sold_count');
        $totalIncentiveSum = $staffReport->sum('total_incentive');
        $totalGrossIncome = $staffReport->sum('gross_income');

        return Inertia::render('cashier_incentives/index', [
            'staffReport' => $staffReport,
            'tiers' => $tiers,
            'totalPackets' => $totalPackets,
            'totalIncentive' => $totalIncentiveSum,
            'totalGrossIncome' => $totalGrossIncome,
            'filters' => [
                'start_date' => $startDate,
                'end_date' => $endDate,
            ]
        ]);
    }
}
