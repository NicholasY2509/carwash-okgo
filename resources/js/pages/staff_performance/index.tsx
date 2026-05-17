import Heading from "@/components/heading";
import {
    Card,
    CardContent,
    CardDescription,
    CardHeader,
    CardTitle,
} from "@/components/ui/card";
import { DataTable } from "@/components/ui/data-table";
import AppLayout from "@/layouts/app-layout";
import { BreadcrumbItem, PageProps } from "@/types";
import { Head, router, usePage } from "@inertiajs/react";
import { ColumnDef } from "@tanstack/react-table";
import { Car, DollarSign, Factory } from "lucide-react";
import {
    Select,
    SelectContent,
    SelectItem,
    SelectTrigger,
    SelectValue,
} from "@/components/ui/select";
import { useEffect, useState } from "react";

// --- Definisikan Tipe Data untuk Props ---

interface CarWashedByStall {
    stall_name: string;
    total_washes: number;
}

interface Staff {
    id: number;
    full_name: string;
    car_washes_count: number;
    hari_kerja: number;
}

interface Incentive {
    amount: number;
}

interface StaffPerformancePageProps {
    carWashedTotal: number;
    carsWashedByStall: CarWashedByStall[];
    staffReport: Staff[];
    incentive: Incentive | null;
    filters: {
        year: number;
        month: number;
    };
}

const formatToIDR = (value: number) => {
    return new Intl.NumberFormat("id-ID", {
        style: "currency",
        currency: "IDR",
        minimumFractionDigits: 0,
    }).format(value);
};

const months = [
    { value: 1, label: "Januari" },
    { value: 2, label: "Februari" },
    { value: 3, label: "Maret" },
    { value: 4, label: "April" },
    { value: 5, label: "Mei" },
    { value: 6, label: "Juni" },
    { value: 7, label: "Juli" },
    { value: 8, label: "Agustus" },
    { value: 9, label: "September" },
    { value: 10, label: "Oktober" },
    { value: 11, label: "November" },
    { value: 12, label: "Desember" },
];

const currentYear = new Date().getFullYear();
const years = Array.from({ length: 2 }, (_, i) => currentYear - i);

export default function StaffPerformanceIndex() {
    const { props } = usePage<PageProps<StaffPerformancePageProps>>();

    const carWashedTotal = props.carWashedTotal ?? 0;
    const staffReport = props.staffReport ?? [];
    const carsWashedByStall = props.carsWashedByStall ?? [];
    const incentive = props.incentive;
    const filters = props.filters;

    const [selectedYear, setSelectedYear] = useState(filters.year);
    const [selectedMonth, setSelectedMonth] = useState(filters.month);

    const breadcrumbs: BreadcrumbItem[] = [
        { title: "Staff Performance", href: "/staff-performance" },
    ];

    const totalIncentive = (incentive?.amount ?? 0) * carWashedTotal;

    useEffect(() => {
        if (selectedYear === filters.year && selectedMonth === filters.month) {
            return;
        }

        router.get(
            route("staff-performances.index"),
            { year: selectedYear, month: selectedMonth },
            { preserveState: true, replace: true },
        );
    }, [selectedYear, selectedMonth]);

    const columns: ColumnDef<Staff>[] = [
        {
            id: "index",
            header: "No",
            cell: (info) => info.row.index + 1,
        },
        {
            accessorKey: "full_name",
            header: "Nama Staff",
        },
        {
            accessorKey: "hari_kerja",
            header: "Hari Kerja",
        },
    ];

    return (
        <AppLayout breadcrumbs={breadcrumbs}>
            <Head title="Staff Performance" />
            <div className="flex h-full flex-1 flex-col space-y-6 rounded-xl p-4 lg:p-6">
                <div className="flex flex-col gap-4 md:flex-row md:items-center md:justify-between">
                    <Heading
                        title="Performa Pegawai"
                        description={`Ringkasan performa untuk bulan ${months.find((m) => m.value === filters.month)?.label} ${filters.year}.`}
                    />
                    <div className="flex items-center gap-2">
                        <Select
                            value={String(selectedMonth)}
                            onValueChange={(v) => setSelectedMonth(Number(v))}
                        >
                            <SelectTrigger className="w-[180px]">
                                <SelectValue placeholder="Pilih Bulan" />
                            </SelectTrigger>
                            <SelectContent>
                                {months.map((month) => (
                                    <SelectItem
                                        key={month.value}
                                        value={String(month.value)}
                                    >
                                        {month.label}
                                    </SelectItem>
                                ))}
                            </SelectContent>
                        </Select>
                        <Select
                            value={String(selectedYear)}
                            onValueChange={(v) => setSelectedYear(Number(v))}
                        >
                            <SelectTrigger className="w-[120px]">
                                <SelectValue placeholder="Pilih Tahun" />
                            </SelectTrigger>
                            <SelectContent>
                                {years.map((year) => (
                                    <SelectItem key={year} value={String(year)}>
                                        {year}
                                    </SelectItem>
                                ))}
                            </SelectContent>
                        </Select>
                    </div>
                </div>

                <div className="*:data-[slot=card]:from-primary/5 *:data-[slot=card]:to-card dark:*:data-[slot=card]:bg-card grid lg:grid-cols-3 md:grid-cols-2 gap-4 *:data-[slot=card]:bg-gradient-to-t *:data-[slot=card]:shadow-xs ">
                    <Card className="col-span-2 lg:col-span-1">
                        <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                            <CardTitle className="text-sm font-medium">
                                Total Mobil Dicuci
                            </CardTitle>
                            <Car className="h-4 w-4 text-muted-foreground" />
                        </CardHeader>
                        <CardContent>
                            <div className="text-2xl font-bold text-primary">
                                {carWashedTotal} Unit
                            </div>
                            <CardDescription>
                                Estimasi total insentif:{" "}
                                <span className="font-bold text-primary">
                                    {formatToIDR(totalIncentive)}
                                </span>
                            </CardDescription>
                        </CardContent>
                    </Card>

                    <Card>
                        <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                            <CardTitle className="text-sm font-medium">
                                Rincian per Stall
                            </CardTitle>
                            <Factory className="h-4 w-4 text-muted-foreground" />
                        </CardHeader>
                        <CardContent>
                            <div className="space-y-2">
                                {carsWashedByStall.length > 0 ? (
                                    carsWashedByStall.map(
                                        (stall: CarWashedByStall) => (
                                            <div
                                                key={stall.stall_name}
                                                className="flex justify-between text-sm"
                                            >
                                                <span className="text-muted-foreground">
                                                    {stall.stall_name}
                                                </span>
                                                <span className=" text-primary font-bold">
                                                    {stall.total_washes} Unit
                                                </span>
                                            </div>
                                        ),
                                    )
                                ) : (
                                    <p className="text-sm text-muted-foreground">
                                        Tidak ada data.
                                    </p>
                                )}
                            </div>
                        </CardContent>
                    </Card>

                    <Card>
                        <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                            <CardTitle className="text-sm font-medium">
                                Insentif per Mobil
                            </CardTitle>
                            <DollarSign className="h-4 w-4 text-muted-foreground" />
                        </CardHeader>
                        <CardContent>
                            <div className="text-2xl font-bold text-primary">
                                {formatToIDR(incentive?.amount ?? 0)}
                            </div>
                        </CardContent>
                    </Card>
                </div>

                <DataTable columns={columns} data={staffReport} />
            </div>
        </AppLayout>
    );
}
