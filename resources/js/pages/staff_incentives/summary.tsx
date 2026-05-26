import Heading from "@/components/heading";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { DataTable } from "@/components/ui/data-table";
import AppLayout from "@/layouts/app-layout";
import { BreadcrumbItem } from "@/types";
import { Head, router, usePage } from "@inertiajs/react";
import { ColumnDef } from "@tanstack/react-table";
import { DollarSign } from "lucide-react";
import { useState } from "react";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { motion } from "framer-motion";

interface StaffSummary {
    id: number;
    full_name: string;
    gross_income: number;
    total_incentive: number;
}

const formatToIDR = (value: number) => {
    return new Intl.NumberFormat("id-ID", {
        style: "currency",
        currency: "IDR",
        minimumFractionDigits: 0,
    }).format(value);
};

export default function StaffIncentivesSummary() {
    const { props } = usePage<any>();
    const staffReport = (props.staffReport as StaffSummary[]) || [];
    const filters = props.filters ?? { start_date: "", end_date: "" };

    const [startDate, setStartDate] = useState(filters.start_date);
    const [endDate, setEndDate] = useState(filters.end_date);

    const breadcrumbs: BreadcrumbItem[] = [
        { title: "Staff", href: "/staffs" },
        { title: "Insentif SPV (Owner)", href: "/staff-incentives/summary" },
    ];

    const handleFilter = () => {
        router.get(
            route("staff-incentives.summary"),
            { start_date: startDate, end_date: endDate },
            { preserveState: true },
        );
    };

    const handleQuickFilter = (
        type: "today" | "this_month" | "last_30_days",
    ) => {
        const todayStr = new Date().toISOString().split("T")[0];
        let startStr = todayStr;
        let endStr = todayStr;

        if (type === "this_month") {
            const firstDay = new Date(
                new Date().getFullYear(),
                new Date().getMonth(),
                1,
            );
            const offset = firstDay.getTimezoneOffset();
            const localFirstDay = new Date(
                firstDay.getTime() - offset * 60 * 1000,
            );
            startStr = localFirstDay.toISOString().split("T")[0];
        } else if (type === "last_30_days") {
            const start = new Date();
            start.setDate(start.getDate() - 30);
            startStr = start.toISOString().split("T")[0];
        }

        setStartDate(startStr);
        setEndDate(endStr);

        router.get(
            route("staff-incentives.summary"),
            { start_date: startStr, end_date: endStr },
            { preserveState: true },
        );
    };

    const columns: ColumnDef<StaffSummary>[] = [
        {
            id: "index",
            header: "No",
            cell: (row) => <div>{row.row.index + 1}</div>,
        },
        {
            accessorKey: "full_name",
            header: "Nama Staff",
            cell: (info) => (
                <div className="font-semibold text-foreground">
                    {info.getValue() as string}
                </div>
            ),
        },
        {
            accessorKey: "gross_income",
            header: "Total Pendapatan Kotor (Gross)",
            cell: (info) => (
                <div className="font-bold text-primary text-base">
                    {formatToIDR(info.getValue() as number)}
                </div>
            ),
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

    const totalGrossIncome = staffReport.reduce(
        (acc, staff) => acc + Number(staff.gross_income),
        0,
    );
    const totalIncentive = staffReport.reduce(
        (acc, staff) => acc + Number(staff.total_incentive),
        0,
    );

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
        show: {
            y: 0,
            opacity: 1,
            transition: { type: "spring", stiffness: 100 },
        },
    };

    return (
        <AppLayout breadcrumbs={breadcrumbs}>
            <Head title="Ringkasan Insentif SPV (Owner)" />
            <div className="flex h-full flex-1 flex-col space-y-6 rounded-xl p-4 lg:p-6">
                <div className="flex flex-col gap-4 md:flex-row md:items-center md:justify-between">
                    <Heading
                        title="Ringkasan Insentif SPV (Owner)"
                        description="Laporan ringkas total pendapatan kotor dan insentif per staff."
                    />

                    <div className="flex flex-col gap-2 bg-card border rounded-xl p-3 shadow-xs sm:flex-row sm:items-center">
                        <div className="flex items-center gap-2">
                            <span className="text-xs text-muted-foreground whitespace-nowrap">
                                Rentang Tanggal:
                            </span>
                            <Input
                                type="date"
                                value={startDate}
                                onChange={(e) => setStartDate(e.target.value)}
                                className="w-[145px] h-9 text-xs"
                            />
                            <span className="text-xs text-muted-foreground">
                                s/d
                            </span>
                            <Input
                                type="date"
                                value={endDate}
                                onChange={(e) => setEndDate(e.target.value)}
                                className="w-[145px] h-9 text-xs"
                            />
                        </div>
                        <div className="flex items-center gap-2">
                            <Button
                                size="sm"
                                onClick={handleFilter}
                                className="h-9"
                            >
                                Filter
                            </Button>
                            <Button
                                variant="outline"
                                size="sm"
                                onClick={() => handleQuickFilter("today")}
                                className="h-9 text-xs"
                            >
                                Hari Ini
                            </Button>
                            <Button
                                variant="outline"
                                size="sm"
                                onClick={() => handleQuickFilter("this_month")}
                                className="h-9 text-xs"
                            >
                                Bulan Ini
                            </Button>
                        </div>
                    </div>
                </div>

                <motion.div
                    className="grid gap-4 md:grid-cols-2"
                    variants={containerVariants}
                    initial="hidden"
                    animate="show"
                >
                    <motion.div variants={cardVariants}>
                        <Card className="shadow-sm border bg-gradient-to-tr from-primary/5 via-card to-card hover:shadow-md transition-shadow">
                            <CardHeader className="flex flex-row items-center justify-between pb-2">
                                <CardTitle className="text-sm font-semibold">
                                    Total Pendapatan Kotor Staff
                                </CardTitle>
                                <DollarSign className="h-5 w-5 text-primary" />
                            </CardHeader>
                            <CardContent>
                                <div className="text-3xl font-extrabold text-primary">
                                    {formatToIDR(totalGrossIncome)}
                                </div>
                                <p className="text-xs text-muted-foreground mt-1">
                                    Akumulasi pendapatan kotor dari layanan cuci
                                </p>
                            </CardContent>
                        </Card>
                    </motion.div>

                    <motion.div variants={cardVariants}>
                        <Card className="shadow-sm border bg-gradient-to-tr from-emerald-500/5 via-card to-card hover:shadow-md transition-shadow">
                            <CardHeader className="flex flex-row items-center justify-between pb-2">
                                <CardTitle className="text-sm font-semibold">
                                    Total Pengeluaran Insentif
                                </CardTitle>
                                <DollarSign className="h-5 w-5 text-emerald-600 dark:text-emerald-400" />
                            </CardHeader>
                            <CardContent>
                                <div className="text-3xl font-extrabold text-emerald-600 dark:text-emerald-400">
                                    {formatToIDR(totalIncentive)}
                                </div>
                                <p className="text-xs text-muted-foreground mt-1">
                                    Total insentif yang dibayarkan ke staff
                                </p>
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
