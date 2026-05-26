<?php

namespace App\Http\Controllers;

use Illuminate\Http\Request;
use Illuminate\Support\Facades\DB;
use Inertia\Inertia;
use Carbon\Carbon;

class VoucherHistoryController extends Controller
{
    public function index(Request $request)
    {
        $perPage = $request->input('per_page', 10);
        $search = $request->input('search', '');
        $startDate = $request->input('start_date', '');
        $endDate = $request->input('end_date', '');

        // GENERATION QUERY
        $generations = DB::table('purchased_packets')
            ->join('sales_transactions', 'purchased_packets.sales_transaction_id', '=', 'sales_transactions.id')
            ->leftJoin('staffs', 'sales_transactions.staff_id', '=', 'staffs.id')
            ->join('vouchers', 'purchased_packets.id', '=', 'vouchers.purchased_packet_id')
            ->select(
                DB::raw("'generation' as event_type"),
                'purchased_packets.id as event_id',
                'purchased_packets.created_at as event_date',
                'staffs.full_name as actor_name',
                DB::raw("GROUP_CONCAT(vouchers.serial_number SEPARATOR ', ') as voucher_serials"),
                DB::raw("COUNT(vouchers.id) as voucher_count")
            )
            ->groupBy('purchased_packets.id', 'purchased_packets.created_at', 'staffs.full_name');

        // USAGE QUERY
        $usages = DB::table('vouchers')
            ->join('sales_transactions', 'vouchers.sales_transaction_id', '=', 'sales_transactions.id')
            ->leftJoin('customers', 'sales_transactions.customer_id', '=', 'customers.id')
            ->whereNotNull('vouchers.redeemed_at')
            ->select(
                DB::raw("'usage' as event_type"),
                'vouchers.id as event_id',
                'vouchers.redeemed_at as event_date',
                'customers.name as actor_name',
                'vouchers.serial_number as voucher_serials',
                DB::raw("1 as voucher_count")
            );

        // Combine using UNION
        $query = $generations->union($usages);

        // Wrap the union query so we can order and paginate it easily
        $wrappedQuery = DB::table(DB::raw("({$query->toSql()}) as combined_history"))
            ->mergeBindings($query);

        if (!empty($search)) {
            $wrappedQuery->where(function($q) use ($search) {
                $q->where('voucher_serials', 'like', "%{$search}%")
                  ->orWhere('actor_name', 'like', "%{$search}%");
            });
        }

        if (!empty($startDate) && !empty($endDate)) {
            $start = Carbon::parse($startDate)->startOfDay();
            $end = Carbon::parse($endDate)->endOfDay();
            $wrappedQuery->whereBetween('event_date', [$start, $end]);
        }

        $history = $wrappedQuery
            ->orderBy('event_date', 'desc')
            ->paginate($perPage)
            ->withQueryString();

        return Inertia::render('voucher_history/index', [
            'history' => $history
        ]);
    }
}
