<?php

namespace Database\Seeders;

use App\Models\Car;
use App\Models\Customer;
use App\Models\Product;
use App\Models\Staff;
use App\Models\Stall;
use Carbon\Carbon;
use Illuminate\Database\Seeder;
use Illuminate\Support\Facades\DB;
use Illuminate\Support\Str;

class SimulateCarWashesSeeder extends Seeder
{
    /**
     * Run the database seeds.
     */
    public function run(): void
    {
        $this->command->info('Starting simulation of thousands of car washes...');

        // 1. Ensure Customer & Car exist
        $customer = Customer::first() ?: Customer::create([
            'name' => 'Simulation Customer',
            'phone' => '081234567890',
            'email' => 'simulation@example.com',
        ]);

        $car = Car::first() ?: Car::create([
            'plate_number' => 'DK 1234 SM',
            'customer_id' => $customer->id,
            'model' => 'Toyota Avanza',
            'color' => 'Black',
        ]);

        // 2. Ensure Product exists
        $product = Product::first() ?: Product::create([
            'name' => 'Cuci Body + Vacuum',
            'price' => 50000,
        ]);

        // 3. Ensure Stall exists
        $stall = Stall::first() ?: Stall::create([
            'name' => 'Stall 1',
        ]);

        // 4. Ensure WorkPosition exists
        $workPosition = \App\Models\WorkPosition::first() ?: \App\Models\WorkPosition::create([
            'name' => 'Wash Specialist',
        ]);

        // Clean up previous simulation records to ensure seeder is idempotent
        $simulationNames = ['Asep Wash', 'Budi Wash', 'Cecep Wash', 'Dedi Wash', 'Andi', 'Budi', 'Cici', 'Dedi'];
        $simulatedStaffIds = Staff::whereIn('full_name', $simulationNames)->pluck('id');
        if ($simulatedStaffIds->isNotEmpty()) {
            $this->command->info('Cleaning up previous simulation records...');
            DB::table('service_records')->whereIn('staff_id', $simulatedStaffIds)->delete();
            DB::table('sales_transactions')->whereIn('staff_id', $simulatedStaffIds)->delete();
            Staff::whereIn('id', $simulatedStaffIds)->delete();
        }

        // 5. Set up four target staff members with deliberate totals
        $targets = [
            [
                'name' => 'Andi',
                'target_washes' => 1100, // Should hit Tier 1 (1000 - 1200)
            ],
            [
                'name' => 'Budi',
                'target_washes' => 1350, // Should hit Tier 2 (1201 - 1500)
            ],
            [
                'name' => 'Cici',
                'target_washes' => 1600, // Should hit Tier 3 (> 1500)
            ],
            [
                'name' => 'Dedi',
                'target_washes' => 950,  // Below Tier 1 threshold (No Tier / Rp0)
            ],
        ];

        $currentMonth = Carbon::now()->month;
        $currentYear = Carbon::now()->year;
        $nowStr = Carbon::now()->toDateTimeString();

        foreach ($targets as $target) {
            $this->command->info("Creating staff member: {$target['name']}...");

            // Find or create the staff member
            $staff = Staff::firstOrCreate(
                ['full_name' => $target['name']],
                [
                    'first_name' => explode(' ', $target['name'])[0],
                    'last_name' => explode(' ', $target['name'])[1] ?? '',
                    'nik' => 'NIK-' . rand(100000, 999999),
                    'phone' => '08' . rand(100000000, 999999999),
                    'work_position_id' => $workPosition->id,
                ]
            );

            $totalWashesToCreate = $target['target_washes'];
            $this->command->info("Generating {$totalWashesToCreate} washes for {$target['name']} distributed in current month...");

            $transactions = [];
            $records = [];

            // We generate all transactions first, then bulk insert
            for ($i = 0; $i < $totalWashesToCreate; $i++) {
                // Distribute dates randomly across the current month
                $day = rand(1, Carbon::now()->day ?: 28);
                $hour = rand(8, 17);
                $minute = rand(0, 59);
                $second = rand(0, 59);
                $serviceDate = Carbon::create($currentYear, $currentMonth, $day, $hour, $minute, $second)->toDateTimeString();

                // Generate a temporary high-precision ID for linking
                // But since DB bulk insert of transactions generates IDs sequentially,
                // we'll get the last inserted ID first, or just insert them one by one or in small linked chunks.
                // To keep it perfectly correct, fast, and simple:
                // We'll insert transactions in batches of 500, get their first ID, and sequentially set payment_id!
                $transactions[] = [
                    'transaction_date' => $serviceDate,
                    'customer_id' => $customer->id,
                    'car_id' => $car->id,
                    'staff_id' => $staff->id,
                    'total_amount' => $product->price,
                    'paid_amount' => $product->price,
                    'change_amount' => 0,
                    'payment_method' => 'Cash',
                    'transaction_type' => 'Cuci Mobil',
                    'status' => 'completed',
                    'created_at' => $serviceDate,
                    'updated_at' => $serviceDate,
                ];
            }

            // Bulk insert transactions in batches of 500, and create corresponding linked ServiceRecords
            $chunks = array_chunk($transactions, 500);
            foreach ($chunks as $chunkIndex => $chunk) {
                // Get the starting ID that will be generated
                // We run a transaction to perform this safely
                DB::transaction(function () use ($chunk, $staff, $car, $product, $stall) {
                    // Bulk insert transactions
                    DB::table('sales_transactions')->insert($chunk);

                    // Retrieve the last generated IDs
                    $countInserted = count($chunk);
                    $lastId = DB::getPdo()->lastInsertId();
                    
                    // PDO lastInsertId returns the first auto-incremented ID of the batch in MySQL/Postgres.
                    // For SQLite/others, it might return the last. Let's make it robust:
                    $firstId = (int)$lastId;

                    $recordsToInsert = [];
                    foreach ($chunk as $index => $tx) {
                        $txId = $firstId + $index;
                        $recordsToInsert[] = [
                            'service_date' => $tx['transaction_date'],
                            'car_id' => $car->id,
                            'product_id' => $product->id,
                            'staff_id' => $staff->id,
                            'stall_id' => $stall->id,
                            'payment_type' => 'App\Models\SalesTransaction',
                            'payment_id' => $txId,
                            'status' => 'completed',
                            'created_at' => $tx['transaction_date'],
                            'updated_at' => $tx['transaction_date'],
                        ];
                    }

                    // Bulk insert the matching service records
                    DB::table('service_records')->insert($recordsToInsert);
                });
            }

            $this->command->info("Successfully generated all washes for {$target['name']}!");
        }

        $this->command->info('Simulation Seeder completed successfully!');
    }
}
