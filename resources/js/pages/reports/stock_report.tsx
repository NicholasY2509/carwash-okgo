import Heading from "@/components/heading";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { DataTable } from "@/components/ui/data-table";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import AppLayout from "@/layouts/app-layout";
import { BreadcrumbItem } from "@/types";
import { Head, router, usePage } from "@inertiajs/react";
import { ColumnDef } from "@tanstack/react-table";
import { Pagination } from "@/components/ui/pagination";
import { useState, useEffect, useRef } from "react";
import { motion } from "framer-motion";
import { ArrowDownCircle, ArrowUpCircle, BarChart3, Box, Calendar, Layers, PackageMinus, PackagePlus } from "lucide-react";

interface ItemOption {
    id: number;
    name: string;
    sku: string | null;
    stock: number;
}

interface Movement {
    id: number;
    item_id: number;
    quantity: number;
    resulting_stock: number;
    type: string;
    reason: string;
    created_at: string;
    item?: { id: number; name: string; sku: string | null };
}

interface TypeBreakdown {
    type: string;
    total_qty: number;
    count: number;
}

interface Summary {
    total_in: number;
    total_out: number;
    total_movements: number;
    current_stock: number;
    items_count: number;
}

const typeLabels: Record<string, { label: string; color: string }> = {
    purchase: { label: "Pembelian", color: "bg-emerald-50 text-emerald-700 border-emerald-200 dark:bg-emerald-900/30 dark:text-emerald-400" },
    adjustment: { label: "Penyesuaian", color: "bg-blue-50 text-blue-700 border-blue-200 dark:bg-blue-900/30 dark:text-blue-400" },
    waste: { label: "Waste/Rusak", color: "bg-red-50 text-red-700 border-red-200 dark:bg-red-900/30 dark:text-red-400" },
    service_usage: { label: "Pemakaian Cuci", color: "bg-orange-50 text-orange-700 border-orange-200 dark:bg-orange-900/30 dark:text-orange-400" },
    service_cancellation: { label: "Pembatalan Cuci", color: "bg-purple-50 text-purple-700 border-purple-200 dark:bg-purple-900/30 dark:text-purple-400" },
};

const formatDateTime = (dateStr: string) =>
    new Intl.DateTimeFormat("id-ID", { day: "numeric", month: "short", year: "numeric", hour: "2-digit", minute: "2-digit", timeZone: "Asia/Jakarta" }).format(new Date(dateStr));

export default function StockReport() {
    const { props } = usePage<any>();
    const movements = props.movements || { data: [], current_page: 1, last_page: 1, per_page: 20, total: 0 };
    const items = (props.items as ItemOption[]) || [];
    const summary = (props.summary as Summary) || {};
    const typeBreakdown = (props.typeBreakdown as TypeBreakdown[]) || [];
    const filters = props.filters ?? { item_id: null, start_date: "", end_date: "" };

    const [selectedItem, setSelectedItem] = useState<string>(filters.item_id?.toString() || "");
    const [startDate, setStartDate] = useState(filters.start_date);
    const [endDate, setEndDate] = useState(filters.end_date);

    const breadcrumbs: BreadcrumbItem[] = [
        { title: "Laporan", href: "/reports/stock" },
        { title: "Stok Barang", href: "/reports/stock" },
    ];

    const isMounted = useRef(false);

    useEffect(() => {
        if (!isMounted.current) {
            isMounted.current = true;
            return;
        }
        router.get(route("reports.stock"), {
            item_id: selectedItem || undefined,
            start_date: startDate,
            end_date: endDate,
        }, { preserveState: true });
    }, [selectedItem, startDate, endDate]);

    const handlePageChange = (page: number) => {
        router.get(route("reports.stock"), {
            item_id: selectedItem || undefined,
            start_date: startDate,
            end_date: endDate,
            page,
        }, { preserveState: true });
    };

    const handleQuickFilter = (type: "today" | "this_month") => {
        const now = new Date();
        let startStr = now.toISOString().split("T")[0];
        const endStr = startStr;

        if (type === "this_month") {
            startStr = `${now.getFullYear()}-${String(now.getMonth() + 1).padStart(2, "0")}-01`;
        }

        setStartDate(startStr);
        setEndDate(endStr);
    };

    const columns: ColumnDef<Movement>[] = [
        { id: "index", header: "No", cell: (row) => row.row.index + 1 + (movements.current_page - 1) * movements.per_page },
        {
            id: "item_name",
            header: "Barang",
            cell: ({ row }) => (
                <div>
                    <div className="font-semibold text-foreground">{row.original.item?.name || "-"}</div>
                    {row.original.item?.sku && <div className="text-xs text-muted-foreground">{row.original.item.sku}</div>}
                </div>
            ),
        },
        {
            accessorKey: "type",
            header: "Tipe",
            cell: ({ row }) => {
                const info = typeLabels[row.original.type] || { label: row.original.type, color: "bg-gray-50 text-gray-700 border-gray-200" };
                return <Badge variant="outline" className={`text-xs font-semibold ${info.color}`}>{info.label}</Badge>;
            },
        },
        {
            accessorKey: "quantity",
            header: "Qty",
            cell: ({ row }) => {
                const qty = row.original.quantity;
                const isPositive = qty > 0;
                return (
                    <div className="flex items-center gap-1.5">
                        {isPositive ? (
                            <ArrowUpCircle className="h-4 w-4 text-emerald-500" />
                        ) : (
                            <ArrowDownCircle className="h-4 w-4 text-red-500" />
                        )}
                        <span className={`font-bold ${isPositive ? "text-emerald-600 dark:text-emerald-400" : "text-red-600 dark:text-red-400"}`}>
                            {isPositive ? `+${qty}` : qty}
                        </span>
                    </div>
                );
            },
        },
        {
            accessorKey: "resulting_stock",
            header: "Stok Akhir",
            cell: ({ row }) => <span className="font-semibold text-foreground">{row.original.resulting_stock}</span>,
        },
        {
            accessorKey: "reason",
            header: "Keterangan",
            cell: ({ row }) => <span className="text-xs text-muted-foreground max-w-[250px] truncate block">{row.original.reason || "-"}</span>,
        },
        {
            accessorKey: "created_at",
            header: "Waktu",
            cell: ({ row }) => <span className="text-xs">{formatDateTime(row.original.created_at)}</span>,
        },
    ];

    const containerVariants = { hidden: { opacity: 0 }, show: { opacity: 1, transition: { staggerChildren: 0.08 } } };
    const cardVariants = { hidden: { y: 20, opacity: 0 }, show: { y: 0, opacity: 1, transition: { type: "spring", stiffness: 100 } } };

    return (
        <AppLayout breadcrumbs={breadcrumbs}>
            <Head title="Laporan Stok Barang" />
            <div className="flex h-full flex-1 flex-col space-y-6 rounded-xl p-4 lg:p-6">
                {/* Header */}
                <div className="flex flex-col gap-1">
                    <Heading title="Laporan Stok Barang" description="Riwayat pergerakan stok masuk dan keluar barang." />
                </div>

                {/* Filters Pane (Horizontal) */}
                <div className="flex flex-col md:flex-row items-center gap-4 bg-card border rounded-xl p-4 shadow-xs w-full">
                    {/* Barang Selector */}
                    <div className="flex items-center gap-2">
                        <span className="text-xs text-muted-foreground whitespace-nowrap">Barang:</span>
                        <select
                            value={selectedItem}
                            onChange={(e) => setSelectedItem(e.target.value)}
                            className="h-9 text-xs rounded-md border border-input bg-background px-3 py-1 shadow-sm focus-visible:outline-none focus-visible:ring-1 focus-visible:ring-ring min-w-[180px]"
                        >
                            <option value="">Semua Barang</option>
                            {items.map((item) => (
                                <option key={item.id} value={item.id.toString()}>
                                    {item.name} {item.sku ? `(${item.sku})` : ""} — Stok: {item.stock}
                                </option>
                            ))}
                        </select>
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
                    </div>
                </div>

                {/* Summary Cards */}
                <motion.div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3" variants={containerVariants} initial="hidden" animate="show">
                    <motion.div variants={cardVariants}>
                        <Card className="shadow-sm border bg-gradient-to-tr from-emerald-500/10 via-card to-card hover:shadow-md transition-shadow">
                            <CardHeader className="flex flex-row items-center justify-between pb-2">
                                <CardTitle className="text-sm font-semibold">Stok Masuk</CardTitle>
                                <PackagePlus className="h-5 w-5 text-emerald-600" />
                            </CardHeader>
                            <CardContent>
                                <div className="text-2xl font-extrabold text-emerald-600 dark:text-emerald-400">+{summary.total_in || 0}</div>
                                <p className="text-xs text-muted-foreground mt-1">Unit masuk dalam periode</p>
                            </CardContent>
                        </Card>
                    </motion.div>
                    <motion.div variants={cardVariants}>
                        <Card className="shadow-sm border bg-gradient-to-tr from-red-500/10 via-card to-card hover:shadow-md transition-shadow">
                            <CardHeader className="flex flex-row items-center justify-between pb-2">
                                <CardTitle className="text-sm font-semibold">Stok Keluar</CardTitle>
                                <PackageMinus className="h-5 w-5 text-red-600" />
                            </CardHeader>
                            <CardContent>
                                <div className="text-2xl font-extrabold text-red-600 dark:text-red-400">-{summary.total_out || 0}</div>
                                <p className="text-xs text-muted-foreground mt-1">Unit keluar dalam periode</p>
                            </CardContent>
                        </Card>
                    </motion.div>
                    <motion.div variants={cardVariants}>
                        <Card className="shadow-sm border bg-gradient-to-tr from-blue-500/10 via-card to-card hover:shadow-md transition-shadow">
                            <CardHeader className="flex flex-row items-center justify-between pb-2">
                                <CardTitle className="text-sm font-semibold">Stok Saat Ini</CardTitle>
                                <Box className="h-5 w-5 text-blue-600" />
                            </CardHeader>
                            <CardContent>
                                <div className="text-2xl font-extrabold text-blue-600 dark:text-blue-400">{summary.current_stock || 0}</div>
                                <p className="text-xs text-muted-foreground mt-1">{selectedItem ? "Barang dipilih" : `${summary.items_count || 0} jenis barang`}</p>
                            </CardContent>
                        </Card>
                    </motion.div>
                    {/* <motion.div variants={cardVariants}>
                        <Card className="shadow-sm border bg-gradient-to-tr from-amber-500/10 via-card to-card hover:shadow-md transition-shadow">
                            <CardHeader className="flex flex-row items-center justify-between pb-2">
                                <CardTitle className="text-sm font-semibold">Total Pergerakan</CardTitle>
                                <Layers className="h-5 w-5 text-amber-600" />
                            </CardHeader>
                            <CardContent>
                                <div className="text-2xl font-extrabold text-amber-600 dark:text-amber-400">{summary.total_movements || 0}</div>
                                <p className="text-xs text-muted-foreground mt-1">
                                    {typeBreakdown.length > 0 ? typeBreakdown.map((t) => `${typeLabels[t.type]?.label || t.type}: ${t.count}`).join(" • ") : "Tidak ada data"}
                                </p>
                            </CardContent>
                        </Card>
                    </motion.div> */}
                </motion.div>

                {/* Data Table */}
                <div className="bg-card rounded-xl border p-4 shadow-sm">
                    <div className="flex items-center gap-2 mb-4">
                        <Calendar className="h-4 w-4 text-muted-foreground" />
                        <h3 className="text-sm font-semibold text-foreground">Riwayat Pergerakan Stok</h3>
                        <span className="text-xs text-muted-foreground ml-auto">{movements.total} data</span>
                    </div>
                    <DataTable columns={columns as any} data={movements.data} />
                    {movements && (
                        <Pagination
                            pagination={movements}
                            onPageChange={handlePageChange}
                            label="pergerakan stok"
                        />
                    )}
                </div>
            </div>
        </AppLayout>
    );
}
