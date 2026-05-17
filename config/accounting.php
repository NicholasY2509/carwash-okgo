<?php

return [
    /*
    |--------------------------------------------------------------------------
    | Account Code Mappings
    |--------------------------------------------------------------------------
    | Maps semantic account names to account codes in the Chart of Accounts.
    | AccountingService uses these codes to look up account IDs dynamically.
    */

    'accounts' => [
        // ASET
        'kas'                   => '1101', // KAS
        'bank_bca'              => '1102', // BANK BCA (8005250028)
        'sewa_dibayar_dimuka'   => '1301', // BIAYA SEWA DIBAYAR DIMUKA
        'aset_tetap_operasional'=> '1501', // ASET TETAP OPERASIONAL
        'bangunan_renovasi'     => '1502', // BANGUNAN & RENOVASI
        'tanah_infrastruktur'   => '1503', // TANAH & INFRASTRUKTUR
        'akum_penyusutan'       => '1591', // AKUMULASI PENYUSUTAN ASET
        'pph23'                 => '1701', // PPH 23

        // KEWAJIBAN
        'hutang_delta_mulia'    => '2101', // HUTANG DELTA MULIA
        'lebih_bayar'           => '2102', // LEBIH BYR (DIKEMBALIKAN)
        'hutang_voucher'        => '2103', // HUTANG VOUCHER

        // EKUITAS
        'modal'                 => '3101', // MODAL
        'laba_ditahan'          => '3201', // LABA DITAHAN

        // PENDAPATAN
        'pendapatan_carwash'    => '4101', // CUCI MOBIL
        'pendapatan_jasa_giro'  => '4201', // PENDAPATAN JASA GIRO
        'pendapatan_lain'       => '4202', // PENDAPATAN LAIN-LAIN

        // BEBAN
        'biaya_gaji'            => '5101', // BYA GAJI
        'biaya_penyusutan'      => '5102', // BIAYA PENYUSUTAN ASET
        'biaya_sewa'            => '5103', // BIAYA SEWA TANAH/BANGUNAN
        'biaya_asuransi'        => '5104', // BIAYA ASURANSI
        'biaya_bank'            => '5105', // BIAYA BANK
        'biaya_kantor'          => '5106', // BIAYA KANTOR LAIN-LAIN
        'biaya_peralatan'       => '5107', // BYA PERALATAN CARWASH
        'biaya_notaris'         => '5108', // BIAYA NOTARIS
        'selisih_kas'           => '5109', // SELISIH KAS
    ],

    /*
    |--------------------------------------------------------------------------
    | Payment Method to Account Mapping
    |--------------------------------------------------------------------------
    */
    'payment_accounts' => [
        'Cash'           => '1101',
        'Transfer'       => '1102',
        'Bank'           => '1102',
        'Debit/Credit'   => '1102',
        'QRIS'           => '1102',
        'Voucher Deltamas'=> '2103',
        'Voucher'        => '2103',
    ],

    /*
    |--------------------------------------------------------------------------
    | System User ID
    |--------------------------------------------------------------------------
    | Used as created_by for auto-generated journal entries.
    */
    'system_user_id' => 1,
];
