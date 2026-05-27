<?php

namespace App\Http\Controllers\Reports;

use App\Http\Controllers\Controller;
use App\Models\SalesTransaction;
use App\Models\Staff;
use Carbon\Carbon;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\DB;
use Inertia\Inertia;

class CarWashRevenueReportController extends Controller
{
    public function index(Request $request)
    {
        $reportType = $request->input('report_type', 'daily'); // 'daily' or 'monthly'
        $startDate = $request->input('start_date', Carbon::now('Asia/Jakarta')->startOfMonth()->format('Y-m-d'));
        $endDate = $request->input('end_date', Carbon::now('Asia/Jakarta')->format('Y-m-d'));
        $staffId = $request->input('staff_id');

        $carWashTypes = ['Cuci Mobil', 'Cuci Mobil Voucher', 'Klaim Garansi'];

        $baseQuery = SalesTransaction::whereIn('transaction_type', $carWashTypes)
            ->where('status', '!=', 'cancelled')
            ->whereBetween('transaction_date', [
                Carbon::parse($startDate)->startOfDay(),
                Carbon::parse($endDate)->endOfDay(),
            ])
            ->when($staffId, function($query) use ($staffId) {
                $query->where('staff_id', $staffId);
            });

        // Summary statistics
        $summaryQuery = clone $baseQuery;
        $summary = [
            'total_revenue' => (clone $summaryQuery)->sum('total_amount'),
            'total_transactions' => (clone $summaryQuery)->count(),
            'avg_transaction' => (clone $summaryQuery)->avg('total_amount') ?? 0,
            'cash_revenue' => (clone $summaryQuery)->where('payment_method', 'Cash')->sum('total_amount'),
            'voucher_revenue' => (clone $summaryQuery)->where('payment_method', 'Voucher')->sum('total_amount'),
            'transfer_revenue' => (clone $summaryQuery)->whereNotIn('payment_method', ['Cash', 'Voucher', 'Garansi', 'Special Program'])->sum('total_amount'),
            'warranty_count' => (clone $summaryQuery)->where('transaction_type', 'Klaim Garansi')->count(),
        ];

        if ($reportType === 'daily') {
            $data = SalesTransaction::with(['customer', 'car'])
                ->whereIn('transaction_type', $carWashTypes)
                ->where('status', '!=', 'cancelled')
                ->whereBetween('transaction_date', [
                    Carbon::parse($startDate)->startOfDay(),
                    Carbon::parse($endDate)->endOfDay(),
                ])
                ->when($staffId, function($query) use ($staffId) {
                    $query->where('staff_id', $staffId);
                })
                ->orderBy('transaction_date', 'desc')
                ->paginate(20)
                ->withQueryString()
                ->through(function ($row) {
                    return [
                        'id' => $row->id,
                        'transaction_date' => $row->transaction_date->toIso8601String(),
                        'customer_name' => $row->customer?->name ?? 'Walk-In Customer',
                        'plate_number' => $row->car?->plate_number,
                        'transaction_type' => $row->transaction_type,
                        'payment_method' => $row->payment_method,
                        'total_amount' => (float) $row->total_amount,
                    ];
                });
        } else {
            $data = SalesTransaction::select(
                    DB::raw("DATE_FORMAT(transaction_date, '%Y-%m') as month"),
                    DB::raw('COUNT(*) as total_transactions'),
                    DB::raw('SUM(total_amount) as total_revenue'),
                    DB::raw("SUM(CASE WHEN payment_method = 'Cash' THEN total_amount ELSE 0 END) as cash_revenue"),
                    DB::raw("SUM(CASE WHEN payment_method = 'Voucher' THEN total_amount ELSE 0 END) as voucher_revenue"),
                    DB::raw("SUM(CASE WHEN payment_method NOT IN ('Cash', 'Voucher', 'Garansi', 'Special Program') THEN total_amount ELSE 0 END) as transfer_revenue"),
                    DB::raw("SUM(CASE WHEN transaction_type = 'Klaim Garansi' THEN 1 ELSE 0 END) as warranty_count"),
                )
                ->whereIn('transaction_type', $carWashTypes)
                ->where('status', '!=', 'cancelled')
                ->whereBetween('transaction_date', [
                    Carbon::parse($startDate)->startOfDay(),
                    Carbon::parse($endDate)->endOfDay(),
                ])
                ->when($staffId, function($query) use ($staffId) {
                    $query->where('staff_id', $staffId);
                })
                ->groupBy(DB::raw("DATE_FORMAT(transaction_date, '%Y-%m')"))
                ->orderBy('month', 'desc')
                ->paginate(20)
                ->withQueryString()
                ->through(function ($row) {
                    return [
                        'month' => $row->month,
                        'total_transactions' => (int) $row->total_transactions,
                        'total_revenue' => (float) $row->total_revenue,
                        'cash_revenue' => (float) $row->cash_revenue,
                        'voucher_revenue' => (float) $row->voucher_revenue,
                        'transfer_revenue' => (float) $row->transfer_revenue,
                        'warranty_count' => (int) $row->warranty_count,
                    ];
                });
        }

        $staffList = Staff::where('work_position_id', 2)->get(['id', 'full_name as name']);

        return Inertia::render('reports/car_wash_revenue', [
            'reportData' => $data,
            'summary' => $summary,
            'filters' => [
                'report_type' => $reportType,
                'start_date' => $startDate,
                'end_date' => $endDate,
                'staff_id' => $staffId,
            ],
            'staffList' => $staffList,
        ]);
    }
}
