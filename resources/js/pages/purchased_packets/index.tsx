import Heading from "@/components/heading";
import { Button } from "@/components/ui/button";
import { DataTable } from "@/components/ui/data-table";
import { Label } from "@/components/ui/label";
import { Badge } from "@/components/ui/badge";
import { Input } from "@/components/ui/input";
import AppLayout from "@/layouts/app-layout";
import { BreadcrumbItem, PageProps } from "@/types";
import { Head, usePage, router } from "@inertiajs/react";
import { route } from "ziggy-js";
import { ColumnDef, Row } from "@tanstack/react-table";
import { format } from "date-fns";
import {
    ChevronDown,
    ChevronRight,
    Search,
    X,
    XCircle,
    Edit,
} from "lucide-react";
import {
    DropdownMenu,
    DropdownMenuTrigger,
    DropdownMenuContent,
    DropdownMenuItem,
} from "@/components/ui/dropdown-menu";
import {
    Dialog,
    DialogContent,
    DialogDescription,
    DialogFooter,
    DialogHeader,
    DialogTitle,
    DialogTrigger,
} from "@/components/ui/dialog";
import { useState, useEffect } from "react";
import { useDebounce } from "@/hooks/use-debounce";
// Removed receipt-formatter import
import { toast } from "sonner";
import { usePermission } from "@/hooks/use-permission";

const breadcrumbs: BreadcrumbItem[] = [
    {
        title: "Pembelian Packet",
        href: "/purchased-packets",
    },
];

interface SalesTransactionRow {
    id: string;
    transaction_date: string;
    total_amount: number;
    payment_method: string;
    status: string;
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
        vouchers: Array<{
            id: string;
            serial_number: string;
            voucher_type: { name: string } | null;
        }>;
    }>;
    transaction_type: string;
}

function EditExpirationDateDialog({
    purchasedPacketId,
    currentDate,
}: {
    purchasedPacketId: string;
    currentDate: string;
}) {
    const [open, setOpen] = useState(false);
    const [date, setDate] = useState(
        currentDate ? format(new Date(currentDate), "yyyy-MM-dd") : ""
    );
    const [loading, setLoading] = useState(false);

    const handleSubmit = (e: React.FormEvent) => {
        e.preventDefault();
        setLoading(true);
        router.patch(
            route("purchased-packets.update", purchasedPacketId),
            { expired_at: date },
            {
                onSuccess: () => {
                    setOpen(false);
                    toast.success("Tanggal kedaluwarsa berhasil diperbarui");
                },
                onError: () => {
                    toast.error("Gagal memperbarui tanggal kedaluwarsa");
                },
                onFinish: () => setLoading(false),
            }
        );
    };

    return (
        <Dialog open={open} onOpenChange={setOpen}>
            <DialogTrigger asChild>
                <Button variant="ghost" size="sm" className="ml-2 h-6 w-6 p-0">
                    <Edit className="h-3 w-3" />
                </Button>
            </DialogTrigger>
            <DialogContent className="sm:max-w-[425px]">
                <DialogHeader>
                    <DialogTitle>Edit Tanggal Kedaluwarsa</DialogTitle>
                    <DialogDescription>
                        Ubah tanggal kedaluwarsa untuk paket pembelian ini.
                    </DialogDescription>
                </DialogHeader>
                <form onSubmit={handleSubmit} className="space-y-4">
                    <div className="grid w-full items-center gap-1.5">
                        <Label htmlFor="expiration-date">Tanggal Baru</Label>
                        <Input
                            id="expiration-date"
                            type="date"
                            value={date}
                            onChange={(e) => setDate(e.target.value)}
                            required
                        />
                    </div>
                    <DialogFooter>
                        <Button type="button" variant="outline" onClick={() => setOpen(false)}>
                            Batal
                        </Button>
                        <Button type="submit" disabled={loading}>
                            {loading ? "Menyimpan..." : "Simpan Perubahan"}
                        </Button>
                    </DialogFooter>
                </form>
            </DialogContent>
        </Dialog>
    );
}

function CancelConfirmDialog({ transaction }: { transaction: SalesTransactionRow }) {
    const [open, setOpen] = useState(false);
    const [loading, setLoading] = useState(false);

    const packetName =
        transaction.purchased_packets?.[0]?.voucher_packet?.name ?? "-";

    const formattedDate = new Intl.DateTimeFormat("id-ID", {
        day: "numeric",
        month: "numeric",
        year: "numeric",
        hour: "2-digit",
        minute: "2-digit",
        timeZone: "Asia/Jakarta",
    }).format(new Date(transaction.transaction_date));

    const formattedTotal = new Intl.NumberFormat("id-ID", {
        style: "currency",
        currency: "IDR",
        minimumFractionDigits: 0,
    }).format(transaction.total_amount);

    const handleConfirm = () => {
        setLoading(true);
        router.post(
            route("purchased-packets.cancel", transaction.id),
            {},
            {
                onSuccess: () => { setOpen(false); toast.success("Transaksi berhasil dibatalkan"); },
                onError: () => { toast.error("Gagal membatalkan transaksi"); },
                onFinish: () => setLoading(false),
            }
        );
    };

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
                            Tindakan ini akan menandai transaksi dan semua paket terkait sebagai <strong>dibatalkan</strong>. Tindakan ini tidak dapat diurungkan.
                        </DialogDescription>
                    </DialogHeader>
                    <div className="rounded-lg border p-4 space-y-2 text-sm">
                        <div className="flex justify-between">
                            <span className="text-muted-foreground">Customer</span>
                            <span className="font-medium">{transaction.customer?.name ?? "-"}</span>
                        </div>
                        <div className="flex justify-between">
                            <span className="text-muted-foreground">Plat Nomor</span>
                            <span className="font-medium">{transaction.car?.plate_number ?? "-"}</span>
                        </div>
                        <div className="flex justify-between">
                            <span className="text-muted-foreground">Nama Paket</span>
                            <span className="font-medium">{packetName}</span>
                        </div>
                        <div className="flex justify-between">
                            <span className="text-muted-foreground">Tanggal</span>
                            <span className="font-medium">{formattedDate}</span>
                        </div>
                        <div className="flex justify-between">
                            <span className="text-muted-foreground">Total</span>
                            <span className="font-semibold">{formattedTotal}</span>
                        </div>
                        <div className="flex justify-between">
                            <span className="text-muted-foreground">Metode Pembayaran</span>
                            <span className="font-medium">{transaction.payment_method}</span>
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

function PurchasedPacketDetails({ row }: { row: Row<SalesTransactionRow> }) {
    const { purchased_packets } = row.original;

    if (!Array.isArray(purchased_packets) || purchased_packets.length === 0) {
        return (
            <div className="p-4 text-center text-muted-foreground">
                Tidak ada detail paket yang dibeli.
            </div>
        );
    }

    const firstPacket = purchased_packets[0];

    return (
        <div className="p-4 space-y-4 bg-muted/50">
            <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
                <div>
                    <Label className="text-sm font-semibold">Tanggal Berlaku</Label>
                    <p className="text-lg font-medium">
                        {format(new Date(firstPacket.purchased_at), "dd MMMM yyyy")}
                    </p>
                </div>

                <div>
                    <Label className="text-sm font-semibold">Tanggal Kedaluwarsa</Label>
                    <div className="flex items-center">
                        <p className="text-lg font-medium">
                            {format(new Date(firstPacket.expired_at), "dd MMMM yyyy")}
                        </p>
                        <EditExpirationDateDialog
                            purchasedPacketId={firstPacket.id}
                            currentDate={firstPacket.expired_at}
                        />
                    </div>
                </div>
            </div>

            <div>
                <Label className="text-sm font-semibold">Detail Voucher</Label>
                <div className="mt-2 space-y-3">
                    {purchased_packets.map((packet) => (
                        <div key={packet.id} className="p-3 border rounded-md bg-white">
                            <div className="flex justify-between items-start">
                                <div>
                                    <p className="font-medium text-base">
                                        {packet.voucher_packet?.name || "Nama Paket Tidak Tersedia"}
                                    </p>
                                    {packet.vouchers && Array.isArray(packet.vouchers) && packet.vouchers.length > 0 ? (
                                        <>
                                            <p className="text-sm text-muted-foreground mt-1">Nomor Seri Voucher:</p>
                                            <p className="font-mono text-base font-semibold tracking-wider">
                                                {packet.vouchers.map((voucher) => voucher.serial_number).join(", ")}
                                            </p>
                                        </>
                                    ) : (
                                        <p className="text-sm text-muted-foreground mt-1">
                                            Voucher akan ditugaskan saat digunakan (Assign on Sale: false)
                                        </p>
                                    )}
                                </div>
                                {packet.id !== firstPacket.id && (
                                    <div className="flex flex-col items-end">
                                        <p className="text-xs text-muted-foreground">Exp: {format(new Date(packet.expired_at), "dd MMM yyyy")}</p>
                                        <EditExpirationDateDialog
                                            purchasedPacketId={packet.id}
                                            currentDate={packet.expired_at}
                                        />
                                    </div>
                                )}
                            </div>
                        </div>
                    ))}
                </div>
            </div>
        </div>
    );
}

export default function PurchasedPacketIndex() {
    const { hasPermission } = usePermission();
    const { props } = usePage<PageProps<{ salesTransactions: any }>>();
    const pagination = props.salesTransactions || { data: [], per_page: 10, current_page: 1, last_page: 1 };
    const [perPage, setPerPage] = useState(pagination.per_page || 10);

    const [searchQuery, setSearchQuery] = useState("");
    const debouncedSearchQuery = useDebounce(searchQuery, 500);

    const columns: ColumnDef<SalesTransactionRow>[] = [
        {
            id: "expand",
            header: "",
            cell: ({ row }) => (
                <Button
                    variant="ghost"
                    size="sm"
                    onClick={() => row.toggleExpanded()}
                    className="h-8 w-8 p-0"
                >
                    {row.getIsExpanded() ? (
                        <ChevronDown className="h-4 w-4" />
                    ) : (
                        <ChevronRight className="h-4 w-4" />
                    )}
                </Button>
            ),
        },
        {
            id: "index",
            header: "No",
            cell: (row) =>
                row.row.index +
                1 +
                (pagination.current_page - 1) * pagination.per_page,
        },
        {
            accessorKey: "customer.name",
            header: "Customer",
            cell: ({ row }) => row.original.customer?.name || "-",
        },
        {
            accessorKey: "car.plate_number",
            header: "Plat Nomor",
            cell: ({ row }) => row.original.car?.plate_number || "-",
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
            header: "Jumlah Paket",
            cell: ({ row }) =>
                Array.isArray(row.original.purchased_packets)
                    ? row.original.purchased_packets.length
                    : 0,
        },
        {
            header: "Nama Paket",
            cell: ({ row }) =>
                Array.isArray(row.original.purchased_packets) &&
                    row.original.purchased_packets.length > 0
                    ? row.original.purchased_packets[0].voucher_packet?.name || ""
                    : "",
        },
        {
            accessorKey: "payment_method",
            header: "Metode Pembayaran",
        },
        {
            accessorKey: "staff.full_name",
            header: "Petugas",
            cell: ({ row }) => row.original.staff?.full_name || "-",
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
                const transaction = row.original;

                return (
                    <div className="flex items-center gap-1">
                        {transaction.status !== "cancelled" && hasPermission("cancel transactions") && (
                            <CancelConfirmDialog transaction={transaction} />
                        )}
                    </div>
                );
            },
        },
    ];

    const handlePageChange = (page: number) => {
        router.get(
            route("purchased-packets.index"),
            { page, per_page: perPage, search: debouncedSearchQuery },
            { preserveState: true },
        );
    };

    const handlePerPageChange = (newPerPage: number) => {
        setPerPage(newPerPage);
        router.get(
            route("purchased-packets.index"),
            { page: 1, per_page: newPerPage, search: debouncedSearchQuery },
            { preserveState: true },
        );
    };

    useEffect(() => {
        if (debouncedSearchQuery !== undefined) {
            router.get(
                route("purchased-packets.index"),
                { page: 1, per_page: perPage, search: debouncedSearchQuery },
                { preserveState: true },
            );
        }
    }, [debouncedSearchQuery, perPage]);

    const clearSearch = () => setSearchQuery("");

    return (
        <AppLayout breadcrumbs={breadcrumbs}>
            <Head title="Pembelian Packet" />
            <div className="flex h-full flex-1 flex-col gap-4 rounded-xl p-4">
                <div className="flex justify-between">
                    <Heading
                        title="Riwayat Pembelian Packet Voucher"
                        description="Lihat riwayat pembelian packet."
                    />
                </div>

                <div className="flex flex-col gap-2">
                    <div className="flex justify-between flex-row">
                        <div className="flex items-center gap-2">
                            <Button
                                variant="outline"
                                size="sm"
                                disabled={pagination.current_page === 1}
                                onClick={() => handlePageChange(pagination.current_page - 1)}
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
                                disabled={pagination.current_page === pagination.last_page}
                                onClick={() => handlePageChange(pagination.current_page + 1)}
                            >
                                Next
                            </Button>
                        </div>
                        <div className="flex flex-row gap-2">
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
                                        placeholder="Customer / Plat Nomor / No. Voucher..."
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
                        <DataTable
                            columns={columns}
                            data={pagination.data || []}
                            renderSubComponent={PurchasedPacketDetails}
                            getRowCanExpand={() => true}
                        />
                    </div>
                </div>
            </div>
        </AppLayout>
    );
}
