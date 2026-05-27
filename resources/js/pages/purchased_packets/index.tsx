import Heading from "@/components/heading";
import { Button } from "@/components/ui/button";
import { DataTable } from "@/components/ui/data-table";
import { Label } from "@/components/ui/label";
import { Badge } from "@/components/ui/badge";
import { Input } from "@/components/ui/input";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
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
    InfoIcon,
    Send,
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
import { Pagination } from "@/components/ui/pagination";

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
            status: string;
            redeemed_at: string | null;
            voucher_type: { name: string } | null;
        }>;
    }>;
    transaction_type: string;
}

function ResendReceiptButton({
    transactionId,
}: {
    transactionId: string | number;
}) {
    const [loading, setLoading] = useState(false);

    const handleResend = () => {
        setLoading(true);
        router.post(
            route("sales-transactions.resend-receipt", transactionId),
            {},
            {
                onSuccess: () =>
                    toast.success("Struk WhatsApp berhasil dikirim ulang"),
                onError: () => toast.error("Gagal mengirim ulang struk"),
                onFinish: () => setLoading(false),
            },
        );
    };

    return (
        <Button
            variant="outline"
            size="icon"
            onClick={handleResend}
            disabled={loading}
            className="h-8 border-blue-300 text-blue-600 hover:bg-blue-50 hover:text-blue-700"
            title="Kirim Ulang Struk WhatsApp"
        >
            <Send className="h-4 w-4" />
        </Button>
    );
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
        currentDate ? format(new Date(currentDate), "yyyy-MM-dd") : "",
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
            },
        );
    };

    return (
        <Dialog open={open} onOpenChange={setOpen}>
            <DialogTrigger asChild>
                <Button
                    variant="ghost"
                    size="sm"
                    className="ml-2 h-6 w-6 p-0"
                    title="Edit Tanggal Kedaluwarsa"
                >
                    <Edit className="h-4 w-4 text-blue-600" />
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
                        <Button
                            type="button"
                            variant="outline"
                            onClick={() => setOpen(false)}
                        >
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

function CancelConfirmDialog({
    transaction,
}: {
    transaction: SalesTransactionRow;
}) {
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
                onSuccess: () => {
                    setOpen(false);
                    toast.success("Transaksi berhasil dibatalkan");
                },
                onError: () => {
                    toast.error("Gagal membatalkan transaksi");
                },
                onFinish: () => setLoading(false),
            },
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
                        <DialogTitle className="text-red-600">
                            Batalkan Transaksi?
                        </DialogTitle>
                        <DialogDescription>
                            Tindakan ini akan menandai transaksi dan semua paket
                            terkait sebagai <strong>dibatalkan</strong>.
                            Tindakan ini tidak dapat diurungkan.
                        </DialogDescription>
                    </DialogHeader>
                    <div className="rounded-lg border p-4 space-y-2 text-sm">
                        <div className="flex justify-between">
                            <span className="text-muted-foreground">
                                Customer
                            </span>
                            <span className="font-medium">
                                {transaction.customer?.name ?? "-"}
                            </span>
                        </div>
                        <div className="flex justify-between">
                            <span className="text-muted-foreground">
                                Nama Paket
                            </span>
                            <span className="font-medium">{packetName}</span>
                        </div>
                        <div className="flex justify-between">
                            <span className="text-muted-foreground">
                                Tanggal
                            </span>
                            <span className="font-medium">{formattedDate}</span>
                        </div>
                        <div className="flex justify-between">
                            <span className="text-muted-foreground">Total</span>
                            <span className="font-semibold">
                                {formattedTotal}
                            </span>
                        </div>
                        <div className="flex justify-between">
                            <span className="text-muted-foreground">
                                Metode Pembayaran
                            </span>
                            <span className="font-medium">
                                {transaction.payment_method}
                            </span>
                        </div>
                    </div>
                    <DialogFooter>
                        <Button
                            variant="outline"
                            onClick={() => setOpen(false)}
                            disabled={loading}
                        >
                            Kembali
                        </Button>
                        <Button
                            variant="destructive"
                            onClick={handleConfirm}
                            disabled={loading}
                        >
                            {loading
                                ? "Membatalkan..."
                                : "Konfirmasi Pembatalan"}
                        </Button>
                    </DialogFooter>
                </DialogContent>
            </Dialog>
        </>
    );
}

function VouchersDialog({ transaction }: { transaction: SalesTransactionRow }) {
    const [open, setOpen] = useState(false);

    return (
        <Dialog open={open} onOpenChange={setOpen}>
            <DialogTrigger asChild>
                <Button variant="outline" size="icon" className="h-8">
                    <InfoIcon />
                </Button>
            </DialogTrigger>
            <DialogContent className="sm:max-w-5xl max-h-[85vh] overflow-y-auto">
                <DialogHeader>
                    <DialogTitle>Detail Voucher Pelanggan</DialogTitle>
                    <DialogDescription>
                        Daftar voucher untuk transaksi ini.
                    </DialogDescription>
                </DialogHeader>
                <div className="bg-muted/50 p-4 justify-between rounded-lg border flex flex-wrap gap-x-12 gap-y-4 mt-2">
                    <div>
                        <p className="text-sm text-muted-foreground">
                            Pelanggan
                        </p>
                        <p className="font-semibold text-lg">
                            {transaction.customer?.name || "-"}
                        </p>
                    </div>
                    <div>
                        <p className="text-sm text-muted-foreground">
                            Tanggal Pembelian
                        </p>
                        <p className="font-semibold text-lg">
                            {format(
                                new Date(transaction.transaction_date),
                                "dd MMM yyyy HH:mm",
                            )}
                        </p>
                    </div>
                </div>
                <div className="space-y-6 mt-2">
                    {transaction.purchased_packets?.map((packet) => (
                        <div
                            key={packet.id}
                            className="border rounded-xl overflow-hidden"
                        >
                            <div className="bg-muted/30 p-4 border-b flex justify-between items-center flex-wrap gap-4">
                                <div>
                                    <p className="font-semibold text-base">
                                        {packet.voucher_packet?.name || "Paket"}
                                    </p>
                                    <p className="text-sm text-muted-foreground mt-1">
                                        Berlaku:{" "}
                                        {format(
                                            new Date(packet.purchased_at),
                                            "dd MMM yyyy",
                                        )}
                                    </p>
                                </div>
                                <div className="flex items-center gap-2">
                                    <div className="flex flex-col items-end">
                                        <p className="text-sm font-medium">
                                            Kedaluwarsa:{" "}
                                            {format(
                                                new Date(packet.expired_at),
                                                "dd MMM yyyy",
                                            )}
                                        </p>
                                    </div>
                                    <EditExpirationDateDialog
                                        purchasedPacketId={packet.id}
                                        currentDate={packet.expired_at}
                                    />
                                </div>
                            </div>
                            <div className="p-4 bg-white">
                                {packet.vouchers &&
                                packet.vouchers.length > 0 ? (
                                    <div className="grid gap-3 sm:grid-cols-2">
                                        {packet.vouchers.map((v) => {
                                            const isUsed =
                                                v.status === "Redeemed" ||
                                                v.status === "Used";
                                            return (
                                                <div
                                                    key={v.id}
                                                    className="flex justify-between items-center p-3 border rounded-lg"
                                                >
                                                    <div>
                                                        <p className="font-bold tracking-wider">
                                                            {v.serial_number}
                                                        </p>
                                                        <p className="text-xs text-muted-foreground mt-0.5">
                                                            {
                                                                v.voucher_type
                                                                    ?.name
                                                            }
                                                        </p>
                                                    </div>
                                                    <div className="text-right">
                                                        <Badge
                                                            variant={
                                                                isUsed
                                                                    ? "secondary"
                                                                    : "default"
                                                            }
                                                            className={
                                                                isUsed
                                                                    ? ""
                                                                    : "bg-green-600"
                                                            }
                                                        >
                                                            {v.status}
                                                        </Badge>
                                                        {v.redeemed_at && (
                                                            <p className="text-[10px] text-muted-foreground mt-1">
                                                                Digunakan:{" "}
                                                                {format(
                                                                    new Date(
                                                                        v.redeemed_at,
                                                                    ),
                                                                    "dd MMM yyyy",
                                                                )}
                                                            </p>
                                                        )}
                                                    </div>
                                                </div>
                                            );
                                        })}
                                    </div>
                                ) : (
                                    <p className="text-sm text-muted-foreground text-center py-2">
                                        Voucher akan ditugaskan saat digunakan
                                        (Assign on Sale: false)
                                    </p>
                                )}
                            </div>
                        </div>
                    ))}
                    {(!transaction.purchased_packets ||
                        transaction.purchased_packets.length === 0) && (
                        <div className="text-center p-6 text-muted-foreground border rounded-xl border-dashed">
                            Tidak ada paket yang ditemukan.
                        </div>
                    )}
                </div>
            </DialogContent>
        </Dialog>
    );
}

export default function PurchasedPacketIndex() {
    const { hasPermission } = usePermission();
    const { props } = usePage<PageProps<{ salesTransactions: any; staffList: any; filters: any }>>();
    const pagination = props.salesTransactions || {
        data: [],
        per_page: 10,
        current_page: 1,
        last_page: 1,
    };
    const staffList = props.staffList || [];
    const filters = props.filters || { staff_id: "", search: "" };

    const [perPage, setPerPage] = useState(pagination.per_page || 10);
    const [staffId, setStaffId] = useState(filters.staff_id ? filters.staff_id.toString() : "all");

    const [searchQuery, setSearchQuery] = useState("");
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
        {
            accessorKey: "customer.name",
            header: "Customer",
            cell: ({ row }) => row.original.customer?.name || "-",
        },
        // {
        //     accessorKey: "car.plate_number",
        //     header: "Plat Nomor",
        //     cell: ({ row }) => row.original.car?.plate_number || "-",
        // },
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
            header: "Penggunaan Voucher",
            cell: ({ row }) => {
                const allVouchers =
                    row.original.purchased_packets?.flatMap(
                        (p) => p.vouchers || [],
                    ) || [];
                const total = allVouchers.length;
                const used = allVouchers.filter(
                    (v) => v.status === "Redeemed" || v.status === "Used",
                ).length;
                if (total === 0) return "-";
                return (
                    <span className="font-medium text-sm">
                        {used} / {total} Terpakai
                    </span>
                );
            },
        },
        {
            header: "Nama Paket",
            cell: ({ row }) =>
                Array.isArray(row.original.purchased_packets) &&
                row.original.purchased_packets.length > 0
                    ? row.original.purchased_packets[0].voucher_packet?.name ||
                      ""
                    : "",
        },
        {
            accessorKey: "payment_method",
            header: "Metode Pembayaran",
        },
        {
            accessorKey: "staff.full_name",
            header: "Kasir",
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
                    <Badge
                        variant="outline"
                        className="text-xs text-green-700 border-green-300 bg-green-50"
                    >
                        Aktif
                    </Badge>
                );
            },
        },
        {
            id: "actions",
            header: "Aksi",
            meta: {
                className:
                    "sticky right-0 bg-card z-10 text-center shadow-[-4px_0_12px_rgba(0,0,0,0.05)]",
            },
            cell: ({ row }) => {
                const transaction = row.original;

                return (
                    <div className="flex items-center gap-2">
                        <VouchersDialog transaction={transaction} />
                        {transaction.status !== "cancelled" && (
                            <ResendReceiptButton
                                transactionId={transaction.id}
                            />
                        )}
                        {transaction.status !== "cancelled" &&
                            hasPermission("cancel transactions") && (
                                <CancelConfirmDialog
                                    transaction={transaction}
                                />
                            )}
                    </div>
                );
            },
        },
    ];

    const handlePageChange = (page: number) => {
        router.get(
            route("purchased-packets.index"),
            { page, per_page: perPage, search: debouncedSearchQuery, staff_id: staffId === "all" ? "" : staffId },
            { preserveState: true },
        );
    };

    const handlePerPageChange = (newPerPage: number) => {
        setPerPage(newPerPage);
        router.get(
            route("purchased-packets.index"),
            { page: 1, per_page: newPerPage, search: debouncedSearchQuery, staff_id: staffId === "all" ? "" : staffId },
            { preserveState: true },
        );
    };

    useEffect(() => {
        if (debouncedSearchQuery !== undefined) {
            router.get(
                route("purchased-packets.index"),
                { page: 1, per_page: perPage, search: debouncedSearchQuery, staff_id: staffId === "all" ? "" : staffId },
                { preserveState: true },
            );
        }
    }, [debouncedSearchQuery, perPage, staffId]);

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

                <div className="flex flex-col gap-4">
                    <div className="flex justify-end flex-row items-center gap-2">
                        <div className="flex items-center gap-2">
                            <span className="text-sm text-muted-foreground">
                                Baris per halaman:
                            </span>
                            <DropdownMenu>
                                <DropdownMenuTrigger asChild>
                                    <Button
                                        variant="outline"
                                        size="sm"
                                        className="min-w-[60px] justify-between h-8"
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
                        <div className="flex items-center gap-2">
                            <Select value={staffId} onValueChange={setStaffId}>
                                <SelectTrigger className="w-[140px] h-8 text-xs">
                                    <SelectValue placeholder="Semua Kasir" />
                                </SelectTrigger>
                                <SelectContent>
                                    <SelectItem value="all" className="text-xs">Semua Kasir</SelectItem>
                                    {staffList.map((staff: any) => (
                                        <SelectItem key={staff.id} value={staff.id.toString()} className="text-xs">{staff.name}</SelectItem>
                                    ))}
                                </SelectContent>
                            </Select>
                        </div>
                        <div className="relative w-full max-w-xs">
                            <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                            <Input
                                placeholder="Customer / Plat Nomor / No. Voucher..."
                                value={searchQuery}
                                onChange={(e) => setSearchQuery(e.target.value)}
                                className="pl-9 pr-8 h-8 text-sm"
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
                    <DataTable columns={columns} data={pagination.data || []} />
                    {pagination && (
                        <Pagination
                            pagination={pagination}
                            onPageChange={handlePageChange}
                            label="pembelian packet voucher"
                        />
                    )}
                </div>
            </div>
        </AppLayout>
    );
}
