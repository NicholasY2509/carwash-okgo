<?php

namespace App\Http\Controllers;
use App\Models\SalesTransaction;
use App\Models\ServiceRecord;
use App\Models\PurchasedPacket;
use App\Models\Stall;
use App\Models\StallAssignment;
use App\Models\Staff;
use App\Models\Voucher;
use App\Models\VoucherPacket;
use App\Services\QueryOptimizerService;
use App\Exports\SalesReportExport;
use App\Exports\TransactionsReportExport;
use App\Exports\VouchersReportExport;
use App\Exports\StaffReportExport;
use Carbon\Carbon;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Auth;
use Illuminate\Support\Facades\Cache;
use Illuminate\Support\Facades\DB;
use Illuminate\Support\Facades\Log;
use Inertia\Inertia;
use Maatwebsite\Excel\Facades\Excel;

class DashboardController extends Controller
{
    public function index()
    {
        $bypassCache = request()->has('refresh') || request()->has('bypass_cache');

        $cacheKey = 'dashboard_data_' . Carbon::today()->format('Y-m-d');

        if ($bypassCache) {
            Cache::forget($cacheKey);
        }

        $dashboardData = Cache::remember($cacheKey, 300, function () {
            return $this->getDashboardData();
        });

        return Inertia::render('dashboard/dashboard', $dashboardData);
    }

    /**
     * Manually clear dashboard cache
     */
    public function clearCache()
    {
        $today = Carbon::today()->format('Y-m-d');
        $cacheKey = 'dashboard_data_' . $today;

        Cache::forget($cacheKey);

        return response()->json([
            'message' => 'Dashboard cache cleared successfully',
            'timestamp' => now()->toISOString()
        ]);
    }

    private function getDashboardData()
    {
        $today = Carbon::today('Asia/Jakarta');
        $todayEnd = Carbon::tomorrow('Asia/Jakarta');

        $performanceData = QueryOptimizerService::measureQueryTime(function () use ($today, $todayEnd) {
            $voucherData = $this->getVoucherPacketSales($today, $todayEnd);
            $reminders = $this->getReminders();

            return [
                'todayCarWashRevenue' => $this->getTodayRevenue($today),
                'todayCarWashByPayment' => $this->getTodayPaymentStats($today),
                'voucherPacketSales' => $voucherData['sales']->toArray(),
                'voucherPurchaseRevenue' => $voucherData['revenue'],
                'cashCarWashRevenue' => $this->getCashRevenue($today),
                'otherCarWashRevenue' => $this->getOtherRevenue($today),
                'latestTransactions' => $this->getLatestTransactions($today),
                'revenueTrend' => $this->getRevenueTrend(),
                'reminders' => $reminders,
            ];
        });

        // Log performance if query takes too long
        if ($performanceData['execution_time'] > 1000) {
            Log::warning('Slow dashboard query detected', [
                'execution_time' => $performanceData['execution_time'],
                'memory_usage' => $performanceData['memory_usage']
            ]);
        }

        return $performanceData['result'];
    }

    private function getReminders()
    {
        $user = Auth::user();
        $reminders = [];

        if ($user->hasRole('Kasir')) {
            $today = Carbon::today('Asia/Jakarta');
            $hasTodayAssignment = StallAssignment::whereDate('start_time', $today)
                ->where('is_active', true)
                ->exists();

            if (!$hasTodayAssignment) {
                $reminders[] = [
                    'type' => 'stall_assignment',
                    'title' => 'Penugasan Stall Belum Diatur',
                    'message' => 'Jadwal Stall Pencucian belum diatur. Mobil yang tercuci tidak akan tercatat ke staff sebelum jadwal diatur.',
                    'priority' => 'high'
                ];
            }
        }

        return $reminders;
    }

    private function getTodayRevenue($today)
    {
        return SalesTransaction::query()
            ->whereDate('created_at', $today)
            ->where('status', '!=', 'cancelled')
            ->sum('total_amount');
    }

    private function getTodayPaymentStats($today)
    {
        return SalesTransaction::query()
            ->select(
                'payment_method',
                DB::raw('COUNT(*) as transaction_count')
            )
            ->whereDate('created_at', $today)
            ->whereIn('transaction_type', ['Cuci Mobil', 'Cuci Mobil Voucher', 'Klaim Garansi'])
            ->where('status', '!=', 'cancelled')
            ->groupBy('payment_method')
            ->get()
            ->map(function ($item) {
                return [
                    'type' => $item->payment_method,
                    'total' => $item->transaction_count,
                ];
            });
    }

    private function getVoucherPacketSales($todayStart, $todayEnd)
    {
        $sales = PurchasedPacket::with('voucherPacket')
            ->whereNotNull('sales_transaction_id')
            ->whereBetween('purchased_at', [$todayStart, $todayEnd])
            ->where('status', '!=', 'cancelled')
            ->get()
            ->groupBy(function ($packet) {
                return $packet->voucherPacket->name ?? 'Unknown';
            })
            ->map(function ($group, $name) {
                $totalRevenue = $group->sum(function ($packet) {
                    return $packet->voucherPacket->price ?? 0;
                });

                return [
                    'name' => $name,
                    'count' => $group->count(),
                    'revenue' => $totalRevenue,
                ];
            })->values();

        return [
            'sales' => $sales,
            'count' => $sales->count(),
            'revenue' => $sales->sum('revenue')
        ];
    }

    private function getCashRevenue($today)
    {
        return SalesTransaction::query()
            ->whereDate('transaction_date', $today)
            ->whereIn('transaction_type', ['Cuci Mobil', 'Cuci Mobil Voucher', 'Klaim Garansi', 'Paket Voucher'])
            ->where('payment_method', 'Cash')
            ->where('status', '!=', 'cancelled')
            ->sum('total_amount');
    }

    private function getOtherRevenue($today)
    {
        return SalesTransaction::query()
            ->whereDate('transaction_date', $today)
            ->whereIn('transaction_type', ['Cuci Mobil', 'Cuci Mobil Voucher', 'Klaim Garansi', 'Paket Voucher'])
            ->where('payment_method', '!=', 'Cash')
            ->where('status', '!=', 'cancelled')
            ->sum('total_amount');
    }

    private function getLatestTransactions($today)
    {
        return SalesTransaction::with([
            'customer:id,name',
            'car:id,plate_number',
            'serviceRecords.stall:id,name'
        ])
            ->whereIn('transaction_type', ['Klaim Garansi', 'Cuci Mobil'])
            ->whereDate('transaction_date', $today)
            ->where('status', '!=', 'cancelled')
            ->orderBy('transaction_date', 'desc')
            ->limit(5)
            ->get();
    }

    private function getRevenueTrend()
    {
        $endDate = Carbon::today('Asia/Jakarta');
        $startDate = $endDate->copy()->subDays(6);

        $revenueData = collect();

        for ($date = $startDate->copy(); $date->lte($endDate); $date->addDay()) {
            $dayStart = $date->copy()->startOfDay();
            $dayEnd = $date->copy()->endOfDay();

            // Get car wash revenue for this day
            $carWashRevenue = SalesTransaction::query()
                ->whereBetween('created_at', [$dayStart, $dayEnd])
                ->whereIn('transaction_type', ['Cuci Mobil', 'Cuci Mobil Voucher', 'Klaim Garansi'])
                ->where('status', '!=', 'cancelled')
                ->sum('total_amount');

            // Get voucher sales revenue for this day
            $voucherSalesRevenue = SalesTransaction::query()
                ->whereBetween('created_at', [$dayStart, $dayEnd])
                ->where('transaction_type', 'Paket Voucher')
                ->where('status', '!=', 'cancelled')
                ->sum('total_amount');

            // Total revenue for this day
            $totalRevenue = $carWashRevenue + $voucherSalesRevenue;

            $revenueData->push([
                'date' => $date->format('Y-m-d'),
                'revenue' => $totalRevenue,
                'carWash' => $carWashRevenue,
                'voucherSales' => $voucherSalesRevenue,
            ]);
        }

        return $revenueData->toArray();
    }

    /**
     * Generate Excel report based on type and date range
     */
    public function generateExcelReport(Request $request)
    {
        Log::info('Excel report generation request received', [
            'user_id' => auth()->id(),
            'user_email' => auth()->user()?->email,
            'request_data' => $request->all(),
            'ip_address' => $request->ip(),
            'user_agent' => $request->userAgent(),
            'timestamp' => now()->toISOString()
        ]);

        try {
            $request->validate([
                'startDate' => 'required|date',
                'endDate' => 'required|date|after_or_equal:startDate',
                'reportType' => 'required|in:sales,transactions,vouchers,staff'
            ]);

            $startDate = Carbon::parse($request->startDate)->startOfDay();
            $endDate = Carbon::parse($request->endDate)->endOfDay();
            $reportType = $request->reportType;

            Log::info('Excel report generation started', [
                'report_type' => $reportType,
                'start_date' => $startDate->toISOString(),
                'end_date' => $endDate->toISOString(),
                'date_range_days' => $startDate->diffInDays($endDate),
                'user_id' => auth()->id()
            ]);

            // Measure execution time
            $startTime = microtime(true);
            $startMemory = memory_get_usage();

            $result = null;
            $filename = '';
            switch ($reportType) {
                case 'sales':
                    $filename = "laporan_penjualan_{$startDate->format('Y-m-d')}_to_{$endDate->format('Y-m-d')}.xlsx";
                    $result = Excel::download(new SalesReportExport($startDate, $endDate), $filename);
                    break;
                case 'transactions':
                    $filename = "laporan_transaksi_{$startDate->format('Y-m-d')}_to_{$endDate->format('Y-m-d')}.xlsx";
                    $result = Excel::download(new TransactionsReportExport($startDate, $endDate), $filename);
                    break;
                case 'vouchers':
                    $filename = "laporan_voucher_{$startDate->format('Y-m-d')}_to_{$endDate->format('Y-m-d')}.xlsx";
                    $result = Excel::download(new VouchersReportExport($startDate, $endDate), $filename);
                    break;
                case 'staff':
                    $filename = "laporan_staff_{$startDate->format('Y-m-d')}_to_{$endDate->format('Y-m-d')}.xlsx";
                    $result = Excel::download(new StaffReportExport($startDate, $endDate), $filename);
                    break;
                default:
                    Log::error('Invalid report type requested', [
                        'report_type' => $reportType,
                        'user_id' => auth()->id()
                    ]);
                    return response()->json(['error' => 'Invalid report type'], 400);
            }

            $endTime = microtime(true);
            $endMemory = memory_get_usage();
            $executionTime = ($endTime - $startTime) * 1000; // Convert to milliseconds
            $memoryUsed = $endMemory - $startMemory;

            Log::info('Excel report generation completed successfully', [
                'report_type' => $reportType,
                'execution_time_ms' => round($executionTime, 2),
                'memory_used_bytes' => $memoryUsed,
                'memory_used_mb' => round($memoryUsed / 1024 / 1024, 2),
                'user_id' => auth()->id(),
                'file_size' => $result->getFile()->getSize() ?? 'unknown'
            ]);

            return $result;

        } catch (\Illuminate\Validation\ValidationException $e) {
            Log::warning('Excel report validation failed', [
                'errors' => $e->errors(),
                'user_id' => auth()->id(),
                'request_data' => $request->all()
            ]);
            throw $e;
        } catch (\Exception $e) {
            Log::error('Excel report generation failed', [
                'report_type' => $request->reportType ?? 'unknown',
                'start_date' => $request->startDate ?? 'unknown',
                'end_date' => $request->endDate ?? 'unknown',
                'error_message' => $e->getMessage(),
                'error_code' => $e->getCode(),
                'error_file' => $e->getFile(),
                'error_line' => $e->getLine(),
                'error_trace' => $e->getTraceAsString(),
                'user_id' => auth()->id(),
                'user_email' => auth()->user()?->email,
                'request_data' => $request->all(),
                'timestamp' => now()->toISOString()
            ]);

            return response()->json([
                'error' => 'Failed to generate report',
                'message' => config('app.debug') ? $e->getMessage() : 'An error occurred while generating the report'
            ], 500);
        }
    }
}
