<?php

namespace App\Console\Commands;

use Illuminate\Console\Command;
use Illuminate\Support\Facades\DB;
use Illuminate\Support\Facades\Session;

class ClearOldSessions extends Command
{
    /**
     * The name and signature of the console command.
     */
    protected $signature = 'app:clear-old-sessions {--force : Force clear all sessions}';

    /**
     * The console command description.
     */
    protected $description = 'Clear old sessions to prevent large headers';

    /**
     * Execute the console command.
     */
    public function handle(): int
    {
        $this->info('🧹 Clearing old sessions...');

        if ($this->option('force')) {
            // Clear all sessions
            DB::table('sessions')->truncate();
            $this->info('✅ All sessions cleared');
        } else {
            // Clear sessions older than 1 hour
            $deleted = DB::table('sessions')
                ->where('last_activity', '<', now()->subHour()->timestamp)
                ->delete();

            $this->info("✅ Cleared {$deleted} old sessions");
        }

        // Clear file sessions if using file driver
        if (config('session.driver') === 'file') {
            $sessionPath = storage_path('framework/sessions');
            $files = glob($sessionPath . '/*');
            $count = 0;

            foreach ($files as $file) {
                if (is_file($file) && filemtime($file) < now()->subHour()->timestamp) {
                    unlink($file);
                    $count++;
                }
            }

            $this->info("✅ Cleared {$count} old session files");
        }

        return self::SUCCESS;
    }
}
