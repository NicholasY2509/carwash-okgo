<?php

namespace App\Http\Controllers\Settings;

use App\Http\Controllers\Controller;
use Illuminate\Support\Facades\Http;
use Illuminate\Support\Facades\Log;
use Inertia\Inertia;

class WhatsAppSettingsController extends Controller
{
    private string $baseUrl;
    private ?string $token;

    public function __construct()
    {
        $this->baseUrl = env('WUZAPI_BASE_URL', 'https://wa.okgo.co.id');
        $this->token = env('WUZAPI_TOKEN');
    }

    /**
     * Show the WhatsApp settings page.
     */
    public function edit()
    {
        return Inertia::render('settings/whatsapp', [
            'hasToken' => !empty($this->token),
            'wuzapiUrl' => $this->baseUrl,
            'csrfToken' => csrf_token(),
        ]);
    }

    /**
     * Fetch current connection status from WuzAPI.
     */
    public function status()
    {
        if (!$this->token) {
            return response()->json([
                'success' => false,
                'message' => 'No WuzAPI Token configured in .env',
                'connected' => false,
                'loggedIn' => false,
            ]);
        }

        try {
            $response = Http::withHeaders([
                'token' => $this->token,
                'Accept' => 'application/json',
            ])->get("{$this->baseUrl}/session/status");

            if ($response->successful()) {
                $resData = $response->json();
                $data = $resData['data'] ?? [];
                
                return response()->json([
                    'success' => true,
                    'connected' => $data['Connected'] ?? $data['connected'] ?? false,
                    'loggedIn' => $data['LoggedIn'] ?? $data['loggedIn'] ?? false,
                    'jid' => $data['jid'] ?? null,
                    'qrcode' => $data['qrcode'] ?? $data['QRCode'] ?? null,
                ]);
            }

            return response()->json([
                'success' => false,
                'message' => 'Failed to reach WuzAPI status API: ' . $response->body(),
                'connected' => false,
                'loggedIn' => false,
            ], 400);
        } catch (\Throwable $e) {
            Log::error('WhatsAppSettingsController status error: ' . $e->getMessage());
            return response()->json([
                'success' => false,
                'message' => 'Exception contacting WuzAPI: ' . $e->getMessage(),
                'connected' => false,
                'loggedIn' => false,
            ], 500);
        }
    }

    /**
     * Initialize WhatsApp session connection.
     */
    public function initialize()
    {
        if (!$this->token) {
            return response()->json([
                'success' => false,
                'message' => 'No WuzAPI Token configured.',
            ], 400);
        }

        try {
            $response = Http::withHeaders([
                'token' => $this->token,
                'Content-Type' => 'application/json',
            ])->post("{$this->baseUrl}/session/connect", [
                'Subscribe' => [],
                'Immediate' => false,
            ]);

            if ($response->successful() || str_contains($response->body(), 'already connected')) {
                return response()->json([
                    'success' => true,
                    'message' => 'Session connection initialized successfully.',
                ]);
            }

            return response()->json([
                'success' => false,
                'message' => 'Failed to connect: ' . $response->body(),
            ], 400);
        } catch (\Throwable $e) {
            Log::error('WhatsAppSettingsController initialize error: ' . $e->getMessage());
            return response()->json([
                'success' => false,
                'message' => 'Exception during connect: ' . $e->getMessage(),
            ], 500);
        }
    }

    /**
     * Fetch the QR code image on-demand.
     */
    public function getQR()
    {
        if (!$this->token) {
            return response()->json([
                'success' => false,
                'message' => 'No WuzAPI Token configured.',
            ], 400);
        }

        try {
            $qrResponse = Http::withHeaders([
                'token' => $this->token,
                'Accept' => 'application/json',
            ])->get("{$this->baseUrl}/session/qr");

            $qrString = '';
            if ($qrResponse->successful()) {
                $qrData = $qrResponse->json();
                $qrString = $qrData['data']['QRCode'] ?? $qrData['data']['qrcode'] ?? '';
            }

            // Fallback to status endpoint if QR is empty
            if (empty($qrString)) {
                $statusResponse = Http::withHeaders(['token' => $this->token])->get("{$this->baseUrl}/session/status");
                if ($statusResponse->successful()) {
                    $statusData = $statusResponse->json()['data'] ?? [];
                    $qrString = $statusData['qrcode'] ?? $statusData['QRCode'] ?? '';
                }
            }

            return response()->json([
                'success' => true,
                'qrcode' => $qrString,
            ]);
        } catch (\Throwable $e) {
            Log::error('WhatsAppSettingsController getQR error: ' . $e->getMessage());
            return response()->json([
                'success' => false,
                'message' => 'Exception fetching QR Code: ' . $e->getMessage(),
            ], 500);
        }
    }

    /**
     * Log out / Disconnect the WhatsApp session.
     */
    public function logout()
    {
        if (!$this->token) {
            return response()->json([
                'success' => false,
                'message' => 'No WuzAPI Token configured.',
            ], 400);
        }

        try {
            // 1. Send logout command to clean up Whatsmeow memory client
            Http::withHeaders([
                'token' => $this->token,
                'Content-Type' => 'application/json',
            ])->post("{$this->baseUrl}/session/logout");

            // 2. Send disconnect command as a fallback
            Http::withHeaders(['token' => $this->token])->post("{$this->baseUrl}/session/disconnect");

            // 3. FORCE WIPE STATIC CACHE: Purges the stale user cache on WuzAPI,
            // forcing it to read the database fresh on the next call!
            Http::withHeaders(['token' => $this->token])->delete("{$this->baseUrl}/session/s3/config");

            return response()->json([
                'success' => true,
                'message' => 'Disconnected and cache cleared successfully.',
            ]);
        } catch (\Throwable $e) {
            Log::error('WhatsAppSettingsController logout error: ' . $e->getMessage());
            return response()->json([
                'success' => false,
                'message' => 'Exception during disconnect: ' . $e->getMessage(),
            ], 500);
        }
    }
}
