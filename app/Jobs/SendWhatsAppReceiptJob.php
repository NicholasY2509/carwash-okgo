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

            $pdfView = 'pdf.receipt';
            $pdfData = [
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
            ];

            if ($this->transaction->transaction_type === 'Paket Voucher') {
                $this->transaction->load('purchasedPackets.vouchers', 'purchasedPackets.voucherPacket');
                $pdfView = 'pdf.voucher_receipt';
                
                $firstPacket = $this->transaction->purchasedPackets->first();
                $productName = $firstPacket?->voucherPacket?->name ?? 'Paket Voucher';
                $pdfData['product_name'] = $productName;

                $vouchers = [];
                $generator = new \Picqer\Barcode\BarcodeGeneratorPNG();

                foreach ($this->transaction->purchasedPackets as $packet) {
                    foreach ($packet->vouchers as $voucher) {
                        $vouchers[] = [
                            'serial_number' => $voucher->serial_number,
                            'base64_barcode' => base64_encode($generator->getBarcode($voucher->serial_number, $generator::TYPE_CODE_128))
                        ];
                    }
                }
                $pdfData['vouchers'] = $vouchers;
            }

            // 1. Generate the receipt PDF in memory
            $pdf = Pdf::loadView($pdfView, $pdfData)->setPaper([0, 0, 576, 850], 'portrait');

            $pdfContentRaw = $pdf->output();

            // 2. Compose the warm caption
            $caption = "Halo *{$customerName}*, terima kasih telah mencuci kendaraan Anda di *KURO AUTO CARE*! 🙏\n\n";
            if($plateNumber) {
                $caption .= "Berikut dilampirkan struk pembayaran digital resmi Anda untuk kendaraan dengan Plat Nomor *{$plateNumber}*.\n\n";
            }
            $caption .= "Enjoy your clean ride ✨ \n";
            $caption .= "See you on your next wash 🙏\n\n";
            $caption .= "Untuk Kritik dan Saran hubungi 0851-7800-8988";

            // 3. Send PDF using WuzAPI
            $formattedDate = $this->transaction->created_at->format('d M Y - H.i');
            $fileName = "KURO AUTO CARE - " . $formattedDate . ".pdf";
            WhatsAppService::sendPDF($customer->phone, $pdfContentRaw, $fileName, $caption);

        } catch (\Throwable $th) {
            Log::error("SendWhatsAppReceiptJob failed: " . $th->getMessage(), [
                'exception' => $th,
            ]);
        }
    }
}
