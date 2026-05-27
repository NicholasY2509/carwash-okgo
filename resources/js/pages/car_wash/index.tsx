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
import { useState, useEffect, useRef } from "react";
import { useDebounce } from "@/hooks/use-debounce";
import { Search, X, XCircle, Info, Send } from "lucide-react";
import { toast } from "sonner";
import { usePermission } from "@/hooks/use-permission";
import { Modal, ModalHeader } from "@/components/ui/modal";
import {
    Table,
    TableBody,
    TableCell,
    TableHead,
    TableHeader,
    TableRow,
} from "@/components/ui/table";
import { Pagination } from "@/components/ui/pagination";

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
    id: string | number;
    staff: Staff;
    car: Car;
    stall: Stall;
    payment_type: string;
    total_amount: number;
    service_date: string;
    voucher?: Voucher;
    status: string;
    service_records?: Array<{
        id: number | string;
        price?: number;
        product?: {
            id: number;
            name: string;
            price: number;
        } | null;
        stall?: {
            id: number;
            name: string;
        } | null;
        staff?: {
            id: number;
            full_name: string;
        } | null;
    }>;
    items?: Array<{
        id: number;
        item_id: number;
        item?: {
            id: number;
            name: string;
            sku: string | null;
        } | null;
        quantity: number;
        price: number;
        subtotal: number;
    }>;
    paid_amount?: number | null;
    change_amount?: number | null;
    transaction_type?: string;
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
            size="sm"
            onClick={handleResend}
            disabled={loading}
            className="h-8 w-8 p-0 border-blue-300 text-blue-600 hover:bg-blue-50 hover:text-blue-700"
            title="Kirim Ulang Struk WhatsApp"
        >
            <Send className="h-4 w-4" />
        </Button>
    );
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
                onSuccess: () => {
                    setOpen(false);
                    toast.success("Transaksi berhasil dibatalkan");
                },
                onFinish: () => setLoading(false),
            },
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
                        <DialogTitle className="text-red-600">
                            Batalkan Transaksi?
                        </DialogTitle>
                        <DialogDescription>
                            Tindakan ini akan menandai transaksi dan semua
                            catatan layanan terkait sebagai{" "}
                            <strong>dibatalkan</strong>. Tindakan ini tidak
                            dapat diurungkan.
                        </DialogDescription>
                    </DialogHeader>
                    <div className="rounded-lg border p-4 space-y-2 text-sm">
                        <div className="flex justify-between">
                            <span className="text-muted-foreground">
                                Plat Nomor
                            </span>
                            <span className="font-medium">
                                {record.car.plate_number}
                            </span>
                        </div>
                        <div className="flex justify-between">
                            <span className="text-muted-foreground">
                                Customer
                            </span>
                            <span className="font-medium">
                                {record.car.customer.name}
                            </span>
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
                                {formatRupiah(record.total_amount)}
                            </span>
                        </div>
                        <div className="flex justify-between">
                            <span className="text-muted-foreground">
                                Pembayaran
                            </span>
                            <span className="font-medium">
                                {record.payment_type}
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

export default function CarWashIndex() {
    const { hasPermission } = usePermission();
    const { props } = usePage<PageProps<{ service_records: any }>>();
    const pagination = props.service_records;
    const [perPage, setPerPage] = useState(pagination.per_page || 10);

    const [selectedWashDetail, setSelectedWashDetail] =
        useState<ServiceRecords | null>(null);
    const [isDetailModalOpen, setIsDetailModalOpen] = useState(false);

    const isMounted = useRef(false);

    useEffect(() => {
        isMounted.current = true;
        return () => {
            isMounted.current = false;
        };
    }, []);

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
                const record = row.original;

                return (
                    <div className="flex items-center gap-1.5 justify-center">
                        <Button
                            size="sm"
                            variant="outline"
                            className="h-8 gap-1 font-semibold"
                            onClick={() => {
                                setSelectedWashDetail(record);
                                setIsDetailModalOpen(true);
                            }}
                        >
                            <Info className="h-3.5 w-3.5" /> Detail
                        </Button>
                        {record.status !== "cancelled" && (
                            <ResendReceiptButton transactionId={record.id} />
                        )}
                        {/* {record.status !== "cancelled" && hasPermission("cancel transactions") && (
                            <CancelConfirmDialog record={record} onConfirm={() => { }} />
                        )} */}
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
        if (!isMounted.current) return;
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
                        <div className="relative w-full max-w-xs">
                            <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                            <Input
                                placeholder="Customer / Plat Nomor..."
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
                    <div>
                        <DataTable columns={columns} data={pagination.data} />
                    </div>
                    {pagination && (
                        <Pagination
                            pagination={pagination}
                            onPageChange={handlePageChange}
                            label="riwayat cuci mobil"
                        />
                    )}
                </div>
            </div>

            {/* Car Wash Detail Modal */}
            <Modal
                open={isDetailModalOpen}
                onClose={() => setIsDetailModalOpen(false)}
                className="max-w-4xl"
            >
                <ModalHeader
                    title={`Detail Transaksi Pencucian #${selectedWashDetail?.id}`}
                />
                {selectedWashDetail && (
                    <div className="space-y-6 px-1 py-2 max-h-[80vh] overflow-y-auto">
                        {/* Summary Cards */}
                        <div className="grid grid-cols-2 md:grid-cols-3 gap-4">
                            <div className="bg-muted/30 p-3 rounded-lg border">
                                <span className="text-xs text-muted-foreground block mb-1">
                                    Status Transaksi
                                </span>
                                <div>
                                    {selectedWashDetail.status ===
                                    "cancelled" ? (
                                        <Badge variant="destructive">
                                            Dibatalkan
                                        </Badge>
                                    ) : (
                                        <Badge
                                            variant="outline"
                                            className="text-green-700 border-green-300 bg-green-50"
                                        >
                                            Aktif
                                        </Badge>
                                    )}
                                </div>
                            </div>
                            <div className="bg-muted/30 p-3 rounded-lg border">
                                <span className="text-xs text-muted-foreground block mb-1">
                                    Tanggal & Waktu
                                </span>
                                <span className="font-semibold text-foreground">
                                    {selectedWashDetail.service_date
                                        ? new Intl.DateTimeFormat("id-ID", {
                                              day: "numeric",
                                              month: "long",
                                              year: "numeric",
                                              hour: "2-digit",
                                              minute: "2-digit",
                                              timeZone: "Asia/Jakarta",
                                          }).format(
                                              new Date(
                                                  selectedWashDetail.service_date,
                                              ),
                                          )
                                        : "-"}
                                </span>
                            </div>
                            <div className="bg-muted/30 p-3 rounded-lg border">
                                <span className="text-xs text-muted-foreground block mb-1">
                                    Customer & Kendaraan
                                </span>
                                <span className="font-semibold text-foreground">
                                    {selectedWashDetail.car?.customer?.name} (
                                    {selectedWashDetail.car?.plate_number})
                                </span>
                            </div>
                            <div className="bg-muted/30 p-3 rounded-lg border">
                                <span className="text-xs text-muted-foreground block mb-1">
                                    Metode Pembayaran
                                </span>
                                <span className="font-semibold text-foreground">
                                    {selectedWashDetail.payment_type}
                                    {selectedWashDetail.voucher && (
                                        <span className="text-xs text-muted-foreground block">
                                            Voucher SN:{" "}
                                            {
                                                selectedWashDetail.voucher
                                                    .serial_number
                                            }
                                        </span>
                                    )}
                                </span>
                            </div>
                            <div className="bg-muted/30 p-3 rounded-lg border">
                                <span className="text-xs text-muted-foreground block mb-1">
                                    Kasir
                                </span>
                                <span className="font-semibold text-foreground">
                                    {selectedWashDetail.staff?.full_name || "-"}
                                </span>
                            </div>
                        </div>

                        {/* Service Records Table */}
                        <div className="space-y-2">
                            <h3 className="text-xs font-semibold text-foreground uppercase tracking-wider">
                                Detail Layanan Cuci
                            </h3>
                            <div className="border rounded-lg overflow-hidden bg-card">
                                <Table className="w-full text-sm text-left">
                                    <TableHeader className="bg-muted/40">
                                        <TableRow>
                                            <TableHead className="font-semibold">
                                                Layanan
                                            </TableHead>
                                            <TableHead className="font-semibold text-center">
                                                Stall
                                            </TableHead>
                                            <TableHead className="font-semibold text-center">
                                                Pencuci
                                            </TableHead>
                                            <TableHead className="font-semibold text-right">
                                                Harga
                                            </TableHead>
                                        </TableRow>
                                    </TableHeader>
                                    <TableBody>
                                        {selectedWashDetail.service_records &&
                                        selectedWashDetail.service_records
                                            .length > 0 ? (
                                            selectedWashDetail.service_records.map(
                                                (sr) => (
                                                    <TableRow key={sr.id}>
                                                        <TableCell className="font-semibold text-sm">
                                                            {sr.product?.name ||
                                                                "Layanan Cuci"}
                                                        </TableCell>
                                                        <TableCell className="text-center">
                                                            {sr.stall?.name ||
                                                                "-"}
                                                        </TableCell>
                                                        <TableCell className="text-center font-medium">
                                                            {sr.staff
                                                                ?.full_name ||
                                                                "-"}
                                                        </TableCell>
                                                        <TableCell className="text-right font-semibold text-foreground">
                                                            {sr.product
                                                                ? formatRupiah(
                                                                      sr.price ??
                                                                          sr
                                                                              .product
                                                                              .price,
                                                                  )
                                                                : "-"}
                                                        </TableCell>
                                                    </TableRow>
                                                ),
                                            )
                                        ) : (
                                            <TableRow>
                                                <TableCell
                                                    colSpan={4}
                                                    className="text-center text-muted-foreground"
                                                >
                                                    Tidak ada data layanan
                                                </TableCell>
                                            </TableRow>
                                        )}
                                    </TableBody>
                                </Table>
                            </div>
                        </div>

                        {/* Sold Items Detail Block */}
                        <div className="space-y-2">
                            <h3 className="text-xs font-semibold text-foreground uppercase tracking-wider">
                                Barang / Item Pelengkap
                            </h3>
                            {selectedWashDetail.items &&
                            selectedWashDetail.items.length > 0 ? (
                                <div className="border rounded-lg overflow-hidden bg-card">
                                    <Table className="w-full text-sm text-left">
                                        <TableHeader className="bg-muted/40">
                                            <TableRow>
                                                <TableHead className="font-semibold">
                                                    Nama Barang
                                                </TableHead>
                                                <TableHead className="font-semibold text-center">
                                                    Qty
                                                </TableHead>
                                                <TableHead className="font-semibold text-right">
                                                    Harga Satuan
                                                </TableHead>
                                                <TableHead className="font-semibold text-right">
                                                    Subtotal
                                                </TableHead>
                                            </TableRow>
                                        </TableHeader>
                                        <TableBody>
                                            {selectedWashDetail.items.map(
                                                (item) => {
                                                    const isIncluded =
                                                        Number(item.price) ===
                                                        0;
                                                    return (
                                                        <TableRow key={item.id}>
                                                            <TableCell className="font-semibold text-sm">
                                                                {item.item
                                                                    ?.name ||
                                                                    `Item ID: ${item.item_id}`}
                                                                {isIncluded && (
                                                                    <Badge
                                                                        variant="secondary"
                                                                        className="ml-2 text-[9px] font-bold text-blue-600 bg-blue-50"
                                                                    >
                                                                        INCLUDED
                                                                        (FREE)
                                                                    </Badge>
                                                                )}
                                                            </TableCell>
                                                            <TableCell className="text-center font-medium">
                                                                {item.quantity}
                                                            </TableCell>
                                                            <TableCell className="text-right text-muted-foreground">
                                                                {isIncluded
                                                                    ? "Rp 0"
                                                                    : formatRupiah(
                                                                          item.price,
                                                                      )}
                                                            </TableCell>
                                                            <TableCell className="text-right font-bold text-foreground">
                                                                {isIncluded
                                                                    ? "Rp 0"
                                                                    : formatRupiah(
                                                                          item.subtotal,
                                                                      )}
                                                            </TableCell>
                                                        </TableRow>
                                                    );
                                                },
                                            )}
                                        </TableBody>
                                    </Table>
                                </div>
                            ) : (
                                <div className="text-sm text-muted-foreground bg-muted/10 p-4 rounded-xl text-center border border-dashed">
                                    Tidak ada item pelengkap yang ditambahkan.
                                </div>
                            )}
                        </div>

                        {/* Grand Total Area */}
                        <div className="border-t pt-4 flex flex-col items-end space-y-1.5">
                            <div className="flex justify-between w-full max-w-xs text-sm">
                                <span className="text-muted-foreground">
                                    Grand Total:
                                </span>
                                <span className="font-extrabold text-lg text-blue-600 dark:text-blue-400">
                                    {formatRupiah(
                                        selectedWashDetail.total_amount,
                                    )}
                                </span>
                            </div>
                            {selectedWashDetail.paid_amount !== null &&
                                selectedWashDetail.paid_amount !==
                                    undefined && (
                                    <div className="flex justify-between w-full max-w-xs text-sm">
                                        <span className="text-muted-foreground">
                                            Nominal Bayar:
                                        </span>
                                        <span className="font-medium text-foreground">
                                            {formatRupiah(
                                                selectedWashDetail.paid_amount,
                                            )}
                                        </span>
                                    </div>
                                )}
                            {/* {selectedWashDetail.change_amount !== null && selectedWashDetail.change_amount !== undefined && (
                                <div className="flex justify-between w-full max-w-xs text-sm">
                                    <span className="text-muted-foreground">Kembalian:</span>
                                    <span className="font-semibold text-emerald-600 dark:text-emerald-400">
                                        {formatRupiah(selectedWashDetail.change_amount)}
                                    </span>
                                </div>
                            )} */}
                        </div>

                        <div className="flex justify-end pt-2">
                            <Button
                                variant="outline"
                                onClick={() => setIsDetailModalOpen(false)}
                                className="px-6"
                            >
                                Tutup
                            </Button>
                        </div>
                    </div>
                )}
            </Modal>
        </AppLayout>
    );
}
