<?php

/**
 * Service Type to Revenue Account Mapping
 * Maps VoucherPacket names to accounting revenue accounts
 *
 * When a SalesTransaction is created, the system will:
 * 1. Look up the VoucherPacket name from the PurchasedPacket
 * 2. Find the matching revenue account from this config
 * 3. Create journal entry: Debit KAS/BANK, Credit Revenue Account
 */

return [
    'revenue_accounts' => [
        // Cuci Mobil Services
        'Cuci Standar' => [
            'code' => '4101',
            'name' => 'Pendapatan Cuci Standar',
            'description' => 'Revenue from standard car wash service'
        ],
        'Cuci Premium' => [
            'code' => '4102',
            'name' => 'Pendapatan Cuci Premium',
            'description' => 'Revenue from premium car wash service'
        ],
        'Cuci Express' => [
            'code' => '4103',
            'name' => 'Pendapatan Cuci Express',
            'description' => 'Revenue from express car wash service'
        ],
        'Wax & Polish' => [
            'code' => '4104',
            'name' => 'Pendapatan Wax & Polish',
            'description' => 'Revenue from wax and polish service'
        ],
        'Detail Service' => [
            'code' => '4105',
            'name' => 'Pendapatan Detail Service',
            'description' => 'Revenue from detail service'
        ],

        // Default fallback
        'default' => [
            'code' => '4100',
            'name' => 'Pendapatan Layanan',
            'description' => 'General service revenue'
        ]
    ],

    /**
     * Service categories for reporting
     * Used to group services in reports
     */
    'categories' => [
        'Car Wash' => [
            'Cuci Standar',
            'Cuci Premium',
            'Cuci Express',
        ],
        'Additional Services' => [
            'Wax & Polish',
            'Detail Service',
        ],
    ],

    /**
     * Service pricing templates (reference only)
     * Actual prices are in VoucherPacket, but these help understand margins
     */
    'pricing_reference' => [
        'Cuci Standar' => [
            'price' => 50000,
            'estimated_labor_cost' => 15000,
            'estimated_supply_cost' => 3000,
        ],
        'Cuci Premium' => [
            'price' => 80000,
            'estimated_labor_cost' => 25000,
            'estimated_supply_cost' => 8000,
        ],
        'Cuci Express' => [
            'price' => 35000,
            'estimated_labor_cost' => 10000,
            'estimated_supply_cost' => 2000,
        ],
    ],
];
