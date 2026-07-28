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
    private string $instanceName;

    public function __construct()
    {
        $this->baseUrl = env('EVOLUTION_API_BASE_URL', 'https://wa-evolution.okgo.co.id');
        $this->token = env('EVOLUTION_API_KEY');
        $this->instanceName = env('EVOLUTION_API_INSTANCE_NAME', 'okgo-carwash-instance');
    }

    /**
     * Show the WhatsApp settings page.
     */
    public function edit()
    {
        return Inertia::render('settings/whatsapp', [
            'hasToken' => !empty($this->token),
            'evolutionUrl' => $this->baseUrl,
            'csrfToken' => csrf_token(),
        ]);
    }

    /**
     * Fetch current connection status from Evolution API.
     */
    public function status()
    {
        if (!$this->token) {
            return response()->json([
                'success' => false,
                'message' => 'No Evolution API Key configured in .env',
                'connected' => false,
                'loggedIn' => false,
            ]);
        }

        try {
            $response = Http::withHeaders([
                'apikey' => $this->token,
                'Accept' => 'application/json',
            ])->timeout(15)->get("{$this->baseUrl}/instance/connectionState/{$this->instanceName}");

            if ($response->successful()) {
                $resData = $response->json();
                
                $state = $resData['instance']['state'] ?? 'close';
                $jid = null;

                if ($state === 'open') {
                    // Fetch the instance to get the connected JID (phone number)
                    $instanceCheck = Http::withHeaders([
                        'apikey' => $this->token,
                        'Accept' => 'application/json',
                    ])->timeout(10)->get("{$this->baseUrl}/instance/fetchInstances?instanceName={$this->instanceName}");
                    
                    if ($instanceCheck->successful()) {
                        $instances = $instanceCheck->json();
                        if (is_array($instances) && count($instances) > 0) {
                            $jid = $instances[0]['ownerJid'] ?? null;
                        }
                    }
                }
                
                return response()->json([
                    'success' => true,
                    'connected' => $state === 'open',
                    'loggedIn' => $state === 'open',
                    'state' => $state,
                    'jid' => $jid,
                ]);
            }

            // If 404, it means instance doesn't exist yet, we treat as not connected.
            if ($response->status() === 404) {
                return response()->json([
                    'success' => true,
                    'connected' => false,
                    'loggedIn' => false,
                    'state' => 'not_created',
                ]);
            }

            return response()->json([
                'success' => false,
                'message' => 'Failed to reach Evolution API status API: ' . $response->body(),
                'connected' => false,
                'loggedIn' => false,
            ], 400);
        } catch (\Throwable $e) {
            Log::error('WhatsAppSettingsController status error: ' . $e->getMessage());
            return response()->json([
                'success' => false,
                'message' => 'Exception contacting Evolution API: ' . $e->getMessage(),
                'connected' => false,
                'loggedIn' => false,
            ], 500);
        }
    }

    /**
     * Initialize WhatsApp session connection / Create instance.
     */
    public function initialize()
    {
        if (!$this->token) {
            return response()->json([
                'success' => false,
                'message' => 'No Evolution API Key configured.',
            ], 400);
        }

        try {
            // First check if instance exists
            $check = Http::withHeaders([
                'apikey' => $this->token,
            ])->timeout(15)->get("{$this->baseUrl}/instance/connectionState/{$this->instanceName}");

            if ($check->status() === 404) {
                // Create instance
                $create = Http::withHeaders([
                    'apikey' => $this->token,
                    'Content-Type' => 'application/json',
                ])->timeout(20)->post("{$this->baseUrl}/instance/create", [
                    'instanceName' => $this->instanceName,
                    'qrcode' => true,
                    'integration' => 'WHATSAPP-BAILEYS',
                ]);

                if (!$create->successful()) {
                    return response()->json([
                        'success' => false,
                        'message' => 'Failed to create instance: ' . $create->body(),
                    ], 400);
                }
            }

            return response()->json([
                'success' => true,
                'message' => 'Session connection initialized successfully.',
            ]);
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
                'message' => 'No Evolution API Key configured.',
            ], 400);
        }

        try {
            $qrResponse = Http::withHeaders([
                'apikey' => $this->token,
                'Accept' => 'application/json',
            ])->timeout(15)->get("{$this->baseUrl}/instance/connect/{$this->instanceName}");

            $qrString = '';
            if ($qrResponse->successful()) {
                $qrData = $qrResponse->json();
                $qrString = $qrData['base64'] ?? '';
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
                'message' => 'No Evolution API Key configured.',
            ], 400);
        }

        try {
            // Send logout command
            Http::withHeaders([
                'apikey' => $this->token,
                'Content-Type' => 'application/json',
            ])->timeout(15)->delete("{$this->baseUrl}/instance/logout/{$this->instanceName}");

            return response()->json([
                'success' => true,
                'message' => 'Disconnected successfully.',
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
