<?php

namespace App\Services;

use App\Models\Account;
use App\Models\JournalEntry;
use Illuminate\Support\Facades\Log;

class AccountingService
{
    /**
     * Get account ID by semantic key from config.
     */
    public function getAccountId(string $key): ?int
    {
        $code = config("accounting.accounts.{$key}");
        if (!$code) return null;

        $account = Account::where('code', $code)->first();
        return $account?->id;
    }

    /**
     * Get account ID by payment method.
     */
    public function getPaymentAccountId(string $paymentMethod): ?int
    {
        $map = config('accounting.payment_accounts', []);
        $code = $map[$paymentMethod] ?? '1101'; // Default KAS

        $account = Account::where('code', $code)->first();
        return $account?->id;
    }

    /**
     * Get account ID by code directly.
     */
    public function getAccountIdByCode(string $code): ?int
    {
        return Account::where('code', $code)->value('id');
    }

    /**
     * Record journal entry for car wash / sales transaction.
     * All revenue goes to single account (4101), service type tracked via reference
     */
    public function recordSale($salesTransaction): ?JournalEntry
    {
        try {
            $debitAccountId = $this->getPaymentAccountId($salesTransaction->payment_method);
            $creditAccountId = $this->getAccountId('pendapatan_carwash');

            if (!$debitAccountId || !$creditAccountId) {
                Log::warning("AccountingService: account not found for sale #{$salesTransaction->id}");
                return null;
            }

            // Get service type for description
            $serviceTypeName = $this->getServiceTypeName($salesTransaction);

            return JournalEntry::createEntry([
                'journal_date'   => $salesTransaction->transaction_date,
                'description'    => "Penjualan {$serviceTypeName} #{$salesTransaction->id}",
                'reference_type' => 'SalesTransaction',
                'reference_id'   => $salesTransaction->id,
                'created_by'     => config('accounting.system_user_id'),
                'status'         => 'posted',
                'lines'          => [
                    ['account_id' => $debitAccountId,  'debit' => $salesTransaction->total_amount, 'credit' => 0],
                    ['account_id' => $creditAccountId, 'debit' => 0, 'credit' => $salesTransaction->total_amount],
                ],
            ]);
        } catch (\Exception $e) {
            Log::error("AccountingService: recordSale failed - " . $e->getMessage());
            return null;
        }
    }

    /**
     * Get service type name from SalesTransaction (via VoucherPacket)
     * Used for journal description and revenue analysis
     */
    private function getServiceTypeName($salesTransaction): string
    {
        $serviceName = $salesTransaction->purchasedPacket?->voucherPacket?->name ?? 'Layanan';
        return $serviceName;
    }

    /**
     * Record journal entry for voucher packet purchase (deferred revenue).
     */
    public function recordVoucherPurchase($purchasedPacket): ?JournalEntry
    {
        try {
            $amount = $purchasedPacket->voucherPacket?->price ?? 0;
            if ($amount <= 0) return null;

            $paymentMethod = $purchasedPacket->salesTransaction?->payment_method ?? 'Cash';
            $debitAccountId = $this->getPaymentAccountId($paymentMethod);
            $creditAccountId = $this->getAccountId('hutang_voucher');

            if (!$debitAccountId || !$creditAccountId) return null;

            return JournalEntry::createEntry([
                'journal_date'   => $purchasedPacket->purchased_at ?? now(),
                'description'    => "Pembelian Paket Voucher #{$purchasedPacket->id}",
                'reference_type' => 'PurchasedPacket',
                'reference_id'   => $purchasedPacket->id,
                'created_by'     => config('accounting.system_user_id'),
                'status'         => 'posted',
                'lines'          => [
                    ['account_id' => $debitAccountId,  'debit' => $amount, 'credit' => 0],
                    ['account_id' => $creditAccountId, 'debit' => 0, 'credit' => $amount],
                ],
            ]);
        } catch (\Exception $e) {
            Log::error("AccountingService: recordVoucherPurchase failed - " . $e->getMessage());
            return null;
        }
    }

    /**
     * Record journal entry for voucher issuance confirmation.
     * Hutang Delta Mulia → Hutang Voucher
     */
    public function recordVoucherIssuance($voucherIssuance): ?JournalEntry
    {
        try {
            $amount = $voucherIssuance->total_amount ?? 0;
            if ($amount <= 0) return null;

            $debitAccountId  = $this->getAccountId('hutang_delta_mulia');
            $creditAccountId = $this->getAccountId('hutang_voucher');

            if (!$debitAccountId || !$creditAccountId) return null;

            return JournalEntry::createEntry([
                'journal_date'   => $voucherIssuance->confirmed_at ?? now(),
                'description'    => "Penagihan Voucher #{$voucherIssuance->id}",
                'reference_type' => 'VoucherIssuance',
                'reference_id'   => $voucherIssuance->id,
                'created_by'     => config('accounting.system_user_id'),
                'status'         => 'posted',
                'lines'          => [
                    ['account_id' => $debitAccountId,  'debit' => $amount, 'credit' => 0],
                    ['account_id' => $creditAccountId, 'debit' => 0, 'credit' => $amount],
                ],
            ]);
        } catch (\Exception $e) {
            Log::error("AccountingService: recordVoucherIssuance failed - " . $e->getMessage());
            return null;
        }
    }

    /**
     * Record journal for daily cash closing.
     * Kas → Selisih Kas (for difference between system and actual)
     */
    public function recordDailyCashClose($dailyCashLog): ?JournalEntry
    {
        try {
            $systemCash = $dailyCashLog->closing_cash_system ?? 0;
            $actualCash = $dailyCashLog->closing_cash_actual ?? 0;
            $difference = $actualCash - $systemCash;

            if (abs($difference) < 0.01) return null;

            $kasAccountId     = $this->getAccountId('kas');
            $selisihAccountId = $this->getAccountId('selisih_kas');

            if (!$kasAccountId || !$selisihAccountId) return null;

            // If actual > system: Debit KAS, Credit Selisih (unexpected gain)
            // If actual < system: Debit Selisih, Credit KAS (cash shortage)
            $lines = $difference > 0
                ? [
                    ['account_id' => $kasAccountId,     'debit' => abs($difference), 'credit' => 0],
                    ['account_id' => $selisihAccountId, 'debit' => 0, 'credit' => abs($difference)],
                ]
                : [
                    ['account_id' => $selisihAccountId, 'debit' => abs($difference), 'credit' => 0],
                    ['account_id' => $kasAccountId,     'debit' => 0, 'credit' => abs($difference)],
                ];

            return JournalEntry::createEntry([
                'journal_date'   => $dailyCashLog->session_date,
                'description'    => "Selisih Kas Harian - " . $dailyCashLog->session_date,
                'reference_type' => 'DailyCashLog',
                'reference_id'   => $dailyCashLog->id,
                'created_by'     => config('accounting.system_user_id'),
                'status'         => 'posted',
                'lines'          => $lines,
            ]);
        } catch (\Exception $e) {
            Log::error("AccountingService: recordDailyCashClose failed - " . $e->getMessage());
            return null;
        }
    }

    /**
     * Record expense journal entry.
     */
    public function recordExpense(array $data): ?JournalEntry
    {
        try {
            return JournalEntry::createEntry([
                'journal_date'   => $data['date'],
                'description'    => $data['description'],
                'reference_type' => $data['reference_type'] ?? 'Expense',
                'reference_id'   => $data['reference_id'] ?? null,
                'created_by'     => $data['created_by'] ?? config('accounting.system_user_id'),
                'notes'          => $data['notes'] ?? null,
                'status'         => 'posted',
                'lines'          => [
                    ['account_id' => $data['expense_account_id'], 'debit' => $data['amount'], 'credit' => 0],
                    ['account_id' => $data['payment_account_id'], 'debit' => 0, 'credit' => $data['amount']],
                ],
            ]);
        } catch (\Exception $e) {
            Log::error("AccountingService: recordExpense failed - " . $e->getMessage());
            return null;
        }
    }

    /**
     * Record cash/bank movement.
     */
    public function recordCashMovement(array $data): ?JournalEntry
    {
        try {
            return JournalEntry::createEntry([
                'journal_date'   => $data['date'],
                'description'    => $data['description'],
                'reference_type' => $data['reference_type'] ?? 'CashMovement',
                'reference_id'   => $data['reference_id'] ?? null,
                'created_by'     => $data['created_by'] ?? config('accounting.system_user_id'),
                'notes'          => $data['notes'] ?? null,
                'status'         => 'posted',
                'lines'          => [
                    ['account_id' => $data['debit_account_id'],  'debit' => $data['amount'], 'credit' => 0],
                    ['account_id' => $data['credit_account_id'], 'debit' => 0, 'credit' => $data['amount']],
                ],
            ]);
        } catch (\Exception $e) {
            Log::error("AccountingService: recordCashMovement failed - " . $e->getMessage());
            return null;
        }
    }

    /**
     * Reverse/void a journal entry by creating a negating entry.
     */
    public function reverseJournal(JournalEntry $entry, string $reason, int $userId): ?JournalEntry
    {
        try {
            $reversedLines = $entry->lines->map(fn($line) => [
                'account_id' => $line->account_id,
                'debit'      => $line->credit,
                'credit'     => $line->debit,
                'notes'      => 'Reversal: ' . ($line->notes ?? ''),
            ])->toArray();

            return JournalEntry::createEntry([
                'journal_date'   => now(),
                'description'    => "REVERSAL: {$entry->description}",
                'reference_type' => 'JournalEntry',
                'reference_id'   => $entry->id,
                'created_by'     => $userId,
                'notes'          => "Reversal of Journal #{$entry->id}. Reason: {$reason}",
                'status'         => 'posted',
                'lines'          => $reversedLines,
            ]);
        } catch (\Exception $e) {
            Log::error("AccountingService: reverseJournal failed - " . $e->getMessage());
            return null;
        }
    }
}
