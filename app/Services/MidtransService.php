<?php

namespace App\Services;

use GuzzleHttp\Client;
use Illuminate\Support\Facades\Log;

class MidtransService
{
    /**
     * Generate QRIS payment using Midtrans API
     *
     * @param string $orderId
     * @param float $grossAmount
     * @param array $items
     * @param array $customerDetails
     * @return array|null
     */
    public static function generateQris($orderId, $grossAmount, $items, $customerDetails)
    {
        $serverKey = env('MIDTRANS_SERVER_KEY');
        $isProduction = env('MIDTRANS_IS_PRODUCTION', false);
        
        $baseUrl = $isProduction 
            ? 'https://api.midtrans.com/v2/charge' 
            : 'https://api.sandbox.midtrans.com/v2/charge';

        $client = new Client();

        $body = [
            'payment_type' => 'qris',
            'transaction_details' => [
                'order_id' => $orderId,
                'gross_amount' => $grossAmount,
            ],
            'item_details' => $items,
            'customer_details' => $customerDetails,
            'qris' => [
                'acquirer' => 'gopay'
            ]
        ];

        try {
            Log::info('Midtrans QRIS Request Initiated', [
                'order_id' => $orderId,
                'gross_amount' => $grossAmount,
                'url' => $baseUrl
            ]);

            Log::debug('Midtrans QRIS Payload', $body);

            $response = $client->request('POST', $baseUrl, [
                'json' => $body,
                'headers' => [
                    'accept' => 'application/json',
                    'content-type' => 'application/json',
                ],
                'auth' => [$serverKey, '']
            ]);

            $responseBody = $response->getBody()->getContents();
            Log::info('Midtrans QRIS Response Received', ['response' => $responseBody]);

            return json_decode($responseBody, true);
        } catch (\GuzzleHttp\Exception\ClientException $e) {
            $responseBody = $e->getResponse()->getBody()->getContents();
            Log::error('Midtrans QRIS Client Error: ' . $e->getMessage(), ['response' => $responseBody]);
            return null;
        } catch (\Exception $e) {
            Log::error('Midtrans QRIS Error: ' . $e->getMessage());
            return null;
        }
    }
}
