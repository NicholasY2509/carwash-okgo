<?php

namespace App\Http\Middleware;

use Closure;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Log;
use Symfony\Component\HttpFoundation\Response;

class OptimizeInertiaResponse
{
    /**
     * Handle an incoming request.
     */
    public function handle(Request $request, Closure $next): Response
    {
        $response = $next($request);

        // Only optimize Inertia responses
        if ($this->isInertiaResponse($response)) {
            $this->optimizeInertiaResponse($response);
        }

        return $response;
    }

    /**
     * Check if response is from Inertia
     */
    private function isInertiaResponse(Response $response): bool
    {
        return $response->headers->has('X-Inertia') ||
            str_contains($response->getContent(), '"component"');
    }

    /**
     * Optimize Inertia response to prevent large headers
     */
    private function optimizeInertiaResponse(Response $response): void
    {
        $content = $response->getContent();
        $data = json_decode($content, true);

        if (!$data) {
            return;
        }

        // Log response size for debugging
        $responseSize = strlen($content);
        Log::info('Inertia response size', [
            'size' => $responseSize,
            'url' => request()->url(),
            'component' => $data['component'] ?? 'unknown'
        ]);

        // If response is too large, truncate it
        if ($responseSize > 100000) { // 100KB limit
            Log::warning('Large Inertia response detected, truncating', [
                'size' => $responseSize,
                'url' => request()->url()
            ]);

            // Truncate props to prevent large headers
            if (isset($data['props'])) {
                $data['props'] = $this->aggressivelyOptimizeProps($data['props']);
            }
        }

        // Set headers to help with compression
        $response->headers->set('Content-Type', 'application/json');
        $response->headers->set('Cache-Control', 'no-cache, private');

        // Update response content
        $newContent = json_encode($data);
        $response->setContent($newContent);

        // Log final size
        Log::info('Optimized Inertia response size', [
            'original_size' => $responseSize,
            'final_size' => strlen($newContent),
            'reduction' => $responseSize - strlen($newContent)
        ]);
    }

    /**
     * Aggressively optimize props data to reduce size
     */
    private function aggressivelyOptimizeProps(array $props): array
    {
        $optimized = [];

        foreach ($props as $key => $value) {
            // Skip very large arrays
            if (is_array($value) && count($value) > 50) {
                $optimized[$key] = array_slice($value, 0, 50);
                Log::info("Truncated large array prop: {$key}", [
                    'original_count' => count($value),
                    'final_count' => 50
                ]);
            }
            // Skip large strings
            elseif (is_string($value) && strlen($value) > 500) {
                $optimized[$key] = substr($value, 0, 500) . '...';
                Log::info("Truncated large string prop: {$key}", [
                    'original_length' => strlen($value),
                    'final_length' => 500
                ]);
            }
            // Skip large objects
            elseif (is_object($value) && method_exists($value, 'toArray')) {
                $arrayValue = $value->toArray();
                if (count($arrayValue) > 50) {
                    $optimized[$key] = array_slice($arrayValue, 0, 50);
                    Log::info("Truncated large object prop: {$key}", [
                        'original_count' => count($arrayValue),
                        'final_count' => 50
                    ]);
                } else {
                    $optimized[$key] = $arrayValue;
                }
            } else {
                $optimized[$key] = $value;
            }
        }

        return $optimized;
    }
}
