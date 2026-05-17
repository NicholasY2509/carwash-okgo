<?php

namespace App\Services;

use Illuminate\Support\Facades\Cache;
use Illuminate\Support\Facades\DB;
use Illuminate\Database\Eloquent\Builder;
use Illuminate\Database\Eloquent\Model;
use Illuminate\Support\Collection;

class QueryOptimizerService
{
    /**
     * Cache query results with automatic invalidation
     */
    public static function cachedQuery(string $key, callable $query, int $ttl = 3600)
    {
        // Execute the query first, then cache the result
        $result = $query();
        Cache::put($key, $result, $ttl);
        return $result;
    }

    /**
     * Get cached query result or execute and cache
     */
    public static function getCachedOrExecute(string $key, callable $query, int $ttl = 3600)
    {
        if (Cache::has($key)) {
            return Cache::get($key);
        }

        return self::cachedQuery($key, $query, $ttl);
    }

    /**
     * Optimize collection queries with eager loading
     */
    public static function optimizeCollectionQuery(Builder $query, array $relations = []): Builder
    {
        if (!empty($relations)) {
            $query->with($relations);
        }

        return $query;
    }

    /**
     * Batch process large datasets
     */
    public static function batchProcess(Collection $items, callable $processor, int $batchSize = 1000): void
    {
        $items->chunk($batchSize)->each(function ($batch) use ($processor) {
            $batch->each($processor);
        });
    }

    /**
     * Get query execution time
     */
    public static function measureQueryTime(callable $query): array
    {
        $startTime = microtime(true);
        $startMemory = memory_get_usage();

        $result = $query();

        $endTime = microtime(true);
        $endMemory = memory_get_usage();

        return [
            'result' => $result,
            'execution_time' => ($endTime - $startTime) * 1000, // in milliseconds
            'memory_usage' => $endMemory - $startMemory, // in bytes
        ];
    }

    /**
     * Optimize search queries with proper indexing hints
     */
    public static function optimizeSearchQuery(Builder $query, string $searchTerm, array $searchColumns): Builder
    {
        if (empty($searchTerm)) {
            return $query;
        }

        $query->where(function ($q) use ($searchTerm, $searchColumns) {
            foreach ($searchColumns as $column) {
                $q->orWhere($column, 'LIKE', "%{$searchTerm}%");
            }
        });

        return $query;
    }

    /**
     * Cache model relationships
     */
    public static function cacheModelRelations(Model $model, array $relations, int $ttl = 1800): void
    {
        foreach ($relations as $relation) {
            $cacheKey = "model_{$model->getTable()}_{$model->id}_{$relation}";
            Cache::remember($cacheKey, $ttl, function () use ($model, $relation) {
                return $model->load($relation);
            });
        }
    }

    /**
     * Clear model cache
     */
    public static function clearModelCache(string $table, ?int $id = null): void
    {
        if ($id) {
            Cache::forget("model_{$table}_{$id}");
        } else {
            // Clear all cache for this table
            Cache::flush();
        }
    }

    /**
     * Get database performance statistics
     */
    public static function getDatabaseStats(): array
    {
        $stats = [];

        // Get slow queries
        $slowQueries = DB::select("
            SELECT 
                sql_text,
                COUNT(*) as execution_count,
                AVG(duration) as avg_duration,
                MAX(duration) as max_duration
            FROM mysql.slow_log 
            WHERE start_time > DATE_SUB(NOW(), INTERVAL 1 DAY)
            GROUP BY sql_text
            ORDER BY avg_duration DESC
            LIMIT 10
        ");

        $stats['slow_queries'] = $slowQueries;

        // Get table sizes
        $tableSizes = DB::select("
            SELECT 
                table_name,
                ROUND(((data_length + index_length) / 1024 / 1024), 2) AS 'size_mb'
            FROM information_schema.tables 
            WHERE table_schema = DATABASE()
            ORDER BY (data_length + index_length) DESC
        ");

        $stats['table_sizes'] = $tableSizes;

        return $stats;
    }
}
