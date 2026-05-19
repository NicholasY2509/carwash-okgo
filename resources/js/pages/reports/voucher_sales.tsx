import Heading from "@/components/heading";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { DataTable } from "@/components/ui/data-table";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import AppLayout from "@/layouts/app-layout";
import formatRupiah from "@/lib/rupiah-formatter";
import { BreadcrumbItem } from "@/types";
import { Head, router, usePage } from "@inertiajs/react";
import { ColumnDef } from "@tanstack/react-table";
import { useState, useEffect, useRef } from "react";
import { motion } from "framer-motion";
import { DollarSign, TrendingUp, Banknote, CreditCard, Calendar, BarChart3, Package } from "lucide-react";
import { Badge } from "@/components/ui/badge";
import { Pagination } from "@/components/ui/pagination";

interface ReportRow {
    id?: string;
    transaction_date?: string;
    customer_name?: string;
    plate_number?: string | null;
    transaction_type?: string;
    payment_method?: string;
    total_amount?: number;

    date?: string;
    month?: string;
    total_transactions?: number;
    total_revenue?: number;
    cash_revenue?: number;
    transfer_revenue?: number;
}

interface Summary {
    total_revenue: number;
    total_transactions: number;
    avg_transaction: number;
    cash_revenue: number;
    transfer_revenue: number;
    total_packets_sold: number;
}

const formatDate = (dateStr?: string) => {
    if (!dateStr) return "";
    try {
        return new Intl.DateTimeFormat("id-ID", { weekday: "short", day: "numeric", month: "short", year: "numeric" }).format(new Date(dateStr));
    } catch (e) {
        return dateStr;
    }
};

const formatMonth = (monthStr?: string) => {
    if (!monthStr) return "";
    try {
        const [year, month] = monthStr.split("-");
        return new Intl.DateTimeFormat("id-ID", { month: "long", year: "numeric" }).format(new Date(parseInt(year), parseInt(month) - 1));
    } catch (e) {
        return monthStr;
    }
};
const formatDateTime = (dateStr?: string) => {
    if (!dateStr) return "";
    try {
        return new Intl.DateTimeFormat("id-ID", {
            day: "numeric",
            month: "short",
            year: "numeric",
            hour: "2-digit",
            minute: "2-digit",
            timeZone: "Asia/Jakarta"
        }).format(new Date(dateStr));
    } catch (e) {
        return dateStr;
    }
};
export default function VoucherSalesReport() {
    const { props } = usePage<any>();
    const pagination = props.reportData || { data: [], current_page: 1, last_page: 1, per_page: 20, total: 0 };
    const reportData = pagination.data || [];
    const summary = (props.summary as Summary) || {};
    const filters = props.filters ?? { report_type: "daily", start_date: "", end_date: "" };

    const [reportType, setReportType] = useState(filters.report_type);
    const [startDate, setStartDate] = useState(filters.start_date);
    const [endDate, setEndDate] = useState(filters.end_date);

    const breadcrumbs: BreadcrumbItem[] = [
        { title: "Laporan", href: "/reports/voucher-sales" },
        { title: "Penjualan Voucher", href: "/reports/voucher-sales" },
    ];

    const isMounted = useRef(false);

    useEffect(() => {
        if (!isMounted.current) {
            isMounted.current = true;
            return;
        }
        router.get(route("reports.voucher-sales"), { report_type: reportType, start_date: startDate, end_date: endDate }, { preserveState: true });
    }, [reportType, startDate, endDate]);

    const handleQuickFilter = (type: "today" | "this_month" | "this_year") => {
        const now = new Date();
        let startStr = now.toISOString().split("T")[0];
        let endStr = startStr;
        let newType = reportType;

        if (type === "this_month") {
            startStr = `${now.getFullYear()}-${String(now.getMonth() + 1).padStart(2, "0")}-01`;
        } else if (type === "this_year") {
            startStr = `${now.getFullYear()}-01-01`;
            newType = "monthly";
        }

        setStartDate(startStr);
        setEndDate(endStr);
        setReportType(newType);
    };

    const handlePageChange = (page: number) => {
        router.get(route("reports.voucher-sales"), {
            report_type: reportType,
            start_date: startDate,
            end_date: endDate,
            page,
        }, { preserveState: true });
    };

    const columns: ColumnDef<ReportRow>[] = filters.report_type === "daily" ? [
        { id: "index", header: "No", cell: (row) => row.row.index + 1 + (pagination.current_page - 1) * pagination.per_page },
        {
            accessorKey: "transaction_date",
            header: "Waktu",
            cell: ({ row }) => <span className="font-medium text-xs">{formatDateTime(row.original.transaction_date)}</span>,
        },
        {
            id: "customer_info",
            header: "Customer & Kendaraan",
            cell: ({ row }) => (
                <div>
                    <div className="font-semibold text-foreground text-xs">{row.original.customer_name}</div>
                    {row.original.plate_number && <div className="text-[10px] text-muted-foreground">{row.original.plate_number}</div>}
                </div>
            ),
        },
        {
            accessorKey: "payment_method",
            header: "Metode",
            cell: ({ row }) => <span className="text-xs font-semibold">{row.original.payment_method}</span>,
        },
        {
            accessorKey: "total_amount",
            header: "Total Penjualan",
            cell: ({ row }) => <span className="font-extrabold text-blue-600 dark:text-blue-400 text-xs">{formatRupiah(row.original.total_amount || 0)}</span>,
        },
    ] : [
        { id: "index", header: "No", cell: (row) => row.row.index + 1 + (pagination.current_page - 1) * pagination.per_page },
        {
            id: "period",
            header: "Bulan",
            cell: ({ row }) => (
                <div className="font-medium">
                    {row.original.month ? formatMonth(row.original.month) : ""}
                </div>
            ),
        },
        {
            accessorKey: "total_transactions",
            header: "Transaksi",
            cell: ({ row }) => <div className="font-semibold text-center">{row.original.total_transactions}</div>,
        },
        {
            accessorKey: "cash_revenue",
            header: "Cash",
            cell: ({ row }) => <span className="text-emerald-600 dark:text-emerald-400 font-medium">{formatRupiah(row.original.cash_revenue || 0)}</span>,
        },
        {
            accessorKey: "transfer_revenue",
            header: "Transfer/Non-Cash",
            cell: ({ row }) => <span className="text-purple-600 dark:text-purple-400 font-medium">{formatRupiah(row.original.transfer_revenue || 0)}</span>,
        },
        {
            accessorKey: "total_revenue",
            header: "Total Penjualan",
            cell: ({ row }) => <span className="font-extrabold text-blue-600 dark:text-blue-400">{formatRupiah(row.original.total_revenue || 0)}</span>,
        },
    ];

    const containerVariants = { hidden: { opacity: 0 }, show: { opacity: 1, transition: { staggerChildren: 0.08 } } };
    const cardVariants = { hidden: { y: 20, opacity: 0 }, show: { y: 0, opacity: 1, transition: { type: "spring", stiffness: 100 } } };

    return (
        <AppLayout breadcrumbs={breadcrumbs}>
            <Head title="Laporan Penjualan Voucher" />
            <div className="flex h-full flex-1 flex-col space-y-6 rounded-xl p-4 lg:p-6">
                {/* Header */}
                <div className="flex flex-col gap-1">
                    <Heading title="Laporan Penjualan Voucher" description="Laporan penjualan paket voucher berdasarkan periode harian atau bulanan." />
                </div>

                {/* Filters Pane (Horizontal) */}
                <div className="flex flex-col md:flex-row items-center gap-4 bg-card border rounded-xl p-4 shadow-xs w-full">
                    {/* Tipe Selector */}
                    <div className="flex items-center gap-2">
                        <span className="text-xs text-muted-foreground whitespace-nowrap">Tipe:</span>
                        <div className="flex rounded-lg border overflow-hidden">
                            <button onClick={() => setReportType("daily")} className={`px-3 py-1.5 text-xs font-medium transition-colors ${reportType === "daily" ? "bg-primary text-primary-foreground" : "bg-background hover:bg-muted"}`}>Harian</button>
                            <button onClick={() => setReportType("monthly")} className={`px-3 py-1.5 text-xs font-medium transition-colors ${reportType === "monthly" ? "bg-primary text-primary-foreground" : "bg-background hover:bg-muted"}`}>Bulanan</button>
                        </div>
                    </div>

                    {/* Date Inputs */}
                    <div className="flex items-center gap-2">
                        <span className="text-xs text-muted-foreground whitespace-nowrap">Periode:</span>
                        <Input type="date" value={startDate} onChange={(e) => setStartDate(e.target.value)} className="w-[140px] h-9 text-xs" />
                        <span className="text-xs text-muted-foreground">s/d</span>
                        <Input type="date" value={endDate} onChange={(e) => setEndDate(e.target.value)} className="w-[140px] h-9 text-xs" />
                    </div>

                    {/* Quick Filters */}
                    <div className="flex items-center gap-2 flex-wrap md:ml-auto">
                        <Button variant="outline" size="sm" onClick={() => handleQuickFilter("today")} className="h-8 text-xs">Hari Ini</Button>
                        <Button variant="outline" size="sm" onClick={() => handleQuickFilter("this_month")} className="h-8 text-xs">Bulan Ini</Button>
                        <Button variant="outline" size="sm" onClick={() => handleQuickFilter("this_year")} className="h-8 text-xs">Tahun Ini</Button>
                    </div>
                </div>

                {/* Summary Cards */}
                <motion.div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4" variants={containerVariants} initial="hidden" animate="show">
                    <motion.div variants={cardVariants}>
                        <Card className="shadow-sm border bg-gradient-to-tr from-blue-500/10 via-card to-card hover:shadow-md transition-shadow">
                            <CardHeader className="flex flex-row items-center justify-between pb-2">
                                <CardTitle className="text-sm font-semibold">Total Penjualan</CardTitle>
                                <DollarSign className="h-5 w-5 text-blue-600" />
                            </CardHeader>
                            <CardContent>
                                <div className="text-2xl font-extrabold text-blue-600 dark:text-blue-400">{formatRupiah(summary.total_revenue || 0)}</div>
                                <p className="text-xs text-muted-foreground mt-1">{summary.total_transactions || 0} transaksi</p>
                            </CardContent>
                        </Card>
                    </motion.div>
                    <motion.div variants={cardVariants}>
                        <Card className="shadow-sm border bg-gradient-to-tr from-emerald-500/10 via-card to-card hover:shadow-md transition-shadow">
                            <CardHeader className="flex flex-row items-center justify-between pb-2">
                                <CardTitle className="text-sm font-semibold">Pembayaran Cash</CardTitle>
                                <Banknote className="h-5 w-5 text-emerald-600" />
                            </CardHeader>
                            <CardContent>
                                <div className="text-2xl font-extrabold text-emerald-600 dark:text-emerald-400">{formatRupiah(summary.cash_revenue || 0)}</div>
                                <p className="text-xs text-muted-foreground mt-1">Pendapatan tunai</p>
                            </CardContent>
                        </Card>
                    </motion.div>
                    <motion.div variants={cardVariants}>
                        <Card className="shadow-sm border bg-gradient-to-tr from-purple-500/10 via-card to-card hover:shadow-md transition-shadow">
                            <CardHeader className="flex flex-row items-center justify-between pb-2">
                                <CardTitle className="text-sm font-semibold">Pembayaran Non-Cash</CardTitle>
                                <CreditCard className="h-5 w-5 text-purple-600" />
                            </CardHeader>
                            <CardContent>
                                <div className="text-2xl font-extrabold text-purple-600 dark:text-purple-400">{formatRupiah(summary.transfer_revenue || 0)}</div>
                                <p className="text-xs text-muted-foreground mt-1">Transfer / lainnya</p>
                            </CardContent>
                        </Card>
                    </motion.div>
                    <motion.div variants={cardVariants}>
                        <Card className="shadow-sm border bg-gradient-to-tr from-amber-500/10 via-card to-card hover:shadow-md transition-shadow">
                            <CardHeader className="flex flex-row items-center justify-between pb-2">
                                <CardTitle className="text-sm font-semibold">Paket Terjual</CardTitle>
                                <Package className="h-5 w-5 text-amber-600" />
                            </CardHeader>
                            <CardContent>
                                <div className="text-2xl font-extrabold text-amber-600 dark:text-amber-400">{summary.total_packets_sold || 0} Paket</div>
                                <p className="text-xs text-muted-foreground mt-1">Rata-rata {formatRupiah(Math.round(summary.avg_transaction || 0))} / transaksi</p>
                            </CardContent>
                        </Card>
                    </motion.div>
                </motion.div>

                {/* Data Table */}
                <div className="bg-card rounded-xl border p-4 shadow-sm">
                    <div className="flex items-center gap-2 mb-4">
                        <Calendar className="h-4 w-4 text-muted-foreground" />
                        <h3 className="text-sm font-semibold text-foreground">Detail {filters.report_type === "daily" ? "Harian" : "Bulanan"}</h3>
                        <span className="text-xs text-muted-foreground ml-auto">{pagination.total || 0} data</span>
                    </div>
                    <DataTable columns={columns as any} data={reportData} />
                    {pagination && (
                        <Pagination
                            pagination={pagination}
                            onPageChange={handlePageChange}
                            label="data penjualan voucher"
                        />
                    )}
                </div>
            </div>
        </AppLayout>
    );
}
