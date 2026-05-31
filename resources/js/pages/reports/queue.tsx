import Heading from "@/components/heading";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { DataTable } from "@/components/ui/data-table";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import AppLayout from "@/layouts/app-layout";
import { BreadcrumbItem } from "@/types";
import { Head, router, usePage } from "@inertiajs/react";
import { ColumnDef } from "@tanstack/react-table";
import { useState, useEffect, useRef } from "react";
import { motion } from "framer-motion";
import { Calendar, Clock, Car, CheckCircle } from "lucide-react";
import { Pagination } from "@/components/ui/pagination";

interface ReportRow {
    id?: string;
    service_date?: string;
    plate_number?: string | null;
    car_type?: string;
    queue_status?: string;
    wait_time_minutes?: number | null;
    process_time_minutes?: number | null;
    total_time_minutes?: number | null;
    finished_at?: string;

    month?: string;
    total_cars?: number;
    avg_wait_time?: number | null;
    avg_process_time?: number | null;
    avg_total_time?: number | null;
}

interface Summary {
    total_cars: number;
    avg_queue_time: number;
    avg_process_time: number;
    avg_total_time: number;
}

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

const formatDuration = (minutes?: number | null) => {
    if (minutes === undefined || minutes === null) return "-";
    const rounded = Math.round(minutes);
    const hours = Math.floor(rounded / 60);
    const mins = rounded % 60;
    return `${hours}:${mins.toString().padStart(2, "0")}`;
};

export default function QueueReport() {
    const { props } = usePage<any>();
    const pagination = props.reportData || { data: [], current_page: 1, last_page: 1, per_page: 20, total: 0 };
    const reportData = pagination.data || [];
    const summary = (props.summary as Summary) || {};
    const filters = props.filters ?? { report_type: "daily", start_date: "", end_date: "" };

    const [reportType, setReportType] = useState(filters.report_type);
    const [startDate, setStartDate] = useState(filters.start_date);
    const [endDate, setEndDate] = useState(filters.end_date);

    const breadcrumbs: BreadcrumbItem[] = [
        { title: "Laporan", href: "/reports/queue" },
        { title: "Waktu Antrian", href: "/reports/queue" },
    ];

    const isMounted = useRef(false);

    useEffect(() => {
        if (!isMounted.current) {
            isMounted.current = true;
            return;
        }
        router.get(route("reports.queue"), { report_type: reportType, start_date: startDate, end_date: endDate }, { preserveState: true });
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
        router.get(route("reports.queue"), {
            report_type: reportType,
            start_date: startDate,
            end_date: endDate,
            page,
        }, { preserveState: true });
    };

    const columns: ColumnDef<ReportRow>[] = filters.report_type === "daily" ? [
        { id: "index", header: "No", cell: (row) => row.row.index + 1 + (pagination.current_page - 1) * pagination.per_page },
        {
            accessorKey: "service_date",
            header: "Waktu Datang",
            cell: ({ row }) => <span className="font-medium text-xs">{formatDateTime(row.original.service_date)}</span>,
        },
        {
            id: "car_info",
            header: "Kendaraan",
            cell: ({ row }) => (
                <div>
                    <div className="font-semibold text-foreground text-xs">{row.original.plate_number}</div>
                    <div className="text-[10px] text-muted-foreground">{row.original.car_type}</div>
                </div>
            ),
        },
        {
            accessorKey: "finished_at",
            header: "Waktu Selesai",
            cell: ({ row }) => <span className="font-medium text-xs">{formatDateTime(row.original.finished_at)}</span>,
        },
        {
            accessorKey: "queue_status",
            header: "Status",
            cell: ({ row }) => <span className="text-xs font-semibold capitalize text-green-600">{row.original.queue_status}</span>,
        },
        {
            accessorKey: "wait_time_minutes",
            header: "Waktu Tunggu",
            cell: ({ row }) => <span className="text-orange-600 dark:text-orange-400 font-medium text-xs">{formatDuration(row.original.wait_time_minutes)}</span>,
        },
        {
            accessorKey: "process_time_minutes",
            header: "Waktu Proses",
            cell: ({ row }) => <span className="text-blue-600 dark:text-blue-400 font-medium text-xs">{formatDuration(row.original.process_time_minutes)}</span>,
        },
        {
            accessorKey: "total_time_minutes",
            header: "Total Waktu",
            cell: ({ row }) => <span className="font-extrabold text-emerald-600 dark:text-emerald-400 text-xs">{formatDuration(row.original.total_time_minutes)}</span>,
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
            accessorKey: "total_cars",
            header: "Total Mobil",
            cell: ({ row }) => <div className="font-semibold text-center">{row.original.total_cars}</div>,
        },
        {
            accessorKey: "avg_wait_time",
            header: "Rata-rata Tunggu",
            cell: ({ row }) => <span className="text-orange-600 dark:text-orange-400 font-medium">{formatDuration(row.original.avg_wait_time)}</span>,
        },
        {
            accessorKey: "avg_process_time",
            header: "Rata-rata Proses",
            cell: ({ row }) => <span className="text-blue-600 dark:text-blue-400 font-medium">{formatDuration(row.original.avg_process_time)}</span>,
        },
        {
            accessorKey: "avg_total_time",
            header: "Rata-rata Total",
            cell: ({ row }) => <span className="font-extrabold text-emerald-600 dark:text-emerald-400">{formatDuration(row.original.avg_total_time)}</span>,
        },
    ];

    const containerVariants = { hidden: { opacity: 0 }, show: { opacity: 1, transition: { staggerChildren: 0.08 } } };
    const cardVariants = { hidden: { y: 20, opacity: 0 }, show: { y: 0, opacity: 1, transition: { type: "spring", stiffness: 100 } } };

    return (
        <AppLayout breadcrumbs={breadcrumbs}>
            <Head title="Laporan Waktu Antrian" />
            <div className="flex h-full flex-1 flex-col space-y-6 rounded-xl p-4 lg:p-6">
                {/* Header */}
                <div className="flex flex-col gap-1">
                    <Heading title="Laporan Waktu Antrian" description="Laporan performa rata-rata waktu antrian dan pengerjaan mobil." />
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
                <motion.div className="grid gap-4 md:grid-cols-3 lg:grid-cols-4" variants={containerVariants} initial="hidden" animate="show">
                    <motion.div variants={cardVariants}>
                        <Card className="shadow-sm border bg-gradient-to-tr from-blue-500/10 via-card to-card hover:shadow-md transition-shadow h-full">
                            <CardHeader className="flex flex-row items-center justify-between pb-2">
                                <CardTitle className="text-sm font-semibold">Total Mobil Dikerjakan</CardTitle>
                                <Car className="h-5 w-5 text-blue-600" />
                            </CardHeader>
                            <CardContent>
                                <div className="text-2xl font-extrabold text-blue-600 dark:text-blue-400">{summary.total_cars || 0} Mobil</div>
                                <p className="text-xs text-muted-foreground mt-1">Selesai dikerjakan di periode ini</p>
                            </CardContent>
                        </Card>
                    </motion.div>
                    <motion.div variants={cardVariants}>
                        <Card className="shadow-sm border bg-gradient-to-tr from-orange-500/10 via-card to-card hover:shadow-md transition-shadow h-full">
                            <CardHeader className="flex flex-row items-center justify-between pb-2">
                                <CardTitle className="text-sm font-semibold">Rata-rata Waktu Tunggu</CardTitle>
                                <Clock className="h-5 w-5 text-orange-600" />
                            </CardHeader>
                            <CardContent>
                                <div className="text-2xl font-extrabold text-orange-600 dark:text-orange-400">{formatDuration(summary.avg_queue_time)}</div>
                                <p className="text-xs text-muted-foreground mt-1">Lama antrian sebelum diproses</p>
                            </CardContent>
                        </Card>
                    </motion.div>
                    <motion.div variants={cardVariants}>
                        <Card className="shadow-sm border bg-gradient-to-tr from-sky-500/10 via-card to-card hover:shadow-md transition-shadow h-full">
                            <CardHeader className="flex flex-row items-center justify-between pb-2">
                                <CardTitle className="text-sm font-semibold">Rata-rata Waktu Proses</CardTitle>
                                <Clock className="h-5 w-5 text-sky-600" />
                            </CardHeader>
                            <CardContent>
                                <div className="text-2xl font-extrabold text-sky-600 dark:text-sky-400">{formatDuration(summary.avg_process_time)}</div>
                                <p className="text-xs text-muted-foreground mt-1">Lama pengerjaan cuci mobil</p>
                            </CardContent>
                        </Card>
                    </motion.div>
                    <motion.div variants={cardVariants}>
                        <Card className="shadow-sm border bg-gradient-to-tr from-emerald-500/10 via-card to-card hover:shadow-md transition-shadow h-full">
                            <CardHeader className="flex flex-row items-center justify-between pb-2">
                                <CardTitle className="text-sm font-semibold">Rata-rata Total Waktu</CardTitle>
                                <CheckCircle className="h-5 w-5 text-emerald-600" />
                            </CardHeader>
                            <CardContent>
                                <div className="text-2xl font-extrabold text-emerald-600 dark:text-emerald-400">{formatDuration(summary.avg_total_time)}</div>
                                <p className="text-xs text-muted-foreground mt-1">Perjalanan dari datang hingga selesai</p>
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
                            label="data waktu antrian"
                        />
                    )}
                </div>
            </div>
        </AppLayout>
    );
}
