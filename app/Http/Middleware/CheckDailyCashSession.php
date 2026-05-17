<?php

namespace App\Http\Middleware;

use App\Models\DailyCashLog;
use Closure;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Auth;
use Symfony\Component\HttpFoundation\Response;

class CheckDailyCashSession
{
    /**
     * Handle an incoming request.
     *
     * @param  \Closure(\Illuminate\Http\Request): (\Symfony\Component\HttpFoundation\Response)  $next
     */
    public function handle(Request $request, Closure $next): Response
    {
        $user = Auth::user();

        if ($user && $user->hasRole('Admin')) {
            $session = DailyCashLog::whereDate('session_date', today())
                                   ->first();

            if (!$session || $session->status !== 'Approved') {
                if (!$request->routeIs('dashboard') && !$request->routeIs('daily-cash-logs.store')) {
                    return redirect()->route('dashboard')
                        ->with('warning', 'Anda harus memasukkan kas awal dan menunggu persetujuan Admin untuk memulai.');
                }
            }
        }



        return $next($request);
    }
}
