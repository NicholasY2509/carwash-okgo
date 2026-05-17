<?php

namespace App\Http\Middleware;

use Closure;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Log;
use Illuminate\Support\Facades\Cache;
use Symfony\Component\HttpFoundation\Response;

class PerformanceMonitor
{
    /**
     * Handle an incoming request.
     */
    public function handle(Request $request, Closure $next): Response
    {
        $startTime = microtime(true);
        $startMemory = memory_get_usage();

        // Add performance headers
        $response = $next($request);

        $endTime = microtime(true);
        $endMemory = memory_get_usage();

        $executionTime = ($endTime - $startTime) * 1000; // Convert to milliseconds
        $memoryUsage = $endMemory - $startMemory;

        // Add performance headers to response
        $response->headers->set('X-Execution-Time', round($executionTime, 2) . 'ms');
        $response->headers->set('X-Memory-Usage', $this->formatBytes($memoryUsage));

        // Log slow requests (over 1000ms)
        if ($executionTime > 1000) {
            Log::warning('Slow request detected', [
                'url' => $request->fullUrl(),
                'method' => $request->method(),
                'execution_time' => $executionTime,
                'memory_usage' => $memoryUsage,
                'user_agent' => $request->userAgent(),
                'ip' => $request->ip(),
            ]);
        }

        // Track performance metrics
        $this->trackMetrics($request, $executionTime, $memoryUsage);

        return $response;
    }

    /**
     * Track performance metrics in cache
     */
    private function trackMetrics(Request $request, float $executionTime, int $memoryUsage): void
    {
        $route = $request->route()?->getName() ?: $request->path();
        $cacheKey = "performance_metrics_{$route}";

        $metrics = Cache::get($cacheKey, [
            'count' => 0,
            'total_time' => 0,
            'total_memory' => 0,
            'min_time' => PHP_FLOAT_MAX,
            'max_time' => 0,
            'last_updated' => now()->toISOString(),
        ]);

        $metrics['count']++;
        $metrics['total_time'] += $executionTime;
        $metrics['total_memory'] += $memoryUsage;
        $metrics['min_time'] = min($metrics['min_time'], $executionTime);
        $metrics['max_time'] = max($metrics['max_time'], $executionTime);
        $metrics['last_updated'] = now()->toISOString();

        // Store for 24 hours
        Cache::put($cacheKey, $metrics, 86400);
    }

    /**
     * Format bytes to human readable format
     */
    private function formatBytes(int $bytes, int $precision = 2): string
    {
        $units = ['B', 'KB', 'MB', 'GB', 'TB'];

        for ($i = 0; $bytes > 1024 && $i < count($units) - 1; $i++) {
            $bytes /= 1024;
        }

        return round($bytes, $precision) . ' ' . $units[$i];
    }
}
