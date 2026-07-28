<?php

namespace App\Services;

use Illuminate\Support\Facades\Http;
use Illuminate\Support\Facades\Log;

class WhatsAppService
{
    /**
     * Send a WhatsApp message to a specific phone number.
     *
     * @param string $phone
     * @param string $message
     * @return bool
     */
    public static function sendMessage(string $phone, string $message): bool
    {
        $baseUrl = env('EVOLUTION_API_BASE_URL', 'https://wa-evolution.okgo.co.id');
        $token = env('EVOLUTION_API_KEY');
        $instance = env('EVOLUTION_API_INSTANCE_NAME', 'okgo-carwash-instance');

        if (!$token) {
            Log::warning('WhatsAppService: No Evolution API token configured. Skipping message dispatch.');
            return false;
        }

        // Clean phone number (remove spaces, symbols, and convert leading 0 to country code 62)
        $cleanPhone = preg_replace('/[^0-9]/', '', $phone);
        if (str_starts_with($cleanPhone, '0')) {
            $cleanPhone = '62' . substr($cleanPhone, 1);
        }

        try {
            $response = Http::withHeaders([
                'apikey' => $token,
                'Content-Type' => 'application/json',
            ])->timeout(20)->post("{$baseUrl}/message/sendText/{$instance}", [
                'number' => $cleanPhone,
                'text' => $message,
            ]);

            if ($response->successful()) {
                Log::info("WhatsApp message sent successfully to {$cleanPhone}.", [
                    'response' => $response->json(),
                ]);
                return true;
            }

            Log::error("WhatsAppService failed to send message to {$cleanPhone}.", [
                'status' => $response->status(),
                'body' => $response->body(),
            ]);
            return false;
        } catch (\Throwable $e) {
            Log::error("WhatsAppService exception: " . $e->getMessage(), [
                'exception' => $e,
            ]);
            return false;
        }
    }

    /**
     * Send a PDF document via WhatsApp.
     *
     * @param string $phone
     * @param string $pdfContentRaw
     * @param string $fileName
     * @param string|null $caption
     * @return bool
     */
    public static function sendPDF(string $phone, string $pdfContentRaw, string $fileName, ?string $caption = null): bool
    {
        $baseUrl = env('EVOLUTION_API_BASE_URL', 'https://wa-evolution.okgo.co.id');
        $token = env('EVOLUTION_API_KEY');
        $instance = env('EVOLUTION_API_INSTANCE_NAME', 'okgo-carwash-instance');

        if (!$token) {
            Log::warning('WhatsAppService: No Evolution API token configured. Skipping PDF dispatch.');
            return false;
        }

        // Clean phone number
        $cleanPhone = preg_replace('/[^0-9]/', '', $phone);
        if (str_starts_with($cleanPhone, '0')) {
            $cleanPhone = '62' . substr($cleanPhone, 1);
        }

        // Convert raw binary PDF bytes to Data URL format
        $base64Pdf = base64_encode($pdfContentRaw);
        $dataUrl = "data:application/pdf;base64,{$base64Pdf}";

        try {
            $response = Http::withHeaders([
                'apikey' => $token,
                'Content-Type' => 'application/json',
            ])->timeout(60)->post("{$baseUrl}/message/sendMedia/{$instance}", [
                'number' => $cleanPhone,
                'mediatype' => 'document',
                'mimetype' => 'application/pdf',
                'caption' => $caption ?? '',
                'media' => $base64Pdf,
                'fileName' => $fileName,
            ]);

            if ($response->successful()) {
                Log::info("WhatsApp PDF document sent successfully to {$cleanPhone}.", [
                    'response' => $response->json(),
                ]);
                return true;
            }

            Log::error("WhatsAppService failed to send PDF to {$cleanPhone}.", [
                'status' => $response->status(),
                'body' => $response->body(),
            ]);
            return false;
        } catch (\Throwable $e) {
            Log::error("WhatsAppService PDF exception: " . $e->getMessage(), [
                'exception' => $e,
            ]);
            return false;
        }
    }
}
