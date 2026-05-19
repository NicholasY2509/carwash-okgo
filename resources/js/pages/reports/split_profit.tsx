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
import { DollarSign, TrendingUp, Calendar, BarChart3, Users, Percent } from "lucide-react";
import { Badge } from "@/components/ui/badge";
import { Pagination } from "@/components/ui/pagination";

interface SplitShare {
    party_name: string;
    percentage: number;
    amount: number;
}

interface SplitProfitRow {
    id: number;
    service_date: string;
    plate_number: string;
    customer_name: string;
    product_name: string;
    price: number;
    shares: SplitShare[];
}

interface PartyShareSummary {
    party_id: number;
    name: string;
    amount: number;
}

interface Summary {
    total_omset: number;
    total_transactions: number;
    party_shares: PartyShareSummary[];
}

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

const formatMonth = (monthStr?: string) => {
    if (!monthStr) return "";
    try {
        const [year, month] = monthStr.split("-");
        return new Intl.DateTimeFormat("id-ID", { month: "long", year: "numeric" }).format(new Date(parseInt(year), parseInt(month) - 1));
    } catch (e) {
        return monthStr;
    }
};

export default function SplitProfitReport() {
    const { props } = usePage<any>();
    const pagination = props.reportData || { data: [], current_page: 1, last_page: 1, per_page: 20, total: 0 };
    const reportData = pagination.data || [];
    const summary = (props.summary as Summary) || { total_omset: 0, total_transactions: 0, party_shares: [] };
    const filters = props.filters ?? { report_type: "daily", start_date: "", end_date: "" };

    const [reportType, setReportType] = useState(filters.report_type || "daily");
    const [startDate, setStartDate] = useState(filters.start_date);
    const [endDate, setEndDate] = useState(filters.end_date);

    const breadcrumbs: BreadcrumbItem[] = [
        { title: "Laporan", href: "/reports/car-wash-revenue" },
        { title: "Bagi Hasil", href: "/reports/split-profit" },
    ];

    const isMounted = useRef(false);

    useEffect(() => {
        if (!isMounted.current) {
            isMounted.current = true;
            return;
        }
        router.get(
            route("reports.split-profit"),
            {
                report_type: reportType,
                start_date: startDate,
                end_date: endDate,
            },
            {
                preserveState: true,
                replace: true,
            }
        );
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
        router.get(
            route("reports.split-profit"),
            {
                report_type: reportType,
                page,
                start_date: startDate,
                end_date: endDate,
            },
            {
                preserveState: true,
            }
        );
    };

    const columns: ColumnDef<any>[] = reportType === "daily" ? [
        {
            accessorKey: "index",
            header: "No",
            cell: (row) => {
                return (
                    <div>
                        {row.row.index +
                            1 +
                            (pagination.current_page - 1) * pagination.per_page}
                    </div>
                );
            },
        },
        {
            accessorKey: "service_date",
            header: "Tanggal Cuci",
            cell: (info) => (
                <div className="text-muted-foreground whitespace-nowrap text-xs">
                    {formatDateTime(info.getValue() as string)}
                </div>
            ),
        },
        {
            accessorKey: "plate_number",
            header: "No. Polisi",
            cell: (info) => (
                <Badge variant="outline" className="font-mono text-xs uppercase px-2 py-0.5">
                    {info.getValue() as string}
                </Badge>
            ),
        },
        {
            accessorKey: "customer_name",
            header: "Customer",
            cell: (info) => (
                <div className="font-semibold text-xs whitespace-nowrap text-foreground">
                    {info.getValue() as string}
                </div>
            ),
        },
        {
            accessorKey: "product_name",
            header: "Layanan Cuci",
            cell: (info) => (
                <div className="text-xs text-foreground font-medium whitespace-nowrap">
                    {info.getValue() as string}
                </div>
            ),
        },
        {
            accessorKey: "price",
            header: "Harga Omset",
            cell: (info) => (
                <span className="font-mono font-medium text-xs text-foreground whitespace-nowrap">
                    {formatRupiah(info.getValue() as number)}
                </span>
            ),
        },
        {
            accessorKey: "shares",
            header: "Rincian Pembagian Laba",
            cell: ({ row }) => {
                const shares = row.original.shares || [];
                if (shares.length === 0) {
                    return <span className="text-xs italic text-gray-300">Tidak ada rincian</span>;
                }
                return (
                    <div className="flex flex-wrap gap-1.5 max-w-[320px]">
                        {shares.map((share: any, idx: number) => (
                            <Badge
                                key={idx}
                                variant="secondary"
                                className="bg-emerald-50 text-emerald-700 dark:bg-emerald-950/30 dark:text-emerald-400 border-emerald-100 dark:border-emerald-900/30 text-[10px] px-1.5 py-0.5"
                            >
                                <span className="font-bold mr-1">{share.party_name}</span>
                                <span>({Math.round(share.percentage)}%): </span>
                                <span className="font-semibold ml-0.5">{formatRupiah(share.amount)}</span>
                            </Badge>
                        ))}
                    </div>
                );
            },
        },
    ] : [
        {
            accessorKey: "index",
            header: "No",
            cell: (row) => {
                return (
                    <div>
                        {row.row.index +
                            1 +
                            (pagination.current_page - 1) * pagination.per_page}
                    </div>
                );
            },
        },
        {
            accessorKey: "month",
            header: "Bulan",
            cell: (info) => (
                <div className="font-semibold text-xs whitespace-nowrap text-foreground">
                    {formatMonth(info.getValue() as string)}
                </div>
            ),
        },
        {
            accessorKey: "total_transactions",
            header: "Transaksi",
            cell: (info) => (
                <div className="text-xs font-semibold text-center">
                    {info.getValue() as number}
                </div>
            ),
        },
        {
            accessorKey: "total_omset",
            header: "Total Omset",
            cell: (info) => (
                <span className="font-mono font-medium text-xs text-foreground whitespace-nowrap">
                    {formatRupiah(info.getValue() as number)}
                </span>
            ),
        },
        {
            accessorKey: "shares",
            header: "Total Bagian Pihak",
            cell: ({ row }) => {
                const shares = row.original.shares || [];
                if (shares.length === 0) {
                    return <span className="text-xs italic text-gray-300">Tidak ada rincian</span>;
                }
                return (
                    <div className="flex flex-wrap gap-1.5 max-w-[320px]">
                        {shares.map((share: any, idx: number) => (
                            <Badge
                                key={idx}
                                variant="secondary"
                                className="bg-emerald-50 text-emerald-700 dark:bg-emerald-950/30 dark:text-emerald-400 border-emerald-100 dark:border-emerald-900/30 text-[10px] px-1.5 py-0.5"
                            >
                                <span className="font-bold mr-1">{share.party_name}:</span>
                                <span className="font-semibold ml-0.5">{formatRupiah(share.amount)}</span>
                            </Badge>
                        ))}
                    </div>
                );
            },
        },
    ];

    const containerVariants = { hidden: { opacity: 0 }, show: { opacity: 1, transition: { staggerChildren: 0.08 } } };
    const cardVariants = { hidden: { y: 20, opacity: 0 }, show: { y: 0, opacity: 1, transition: { type: "spring", stiffness: 100 } } };

    return (
        <AppLayout breadcrumbs={breadcrumbs}>
            <Head title="Laporan Bagi Hasil" />
            <div className="flex h-full flex-1 flex-col gap-5 rounded-xl p-4">
                {/* Heading */}
                <div className="flex justify-between items-center">
                    <Heading
                        title="Laporan Bagi Hasil"
                        description="Pantau detail pembagian omset / hasil layanan ke berbagai pihak secara real-time."
                    />
                </div>

                {/* Horizontal Filters Section */}
                <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 p-4 border rounded-xl bg-card shadow-xs w-full">
                    {/* Tipe Selector */}
                    <div className="flex items-center gap-2">
                        <span className="text-xs text-muted-foreground whitespace-nowrap">Tipe:</span>
                        <div className="flex rounded-lg border overflow-hidden">
                            <button
                                onClick={() => setReportType("daily")}
                                className={`px-3 py-1.5 text-xs font-medium transition-colors ${
                                    reportType === "daily"
                                        ? "bg-primary text-primary-foreground"
                                        : "bg-background hover:bg-muted"
                                }`}
                            >
                                Harian
                            </button>
                            <button
                                onClick={() => setReportType("monthly")}
                                className={`px-3 py-1.5 text-xs font-medium transition-colors ${
                                    reportType === "monthly"
                                        ? "bg-primary text-primary-foreground"
                                        : "bg-background hover:bg-muted"
                                }`}
                            >
                                Bulanan
                            </button>
                        </div>
                    </div>

                    {/* Date Inputs */}
                    <div className="flex items-center gap-2">
                        <span className="text-xs text-muted-foreground whitespace-nowrap">Periode:</span>
                        <Input
                            type="date"
                            value={startDate}
                            onChange={(e) => setStartDate(e.target.value)}
                            className="w-[140px] h-9 text-xs"
                        />
                        <span className="text-xs text-muted-foreground">s/d</span>
                        <Input
                            type="date"
                            value={endDate}
                            onChange={(e) => setEndDate(e.target.value)}
                            className="w-[140px] h-9 text-xs"
                        />
                    </div>

                    {/* Quick Filters */}
                    <div className="flex items-center gap-2 flex-wrap md:ml-auto">
                        <Button
                            variant="outline"
                            size="sm"
                            onClick={() => handleQuickFilter("today")}
                            className="h-8 text-xs"
                        >
                            Hari Ini
                        </Button>
                        <Button
                            variant="outline"
                            size="sm"
                            onClick={() => handleQuickFilter("this_month")}
                            className="h-8 text-xs"
                        >
                            Bulan Ini
                        </Button>
                        <Button
                            variant="outline"
                            size="sm"
                            onClick={() => handleQuickFilter("this_year")}
                            className="h-8 text-xs"
                        >
                            Tahun Ini
                        </Button>
                    </div>
                </div>

                {/* Summary Cards Grid */}
                <motion.div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4" variants={containerVariants} initial="hidden" animate="show">
                    {/* Card 1: Total Omset Bagi Hasil */}
                    <motion.div variants={cardVariants}>
                        <Card className="shadow-sm border bg-gradient-to-tr from-blue-500/10 via-card to-card hover:shadow-md transition-shadow">
                            <CardHeader className="flex flex-row items-center justify-between pb-2">
                                <CardTitle className="text-sm font-semibold">Total Omset Bagi Hasil</CardTitle>
                                <TrendingUp className="h-5 w-5 text-blue-600" />
                            </CardHeader>
                            <CardContent>
                                <div className="text-2xl font-extrabold text-blue-600 dark:text-blue-400">
                                    {formatRupiah(summary.total_omset || 0)}
                                </div>
                                <p className="text-xs text-muted-foreground mt-1">
                                    {summary.total_transactions || 0} transaksi cuci
                                </p>
                            </CardContent>
                        </Card>
                    </motion.div>

                    {/* Card 2: Total Transaksi Bagi Hasil */}
                    <motion.div variants={cardVariants}>
                        <Card className="shadow-sm border bg-gradient-to-tr from-indigo-500/10 via-card to-card hover:shadow-md transition-shadow">
                            <CardHeader className="flex flex-row items-center justify-between pb-2">
                                <CardTitle className="text-sm font-semibold">Total Transaksi</CardTitle>
                                <BarChart3 className="h-5 w-5 text-indigo-600" />
                            </CardHeader>
                            <CardContent>
                                <div className="text-2xl font-extrabold text-indigo-600 dark:text-indigo-400">
                                    {summary.total_transactions || 0}
                                </div>
                                <p className="text-xs text-muted-foreground mt-1">
                                    Cucian bagi hasil aktif
                                </p>
                            </CardContent>
                        </Card>
                    </motion.div>

                    {/* Dynamic Shares Summary Cards */}
                    {summary.party_shares.map((party, idx) => (
                        <motion.div key={party.party_id} variants={cardVariants}>
                            <Card className="shadow-sm border bg-gradient-to-tr from-emerald-500/10 via-card to-card hover:shadow-md transition-shadow">
                                <CardHeader className="flex flex-row items-center justify-between pb-2">
                                    <CardTitle className="text-sm font-semibold">Bagian {party.name}</CardTitle>
                                    <Users className="h-5 w-5 text-emerald-600" />
                                </CardHeader>
                                <CardContent>
                                    <div className="text-2xl font-extrabold text-emerald-600 dark:text-emerald-400">
                                        {formatRupiah(party.amount || 0)}
                                    </div>
                                    <p className="text-xs text-muted-foreground mt-1">
                                        Bagi hasil untuk {party.name}
                                    </p>
                                </CardContent>
                            </Card>
                        </motion.div>
                    ))}
                </motion.div>

                {/* Table Block */}
                <div className="flex flex-col gap-4 border rounded-xl bg-card p-4 shadow-sm">
                    <DataTable columns={columns} data={reportData} />
                    {pagination && (
                        <Pagination
                            pagination={pagination}
                            onPageChange={handlePageChange}
                            label="transaksi bagi hasil"
                        />
                    )}
                </div>
            </div>
        </AppLayout>
    );
}
