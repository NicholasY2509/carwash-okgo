<?php

namespace App\Http\Controllers;

use App\Jobs\SendWhatsAppReceiptJob;
use App\Models\SalesTransaction;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Log;

class MidtransController extends Controller
{
    public function webhook(Request $request)
    {
        $serverKey = env('MIDTRANS_SERVER_KEY');
        $payload = $request->getContent();
        Log::info('Webhook received', ['payload' => $payload]);
        $notification = json_decode($payload);

        if (!$notification) {
            return response()->json(['message' => 'Invalid JSON'], 400);
        }

        $signatureKey = hash('sha512', $notification->order_id . $notification->status_code . $notification->gross_amount . $serverKey);

        if ($notification->signature_key !== $signatureKey) {
            Log::warning('Midtrans Signature mismatch', ['payload' => $notification]);
            return response()->json(['message' => 'Invalid signature'], 403);
        }

        $transactionStatus = $notification->transaction_status;
        $orderId = $notification->order_id; // e.g., CW-15-16839213

        // Extract ID from orderId (Format: prefix-ID-timestamp)
        $parts = explode('-', $orderId);
        if (count($parts) >= 2) {
            $transactionId = $parts[1];
            $salesTransaction = SalesTransaction::find($transactionId);

            if ($salesTransaction) {
                if ($transactionStatus == 'capture' || $transactionStatus == 'settlement') {
                    if ($salesTransaction->status !== 'completed') {
                        $salesTransaction->status = 'completed';
                        $salesTransaction->paid_amount = $salesTransaction->total_amount;
                        $salesTransaction->save();
                        
                        $salesTransaction->load(['customer', 'car', 'serviceRecords.product', 'items.item']);
                        SendWhatsAppReceiptJob::dispatchSync($salesTransaction);
                    }
                } else if ($transactionStatus == 'cancel' || $transactionStatus == 'deny' || $transactionStatus == 'expire') {
                    $salesTransaction->status = 'cancelled';
                    $salesTransaction->save();
                }
            }
        }

        return response()->json(['message' => 'Success']);
    }

    public function status(string $id)
    {
        $transaction = SalesTransaction::find($id);
        
        if (!$transaction) {
            return response()->json(['message' => 'Not found'], 404);
        }

        return response()->json([
            'status' => $transaction->status,
        ]);
    }
}
