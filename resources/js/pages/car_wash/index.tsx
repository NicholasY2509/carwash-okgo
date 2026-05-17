import Heading from "@/components/heading";
import { DataTable } from "@/components/ui/data-table";
import { Input } from "@/components/ui/input";
import AppLayout from "@/layouts/app-layout";
import formatRupiah from "@/lib/rupiah-formatter";
import { BreadcrumbItem, PageProps } from "@/types";
import { Head, usePage, router } from "@inertiajs/react";
import { ColumnDef } from "@tanstack/react-table";
import {
    DropdownMenu,
    DropdownMenuTrigger,
    DropdownMenuContent,
    DropdownMenuItem,
} from "@/components/ui/dropdown-menu";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import {
    Dialog,
    DialogContent,
    DialogDescription,
    DialogFooter,
    DialogHeader,
    DialogTitle,
} from "@/components/ui/dialog";
import { useState, useEffect } from "react";
import { useDebounce } from "@/hooks/use-debounce";
import { Search, X, XCircle } from "lucide-react";
import { toast } from "sonner";
import { usePermission } from "@/hooks/use-permission";

interface Staff {
    full_name: string;
}

interface Customer {
    name: string;
}

interface Car {
    plate_number: string;
    customer: Customer;
}

interface Stall {
    name: string;
}

interface Voucher {
    serial_number: string;
}

interface ServiceRecords {
    id: string;
    staff: Staff;
    car: Car;
    stall: Stall;
    payment_type: string;
    total_amount: number;
    service_date: string;
    voucher?: Voucher;
    status: string;
}

function CancelConfirmDialog({
    record,
    onConfirm,
}: {
    record: ServiceRecords;
    onConfirm: () => void;
}) {
    const [open, setOpen] = useState(false);
    const [loading, setLoading] = useState(false);

    const handleConfirm = () => {
        setLoading(true);
        router.post(
            route("car-washes.cancel", record.id),
            {},
            {
                onSuccess: () => { setOpen(false); toast.success("Transaksi berhasil dibatalkan"); },
                onFinish: () => setLoading(false),
            }
        );
        onConfirm();
    };

    const formattedDate = record.service_date
        ? new Intl.DateTimeFormat("id-ID", {
            day: "numeric",
            month: "numeric",
            year: "numeric",
            hour: "2-digit",
            minute: "2-digit",
            timeZone: "Asia/Jakarta",
        }).format(new Date(record.service_date))
        : "-";

    return (
        <>
            <Button
                variant="outline"
                size="sm"
                onClick={() => setOpen(true)}
                className="h-8 w-8 p-0 border-red-300 text-red-600 hover:bg-red-50 hover:text-red-700"
                title="Batalkan Transaksi"
            >
                <XCircle className="h-4 w-4" />
            </Button>

            <Dialog open={open} onOpenChange={setOpen}>
                <DialogContent className="sm:max-w-[440px]">
                    <DialogHeader>
                        <DialogTitle className="text-red-600">Batalkan Transaksi?</DialogTitle>
                        <DialogDescription>
                            Tindakan ini akan menandai transaksi dan semua catatan layanan terkait sebagai <strong>dibatalkan</strong>. Tindakan ini tidak dapat diurungkan.
                        </DialogDescription>
                    </DialogHeader>
                    <div className="rounded-lg border p-4 space-y-2 text-sm">
                        <div className="flex justify-between">
                            <span className="text-muted-foreground">Plat Nomor</span>
                            <span className="font-medium">{record.car.plate_number}</span>
                        </div>
                        <div className="flex justify-between">
                            <span className="text-muted-foreground">Customer</span>
                            <span className="font-medium">{record.car.customer.name}</span>
                        </div>
                        <div className="flex justify-between">
                            <span className="text-muted-foreground">Tanggal</span>
                            <span className="font-medium">{formattedDate}</span>
                        </div>
                        <div className="flex justify-between">
                            <span className="text-muted-foreground">Total</span>
                            <span className="font-semibold">{formatRupiah(record.total_amount)}</span>
                        </div>
                        <div className="flex justify-between">
                            <span className="text-muted-foreground">Pembayaran</span>
                            <span className="font-medium">{record.payment_type}</span>
                        </div>
                    </div>
                    <DialogFooter>
                        <Button variant="outline" onClick={() => setOpen(false)} disabled={loading}>
                            Kembali
                        </Button>
                        <Button
                            variant="destructive"
                            onClick={handleConfirm}
                            disabled={loading}
                        >
                            {loading ? "Membatalkan..." : "Konfirmasi Pembatalan"}
                        </Button>
                    </DialogFooter>
                </DialogContent>
            </Dialog>
        </>
    );
}

export default function CarWashIndex() {
    const { hasPermission } = usePermission();
    const { props } = usePage<PageProps<{ service_records: any }>>();
    const pagination = props.service_records;
    const [perPage, setPerPage] = useState(pagination.per_page || 10);

    // Search states
    const [searchQuery, setSearchQuery] = useState("");
    const debouncedSearchQuery = useDebounce(searchQuery, 500);

    const breadcrumbs: BreadcrumbItem[] = [
        {
            title: "Pencucian Mobil",
            href: "/car-wash",
        },
    ];

    const columns: ColumnDef<ServiceRecords>[] = [
        {
            accessorKey: "index",
            header: "No",
            cell: (row) => row.row.index + 1,
        },
        { accessorKey: "car.plate_number", header: "Plat Nomor" },
        { accessorKey: "car.customer.name", header: "Customer" },
        { accessorKey: "stall.name", header: "Stall" },
        {
            accessorKey: "payment_type",
            header: "Jenis Pembayaran",
            cell: ({ row }) => {
                const paymentType = row.getValue("payment_type") as string;
                const voucher = row.original.voucher;
                return (
                    <div className="flex flex-col">
                        <span>{paymentType}</span>
                        {voucher && (
                            <span className="text-xs text-muted-foreground">
                                {voucher.serial_number}
                            </span>
                        )}
                    </div>
                );
            },
        },
        {
            accessorKey: "total_amount",
            header: "Total",
            cell: ({ row }) => {
                const totalAmount = row.getValue("total_amount") as number;
                return <span>{formatRupiah(totalAmount)}</span>;
            },
        },
        {
            accessorKey: "service_date",
            header: "Tanggal/Waktu",
            cell: ({ row }) => {
                const dateValue = row.getValue("service_date") as string;
                if (!dateValue) return <span>-</span>;
                const date = new Date(dateValue);
                const formatted = new Intl.DateTimeFormat("id-ID", {
                    day: "numeric",
                    month: "numeric",
                    year: "numeric",
                    hour: "2-digit",
                    minute: "2-digit",
                    timeZone: "Asia/Jakarta",
                }).format(date);
                return <span>{formatted}</span>;
            },
        },
        {
            accessorKey: "status",
            header: "Status",
            cell: ({ row }) => {
                const status = row.original.status;
                if (status === "cancelled") {
                    return (
                        <Badge variant="destructive" className="text-xs">
                            Dibatalkan
                        </Badge>
                    );
                }
                return (
                    <Badge variant="outline" className="text-xs text-green-700 border-green-300 bg-green-50">
                        Aktif
                    </Badge>
                );
            },
        },
        {
            id: "actions",
            header: "Aksi",
            cell: ({ row }) => {
                const record = row.original;

                return (
                    <div className="flex items-center gap-1">
                        {record.status !== "cancelled" && hasPermission("cancel transactions") && (
                            <CancelConfirmDialog record={record} onConfirm={() => { }} />
                        )}
                    </div>
                );
            },
        },
    ];

    const handlePageChange = (page: number) => {
        router.get(
            route("car-washes.index"),
            { page, per_page: perPage, search: debouncedSearchQuery },
            { preserveState: true },
        );
    };

    const handlePerPageChange = (newPerPage: number) => {
        setPerPage(newPerPage);
        router.get(
            route("car-washes.index"),
            { page: 1, per_page: newPerPage, search: debouncedSearchQuery },
            { preserveState: true },
        );
    };

    useEffect(() => {
        router.get(
            route("car-washes.index"),
            { page: 1, per_page: perPage, search: debouncedSearchQuery },
            { preserveState: true },
        );
    }, [debouncedSearchQuery]);

    const clearSearch = () => {
        setSearchQuery("");
    };

    return (
        <AppLayout breadcrumbs={breadcrumbs}>
            <Head title="Car Wash" />
            <div className="flex h-full flex-1 flex-col gap-4 rounded-xl p-4">
                <div className="flex justify-between">
                    <Heading
                        title="Riwayat Cuci Mobil"
                        description="Lihat riwayat pencucian mobil."
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
                                    handlePageChange(pagination.current_page - 1)
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
                                    pagination.current_page === pagination.last_page
                                }
                                onClick={() =>
                                    handlePageChange(pagination.current_page + 1)
                                }
                            >
                                Next
                            </Button>
                        </div>
                        <div className="flex flex-row items-center gap-2">
                            <div className="flex items-center gap-2 justify-end">
                                <span className="text-sm">Baris per halaman:</span>
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
                                                onSelect={() => handlePerPageChange(size)}
                                            >
                                                {size}
                                            </DropdownMenuItem>
                                        ))}
                                    </DropdownMenuContent>
                                </DropdownMenu>
                            </div>
                            <div className="flex items-center gap-2">
                                <div className="relative flex-1 max-w-md">
                                    <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                                    <Input
                                        placeholder="Customer / Plat Nomor..."
                                        value={searchQuery}
                                        onChange={(e) => setSearchQuery(e.target.value)}
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
