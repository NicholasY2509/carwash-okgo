<?php

namespace App\Http\Controllers\Reports;

use App\Http\Controllers\Controller;
use App\Models\Item;
use App\Models\StockMovement;
use Carbon\Carbon;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\DB;
use Inertia\Inertia;

class StockReportController extends Controller
{
    public function index(Request $request)
    {
        $itemId = $request->input('item_id');
        $startDate = $request->input('start_date', Carbon::now('Asia/Jakarta')->startOfMonth()->format('Y-m-d'));
        $endDate = $request->input('end_date', Carbon::now('Asia/Jakarta')->format('Y-m-d'));

        $items = Item::select('id', 'name', 'sku', 'stock')->orderBy('name')->get();

        $movementsQuery = StockMovement::with('item:id,name,sku')
            ->whereBetween('created_at', [
                Carbon::parse($startDate)->startOfDay(),
                Carbon::parse($endDate)->endOfDay(),
            ]);

        if ($itemId) {
            $movementsQuery->where('item_id', $itemId);
        }

        $movements = $movementsQuery
            ->orderBy('created_at', 'desc')
            ->paginate(20)
            ->withQueryString();

        // Summary for the filtered scope
        $summaryBaseQuery = StockMovement::whereBetween('created_at', [
            Carbon::parse($startDate)->startOfDay(),
            Carbon::parse($endDate)->endOfDay(),
        ]);

        if ($itemId) {
            $summaryBaseQuery->where('item_id', $itemId);
        }

        $summary = [
            'total_in' => (clone $summaryBaseQuery)->where('quantity', '>', 0)->sum('quantity'),
            'total_out' => abs((clone $summaryBaseQuery)->where('quantity', '<', 0)->sum('quantity')),
            'total_movements' => (clone $summaryBaseQuery)->count(),
            'current_stock' => $itemId
                ? (Item::find($itemId)?->stock ?? 0)
                : Item::sum('stock'),
            'items_count' => $itemId ? 1 : (clone $summaryBaseQuery)->distinct('item_id')->count('item_id'),
        ];

        // Per-type breakdown
        $typeBreakdown = (clone $summaryBaseQuery)
            ->select('type', DB::raw('SUM(quantity) as total_qty'), DB::raw('COUNT(*) as count'))
            ->groupBy('type')
            ->get()
            ->map(fn ($row) => [
                'type' => $row->type,
                'total_qty' => (int) $row->total_qty,
                'count' => (int) $row->count,
            ]);

        return Inertia::render('reports/stock_report', [
            'movements' => $movements,
            'items' => $items,
            'summary' => $summary,
            'typeBreakdown' => $typeBreakdown,
            'filters' => [
                'item_id' => $itemId,
                'start_date' => $startDate,
                'end_date' => $endDate,
            ],
        ]);
    }
}
