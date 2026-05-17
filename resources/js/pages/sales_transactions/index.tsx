import Heading from "@/components/heading";
import { Button } from "@/components/ui/button";
import { DataTable } from "@/components/ui/data-table";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";
import AppLayout from "@/layouts/app-layout";
import { BreadcrumbItem, PageProps } from "@/types";
import { Head, usePage, router } from "@inertiajs/react";
import { ColumnDef } from "@tanstack/react-table";
import {
    DropdownMenu,
    DropdownMenuTrigger,
    DropdownMenuContent,
    DropdownMenuItem,
} from "@/components/ui/dropdown-menu";
import {
    Select,
    SelectContent,
    SelectItem,
    SelectTrigger,
    SelectValue,
} from "@/components/ui/select";
import { useState, useEffect } from "react";
import { useDebounce } from "@/hooks/use-debounce";
import { Search, X } from "lucide-react";

const breadcrumbs: BreadcrumbItem[] = [
    {
        title: "Master Transaksi",
        href: "/sales-transactions",
    },
];

interface SalesTransactionRow {
    id: string;
    transaction_date: string;
    total_amount: number;
    payment_method: string;
    transaction_type: string;
    staff: { full_name: string } | null;
    customer: { name: string } | null;
    car: { plate_number: string } | null;
    purchased_packets: Array<{
        id: string;
        voucher_packet: { name: string } | null;
        quantity: number;
        price: number;
        purchased_at: string;
        expired_at: string;
    }>;
    service_records: Array<{
        id: string;
        product: { name: string } | null;
        stall: { name: string } | null;
    }>;
}

export default function SalesTransactionIndex() {
    const { props } = usePage<
        PageProps<{
            salesTransactions: any;
            filters: { type: string; search: string };
        }>
    >();
    const pagination = props.salesTransactions;
    const filters = props.filters;
    const [perPage, setPerPage] = useState(pagination.per_page || 10);
    const [selectedType, setSelectedType] = useState(filters.type || "");

    const [searchQuery, setSearchQuery] = useState(filters.search || "");
    const debouncedSearchQuery = useDebounce(searchQuery, 500);

    const columns: ColumnDef<SalesTransactionRow>[] = [
        {
            id: "index",
            header: "No",
            cell: (row) =>
                row.row.index +
                1 +
                (pagination.current_page - 1) * pagination.per_page,
        },
        { accessorKey: "customer.name", header: "Customer" },
        { accessorKey: "car.plate_number", header: "Plat Nomor" },
        {
            accessorKey: "transaction_type",
            header: "Tipe Transaksi",
            cell: ({ row }) => {
                const type = row.original.transaction_type;
                const getVariant = () => {
                    if (type === "Paket Voucher") return "default";
                    if (type === "Cuci Mobil") return "secondary";
                    if (type === "Cuci Mobil Voucher") return "outline";
                    if (type === "Klaim Garansi") return "destructive";
                    return "secondary";
                };
                return <Badge variant={getVariant()}>{type}</Badge>;
            },
        },
        {
            accessorKey: "transaction_date",
            header: "Tanggal",
            cell: ({ row }) => {
                const date = row.original.transaction_date;
                return new Intl.DateTimeFormat("id-ID", {
                    day: "numeric",
                    month: "numeric",
                    year: "numeric",
                    hour: "2-digit",
                    minute: "2-digit",
                    timeZone: "Asia/Jakarta",
                }).format(new Date(date));
            },
        },
        {
            accessorKey: "total_amount",
            header: "Total",
            cell: ({ row }) =>
                new Intl.NumberFormat("id-ID", {
                    style: "currency",
                    currency: "IDR",
                    minimumFractionDigits: 0,
                }).format(row.original.total_amount),
        },
        {
            accessorKey: "payment_method",
            header: "Metode Pembayaran",
        },
        {
            accessorKey: "staff.full_name",
            header: "Petugas",
        },
    ];

    const handlePageChange = (page: number) => {
        router.get(
            route("sales-transactions.index"),
            {
                page,
                per_page: perPage,
                search: debouncedSearchQuery,
                type: selectedType,
            },
            { preserveState: true },
        );
    };

    const handlePerPageChange = (newPerPage: number) => {
        setPerPage(newPerPage);
        router.get(
            route("sales-transactions.index"),
            {
                page: 1,
                per_page: newPerPage,
                search: debouncedSearchQuery,
                type: selectedType,
            },
            { preserveState: true },
        );
    };

    const handleTypeChange = (type: string) => {
        setSelectedType(type);
        router.get(
            route("sales-transactions.index"),
            {
                page: 1,
                per_page: perPage,
                search: debouncedSearchQuery,
                type,
            },
            { preserveState: true },
        );
    };

    // Handle search changes
    useEffect(() => {
        router.get(
            route("sales-transactions.index"),
            {
                page: 1,
                per_page: perPage,
                search: debouncedSearchQuery,
                type: selectedType,
            },
            { preserveState: true },
        );
    }, [debouncedSearchQuery]);

    const clearSearch = () => {
        setSearchQuery("");
    };

    return (
        <AppLayout breadcrumbs={breadcrumbs}>
            <Head title="Master Transaksi" />
            <div className="flex h-full flex-1 flex-col gap-4 rounded-xl p-4">
                <div className="flex justify-between">
                    <Heading
                        title="Master Transaksi"
                        description="Lihat semua riwayat transaksi cuci mobil dan pembelian voucher."
                    />
                </div>

                <div className="flex flex-col gap-2">
                    <div className="flex justify-between flex-row">
                        <div className="flex items-center gap-2">
                            <Button
                                variant="outline"
                                size="sm"
                                disabled={pagination.current_page === 1}
                                onClick={() =>
                                    handlePageChange(
                                        pagination.current_page - 1,
                                    )
                                }
                            >
                                Previous
                            </Button>
                            <span className="mx-2 text-sm">
                                Halaman {pagination.current_page} dari{" "}
                                {pagination.last_page}
                            </span>
                            <Button
                                variant="outline"
                                size="sm"
                                disabled={
                                    pagination.current_page ===
                                    pagination.last_page
                                }
                                onClick={() =>
                                    handlePageChange(
                                        pagination.current_page + 1,
                                    )
                                }
                            >
                                Next
                            </Button>
                        </div>
                        <div className="flex flex-row gap-2">
                            <div className="flex items-center gap-2 justify-end">
                                <span className="text-sm">
                                    Baris per halaman:
                                </span>
                                <DropdownMenu>
                                    <DropdownMenuTrigger asChild>
                                        <Button
                                            variant="outline"
                                            size="sm"
                                            className="min-w-[60px] justify-between"
                                        >
                                            {perPage}
                                        </Button>
                                    </DropdownMenuTrigger>
                                    <DropdownMenuContent align="end">
                                        {[5, 10, 20, 50, 100].map((size) => (
                                            <DropdownMenuItem
                                                key={size}
                                                onSelect={() =>
                                                    handlePerPageChange(size)
                                                }
                                            >
                                                {size}
                                            </DropdownMenuItem>
                                        ))}
                                    </DropdownMenuContent>
                                </DropdownMenu>
                            </div>
                            {/* Type Filter */}
                            <div className="flex items-center gap-2">
                                <Select
                                    value={selectedType}
                                    onValueChange={handleTypeChange}
                                >
                                    <SelectTrigger className="w-[180px]">
                                        <SelectValue placeholder="Semua Tipe" />
                                    </SelectTrigger>
                                    <SelectContent>
                                        <SelectItem value="">
                                            Semua Tipe
                                        </SelectItem>
                                        <SelectItem value="car_wash">
                                            Cuci Mobil
                                        </SelectItem>
                                        <SelectItem value="voucher">
                                            Pembelian Voucher
                                        </SelectItem>
                                    </SelectContent>
                                </Select>
                            </div>
                            {/* Search Bar */}
                            <div className="flex items-center gap-2">
                                <div className="relative flex-1 max-w-md">
                                    <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                                    <Input
                                        placeholder="Customer / Plat Nomor..."
                                        value={searchQuery}
                                        onChange={(e) =>
                                            setSearchQuery(e.target.value)
                                        }
                                        className="pl-10 pr-10"
                                    />
                                    {searchQuery && (
                                        <Button
                                            variant="ghost"
                                            size="sm"
                                            onClick={clearSearch}
                                            className="absolute right-1 top-1/2 transform -translate-y-1/2 h-6 w-6 p-0"
                                        >
                                            <X className="h-4 w-4" />
                                        </Button>
                                    )}
                                </div>
                            </div>
                        </div>
                    </div>
                    <div>
                        <DataTable columns={columns} data={pagination.data} />
                    </div>
                </div>
            </div>
        </AppLayout>
    );
}
