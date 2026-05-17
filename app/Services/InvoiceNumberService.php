<?php

namespace App\Services;

use Illuminate\Support\Facades\DB;

class InvoiceNumberService
{
    /**
     * Generate the next invoice number for voucher issuances
     * Format: DTMVC/{year}-{month}/{automatic_number}
     * Example: DTMVC/2025-10/0001
     * Number never resets and continues incrementing across months
     *
     * @param string $tableName The table to generate invoice number for
     * @param string $columnName The column name that stores the invoice number
     * @return string
     */
    public static function generate(
        string $tableName = 'voucher_issuances',
        string $columnName = 'nota'
    ): string {
        $year = date('Y');
        $month = date('m');
        $prefix = "DTMVC/{$year}-{$month}/";

        $lastInvoice = DB::table($tableName)
            ->where($columnName, 'LIKE', 'DTMVC/%')
            ->orderByRaw("CAST(SUBSTRING_INDEX($columnName, '/', -1) AS UNSIGNED) DESC")
            ->value($columnName);

        if ($lastInvoice) {
            $lastNumber = (int) substr($lastInvoice, strrpos($lastInvoice, '/') + 1);
            $newNumber = $lastNumber + 1;
        } else {
            $newNumber = 1;
        }

        return $prefix . str_pad($newNumber, 4, '0', STR_PAD_LEFT);
    }

    /**
     * Generate invoice number with transaction lock to prevent duplicates
     * Use this method when multiple processes might generate numbers simultaneously
     *
     * @param string $tableName
     * @param string $columnName
     * @return string
     */
    public static function generateSafe(
        string $tableName = 'voucher_issuances',
        string $columnName = 'nota'
    ): string {
        return DB::transaction(function () use ($tableName, $columnName) {
            $year = date('Y');
            $month = date('m');
            $prefix = "DTMVC/{$year}-{$month}/";

            $lastInvoice = DB::table($tableName)
                ->where($columnName, 'LIKE', $prefix . '%')
                ->lockForUpdate()
                ->orderBy($columnName, 'desc')
                ->value($columnName);

            if ($lastInvoice) {
                $lastNumber = (int) substr($lastInvoice, strlen($prefix));
                $newNumber = $lastNumber + 1;
            } else {
                $newNumber = 1;
            }

            return $prefix . str_pad($newNumber, 4, '0', STR_PAD_LEFT);
        });
    }
}