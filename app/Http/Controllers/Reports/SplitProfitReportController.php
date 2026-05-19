<?php

namespace App\Http\Controllers\Reports;

use App\Http\Controllers\Controller;
use App\Models\ServiceRecord;
use Carbon\Carbon;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\DB;
use Inertia\Inertia;

class SplitProfitReportController extends Controller
{
    public function index(Request $request)
    {
        $reportType = $request->input('report_type', 'daily'); // 'daily' or 'monthly'
        $startDate = $request->input('start_date', Carbon::now('Asia/Jakarta')->startOfMonth()->format('Y-m-d'));
        $endDate = $request->input('end_date', Carbon::now('Asia/Jakarta')->format('Y-m-d'));

        // Query service records with split-profit product configured and not cancelled
        $baseQuery = ServiceRecord::where('status', '!=', 'cancelled')
            ->whereHas('product', function ($q) {
                $q->where('is_split_profits', true);
            })
            ->whereBetween('service_date', [
                Carbon::parse($startDate)->startOfDay(),
                Carbon::parse($endDate)->endOfDay(),
            ]);

        // Get all matching records for global calculations
        $allRecords = (clone $baseQuery)->with(['product.splits.party'])->get();

        $totalOmset = 0;
        $partyShares = [];

        foreach ($allRecords as $record) {
            $price = (float)$record->price;
            $totalOmset += $price;

            if ($record->product && $record->product->is_split_profits) {
                foreach ($record->product->splits as $split) {
                    $partyId = $split->party_id;
                    $partyName = $split->party?->name ?? 'Pihak Lain';
                    $share = $price * ($split->percentage / 100);

                    if (!isset($partyShares[$partyId])) {
                        $partyShares[$partyId] = [
                            'party_id' => $partyId,
                            'name' => $partyName,
                            'amount' => 0
                        ];
                    }
                    $partyShares[$partyId]['amount'] += $share;
                }
            }
        }

        $summary = [
            'total_omset' => $totalOmset,
            'total_transactions' => $allRecords->count(),
            'party_shares' => array_values($partyShares)
        ];

        if ($reportType === 'daily') {
            // Paginated details
            $reportData = $baseQuery->with(['car.customer', 'product.splits.party'])
                ->orderBy('service_date', 'desc')
                ->paginate(20)
                ->withQueryString()
                ->through(function ($row) {
                    $rowShares = [];
                    if ($row->product && $row->product->is_split_profits) {
                        foreach ($row->product->splits as $split) {
                            $rowShares[] = [
                                'party_name' => $split->party?->name ?? 'Unknown',
                                'percentage' => (float)$split->percentage,
                                'amount' => (float)$row->price * ($split->percentage / 100)
                            ];
                        }
                    }

                    return [
                        'id' => $row->id,
                        'service_date' => $row->service_date->toIso8601String(),
                        'plate_number' => $row->car?->plate_number ?? 'N/A',
                        'customer_name' => $row->car?->customer?->name ?? 'Walk-In Customer',
                        'product_name' => $row->product?->name ?? 'Layanan',
                        'price' => (float)$row->price,
                        'shares' => $rowShares
                    ];
                });
        } else {
            // Group by Month query
            $monthlyData = ServiceRecord::select(
                    DB::raw("DATE_FORMAT(service_date, '%Y-%m') as month"),
                    DB::raw('COUNT(*) as total_transactions'),
                    DB::raw('SUM(price) as total_omset')
                )
                ->where('status', '!=', 'cancelled')
                ->whereHas('product', function ($q) {
                    $q->where('is_split_profits', true);
                })
                ->whereBetween('service_date', [
                    Carbon::parse($startDate)->startOfDay(),
                    Carbon::parse($endDate)->endOfDay(),
                ])
                ->groupBy(DB::raw("DATE_FORMAT(service_date, '%Y-%m')"))
                ->orderBy('month', 'desc')
                ->paginate(20)
                ->withQueryString();

            $monthlyData->through(function ($row) use ($startDate, $endDate) {
                // Fetch all service records in this specific month
                $recordsInMonth = ServiceRecord::with(['product.splits.party'])
                    ->where('status', '!=', 'cancelled')
                    ->whereHas('product', function ($q) {
                        $q->where('is_split_profits', true);
                    })
                    ->whereRaw("DATE_FORMAT(service_date, '%Y-%m') = ?", [$row->month])
                    ->whereBetween('service_date', [
                        Carbon::parse($startDate)->startOfDay(),
                        Carbon::parse($endDate)->endOfDay(),
                    ])
                    ->get();

                $partyShares = [];
                foreach ($recordsInMonth as $record) {
                    $price = (float)$record->price;
                    if ($record->product && $record->product->is_split_profits) {
                        foreach ($record->product->splits as $split) {
                            $partyName = $split->party?->name ?? 'Unknown';
                            $share = $price * ($split->percentage / 100);
                            if (!isset($partyShares[$partyName])) {
                                $partyShares[$partyName] = [
                                    'party_name' => $partyName,
                                    'amount' => 0
                                ];
                            }
                            $partyShares[$partyName]['amount'] += $share;
                        }
                    }
                }

                return [
                    'month' => $row->month,
                    'total_transactions' => (int)$row->total_transactions,
                    'total_omset' => (float)$row->total_omset,
                    'shares' => array_values($partyShares)
                ];
            });

            $reportData = $monthlyData;
        }

        return Inertia::render('reports/split_profit', [
            'reportData' => $reportData,
            'summary' => $summary,
            'filters' => [
                'report_type' => $reportType,
                'start_date' => $startDate,
                'end_date' => $endDate,
            ],
        ]);
    }
}
