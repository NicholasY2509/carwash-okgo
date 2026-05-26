import Heading from "@/components/heading";
import {
    Card,
    CardContent,
    CardHeader,
    CardTitle,
} from "@/components/ui/card";
import { DataTable } from "@/components/ui/data-table";
import AppLayout from "@/layouts/app-layout";
import { BreadcrumbItem } from "@/types";
import { Head, router, usePage } from "@inertiajs/react";
import { ColumnDef } from "@tanstack/react-table";
import { DollarSign, Award, Info, Package } from "lucide-react";
import { useState } from "react";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { motion } from "framer-motion";

interface Staff {
    id: number;
    full_name: string;
    packets_sold_count: number;
    tier_name: string;
    total_incentive: number;
    gross_income: number;
}

interface CashierIncentiveTier {
    id: number;
    name: string;
    min_packets: number;
    max_packets: number | null;
    commission_per_packet: number;
}

const formatToIDR = (value: number) => {
    return new Intl.NumberFormat("id-ID", {
        style: "currency",
        currency: "IDR",
        minimumFractionDigits: 0,
    }).format(value);
};

export default function CashierIncentivesIndex() {
    const { props } = usePage<any>();
    const staffReport = (props.staffReport as Staff[]) || [];
    const tiers = (props.tiers as CashierIncentiveTier[]) || [];
    const totalPackets = props.totalPackets ?? 0;
    const totalIncentive = props.totalIncentive ?? 0;
    const totalGrossIncome = props.totalGrossIncome ?? 0;
    const filters = props.filters ?? { start_date: "", end_date: "" };

    const [startDate, setStartDate] = useState(filters.start_date);
    const [endDate, setEndDate] = useState(filters.end_date);

    const breadcrumbs: BreadcrumbItem[] = [
        { title: "Staff", href: "/staffs" },
        { title: "Insentif Kasir", href: "/cashier-incentives" },
    ];

    const handleFilter = () => {
        router.get(
            route("cashier-incentives.index"),
            { start_date: startDate, end_date: endDate },
            { preserveState: true }
        );
    };

    const handleQuickFilter = (type: "today" | "this_month" | "last_30_days") => {
        const todayStr = new Date().toISOString().split("T")[0];
        let startStr = todayStr;
        let endStr = todayStr;

        if (type === "this_month") {
            const firstDay = new Date(new Date().getFullYear(), new Date().getMonth(), 1);
            const offset = firstDay.getTimezoneOffset();
            const localFirstDay = new Date(firstDay.getTime() - (offset * 60 * 1000));
            startStr = localFirstDay.toISOString().split('T')[0];
        } else if (type === "last_30_days") {
            const start = new Date();
            start.setDate(start.getDate() - 30);
            startStr = start.toISOString().split("T")[0];
        }

        setStartDate(startStr);
        setEndDate(endStr);

        router.get(
            route("cashier-incentives.index"),
            { start_date: startStr, end_date: endStr },
            { preserveState: true }
        );
    };

    const columns: ColumnDef<Staff>[] = [
        {
            id: "index",
            header: "No",
            cell: (row) => <div>{row.row.index + 1}</div>,
        },
        {
            accessorKey: "full_name",
            header: "Nama Kasir / Staff",
            cell: (info) => <div className="font-semibold text-foreground">{info.getValue() as string}</div>,
        },
        {
            accessorKey: "packets_sold_count",
            header: "Jumlah Paket Terjual",
            cell: (info) => (
                <div className="font-bold text-primary text-base">
                    {info.getValue() as number} <span className="text-xs font-normal text-muted-foreground">Paket</span>
                </div>
            ),
        },
        {
            accessorKey: "gross_income",
            header: "Pendapatan Kotor",
            cell: (info) => (
                <div className="font-medium text-foreground">
                    {formatToIDR(info.getValue() as number)}
                </div>
            ),
        },
        {
            accessorKey: "tier_name",
            header: "Pencapaian Tier",
            cell: (info) => {
                const tierName = info.getValue() as string;
                let badgeClass = "bg-gray-100 text-gray-800 border-gray-200 dark:bg-gray-800 dark:text-gray-200 dark:border-gray-700";

                if (tierName !== 'Tanpa Tier') {
                    badgeClass = "bg-blue-50 text-blue-700 border-blue-200 dark:bg-blue-900/30 dark:text-blue-400 dark:border-blue-800";
                }

                return (
                    <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-semibold border ${badgeClass}`}>
                        {tierName}
                    </span>
                );
            },
        },
        {
            accessorKey: "total_incentive",
            header: "Total Insentif",
            cell: (info) => (
                <div className="font-extrabold text-emerald-600 dark:text-emerald-400 text-base">
                    {formatToIDR(info.getValue() as number)}
                </div>
            ),
        },
    ];

    const containerVariants = {
        hidden: { opacity: 0 },
        show: {
            opacity: 1,
            transition: {
                staggerChildren: 0.1,
            },
        },
    };

    const cardVariants = {
        hidden: { y: 20, opacity: 0 },
        show: { y: 0, opacity: 1, transition: { type: "spring", stiffness: 100 } },
    };

    return (
        <AppLayout breadcrumbs={breadcrumbs}>
            <Head title="Insentif Kasir" />
            <div className="flex h-full flex-1 flex-col space-y-6 rounded-xl p-4 lg:p-6">
                <div className="flex flex-col gap-4 md:flex-row md:items-center md:justify-between">
                    <Heading
                        title="Insentif Penjualan Kasir"
                        description="Laporan detail penjualan paket voucher per staff dan komisi insentif berdasarkan target tier."
                    />
                    <div className="flex flex-col gap-2 bg-card border rounded-xl p-3 shadow-xs sm:flex-row sm:items-center">
                        <div className="flex items-center gap-2">
                            <span className="text-xs text-muted-foreground whitespace-nowrap">Rentang Tanggal:</span>
                            <Input
                                type="date"
                                value={startDate}
                                onChange={(e) => setStartDate(e.target.value)}
                                className="w-[145px] h-9 text-xs"
                            />
                            <span className="text-xs text-muted-foreground">s/d</span>
                            <Input
                                type="date"
                                value={endDate}
                                onChange={(e) => setEndDate(e.target.value)}
                                className="w-[145px] h-9 text-xs"
                            />
                        </div>
                        <div className="flex items-center gap-2">
                            <Button size="sm" onClick={handleFilter} className="h-9">
                                Filter
                            </Button>
                            <Button variant="outline" size="sm" onClick={() => handleQuickFilter("this_month")} className="h-9 text-xs">
                                Bulan Ini
                            </Button>
                        </div>
                    </div>
                </div>

                <motion.div 
                    className="grid gap-4 md:grid-cols-2 lg:grid-cols-4"
                    variants={containerVariants}
                    initial="hidden"
                    animate="show"
                >
                    <motion.div variants={cardVariants}>
                        <Card className="shadow-sm border bg-gradient-to-tr from-primary/5 via-card to-card hover:shadow-md transition-shadow">
                            <CardHeader className="flex flex-row items-center justify-between pb-2">
                                <CardTitle className="text-sm font-semibold">Total Paket Terjual</CardTitle>
                                <Package className="h-5 w-5 text-primary" />
                            </CardHeader>
                            <CardContent>
                                <div className="text-3xl font-extrabold text-primary">{totalPackets} Paket</div>
                                <p className="text-xs text-muted-foreground mt-1">
                                    Total penjualan paket valid oleh seluruh staff
                                </p>
                            </CardContent>
                        </Card>
                    </motion.div>

                    <motion.div variants={cardVariants}>
                        <Card className="shadow-sm border bg-gradient-to-tr from-emerald-500/5 via-card to-card hover:shadow-md transition-shadow">
                            <CardHeader className="flex flex-row items-center justify-between pb-2">
                                <CardTitle className="text-sm font-semibold">Total Pengeluaran Insentif</CardTitle>
                                <DollarSign className="h-5 w-5 text-emerald-600 dark:text-emerald-400" />
                            </CardHeader>
                            <CardContent>
                                <div className="text-3xl font-extrabold text-emerald-600 dark:text-emerald-400">{formatToIDR(totalIncentive)}</div>
                                <p className="text-xs text-muted-foreground mt-1">
                                    Akumulasi pengeluaran insentif kasir
                                </p>
                            </CardContent>
                        </Card>
                    </motion.div>

                    <motion.div variants={cardVariants}>
                        <Card className="shadow-sm border bg-gradient-to-tr from-blue-500/5 via-card to-card hover:shadow-md transition-shadow">
                            <CardHeader className="flex flex-row items-center justify-between pb-2">
                                <CardTitle className="text-sm font-semibold">Total Pendapatan Kotor</CardTitle>
                                <DollarSign className="h-5 w-5 text-blue-600 dark:text-blue-400" />
                            </CardHeader>
                            <CardContent>
                                <div className="text-3xl font-extrabold text-blue-600 dark:text-blue-400">{formatToIDR(totalGrossIncome)}</div>
                                <p className="text-xs text-muted-foreground mt-1">
                                    Total pemasukan dari paket voucher
                                </p>
                            </CardContent>
                        </Card>
                    </motion.div>

                    <motion.div variants={cardVariants}>
                        <Card className="shadow-sm border hover:shadow-md transition-shadow">
                            <CardHeader className="flex flex-row items-center justify-between pb-2">
                                <CardTitle className="text-sm font-semibold">Konfigurasi Tier Aktif</CardTitle>
                                <Award className="h-5 w-5 text-indigo-500" />
                            </CardHeader>
                            <CardContent>
                                <div className="space-y-1.5 max-h-[80px] overflow-y-auto pr-1">
                                    {tiers.length > 0 ? (
                                        tiers.map((t) => (
                                            <div key={t.id} className="flex justify-between text-xs items-center">
                                                <span className="font-semibold text-muted-foreground">{t.name} ({t.max_packets ? `${t.min_packets}-${t.max_packets}` : `>${t.min_packets}`} paket)</span>
                                                <span className="font-bold text-emerald-600">{formatToIDR(t.commission_per_packet)} / paket</span>
                                            </div>
                                        ))
                                    ) : (
                                        <div className="flex items-center gap-1 text-xs text-amber-600">
                                            <Info className="h-3 w-3" />
                                            Belum ada tier. Atur di Master Insentif Kasir.
                                        </div>
                                    )}
                                </div>
                            </CardContent>
                        </Card>
                    </motion.div>
                </motion.div>

                <div className="bg-card rounded-xl border p-4 shadow-sm">
                    <DataTable columns={columns} data={staffReport} />
                </div>
            </div>
        </AppLayout>
    );
}
