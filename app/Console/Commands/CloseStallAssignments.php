<?php

namespace App\Console\Commands;

use App\Models\StallAssignment;
use Illuminate\Console\Command;

class CloseStallAssignments extends Command
{
    /**
     * The name and signature of the console command.
     *
     * @var string
     */
    protected $signature = 'app:close-stall-assignments';

    /**
     * The console command description.
     *
     * @var string
     */
    protected $description = 'Command description';

    /**
     * Execute the console command.
     */
    public function handle()
    {
        $stall_assignments = StallAssignment::where('is_active', true)->get();
        foreach ($stall_assignments as $stall_assignment) {
            $stall_assignment->update([
                'end_time' => now()->toDateTimeString(),
                'is_active' => false
            ]);
        }
    }
}
