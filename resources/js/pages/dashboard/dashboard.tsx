import Heading from "@/components/heading";
import AppLayout from "@/layouts/app-layout";
import { PageProps, type BreadcrumbItem } from "@/types";
import { Head, router, usePage } from "@inertiajs/react";
import { route } from "ziggy-js";
import { useEffect, useState } from "react";
import { PaymentTypeStats } from "./components/stat-card";
import { Button } from "@/components/ui/button";
import { Banknote, File, RefreshCw } from "lucide-react";
import { usePermission } from "@/hooks/use-permission";
import { toast } from "sonner";
import {
    AlertDialog,
    AlertDialogCancel,
    AlertDialogContent,
    AlertDialogDescription,
    AlertDialogFooter,
    AlertDialogTitle,
} from "@/components/ui/alert-dialog";
import {
    Dialog,
    DialogContent,
    DialogDescription,
    DialogFooter,
    DialogHeader,
    DialogTitle,
} from "@/components/ui/dialog";
import { Label } from "@/components/ui/label";
import { Input } from "@/components/ui/input";
import {
    Select,
    SelectContent,
    SelectItem,
    SelectTrigger,
    SelectValue,
} from "@/components/ui/select";
import TotalRevenueCard from "./components/total-revenue-card";
import VoucherPacketSalesCard from "./components/voucher-packet-sales-card";
import LatestTransactionsCard from "./components/latest-transactions-card";
import RevenueTrendChart from "./components/revenue-trend-chart";
import ReminderAlert from "./components/reminder-alert";
import axios from "axios";

const breadcrumbs: BreadcrumbItem[] = [
    {
        title: "Dashboard",
        href: "/dashboard",
    },
];

interface TypeCount {
    type: string;
    total: number;
}

interface DailyCashLog {
    id: number;
    status: string;
}

interface Reminder {
    type: string;
    title: string;
    message: string;
    priority: "high" | "medium" | "low";
}

interface DashbardProps {
    todayCarWashRevenue: number;
    todayCarWashByPayment: TypeCount[];
    hasClosedTodayCash?: DailyCashLog;
    voucherPurchaseRevenue?: number;
    voucherPacketSales?: any[];
    cashCarWashRevenue?: number;
    otherCarWashRevenue?: number;
    latestTransactions?: any[];
    revenueTrend?: any[];
    reminders?: Reminder[];
}

export default function Dashboard({ }) {
    const { props } = usePage<PageProps<any>>();
    const revenue = props.todayCarWashRevenue || 0;
    const hasClosedTodayCash = props.hasClosedTodayCash;
    const reminders = props.reminders || [];

    const [currentTime, setCurrentTime] = useState(new Date());
    const { hasRole } = usePermission();

    useEffect(() => {
        const interval = setInterval(() => {
            setCurrentTime(new Date());
        }, 1000);
        return () => clearInterval(interval);
    });

    const [isModalKasOpen, setIsModalKasOpen] = useState(false);
    const [isExcelReportOpen, setIsExcelReportOpen] = useState(false);
    const [isRefreshing, setIsRefreshing] = useState(false);
    const [isGeneratingReport, setIsGeneratingReport] = useState(false);
    const [reportData, setReportData] = useState({
        startDate: new Date(),
        endDate: new Date(),
        reportType: "sales",
    });

    const voucherPurchaseRevenue = props.voucherPurchaseRevenue || 0;
    const voucherPacketSales = props.voucherPacketSales || [];
    const cashCarWashRevenue = props.cashCarWashRevenue || 0;
    const otherCarWashRevenue = props.otherCarWashRevenue || 0;
    const latestTransactions = props.latestTransactions || [];
    const revenueTrend = props.revenueTrend || [];

    function handleKasClose() {
        if (!hasClosedTodayCash?.id) {
            toast.error("Error: ID Laporan kas tidak ditemukan.");
            console.error(
                "Attempted to close cash log without a valid ID.",
                hasClosedTodayCash,
            );
            return;
        }

        setIsModalKasOpen(false);
        router.patch(
            route("daily-cash-logs.kasir-close", hasClosedTodayCash.id),
            {},
            {
                onSuccess: () => {
                    toast.success("Kas Berhasil ditutup");
                },
                onError: () => {
                    toast.error("Gagal menutup kas");
                },
            },
        );
    }

    async function handleRefresh() {
        setIsRefreshing(true);
        try {
            await axios.post(route("dashboard.clear-cache"));
            router.reload({ only: ["props"], data: { refresh: true } });
            toast.success("Dashboard diperbarui");
        } catch (error) {
            console.error("Error refreshing dashboard:", error);
            toast.error("Gagal memperbarui dashboard");
        } finally {
            setIsRefreshing(false);
        }
    }

    async function handleGenerateExcelReport() {
        if (!reportData.startDate || !reportData.endDate) {
            toast.error("Pilih rentang tanggal terlebih dahulu");
            return;
        }

        setIsGeneratingReport(true);

        // Log the request data
        const requestData = {
            startDate: reportData.startDate.toISOString().split("T")[0],
            endDate: reportData.endDate.toISOString().split("T")[0],
            reportType: reportData.reportType,
        };

        console.log("Generating Excel report with data:", requestData);

        try {
            console.log(
                "Making API request to:",
                route("dashboard.generate-excel-report"),
            );

            const response = await axios.post(
                route("dashboard.generate-excel-report"),
                requestData,
                {
                    responseType: "blob",
                },
            );

            console.log("API response received:", {
                status: response.status,
                statusText: response.statusText,
                headers: response.headers,
                dataSize: response.data?.size || "unknown",
            });

            const url = window.URL.createObjectURL(new Blob([response.data]));
            const link = document.createElement("a");
            link.href = url;
            link.setAttribute(
                "download",
                `laporan-${reportData.reportType}-${requestData.startDate}-${requestData.endDate}.xlsx`,
            );
            document.body.appendChild(link);
            link.click();
            link.remove();
            window.URL.revokeObjectURL(url);

            console.log("Excel report downloaded successfully");
            toast.success("Laporan Excel berhasil diunduh");
            setIsExcelReportOpen(false);
        } catch (error: any) {
            // Comprehensive error logging
            console.error("=== EXCEL REPORT GENERATION ERROR ===");
            console.error("Error type:", error?.constructor?.name || "Unknown");
            console.error("Error message:", error?.message || "Unknown error");
            console.error("Error stack:", error?.stack || "No stack trace");

            // Log request details
            console.error("Request details:", {
                url: route("dashboard.generate-excel-report"),
                method: "POST",
                data: requestData,
                timestamp: new Date().toISOString(),
            });

            // Log axios specific error details
            if (error?.response) {
                console.error("Server response error:", {
                    status: error.response.status,
                    statusText: error.response.statusText,
                    headers: error.response.headers,
                    data: error.response.data,
                });
            } else if (error?.request) {
                console.error("Network error - no response received:", {
                    request: error.request,
                });
            } else {
                console.error(
                    "Request setup error:",
                    error?.message || "Unknown error",
                );
            }

            // Log user context
            console.error("User context:", {
                reportType: reportData.reportType,
                startDate: requestData.startDate,
                endDate: requestData.endDate,
                userAgent: navigator.userAgent,
                timestamp: new Date().toISOString(),
            });

            toast.error("Gagal menghasilkan laporan Excel");
        } finally {
            setIsGeneratingReport(false);
        }
    }

    return (
        <AppLayout breadcrumbs={breadcrumbs}>
            <Head title="Dashboard" />
            <div className="flex h-full flex-1 flex-col gap-4 rounded-xl p-4">
                <div className="flex flex-col md:flex-row justify-between">
                    <Heading
                        title="Dashboard"
                        description="Selamat datang di dashboard"
                    />
                    <div className="flex gap-2 flex-row justify-end">
                        <Button
                            variant="outline"
                            size="sm"
                            className="flex items-center gap-2"
                            onClick={() => setIsExcelReportOpen(true)}
                        >
                            <File />
                            <span>Tarik Laporan Excel</span>
                        </Button>
                        <Button
                            onClick={handleRefresh}
                            disabled={isRefreshing}
                            variant="outline"
                            size="sm"
                            className="flex items-center gap-2"
                        >
                            <RefreshCw
                                className={`h-4 w-4 ${isRefreshing ? "animate-spin" : ""}`}
                            />
                            <span>Refresh</span>
                        </Button>
                        {hasRole("Kasir") && (
                            <div>
                                {hasClosedTodayCash && (
                                    <Button
                                        onClick={() => setIsModalKasOpen(true)}
                                        className="flex items-center gap-2"
                                    >
                                        <Banknote className="h-4 w-4" />
                                        <span>Tutup Kas Hari ini</span>
                                    </Button>
                                )}
                            </div>
                        )}
                    </div>
                </div>

                <ReminderAlert reminders={reminders} />

                <div className="grid grid-cols-1 lg:grid-cols-2 gap-4 *:data-[slot=card]:from-primary/5 *:data-[slot=card]:to-card dark:*:data-[slot=card]:bg-card *:data-[slot=card]:bg-gradient-to-t *:data-[slot=card]:shadow-xs ">
                    <div className="grid grid-cols-1 lg:grid-cols-2 gap-4 *:data-[slot=card]:from-primary/5 *:data-[slot=card]:to-card dark:*:data-[slot=card]:bg-card *:data-[slot=card]:bg-gradient-to-t *:data-[slot=card]:shadow-xs ">
                        <TotalRevenueCard
                            className="col-span-1 lg:col-span-2"
                            revenue={revenue}
                            cashCarWashRevenue={cashCarWashRevenue}
                            otherCarWashRevenue={otherCarWashRevenue}
                        />
                        <PaymentTypeStats
                            title="Cuci Mobil Hari Ini"
                            stats={props.todayCarWashByPayment}
                        />
                        <VoucherPacketSalesCard
                            voucherPacketSales={voucherPacketSales}
                            voucherPurchaseRevenue={voucherPurchaseRevenue}
                        />
                    </div>
                    <LatestTransactionsCard
                        latestTransactions={latestTransactions}
                    />
                    <RevenueTrendChart
                        data={revenueTrend}
                        className="col-span-1 lg:col-span-2"
                    />
                </div>
            </div>

            <Dialog
                open={isExcelReportOpen}
                onOpenChange={setIsExcelReportOpen}
                modal={false}
            >
                <DialogContent className="sm:max-w-[425px]">
                    <DialogHeader>
                        <DialogTitle>Generate Laporan Excel</DialogTitle>
                        <DialogDescription>
                            Pilih rentang tanggal dan jenis laporan yang ingin
                            diunduh.
                        </DialogDescription>
                    </DialogHeader>
                    <div className="grid gap-4 py-4">
                        <div className="flex flex-col gap-2">
                            <Label htmlFor="startDate">Tanggal Mulai</Label>
                            <Input
                                type="date"
                                value={
                                    reportData.startDate
                                        .toISOString()
                                        .split("T")[0]
                                }
                                onChange={(e) => {
                                    const date = new Date(e.target.value);
                                    setReportData((prev) => ({
                                        ...prev,
                                        startDate: date,
                                    }));
                                }}
                                className="w-full"
                            />
                        </div>
                        <div className="flex flex-col gap-2">
                            <Label htmlFor="endDate">Tanggal Akhir</Label>
                            <Input
                                type="date"
                                value={
                                    reportData.endDate
                                        .toISOString()
                                        .split("T")[0]
                                }
                                onChange={(e) => {
                                    const date = new Date(e.target.value);
                                    setReportData((prev) => ({
                                        ...prev,
                                        endDate: date,
                                    }));
                                }}
                                className="w-full"
                            />
                        </div>
                        <div className="flex flex-col gap-2">
                            <Label htmlFor="reportType">Jenis Laporan</Label>
                            <Select
                                value={reportData.reportType}
                                onValueChange={(value) =>
                                    setReportData((prev) => ({
                                        ...prev,
                                        reportType: value,
                                    }))
                                }
                            >
                                <SelectTrigger className="w-full">
                                    <SelectValue placeholder="Pilih jenis laporan" />
                                </SelectTrigger>
                                <SelectContent>
                                    {/* <SelectItem value="sales">Laporan Penjualan</SelectItem>
                                    <SelectItem value="transactions">Laporan Transaksi</SelectItem> */}
                                    <SelectItem value="vouchers">
                                        Laporan Voucher
                                    </SelectItem>
                                    {/* <SelectItem value="staff">Laporan Kinerja Staff</SelectItem>
                                    <SelectItem value="daily-cash">Laporan Kas Harian</SelectItem> */}
                                </SelectContent>
                            </Select>
                        </div>
                    </div>
                    <DialogFooter>
                        <Button
                            variant="outline"
                            onClick={() => setIsExcelReportOpen(false)}
                        >
                            Batal
                        </Button>
                        <Button
                            onClick={handleGenerateExcelReport}
                            disabled={isGeneratingReport}
                        >
                            {isGeneratingReport
                                ? "Mengunduh..."
                                : "Unduh Laporan"}
                        </Button>
                    </DialogFooter>
                </DialogContent>
            </Dialog>

            <AlertDialog open={isModalKasOpen} onOpenChange={setIsModalKasOpen}>
                <AlertDialogContent>
                    <AlertDialogTitle>Tutup Kas Hari Ini?</AlertDialogTitle>
                    <AlertDialogDescription>
                        Anda yakin ingin menutup kas hari ini?
                    </AlertDialogDescription>
                    <AlertDialogFooter>
                        <AlertDialogCancel>Batal</AlertDialogCancel>
                        <Button
                            onClick={handleKasClose}
                            variant={"destructive"}
                        >
                            Tutup Kas
                        </Button>
                    </AlertDialogFooter>
                </AlertDialogContent>
            </AlertDialog>
        </AppLayout>
    );
}
