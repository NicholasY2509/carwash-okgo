<?php

namespace App\Jobs;

use App\Models\SalesTransaction;
use App\Services\WhatsAppService;
use Barryvdh\DomPDF\Facade\Pdf;
use Illuminate\Bus\Queueable;
use Illuminate\Contracts\Queue\ShouldQueue;
use Illuminate\Foundation\Bus\Dispatchable;
use Illuminate\Queue\InteractsWithQueue;
use Illuminate\Queue\SerializesModels;
use Illuminate\Support\Facades\Log;

class SendWhatsAppReceiptJob implements ShouldQueue
{
    use Dispatchable, InteractsWithQueue, Queueable, SerializesModels;

    public $transaction;

    /**
     * Create a new job instance.
     */
    public function __construct(SalesTransaction $transaction)
    {
        $this->transaction = $transaction;
    }

    /**
     * Execute the job.
     */
    public function handle(): void
    {
        try {
            // Load relationships if not loaded
            $this->transaction->load(['customer', 'car', 'serviceRecords.product', 'staff']);

            $customer = $this->transaction->customer;
            $car = $this->transaction->car;
            
            if (!$customer || !$customer->phone) {
                Log::info("SendWhatsAppReceiptJob: Skipping because customer or phone number is missing.");
                return;
            }

            $serviceRecord = $this->transaction->serviceRecords->first();
            $productName = $serviceRecord?->product?->name ?? 'Layanan Cuci Mobil';
            
            $customerName = $customer->name;
            $plateNumber = $car?->plate_number ?? '-';
            $carModel = $car?->model ?? '-';
            $carColor = $car?->color ?? '-';
            $paymentMethod = $this->transaction->payment_method ?? 'Cash';
            $totalAmount = $this->transaction->total_amount ?? 0;
            $transactionDate = $this->transaction->transaction_date ?? now()->toDateTimeString();

            // 1. Generate the receipt PDF in memory
            $pdf = Pdf::loadView('pdf.receipt', [
                'transaction_id' => $this->transaction->id,
                'transaction_date' => $transactionDate,
                'staff_name' => $this->transaction->staff?->full_name ?? 'Kasir',
                'customer_name' => $customerName,
                'plate_number' => $plateNumber,
                'car_model' => $carModel,
                'car_color' => $carColor,
                'product_name' => $productName,
                'payment_method' => $paymentMethod,
                'total_amount' => $totalAmount,
                'paid_amount' => $this->transaction->paid_amount,
                'change_amount' => $this->transaction->change_amount,
            ]);

            $pdfContentRaw = $pdf->output();

            // 2. Compose the warm caption
            $caption = "Halo *{$customerName}*, terima kasih telah mencuci kendaraan Anda di *OKGO Car Wash*! 🙏\n\n";
            $caption .= "Berikut dilampirkan struk pembayaran digital resmi Anda untuk kendaraan dengan Plat Nomor *{$plateNumber}*.\n\n";
            $caption .= "Semoga perjalanan Anda menyenangkan! 🚗✨";

            // 3. Send PDF using WuzAPI
            $fileName = "struk-okgo-" . $this->transaction->id . ".pdf";
            WhatsAppService::sendPDF($customer->phone, $pdfContentRaw, $fileName, $caption);

        } catch (\Throwable $th) {
            Log::error("SendWhatsAppReceiptJob failed: " . $th->getMessage(), [
                'exception' => $th,
            ]);
        }
    }
}
