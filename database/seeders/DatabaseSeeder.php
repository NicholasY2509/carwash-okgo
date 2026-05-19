<?php

namespace Database\Seeders;

use App\Models\Staff;
use App\Models\User;
// use Illuminate\Database\Console\Seeds\WithoutModelEvents;
use Illuminate\Database\Seeder;

class DatabaseSeeder extends Seeder
{
    /**
     * Seed the application's database.
     */
    public function run(): void
    {
        // User::factory(10)->create();

        if (!User::where('email', 'test@example.com')->exists()) {
            User::factory()->create([
                'name' => 'Test User',
                'email' => 'test@example.com',
            ]);
        }

        if (Staff::count() === 0) {
            Staff::factory(12)->create();
        }

        // Seed default items/barang if not exists
        if (!\App\Models\Item::where('sku', 'SHM-PREM')->exists()) {
            $itemShampoo = \App\Models\Item::create([
                'sku' => 'SHM-PREM',
                'name' => 'Shampoo Premium Salju',
                'description' => 'Shampoo mobil salju dengan pH balance dan wax protector.',
                'stock' => 50,
                'price' => 15000,
            ]);

            \App\Models\StockMovement::create([
                'item_id' => $itemShampoo->id,
                'quantity' => 50,
                'resulting_stock' => 50,
                'type' => 'adjustment',
                'reason' => 'Stok awal shampoo premium',
            ]);

            $itemSponge = \App\Models\Item::create([
                'sku' => 'SPG-WASH',
                'name' => 'Spons Cuci Microfiber',
                'description' => 'Spons cuci microfiber anti gores.',
                'stock' => 20,
                'price' => 8500,
            ]);

            \App\Models\StockMovement::create([
                'item_id' => $itemSponge->id,
                'quantity' => 20,
                'resulting_stock' => 20,
                'type' => 'adjustment',
                'reason' => 'Stok awal spons cuci',
            ]);

            // Connect items to a default product (service)
            $defaultService = \App\Models\Product::firstOrCreate([
                'name' => 'Cuci Body + Vacuum',
            ], [
                'price' => 50000,
                'description' => 'Layanan cuci body luar, cuci kolong, vacuum debu interior mobil.',
            ]);

            // Attach items to the default service
            $defaultService->items()->sync([
                $itemShampoo->id => ['quantity' => 1],
                $itemSponge->id => ['quantity' => 1]
            ]);
        }

        // Seed default incentive tiers if not exists
        if (\App\Models\IncentiveTier::count() === 0) {
            \App\Models\IncentiveTier::create([
                'name' => 'Tier 1',
                'min_cars' => 1000,
                'max_cars' => 1200,
                'commission' => 400,
            ]);

            \App\Models\IncentiveTier::create([
                'name' => 'Tier 2',
                'min_cars' => 1201,
                'max_cars' => 1500,
                'commission' => 500,
            ]);

            \App\Models\IncentiveTier::create([
                'name' => 'Tier 3',
                'min_cars' => 1501,
                'max_cars' => null,
                'commission' => 500,
            ]);
        }
    }
}
