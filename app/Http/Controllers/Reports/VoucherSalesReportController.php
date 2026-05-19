<?php

namespace App\Http\Controllers\Reports;

use App\Http\Controllers\Controller;
use App\Models\SalesTransaction;
use Carbon\Carbon;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\DB;
use Inertia\Inertia;

class VoucherSalesReportController extends Controller
{
    public function index(Request $request)
    {
        $reportType = $request->input('report_type', 'daily');
        $startDate = $request->input('start_date', Carbon::now('Asia/Jakarta')->startOfMonth()->format('Y-m-d'));
        $endDate = $request->input('end_date', Carbon::now('Asia/Jakarta')->format('Y-m-d'));

        $baseQuery = SalesTransaction::where('transaction_type', 'Paket Voucher')
            ->where('status', '!=', 'cancelled')
            ->whereBetween('transaction_date', [
                Carbon::parse($startDate)->startOfDay(),
                Carbon::parse($endDate)->endOfDay(),
            ]);

        // Summary statistics
        $summaryQuery = clone $baseQuery;
        $summary = [
            'total_revenue' => (clone $summaryQuery)->sum('total_amount'),
            'total_transactions' => (clone $summaryQuery)->count(),
            'avg_transaction' => (clone $summaryQuery)->avg('total_amount') ?? 0,
            'cash_revenue' => (clone $summaryQuery)->where('payment_method', 'Cash')->sum('total_amount'),
            'transfer_revenue' => (clone $summaryQuery)->where('payment_method', '!=', 'Cash')->sum('total_amount'),
            'total_packets_sold' => DB::table('purchased_packets')
                ->join('sales_transactions', 'purchased_packets.sales_transaction_id', '=', 'sales_transactions.id')
                ->where('sales_transactions.transaction_type', 'Paket Voucher')
                ->where('sales_transactions.status', '!=', 'cancelled')
                ->where('purchased_packets.status', '!=', 'cancelled')
                ->whereBetween('sales_transactions.transaction_date', [
                    Carbon::parse($startDate)->startOfDay(),
                    Carbon::parse($endDate)->endOfDay(),
                ])
                ->count(),
        ];

        if ($reportType === 'daily') {
            $data = SalesTransaction::with(['customer', 'car'])
                ->where('transaction_type', 'Paket Voucher')
                ->where('status', '!=', 'cancelled')
                ->whereBetween('transaction_date', [
                    Carbon::parse($startDate)->startOfDay(),
                    Carbon::parse($endDate)->endOfDay(),
                ])
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
                    DB::raw("SUM(CASE WHEN payment_method != 'Cash' THEN total_amount ELSE 0 END) as transfer_revenue"),
                )
                ->where('transaction_type', 'Paket Voucher')
                ->where('status', '!=', 'cancelled')
                ->whereBetween('transaction_date', [
                    Carbon::parse($startDate)->startOfDay(),
                    Carbon::parse($endDate)->endOfDay(),
                ])
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
                        'transfer_revenue' => (float) $row->transfer_revenue,
                    ];
                });
        }

        return Inertia::render('reports/voucher_sales', [
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
