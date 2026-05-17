<?php

namespace App\Console\Commands;

use Illuminate\Console\Command;
use Illuminate\Support\Facades\Cache;
use Illuminate\Support\Facades\DB;
use Illuminate\Support\Facades\Artisan;
use App\Services\QueryOptimizerService;

class OptimizePerformance extends Command
{
    /**
     * The name and signature of the console command.
     *
     * @var string
     */
    protected $signature = 'app:optimize-performance {--clear-cache : Clear all caches} {--analyze : Analyze database performance}';

    /**
     * The console command description.
     *
     * @var string
     */
    protected $description = 'Optimize application performance by clearing caches and analyzing database';

    /**
     * Execute the console command.
     */
    public function handle(): int
    {
        $this->info('🚀 Starting performance optimization...');

        if ($this->option('clear-cache')) {
            $this->clearAllCaches();
        }

        if ($this->option('analyze')) {
            $this->analyzeDatabase();
        }

        $this->optimizeApplication();

        $this->info('✅ Performance optimization completed!');

        return self::SUCCESS;
    }

    /**
     * Clear all application caches
     */
    private function clearAllCaches(): void
    {
        $this->info('🧹 Clearing application caches...');

        $caches = [
            'config' => 'php artisan config:clear',
            'route' => 'php artisan route:clear',
            'view' => 'php artisan view:clear',
            'cache' => 'php artisan cache:clear',
            'application' => 'php artisan optimize:clear',
        ];

        $progressBar = $this->output->createProgressBar(count($caches));
        $progressBar->start();

        foreach ($caches as $name => $command) {
            $this->line("\nClearing {$name} cache...");
            Artisan::call($command);
            $progressBar->advance();
        }

        $progressBar->finish();
        $this->newLine();
        $this->info('✅ All caches cleared successfully!');
    }

    /**
     * Analyze database performance
     */
    private function analyzeDatabase(): void
    {
        $this->info('📊 Analyzing database performance...');

        try {
            // Get table sizes
            $tableSizes = DB::select("
                SELECT 
                    table_name,
                    ROUND(((data_length + index_length) / 1024 / 1024), 2) AS 'size_mb',
                    table_rows
                FROM information_schema.tables 
                WHERE table_schema = DATABASE()
                ORDER BY (data_length + index_length) DESC
            ");

            $this->table(
                ['Table', 'Size (MB)', 'Rows'],
                collect($tableSizes)->map(fn($table) => [
                    $table->table_name,
                    $table->size_mb,
                    number_format($table->table_rows)
                ])->toArray()
            );

            // Check for missing indexes
            $this->checkMissingIndexes();
        } catch (\Exception $e) {
            $this->error("Database analysis failed: {$e->getMessage()}");
        }
    }

    /**
     * Check for missing indexes on foreign keys
     */
    private function checkMissingIndexes(): void
    {
        $this->info('🔍 Checking for missing indexes...');

        $foreignKeys = DB::select("
            SELECT 
                TABLE_NAME,
                COLUMN_NAME,
                CONSTRAINT_NAME
            FROM information_schema.KEY_COLUMN_USAGE 
            WHERE REFERENCED_TABLE_SCHEMA = DATABASE()
            AND REFERENCED_TABLE_NAME IS NOT NULL
        ");

        $missingIndexes = [];

        foreach ($foreignKeys as $fk) {
            $indexExists = DB::select("
                SELECT COUNT(*) as count
                FROM information_schema.STATISTICS 
                WHERE TABLE_SCHEMA = DATABASE()
                AND TABLE_NAME = ?
                AND COLUMN_NAME = ?
            ", [$fk->TABLE_NAME, $fk->COLUMN_NAME]);

            if ($indexExists[0]->count == 0) {
                $missingIndexes[] = [
                    'table' => $fk->TABLE_NAME,
                    'column' => $fk->COLUMN_NAME,
                    'constraint' => $fk->CONSTRAINT_NAME
                ];
            }
        }

        if (!empty($missingIndexes)) {
            $this->warn('⚠️  Missing indexes found:');
            $this->table(
                ['Table', 'Column', 'Constraint'],
                $missingIndexes
            );
        } else {
            $this->info('✅ All foreign keys are properly indexed!');
        }
    }

    /**
     * Optimize application settings
     */
    private function optimizeApplication(): void
    {
        $this->info('⚡ Optimizing application settings...');

        // Optimize configuration
        Artisan::call('config:cache');
        $this->line('✅ Configuration cached');

        // Optimize routes
        Artisan::call('route:cache');
        $this->line('✅ Routes cached');

        // Optimize views
        Artisan::call('view:cache');
        $this->line('✅ Views cached');

        // Clear performance metrics cache
        $this->clearPerformanceMetrics();

        $this->info('✅ Application optimization completed!');
    }

    /**
     * Clear performance metrics cache
     */
    private function clearPerformanceMetrics(): void
    {
        $keys = Cache::get('performance_metrics_keys', []);

        foreach ($keys as $key) {
            Cache::forget($key);
        }

        Cache::forget('performance_metrics_keys');
        $this->line('✅ Performance metrics cleared');
    }
}
