<?php

namespace App\Http\Middleware;

use Closure;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Session;
use Illuminate\Support\Facades\DB;
use Symfony\Component\HttpFoundation\Response;

class ClearOldSessionData
{
    /**
     * Handle an incoming request.
     */
    public function handle(Request $request, Closure $next): Response
    {
        // Get current session size
        $sessionData = Session::all();
        $sessionSize = strlen(serialize($sessionData));

        // If session is too large (> 10KB), clear everything except auth
        if ($sessionSize > 10240) {
            $this->clearLargeSession($request);
        }

        // Always clear these problematic session keys
        $this->clearProblematicSessionData();

        // Clear old flash messages
        if (Session::has('_flash.old')) {
            Session::forget('_flash.old');
        }

        // Clear old error messages
        if (Session::has('errors')) {
            Session::forget('errors');
        }

        // Clear old validation errors
        if (Session::has('_old_input')) {
            Session::forget('_old_input');
        }

        // Clear old success messages
        if (Session::has('success')) {
            Session::forget('success');
        }

        // Clear old error messages
        if (Session::has('error')) {
            Session::forget('error');
        }

        // Clear old transaction data
        if (Session::has('transaction')) {
            Session::forget('transaction');
        }

        // Clear Inertia.js related data that might be large
        if (Session::has('inertia')) {
            Session::forget('inertia');
        }

        // Clear any other large session data
        foreach ($sessionData as $key => $value) {
            if (strlen(serialize($value)) > 1000) {
                Session::forget($key);
            }
        }

        return $next($request);
    }

    /**
     * Clear large session data completely
     */
    private function clearLargeSession(Request $request): void
    {
        // Keep only essential session data
        $essentialKeys = ['_token', 'auth', 'locale'];

        // Get current session ID
        $sessionId = $request->session()->getId();

        // Clear all session data except essentials
        $sessionData = Session::all();
        foreach ($sessionData as $key => $value) {
            if (!in_array($key, $essentialKeys)) {
                Session::forget($key);
            }
        }

        // If using database sessions, clean up old sessions
        if (config('session.driver') === 'database') {
            DB::table('sessions')
                ->where('last_activity', '<', now()->subMinutes(30)->timestamp)
                ->delete();
        }
    }

    /**
     * Clear problematic session data
     */
    private function clearProblematicSessionData(): void
    {
        $problematicKeys = [
            '_flash',
            'errors',
            '_old_input',
            'success',
            'error',
            'transaction',
            'inertia',
            'csrf_token',
            'app',
            'locale',
            'theme',
            'sidebar_state'
        ];

        foreach ($problematicKeys as $key) {
            if (Session::has($key)) {
                $value = Session::get($key);
                if (is_array($value) && count($value) > 10) {
                    Session::forget($key);
                }
            }
        }
    }
}
