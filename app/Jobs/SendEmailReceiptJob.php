<?php

namespace App\Jobs;

use App\Models\SalesTransaction;
use App\Mail\TransactionReceiptMail;
use Barryvdh\DomPDF\Facade\Pdf;
use Illuminate\Bus\Queueable;
use Illuminate\Contracts\Queue\ShouldQueue;
use Illuminate\Foundation\Bus\Dispatchable;
use Illuminate\Queue\InteractsWithQueue;
use Illuminate\Queue\SerializesModels;
use Illuminate\Support\Facades\Log;
use Illuminate\Support\Facades\Mail;

class SendEmailReceiptJob
{
    use Dispatchable, InteractsWithQueue, Queueable, SerializesModels;


    public $transaction;
    public $targetEmail;

    /**
     * Create a new job instance.
     */
    public function __construct(SalesTransaction $transaction, string $targetEmail)
    {
        $this->transaction = $transaction;
        $this->targetEmail = $targetEmail;
    }

    /**
     * Execute the job.
     */
    public function handle(): void
    {
        try {
            // Load relationships if not loaded
            $this->transaction->load(['customer', 'car', 'serviceRecords.product', 'staff', 'voucher']);

            $customer = $this->transaction->customer;
            $car = $this->transaction->car;
            
            $serviceRecord = $this->transaction->serviceRecords->first();
            $productName = $serviceRecord?->product?->name ?? 'Layanan Cuci Mobil';
            
            $customerName = $customer?->name ?? 'Pelanggan';
            $plateNumber = $car?->plate_number ?? '-';
            $carModel = $car?->model ?? '-';
            $carColor = $car?->color ?? '-';
            $paymentMethod = $this->transaction->payment_method ?? 'Cash';
            $totalAmount = $this->transaction->total_amount ?? 0;
            $transactionDate = $this->transaction->transaction_date ?? now()->toDateTimeString();

            $pdfView = 'pdf.receipt';
            
            $remainingVouchers = null;
            if ($paymentMethod === 'Voucher' && $customer) {
                $remainingVouchers = \App\Models\Voucher::whereHas('purchasedPacket', function($q) use ($customer) {
                    $q->where('customer_id', $customer->id)
                      ->where(function ($subQ) {
                          $subQ->whereNull('expired_at')->orWhere('expired_at', '>=', now()->startOfDay());
                      });
                })->where('status', 'Sold')
                ->where(function ($q) {
                    $q->whereNull('expired_at')->orWhere('expired_at', '>=', now()->startOfDay());
                })->count();
            }

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
                'voucher_serial_number' => $this->transaction->voucher?->serial_number,
                'remaining_vouchers' => $remainingVouchers,
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
                            'base64_barcode' => base64_encode($generator->getBarcode($voucher->serial_number, $generator::TYPE_CODE_128)),
                            'expired_at' => $voucher->expired_at ? $voucher->expired_at->format('d M Y') : ($packet->expired_at ? $packet->expired_at->format('d M Y') : '-')
                        ];
                    }
                }
                $pdfData['vouchers'] = $vouchers;
            }

            // 1. Generate the receipt PDF in memory
            $pdf = Pdf::loadView($pdfView, $pdfData)->setPaper([0, 0, 576, 850], 'portrait');

            $pdfContentRaw = $pdf->output();

            // 3. Send PDF using Mail
            $formattedDate = $this->transaction->created_at->format('d M Y - H.i');
            $fileName = "KURO AUTO CARE - " . $formattedDate . ".pdf";
            
            Mail::to($this->targetEmail)->send(new TransactionReceiptMail($customerName, $plateNumber, $pdfContentRaw, $fileName));

        } catch (\Throwable $th) {
            Log::error("SendEmailReceiptJob failed: " . $th->getMessage(), [
                'exception' => $th,
            ]);
            throw $th;
        }
    }
}
