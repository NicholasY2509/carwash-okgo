<?php

namespace Tests\Feature;

use App\Models\User;
use App\Models\VoucherDeltamas;
use App\Models\PurchasedPacket;
use App\Models\VoucherPacket;
use App\Models\Customer;
use App\Models\SalesTransaction;
use Illuminate\Foundation\Testing\RefreshDatabase;
use Illuminate\Support\Facades\Http;
use Tests\TestCase;

class VoucherDeltamasDuplicateTest extends TestCase
{
    // use RefreshDatabase; // We might want to avoid wiping the DB if we want to use existing data, but for a reproducible test, we should create our own. 
    // However, since I don't want to mess up the user's DB, I will use transactions or just create and delete.
    // Actually, RefreshDatabase is safer for tests usually, but existing dev data might be lost. 
    // Let's rely on creating specific unique data.

    public function test_search_spk_detects_duplicate()
    {
        $user = User::first(); // Assume a user exists, or create one if needed for auth.
        if (!$user) {
             $user = User::factory()->create();
        }

        // 1. Create a dummy existing Voucher Deltamas record
        // Need dependencies: PurchasedPacket -> VoucherPacket, Customer, SalesTransaction
        
        $customer = Customer::forceCreate(['name' => 'Test Cust', 'phone' => '08123']);
        $packet = VoucherPacket::forceCreate(['name' => 'Test Packet', 'valid_period_months' => 12, 'price' => 1000, 'voucher_type_id' => 1, 'quantity' => 1]);
        $trx = SalesTransaction::forceCreate(['customer_id' => $customer->id, 'transaction_date' => now(), 'total_amount' => 0, 'paid_amount' => 0, 'change_amount' => 0, 'payment_method' => 'Other', 'transaction_type' => 'Test']);
        
        $purchasedPacket = PurchasedPacket::forceCreate([
            'voucher_packet_id' => $packet->id,
            'customer_id' => $customer->id,
            'sales_transaction_id' => $trx->id,
            'purchased_at' => now(),
            'expired_at' => now()->addYear(),
        ]);

        $duplicateNota = 'DUPLICATE-123';
        
        VoucherDeltamas::forceCreate([
            'date' => now(),
            'purchased_packet_id' => $purchasedPacket->id,
            'spk_id' => 'SPK-999',
            'nota_spk' => $duplicateNota,
            'sales_code' => 'XYZ',
            'description' => 'Test',
        ]);

        // 2. Mock External API to return this duplicate nota
        Http::fake([
            'sales.deltamastoyota.com/api/v1/spk/search*' => Http::response([
                [
                    'spk_id' => 'SPK-NEW',
                    'nota' => $duplicateNota, // Matches existing
                    'kd_sales' => 'XYZ',
                    'customer_name' => 'New Guy',
                    'customer_phone' => '08111',
                    'tanggal_do' => '2023-01-01',
                    'plate_number' => 'B 9999 NEW',
                    'car_model' => 'Innova',
                ]
            ], 200),
        ]);

        // 3. Hit the endpoint
        $response = $this->actingAs($user)->getJson(route('voucher-deltamas.search-spk', ['search' => 'anything']));

        // 4. Verification
        $response->assertStatus(200);
        $data = $response->json();
        
        $this->assertNotEmpty($data);
        $this->assertTrue($data[0]['is_duplicate'], 'Should be flagged as duplicate');
        $this->assertStringContainsString('sudah terdaftar', $data[0]['duplicate_message']);

        // Clean up (if not using RefreshDatabase)
        VoucherDeltamas::where('nota_spk', $duplicateNota)->delete();
        $purchasedPacket->delete();
        $trx->delete();
        $customer->delete();
        $packet->delete();
    }
}
