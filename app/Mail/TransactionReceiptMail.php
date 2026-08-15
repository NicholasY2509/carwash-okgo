<?php

namespace App\Mail;

use Illuminate\Bus\Queueable;
use Illuminate\Contracts\Queue\ShouldQueue;
use Illuminate\Mail\Mailable;
use Illuminate\Mail\Mailables\Attachment;
use Illuminate\Mail\Mailables\Content;
use Illuminate\Mail\Mailables\Envelope;
use Illuminate\Queue\SerializesModels;

class TransactionReceiptMail extends Mailable
{
    use Queueable, SerializesModels;

    public $customerName;
    public $plateNumber;
    public $pdfContent;
    public $fileName;

    /**
     * Create a new message instance.
     */
    public function __construct($customerName, $plateNumber, $pdfContent, $fileName)
    {
        $this->customerName = $customerName;
        $this->plateNumber = $plateNumber;
        $this->pdfContent = $pdfContent;
        $this->fileName = $fileName;
    }

    /**
     * Get the message envelope.
     */
    public function envelope(): Envelope
    {
        return new Envelope(
            subject: 'Struk Transaksi KURO AUTO CARE',
        );
    }

    /**
     * Get the message content definition.
     */
    public function content(): Content
    {
        return new Content(
            view: 'emails.transaction_receipt',
        );
    }

    /**
     * Get the attachments for the message.
     *
     * @return array<int, \Illuminate\Mail\Mailables\Attachment>
     */
    public function attachments(): array
    {
        return [
            Attachment::fromData(fn () => $this->pdfContent, $this->fileName)
                ->withMime('application/pdf'),
        ];
    }
}
