<?php

namespace Database\Seeders;

use Illuminate\Database\Console\Seeds\WithoutModelEvents;
use Illuminate\Database\Seeder;

class AccountSeeder extends Seeder
{
    /**
     * Run the database seeds.
     */
    public function run(): void
    {
        // Chart of Accounts - Standard Indonesian Accounting
        \App\Models\Account::insert([
            // ASET (1xxx)
            ['code' => '1101', 'name' => 'KAS', 'type' => 'asset', 'normal_balance' => 'debit', 'is_active' => true],
            ['code' => '1102', 'name' => 'BANK BCA (8005250028)', 'type' => 'asset', 'normal_balance' => 'debit', 'is_active' => true],
            ['code' => '1301', 'name' => 'BIAYA SEWA DIBAYAR DIMUKA', 'type' => 'asset', 'normal_balance' => 'debit', 'is_active' => true],

            // ASET TETAP (Fixed Assets)
            ['code' => '1501', 'name' => 'ASET TETAP OPERASIONAL', 'type' => 'asset', 'normal_balance' => 'debit', 'is_active' => true],
            ['code' => '1502', 'name' => 'BANGUNAN & RENOVASI', 'type' => 'asset', 'normal_balance' => 'debit', 'is_active' => true],
            ['code' => '1503', 'name' => 'TANAH & INFRASTRUKTUR', 'type' => 'asset', 'normal_balance' => 'debit', 'is_active' => true],
            ['code' => '1591', 'name' => 'AKUMULASI PENYUSUTAN ASET', 'type' => 'asset', 'normal_balance' => 'credit', 'is_active' => true],
            ['code' => '1701', 'name' => 'PPH 23', 'type' => 'asset', 'normal_balance' => 'debit', 'is_active' => true],

            // KEWAJIBAN (2xxx)
            ['code' => '2101', 'name' => 'HUTANG DELTA MULIA', 'type' => 'liability', 'normal_balance' => 'credit', 'is_active' => true],
            ['code' => '2102', 'name' => 'LEBIH BYR (DIKEMBALIKAN)', 'type' => 'liability', 'normal_balance' => 'credit', 'is_active' => true],
            ['code' => '2103', 'name' => 'HUTANG VOUCHER', 'type' => 'liability', 'normal_balance' => 'credit', 'is_active' => true],

            // EKUITAS (3xxx)
            ['code' => '3101', 'name' => 'MODAL', 'type' => 'equity', 'normal_balance' => 'credit', 'is_active' => true],
            ['code' => '3201', 'name' => 'LABA DITAHAN', 'type' => 'equity', 'normal_balance' => 'credit', 'is_active' => true],

            // PENDAPATAN (4xxx)
            ['code' => '4101', 'name' => 'CUCI MOBIL', 'type' => 'revenue', 'normal_balance' => 'credit', 'is_active' => true],
            ['code' => '4201', 'name' => 'PENDAPATAN JASA GIRO', 'type' => 'revenue', 'normal_balance' => 'credit', 'is_active' => true],
            ['code' => '4202', 'name' => 'PENDAPATAN LAIN-LAIN', 'type' => 'revenue', 'normal_balance' => 'credit', 'is_active' => true],

            // BEBAN (5xxx)
            ['code' => '5101', 'name' => 'BYA GAJI', 'type' => 'expense', 'normal_balance' => 'debit', 'is_active' => true],
            ['code' => '5102', 'name' => 'BIAYA PENYUSUTAN ASET', 'type' => 'expense', 'normal_balance' => 'debit', 'is_active' => true],
            ['code' => '5103', 'name' => 'BIAYA SEWA TANAH/BANGUNAN', 'type' => 'expense', 'normal_balance' => 'debit', 'is_active' => true],
            ['code' => '5104', 'name' => 'BIAYA ASURANSI', 'type' => 'expense', 'normal_balance' => 'debit', 'is_active' => true],
            ['code' => '5105', 'name' => 'BIAYA BANK', 'type' => 'expense', 'normal_balance' => 'debit', 'is_active' => true],
            ['code' => '5106', 'name' => 'BIAYA KANTOR LAIN-LAIN', 'type' => 'expense', 'normal_balance' => 'debit', 'is_active' => true],
            ['code' => '5107', 'name' => 'BYA PERALATAN CARWASH', 'type' => 'expense', 'normal_balance' => 'debit', 'is_active' => true],
            ['code' => '5108', 'name' => 'BIAYA NOTARIS', 'type' => 'expense', 'normal_balance' => 'debit', 'is_active' => true],
            ['code' => '5109', 'name' => 'SELISIH KAS', 'type' => 'expense', 'normal_balance' => 'debit', 'is_active' => true],
        ]);
    }
}
