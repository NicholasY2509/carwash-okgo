import Heading from "@/components/heading";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { DataTable } from "@/components/ui/data-table";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import {
    Select,
    SelectContent,
    SelectItem,
    SelectTrigger,
    SelectValue,
} from "@/components/ui/select";
import AppLayout from "@/layouts/app-layout";
import formatRupiah from "@/lib/rupiah-formatter";
import { BreadcrumbItem } from "@/types";
import { Head, router, usePage } from "@inertiajs/react";
import { ColumnDef } from "@tanstack/react-table";
import { useState, useEffect, useRef } from "react";
import { motion } from "framer-motion";
import {
    DollarSign,
    TrendingUp,
    Ticket,
    Banknote,
    Calendar,
    BarChart3,
} from "lucide-react";
import { Badge } from "@/components/ui/badge";
import { Pagination } from "@/components/ui/pagination";
import { Popover, PopoverContent, PopoverTrigger } from "@/components/ui/popover";
import { Info } from "lucide-react";

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
    voucher_revenue?: number;
    voucher_count?: number;
    transfer_revenue?: number;
    warranty_count?: number;
    payment_breakdown?: Record<string, number>;
}

interface Summary {
    total_revenue: number;
    total_transactions: number;
    avg_transaction: number;
    cash_revenue: number;
    voucher_revenue: number;
    voucher_count: number;
    transfer_revenue: number;
    warranty_count: number;
    payment_breakdown: Record<string, number>;
}

interface Staff {
    id: number;
    name: string;
}

const formatDate = (dateStr?: string) => {
    if (!dateStr) return "";
    try {
        return new Intl.DateTimeFormat("id-ID", {
            weekday: "short",
            day: "numeric",
            month: "short",
            year: "numeric",
        }).format(new Date(dateStr));
    } catch (e) {
        return dateStr;
    }
};

const formatMonth = (monthStr?: string) => {
    if (!monthStr) return "";
    try {
        const [year, month] = monthStr.split("-");
        return new Intl.DateTimeFormat("id-ID", {
            month: "long",
            year: "numeric",
        }).format(new Date(parseInt(year), parseInt(month) - 1));
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
            timeZone: "Asia/Jakarta",
        }).format(new Date(dateStr));
    } catch (e) {
        return dateStr;
    }
};
export default function CarWashRevenueReport() {
    const { props } = usePage<any>();
    const pagination = props.reportData || {
        data: [],
        current_page: 1,
        last_page: 1,
        per_page: 20,
        total: 0,
    };
    const reportData = pagination.data || [];
    const summary = (props.summary as Summary) || {};
    const filters = props.filters ?? {
        report_type: "daily",
        start_date: "",
        end_date: "",
        staff_id: "",
    };
    const staffList = (props.staffList as Staff[]) || [];
    const isKasir = props.auth?.roles?.includes("Kasir");

    const [reportType, setReportType] = useState(filters.report_type);
    const [startDate, setStartDate] = useState(filters.start_date);
    const [endDate, setEndDate] = useState(filters.end_date);
    const [staffId, setStaffId] = useState(
        filters.staff_id ? filters.staff_id.toString() : "all",
    );

    const breadcrumbs: BreadcrumbItem[] = [
        { title: "Laporan", href: "/reports/car-wash-revenue" },
        { title: "Omset Cuci Mobil", href: "/reports/car-wash-revenue" },
    ];

    const isMounted = useRef(false);

    useEffect(() => {
        if (!isMounted.current) {
            isMounted.current = true;
            return;
        }
        router.get(
            route("reports.car-wash-revenue"),
            {
                report_type: reportType,
                start_date: startDate,
                end_date: endDate,
                staff_id: staffId === "all" ? "" : staffId,
            },
            { preserveState: true },
        );
    }, [reportType, startDate, endDate, staffId]);

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
            route("reports.car-wash-revenue"),
            {
                report_type: reportType,
                start_date: startDate,
                end_date: endDate,
                staff_id: staffId === "all" ? "" : staffId,
                page,
            },
            { preserveState: true },
        );
    };

    const columns: ColumnDef<ReportRow>[] =
        filters.report_type === "daily"
            ? [
                {
                    id: "index",
                    header: "No",
                    cell: (row) =>
                        row.row.index +
                        1 +
                        (pagination.current_page - 1) * pagination.per_page,
                },
                {
                    accessorKey: "transaction_date",
                    header: "Waktu",
                    cell: ({ row }) => (
                        <span className="font-medium text-xs">
                            {formatDateTime(row.original.transaction_date)}
                        </span>
                    ),
                },
                {
                    id: "customer_info",
                    header: "Customer & Kendaraan",
                    cell: ({ row }) => (
                        <div>
                            <div className="font-semibold text-foreground text-xs">
                                {row.original.customer_name}
                            </div>
                            {row.original.plate_number && (
                                <div className="text-[10px] text-muted-foreground">
                                    {row.original.plate_number}
                                </div>
                            )}
                        </div>
                    ),
                },
                {
                    accessorKey: "transaction_type",
                    header: "Tipe Transaksi",
                    cell: ({ row }) => {
                        const type = row.original.transaction_type;
                        const getVariant = () => {
                            if (type === "Cuci Mobil") return "secondary";
                            if (type === "Cuci Mobil Voucher")
                                return "outline";
                            if (type === "Klaim Garansi")
                                return "destructive";
                            return "secondary";
                        };
                        return (
                            <Badge
                                variant={getVariant()}
                                className="text-[10px] py-0.5 px-1.5"
                            >
                                {type}
                            </Badge>
                        );
                    },
                },
                {
                    accessorKey: "payment_method",
                    header: "Metode",
                    cell: ({ row }) => (
                        <span className="text-xs font-semibold">
                            {row.original.payment_method}
                        </span>
                    ),
                },
                {
                    accessorKey: "total_amount",
                    header: "Total Omset",
                    cell: ({ row }) => (
                        <span className="font-extrabold text-blue-600 dark:text-blue-400 text-xs">
                            {formatRupiah(row.original.total_amount || 0)}
                        </span>
                    ),
                },
            ]
            : [
                {
                    id: "index",
                    header: "No",
                    cell: (row) =>
                        row.row.index +
                        1 +
                        (pagination.current_page - 1) * pagination.per_page,
                },
                {
                    id: "period",
                    header: "Bulan",
                    cell: ({ row }) => (
                        <div className="font-medium">
                            {row.original.month
                                ? formatMonth(row.original.month)
                                : ""}
                        </div>
                    ),
                },
                {
                    accessorKey: "total_transactions",
                    header: "Transaksi",
                    cell: ({ row }) => (
                        <div className="font-semibold text-center">
                            {row.original.total_transactions}
                        </div>
                    ),
                },
                {
                    accessorKey: "cash_revenue",
                    header: "Cash",
                    cell: ({ row }) => (
                        <span className="text-emerald-600 dark:text-emerald-400 font-medium">
                            {formatRupiah(row.original.cash_revenue || 0)}
                        </span>
                    ),
                },
                {
                    accessorKey: "voucher_revenue",
                    header: "Voucher",
                    cell: ({ row }) => (
                        <span className="text-indigo-600 dark:text-indigo-400 font-medium">
                            {formatRupiah(row.original.voucher_revenue || 0)}
                        </span>
                    ),
                },
                {
                    accessorKey: "transfer_revenue",
                    header: "Transfer",
                    cell: ({ row }) => (
                        <span className="text-amber-600 dark:text-amber-400 font-medium">
                            {formatRupiah(row.original.transfer_revenue || 0)}
                        </span>
                    ),
                },
                {
                    accessorKey: "warranty_count",
                    header: "Garansi",
                    cell: ({ row }) => (
                        <div className="text-center text-xs font-semibold text-muted-foreground">
                            {row.original.warranty_count}
                        </div>
                    ),
                },
                {
                    accessorKey: "total_revenue",
                    header: "Total Omset",
                    cell: ({ row }) => (
                        <span className="font-extrabold text-blue-600 dark:text-blue-400">
                            {formatRupiah(row.original.total_revenue || 0)}
                        </span>
                    ),
                },
            ];

    const containerVariants = {
        hidden: { opacity: 0 },
        show: { opacity: 1, transition: { staggerChildren: 0.08 } },
    };
    const cardVariants = {
        hidden: { y: 20, opacity: 0 },
        show: {
            y: 0,
            opacity: 1,
            transition: { type: "spring", stiffness: 100 },
        },
    };

    return (
        <AppLayout breadcrumbs={breadcrumbs}>
            <Head title="Laporan Omset Cuci Mobil" />
            <div className="flex h-full flex-1 flex-col space-y-6 rounded-xl p-4 lg:p-6">
                {/* Header */}
                <div className="flex flex-col gap-1">
                    <Heading
                        title="Laporan Omset Cuci Mobil"
                        description="Laporan omset pendapatan cuci mobil berdasarkan periode harian atau bulanan."
                    />
                </div>

                {/* Filters Pane (Horizontal) */}
                {!isKasir && (
                <div className="flex flex-col md:flex-row items-center gap-4 bg-card border rounded-xl p-4 shadow-xs w-full">
                    {/* Tipe Selector */}
                    <div className="flex items-center gap-2">
                        <span className="text-xs text-muted-foreground whitespace-nowrap">
                            Tipe:
                        </span>
                        <div className="flex rounded-lg border overflow-hidden">
                            <button
                                onClick={() => setReportType("daily")}
                                className={`px-3 py-1.5 text-xs font-medium transition-colors ${reportType === "daily" ? "bg-primary text-primary-foreground" : "bg-background hover:bg-muted"}`}
                            >
                                Harian
                            </button>
                            <button
                                onClick={() => setReportType("monthly")}
                                className={`px-3 py-1.5 text-xs font-medium transition-colors ${reportType === "monthly" ? "bg-primary text-primary-foreground" : "bg-background hover:bg-muted"}`}
                            >
                                Bulanan
                            </button>
                        </div>
                    </div>

                    {/* Date Inputs */}
                    <div className="flex items-center gap-2">
                        <span className="text-xs text-muted-foreground whitespace-nowrap">
                            Periode:
                        </span>
                        <Input
                            type="date"
                            value={startDate}
                            onChange={(e) => setStartDate(e.target.value)}
                            className="w-[140px] h-9 text-xs"
                        />
                        <span className="text-xs text-muted-foreground">
                            s/d
                        </span>
                        <Input
                            type="date"
                            value={endDate}
                            onChange={(e) => setEndDate(e.target.value)}
                            className="w-[140px] h-9 text-xs"
                        />
                    </div>

                    {/* Staff Filter */}
                    <div className="flex items-center gap-2">
                        <span className="text-xs text-muted-foreground whitespace-nowrap">
                            Pencuci:
                        </span>
                        <Select value={staffId} onValueChange={setStaffId}>
                            <SelectTrigger className="w-[140px] h-9 text-xs">
                                <SelectValue placeholder="Semua Kasir" />
                            </SelectTrigger>
                            <SelectContent>
                                <SelectItem value="all" className="text-xs">
                                    Semua Kasir
                                </SelectItem>
                                {staffList.map((staff) => (
                                    <SelectItem
                                        key={staff.id}
                                        value={staff.id.toString()}
                                        className="text-xs"
                                    >
                                        {staff.name}
                                    </SelectItem>
                                ))}
                            </SelectContent>
                        </Select>
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
                )}

                {/* Summary Cards */}
                <motion.div
                    className="grid gap-4 md:grid-cols-2 lg:grid-cols-2"
                    variants={containerVariants}
                    initial="hidden"
                    animate="show"
                >
                    <motion.div variants={cardVariants}>
                        <Card className="shadow-sm border bg-gradient-to-tr from-blue-500/10 via-card to-card hover:shadow-md transition-shadow">
                            <CardHeader className="flex flex-row items-center justify-between pb-2">
                                <CardTitle className="text-sm font-semibold">
                                    Total Omset
                                </CardTitle>
                                <DollarSign className="h-5 w-5 text-blue-600" />
                            </CardHeader>
                            <CardContent>
                                <div className="text-2xl font-extrabold text-blue-600 dark:text-blue-400">
                                    {formatRupiah(summary.total_revenue || 0)}
                                </div>
                                <div className="flex items-end justify-between mt-1">
                                    <p className="text-xs text-muted-foreground">
                                        {summary.total_transactions || 0} transaksi
                                    </p>
                                    <Popover>
                                        <PopoverTrigger asChild>
                                            <Button variant="link" size="sm" className="h-auto p-0 text-xs font-semibold text-blue-600 hover:text-blue-800">
                                                Lihat Rincian
                                            </Button>
                                        </PopoverTrigger>
                                        <PopoverContent className="w-56 p-3">
                                            <div className="space-y-2">
                                                <h4 className="font-medium text-sm border-b pb-1">Detail Pembayaran</h4>
                                                {summary.payment_breakdown && Object.entries(summary.payment_breakdown).length > 0 ? (
                                                    Object.entries(summary.payment_breakdown).map(([method, amount]) => (
                                                        <div key={method} className="flex justify-between text-xs">
                                                            <span>{method}</span>
                                                            <span className="font-medium">{formatRupiah(amount as number)}</span>
                                                        </div>
                                                    ))
                                                ) : (
                                                    <div className="text-xs text-muted-foreground">Tidak ada data</div>
                                                )}
                                            </div>
                                        </PopoverContent>
                                    </Popover>
                                </div>
                            </CardContent>
                        </Card>
                    </motion.div>
                    <motion.div variants={cardVariants}>
                        <Card className="shadow-sm border bg-gradient-to-tr from-indigo-500/10 via-card to-card hover:shadow-md transition-shadow">
                            <CardHeader className="flex flex-row items-center justify-between pb-2">
                                <CardTitle className="text-sm font-semibold">
                                    Pembayaran Voucher
                                </CardTitle>
                                <Ticket className="h-5 w-5 text-indigo-600" />
                            </CardHeader>
                            <CardContent>
                                <div className="text-2xl font-extrabold text-indigo-600 dark:text-indigo-400">
                                    {summary.voucher_count || 0} Transaksi
                                </div>
                                <p className="text-xs text-muted-foreground mt-1">
                                    Penukaran voucher
                                </p>
                            </CardContent>
                        </Card>
                    </motion.div>
                    {/* <motion.div variants={cardVariants}>
                        <Card className="shadow-sm border bg-gradient-to-tr from-amber-500/10 via-card to-card hover:shadow-md transition-shadow">
                            <CardHeader className="flex flex-row items-center justify-between pb-2">
                                <CardTitle className="text-sm font-semibold">Rata-rata / Transaksi</CardTitle>
                                <TrendingUp className="h-5 w-5 text-amber-600" />
                            </CardHeader>
                            <CardContent>
                                <div className="text-2xl font-extrabold text-amber-600 dark:text-amber-400">{formatRupiah(Math.round(summary.avg_transaction || 0))}</div>
                                <p className="text-xs text-muted-foreground mt-1">{summary.warranty_count || 0} klaim garansi</p>
                            </CardContent>
                        </Card>
                    </motion.div> */}
                </motion.div>

                {/* Data Table */}
                <div className="bg-card rounded-xl border p-4 shadow-sm">
                    <div className="flex items-center gap-2 mb-4">
                        <Calendar className="h-4 w-4 text-muted-foreground" />
                        <h3 className="text-sm font-semibold text-foreground">
                            Detail{" "}
                            {filters.report_type === "daily"
                                ? "Harian"
                                : "Bulanan"}
                        </h3>
                        <span className="text-xs text-muted-foreground ml-auto">
                            {pagination.total || 0} data
                        </span>
                    </div>
                    <DataTable columns={columns as any} data={reportData} />
                    {pagination && (
                        <Pagination
                            pagination={pagination}
                            onPageChange={handlePageChange}
                            label="data omset"
                        />
                    )}
                </div>
            </div>
        </AppLayout>
    );
}
