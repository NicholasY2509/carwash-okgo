import { Head } from '@inertiajs/react';
import { useState, useEffect, useRef } from 'react';
import AppLayout from '@/layouts/app-layout';
import Heading from '@/components/heading';
import { Button } from '@/components/ui/button';
import { type BreadcrumbItem } from '@/types';
import {
    AlertDialog,
    AlertDialogContent,
    AlertDialogHeader,
    AlertDialogTitle,
    AlertDialogDescription,
    AlertDialogFooter,
    AlertDialogCancel,
    AlertDialogAction,
} from '@/components/ui/alert-dialog';

interface Props {
    hasToken: boolean;
    wuzapiUrl: string;
    csrfToken: string;
}

const breadcrumbs: BreadcrumbItem[] = [
    {
        title: 'Pengaturan WhatsApp',
        href: '/settings/whatsapp',
    },
];

export default function WhatsAppSettings({ hasToken, wuzapiUrl, csrfToken }: Props) {
    const [loading, setLoading] = useState(true);
    const [connected, setConnected] = useState(false);
    const [loggedIn, setLoggedIn] = useState(false);
    const [jid, setJid] = useState<string | null>(null);
    const [qrcode, setQrcode] = useState<string | null>(null);
    const [errorMsg, setErrorMsg] = useState<string | null>(null);

    const [actionLoading, setActionLoading] = useState(false);
    const [loadingQR, setLoadingQR] = useState(false);
    const [showUnbindDialog, setShowUnbindDialog] = useState(false);

    // Keep track of polling interval
    const pollingIntervalRef = useRef<NodeJS.Timeout | null>(null);

    // Helper to format JID to a clean international phone number
    const formatPhoneNumber = (rawJid: string | null) => {
        if (!rawJid) return '';
        const number = rawJid.split('@')[0].split(':')[0];
        return `+${number}`;
    };

    // 1. Fetch connection status on load
    const checkStatus = async (showLoading = true) => {
        if (!hasToken) {
            setLoading(false);
            return;
        }

        if (showLoading) setLoading(true);
        setErrorMsg(null);

        try {
            const response = await fetch('/settings/whatsapp/status');
            const data = await response.json();

            if (data.success) {
                setConnected(data.connected);
                setLoggedIn(data.loggedIn);
                setJid(data.jid);

                // Auto-refresh the page ONLY if it has successfully linked during active scanning
                if (data.loggedIn) {
                    stopPolling();

                    // Only trigger full page reload if they were actively looking at the QR code
                    // This prevents infinite reload loops on page mount!
                    if (qrcode !== null) {
                        setQrcode(null);
                        window.location.reload();
                    }
                } else if (data.qrcode) {
                    setQrcode(data.qrcode);
                }
            } else {
                setErrorMsg(data.message || 'Gagal memuat status WhatsApp.');
            }
        } catch (e) {
            console.error('WhatsApp checkStatus error:', e);
            setErrorMsg('Tidak dapat menghubungi server.');
        } finally {
            if (showLoading) setLoading(false);
        }
    };

    // 2. Start polling status (runs when QR code is visible)
    const startPolling = () => {
        stopPolling(); // Clear existing if any

        pollingIntervalRef.current = setInterval(() => {
            checkStatus(false);
        }, 4000);
    };

    const stopPolling = () => {
        if (pollingIntervalRef.current) {
            clearInterval(pollingIntervalRef.current);
            pollingIntervalRef.current = null;
        }
    };

    // Trigger check on page mount
    useEffect(() => {
        checkStatus();
        return () => stopPolling();
    }, []);

    // 3. Connect workflow: Logout ➔ Connect ➔ QR
    const handleConnectWorkflow = async () => {
        setActionLoading(true);
        setErrorMsg(null);
        setQrcode(null);

        try {
            // Step A: Silently logout of any old stale connections & clear WuzAPI cache
            await fetch('/settings/whatsapp/logout', {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                    'X-CSRF-TOKEN': csrfToken,
                }
            });

            // Step B: Initialize a fresh new WhatsApp connection
            const initResponse = await fetch('/settings/whatsapp/initialize', {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                    'X-CSRF-TOKEN': csrfToken,
                }
            });
            const initData = await initResponse.json();

            if (!initData.success) {
                setErrorMsg(initData.message || 'Gagal menginisialisasi sesi.');
                setActionLoading(false);
                return;
            }

            // Step C: Set status to loading QR and fetch QR Code
            setQrcode(''); // Enter QR loading state

            // Give WuzAPI a brief second to handshake before fetching QR code
            setTimeout(async () => {
                await handleFetchQR();
                setActionLoading(false);
            }, 2000);

        } catch (e) {
            console.error('WhatsApp handleConnectWorkflow error:', e);
            setErrorMsg('Terjadi kesalahan saat menghubungkan WhatsApp. Periksa console browser Anda.');
            setActionLoading(false);
        }
    };

    // 4. Fetch/Refresh QR Code on-demand
    const handleFetchQR = async () => {
        setLoadingQR(true);
        setErrorMsg(null);

        try {
            const response = await fetch('/settings/whatsapp/qr');
            const data = await response.json();

            if (data.success) {
                setQrcode(data.qrcode || '');
                startPolling(); // Start polling in background to auto-detect scan success
            } else {
                setErrorMsg(data.message || 'Gagal memuat QR Code.');
            }
        } catch (e) {
            console.error('WhatsApp handleFetchQR error:', e);
            setErrorMsg('Terjadi kesalahan saat memuat QR Code.');
        } finally {
            setLoadingQR(false);
        }
    };

    // 5. Unbind / Disconnect session completely
    const handleUnbind = async () => {
        setActionLoading(true);
        setErrorMsg(null);
        stopPolling();

        try {
            const response = await fetch('/settings/whatsapp/logout', {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                    'X-CSRF-TOKEN': csrfToken,
                }
            });
            const data = await response.json();

            if (data.success) {
                setLoggedIn(false);
                setConnected(false);
                setJid(null);
                setQrcode(null);
            } else {
                setErrorMsg(data.message || 'Gagal memutus sambungan WhatsApp.');
            }
        } catch (e) {
            console.error('WhatsApp handleDisconnect error:', e);
            setErrorMsg('Terjadi kesalahan saat memutus sambungan.');
        } finally {
            setActionLoading(false);
            checkStatus(true);
        }
    };

    return (
        <AppLayout breadcrumbs={breadcrumbs}>
            <Head title="Pengaturan WhatsApp" />

            <div className="px-6 py-6 max-w-4xl space-y-6">
                <Heading
                    title="Pengaturan WhatsApp Integration"
                    description="Kelola sambungan nomor WhatsApp untuk pengiriman struk cuci mobil otomatis ke pelanggan."
                />

                {errorMsg && (
                    <div className="rounded-lg bg-red-50 p-4 text-sm text-red-600 dark:bg-red-950/20 dark:text-red-400">
                        {errorMsg}
                    </div>
                )}

                {!hasToken ? (
                    <div className="rounded-xl border border-yellow-200 bg-yellow-50/50 p-6 text-slate-800 dark:border-yellow-900/30 dark:bg-yellow-950/10">
                        <h3 className="text-base font-bold text-yellow-800 dark:text-yellow-500">Konfigurasi .env Diperlukan</h3>
                        <p className="mt-2 text-sm leading-relaxed text-slate-600 dark:text-slate-400">
                            Token WhatsApp (`WUZAPI_TOKEN`) belum dikonfigurasi di file `.env` Laravel Anda.
                        </p>
                        <p className="mt-4 text-xs font-mono text-slate-500">
                            Tambahkan kunci ini di .env Droplet Anda:<br />
                            WUZAPI_BASE_URL=https://wa.okgo.co.id<br />
                            WUZAPI_TOKEN=token_user_anda
                        </p>
                    </div>
                ) : (
                    <div className="space-y-6">

                        {/* Section 0: Loading Skeleton Placeholder */}
                        {loading && (
                            <div className="rounded-xl border border-slate-100 bg-slate-50/50 p-6 animate-pulse space-y-4 dark:border-slate-800 dark:bg-slate-900/30">
                                <div className="flex items-center space-x-2">
                                    <div className="h-3 w-3 rounded-full bg-slate-200 dark:bg-slate-800"></div>
                                    <div className="h-3 w-28 rounded bg-slate-200 dark:bg-slate-800"></div>
                                </div>
                                <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
                                    <div className="space-y-2 flex-grow">
                                        <div className="h-8 w-48 rounded bg-slate-200 dark:bg-slate-800"></div>
                                        <div className="h-3.5 w-full sm:w-2/3 rounded bg-slate-200 dark:bg-slate-800"></div>
                                    </div>
                                    <div className="h-9 w-full sm:w-32 rounded bg-slate-200 dark:bg-slate-800"></div>
                                </div>
                            </div>
                        )}

                        {/* Section 1: Active Connected Card */}
                        {!loading && loggedIn && jid && (
                            <div className="rounded-xl border border-slate-100 bg-emerald-50/20 p-6 dark:border-slate-800 dark:bg-emerald-950/5">
                                <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
                                    <div className="space-y-1">
                                        <div className="flex items-center space-x-2">
                                            <span className="flex h-3 w-3 items-center justify-center rounded-full bg-emerald-100 dark:bg-emerald-900">
                                                <span className="h-1.5 w-1.5 rounded-full bg-emerald-500 animate-pulse"></span>
                                            </span>
                                            <span className="text-xs font-bold uppercase tracking-wider text-emerald-600 dark:text-emerald-400">Terhubung & Aktif</span>
                                        </div>
                                        <h3 className="text-2xl font-black text-slate-800 dark:text-slate-100">
                                            {formatPhoneNumber(jid)}
                                        </h3>
                                        <p className="text-xs text-slate-400">
                                            Nomor di atas saat ini aktif digunakan oleh sistem untuk mengirimkan file struk PDF otomatis.
                                        </p>
                                    </div>

                                    <Button
                                        variant="destructive"
                                        onClick={() => setShowUnbindDialog(true)}
                                        disabled={actionLoading}
                                        className="sm:w-auto w-full"
                                    >
                                        {actionLoading ? 'Memutuskan...' : 'Putuskan Sambungan'}
                                    </Button>
                                </div>
                            </div>
                        )}

                        {/* Section 2: Disconnected setup panel (Always force rescan if loggedIn is false) */}
                        {!loading && !loggedIn && (
                            <div className="flex flex-col items-center justify-center rounded-xl border border-dashed border-slate-200 p-8 text-center dark:border-slate-800">
                                {qrcode === null ? (
                                    <div className="max-w-md space-y-4">
                                        <div className="mx-auto flex h-16 w-16 items-center justify-center rounded-full bg-indigo-50 text-indigo-600 dark:bg-indigo-950/20">
                                            <svg className="h-8 w-8" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 18h.01M8 21h8a2 2 0 002-2V5a2 2 0 00-2-2H8a2 2 0 00-2 2v14a2 2 0 002 2z" />
                                            </svg>
                                        </div>
                                        <div>
                                            <h4 className="text-base font-bold text-slate-800 dark:text-slate-200">Hubungkan WhatsApp</h4>
                                            <p className="mt-1 text-sm text-slate-500 leading-relaxed">
                                                Klik tombol di bawah untuk menampilkan QR Code baru. Scan menggunakan menu <strong>Linked Devices</strong> di aplikasi WhatsApp Anda untuk menghubungkan.
                                            </p>
                                        </div>
                                        <Button
                                            onClick={handleConnectWorkflow}
                                            disabled={actionLoading}
                                            className="w-full sm:w-auto px-8"
                                        >
                                            {actionLoading ? 'Menyiapkan Sesi Gateway...' : 'Hubungkan WhatsApp'}
                                        </Button>
                                    </div>
                                ) : (
                                    <div className="space-y-6">
                                        <div className="relative mx-auto flex h-64 w-64 items-center justify-center rounded-lg border border-slate-100 bg-white p-4 shadow-sm dark:bg-slate-950">
                                            {loadingQR || actionLoading ? (
                                                <div className="flex flex-col items-center justify-center space-y-3">
                                                    <span className="h-8 w-8 animate-spin rounded-full border-4 border-slate-100 border-t-indigo-600"></span>
                                                    <span className="text-xs text-slate-400 font-medium">Generating QR Code...</span>
                                                </div>
                                            ) : qrcode === '' ? (
                                                <div className="flex flex-col items-center justify-center text-center p-2 space-y-2">
                                                    <span className="text-xs text-slate-400 font-semibold">QR sedang digenerate server...</span>
                                                    <span className="text-[10px] text-slate-400">Jika terlalu lama, silakan ketuk "Segarkan QR".</span>
                                                </div>
                                            ) : (
                                                <img
                                                    src={qrcode}
                                                    alt="WhatsApp QR Code"
                                                    className="max-h-full max-w-full"
                                                />
                                            )}
                                        </div>
                                        <div className="max-w-md space-y-2">
                                            <h4 className="text-sm font-bold text-slate-800 dark:text-slate-200">Scan QR Code</h4>
                                            <p className="text-xs text-slate-500 leading-relaxed">
                                                Buka WhatsApp di ponsel ➔ Ketuk <strong>Menu (⚙️ Pengaturan)</strong> ➔ <strong>Linked Devices</strong> ➔ <strong>Link a Device</strong> ➔ Arahkan kamera ke layar ini.
                                            </p>

                                            <div className="flex flex-col sm:flex-row justify-center gap-3 pt-4">
                                                <Button
                                                    variant="outline"
                                                    onClick={handleFetchQR}
                                                    disabled={loadingQR || actionLoading}
                                                    className="text-xs"
                                                >
                                                    {loadingQR ? 'Menyegarkan...' : 'Segarkan QR Code'}
                                                </Button>

                                                <Button
                                                    variant="ghost"
                                                    onClick={() => setQrcode(null)}
                                                    className="text-xs"
                                                >
                                                    Kembali
                                                </Button>
                                            </div>

                                            <div className="mt-4 flex items-center justify-center space-x-2 text-xs text-indigo-600 dark:text-indigo-400 font-medium">
                                                <span className="h-3 w-3 animate-ping rounded-full bg-indigo-400"></span>
                                                <span>Menunggu scan (Halaman akan otomatis reload saat terhubung)...</span>
                                            </div>
                                        </div>
                                    </div>
                                )}
                            </div>
                        )}
                    </div>
                )}
            </div>

            {/* Premium Shadcn AlertDialog Confirmation Modal */}
            <AlertDialog open={showUnbindDialog} onOpenChange={setShowUnbindDialog}>
                <AlertDialogContent>
                    <AlertDialogHeader>
                        <AlertDialogTitle>Putus Sambungan WhatsApp?</AlertDialogTitle>
                        <AlertDialogDescription>
                            Apakah Anda yakin ingin memutuskan sambungan nomor WhatsApp ini? Sesi lama akan dihapus sepenuhnya, dan Anda harus scan ulang QR Code untuk menghubungkan kembali perangkat baru.
                        </AlertDialogDescription>
                    </AlertDialogHeader>
                    <AlertDialogFooter>
                        <AlertDialogCancel>Batal</AlertDialogCancel>
                        <AlertDialogAction
                            onClick={handleUnbind}
                            className="bg-destructive hover:bg-destructive/90"
                        >
                            Ya, Putuskan Sambungan
                        </AlertDialogAction>
                    </AlertDialogFooter>
                </AlertDialogContent>
            </AlertDialog>
        </AppLayout>
    );
}
