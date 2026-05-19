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
import { useState, useEffect, useRef } from "react";
import { useDebounce } from "@/hooks/use-debounce";
import { Info, Search, X } from "lucide-react";
import { Modal, ModalHeader } from "@/components/ui/modal";
import { Pagination } from "@/components/ui/pagination";

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
    paid_amount?: number | null;
    change_amount?: number | null;
    payment_method: string;
    transaction_type: string;
    staff: { full_name: string } | null;
    customer: { name: string } | null;
    car: { plate_number: string } | null;
    purchased_packets: Array<{
        id: string;
        voucher_packet: { name: string; price?: number } | null;
        quantity: number;
        price: number;
        purchased_at: string;
        expired_at: string;
    }>;
    service_records: Array<{
        id: string;
        price?: number;
        product: { name: string; price?: number } | null;
        stall: { name: string } | null;
        staff: { full_name: string } | null;
    }>;
    items?: Array<{
        id: number;
        item_id: number;
        quantity: number;
        price: number;
        subtotal: number;
        item?: {
            name: string;
        } | null;
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
    const [selectedType, setSelectedType] = useState(filters.type || "all");

    const [searchQuery, setSearchQuery] = useState(filters.search || "");
    const debouncedSearchQuery = useDebounce(searchQuery, 500);

    const [selectedTransaction, setSelectedTransaction] = useState<SalesTransactionRow | null>(null);

    const isMounted = useRef(false);

    useEffect(() => {
        isMounted.current = true;
        return () => {
            isMounted.current = false;
        };
    }, []);

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
            header: "Kasir",
        },
        {
            id: "actions",
            header: "Aksi",
            cell: ({ row }) => (
                <Button
                    variant="outline"
                    size="sm"
                    onClick={() => setSelectedTransaction(row.original)}
                >
                    <Info />
                    Detail
                </Button>
            ),
        },
    ];

    const handlePageChange = (page: number) => {
        router.get(
            route("sales-transactions.index"),
            {
                page,
                per_page: perPage,
                search: debouncedSearchQuery,
                type: selectedType === "all" ? "" : selectedType,
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
                type: selectedType === "all" ? "" : selectedType,
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
                type: type === "all" ? "" : type,
            },
            { preserveState: true },
        );
    };

    // Handle search changes
    useEffect(() => {
        if (!isMounted.current) return;
        router.get(
            route("sales-transactions.index"),
            {
                page: 1,
                per_page: perPage,
                search: debouncedSearchQuery,
                type: selectedType === "all" ? "" : selectedType,
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

                <div className="flex flex-col gap-4">
                    <div className="flex justify-end flex-row items-center gap-2">
                        <div className="flex items-center gap-2">
                            <span className="text-sm text-muted-foreground">Baris per halaman:</span>
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
                        {/* Type Filter */}
                        <div className="flex items-center gap-2">
                            <Select
                                value={selectedType}
                                onValueChange={handleTypeChange}
                            >
                                <SelectTrigger className="w-[180px] h-8 text-sm">
                                    <SelectValue placeholder="Semua Tipe" />
                                </SelectTrigger>
                                <SelectContent>
                                    <SelectItem value="all">
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
                        <div className="relative w-full max-w-xs">
                            <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                            <Input
                                placeholder="Customer / Plat Nomor..."
                                value={searchQuery}
                                onChange={(e) =>
                                    setSearchQuery(e.target.value)
                                }
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
                    <DataTable columns={columns} data={pagination.data} />
                    {pagination && (
                        <Pagination
                            pagination={pagination}
                            onPageChange={handlePageChange}
                            label="transaksi"
                        />
                    )}
                </div>
            </div>

            {selectedTransaction && (
                <Modal
                    open={!!selectedTransaction}
                    onClose={() => setSelectedTransaction(null)}
                    className="max-w-3xl p-6"
                >
                    <ModalHeader title={`Detail Transaksi #${selectedTransaction.id}`} />

                    <div className="mt-4 space-y-6 max-h-[70vh] overflow-y-auto pr-2">
                        {/* Transaction Metadata Card */}
                        <div className="grid grid-cols-1 md:grid-cols-2 gap-4 bg-muted/20 p-4 rounded-xl border">
                            <div className="space-y-1">
                                <span className="text-xs text-muted-foreground font-semibold uppercase">Detail Transaksi</span>
                                <div className="text-sm font-medium">Tipe: <Badge variant="outline" className="ml-1">{selectedTransaction.transaction_type}</Badge></div>
                                <div className="text-sm">Tanggal: <span className="font-semibold">{new Intl.DateTimeFormat("id-ID", {
                                    day: "numeric", month: "long", year: "numeric", hour: "2-digit", minute: "2-digit"
                                }).format(new Date(selectedTransaction.transaction_date))}</span></div>
                                <div className="text-sm">Metode Pembayaran: <span className="font-semibold">{selectedTransaction.payment_method || "-"}</span></div>
                            </div>
                            <div className="space-y-1">
                                <span className="text-xs text-muted-foreground font-semibold uppercase">Customer & Kendaraan</span>
                                <div className="text-sm">Nama: <span className="font-semibold">{selectedTransaction.customer?.name || "Walk-In Customer"}</span></div>
                                <div className="text-sm">Plat Nomor: <span className="font-semibold">{selectedTransaction.car?.plate_number || "-"}</span></div>
                                <div className="text-sm">Kasir: <span className="font-semibold">{selectedTransaction.staff?.full_name || "-"}</span></div>
                            </div>
                        </div>

                        {/* Service & Product Details */}
                        {selectedTransaction.service_records && selectedTransaction.service_records.length > 0 && (
                            <div className="space-y-2">
                                <h3 className="text-xs font-semibold text-foreground uppercase tracking-wider">Detail Layanan Cuci</h3>
                                <div className="border rounded-xl overflow-hidden">
                                    <table className="w-full text-sm text-left">
                                        <thead className="bg-muted text-muted-foreground uppercase text-[10px] font-bold">
                                            <tr>
                                                <th className="px-4 py-2">Layanan</th>
                                                <th className="px-4 py-2">Stall</th>
                                                <th className="px-4 py-2">Pencuci</th>
                                                <th className="px-4 py-2 text-right">Harga</th>
                                            </tr>
                                        </thead>
                                        <tbody className="divide-y">
                                            {selectedTransaction.service_records.map((srv: any) => (
                                                <tr key={srv.id} className="hover:bg-muted/10">
                                                    <td className="px-4 py-3 font-medium">{srv.product?.name || "-"}</td>
                                                    <td className="px-4 py-3">{srv.stall?.name || "-"}</td>
                                                    <td className="px-4 py-3">{srv.staff?.full_name || "-"}</td>
                                                    <td className="px-4 py-3 text-right font-semibold">
                                                        {new Intl.NumberFormat("id-ID", {
                                                            style: "currency", currency: "IDR", minimumFractionDigits: 0
                                                        }).format(srv.price ?? srv.product?.price ?? 0)}
                                                    </td>
                                                </tr>
                                            ))}
                                        </tbody>
                                    </table>
                                </div>
                            </div>
                        )}

                        {/* Purchased Packets Details */}
                        {selectedTransaction.purchased_packets && selectedTransaction.purchased_packets.length > 0 && (
                            <div className="space-y-2">
                                <h3 className="text-xs font-semibold text-foreground uppercase tracking-wider">Paket Voucher yang Dibeli</h3>
                                <div className="border rounded-xl overflow-hidden">
                                    <table className="w-full text-sm text-left">
                                        <thead className="bg-muted text-muted-foreground uppercase text-[10px] font-bold">
                                            <tr>
                                                <th className="px-4 py-2">Nama Paket</th>
                                                <th className="px-4 py-2">Qty</th>
                                                <th className="px-4 py-2 text-right">Harga</th>
                                            </tr>
                                        </thead>
                                        <tbody className="divide-y">
                                            {selectedTransaction.purchased_packets.map((pkt: any) => (
                                                <tr key={pkt.id} className="hover:bg-muted/10">
                                                    <td className="px-4 py-3 font-medium">{pkt.voucher_packet?.name || "-"}</td>
                                                    <td className="px-4 py-3">{pkt.quantity || 1}</td>
                                                    <td className="px-4 py-3 text-right font-semibold">
                                                        {new Intl.NumberFormat("id-ID", {
                                                            style: "currency", currency: "IDR", minimumFractionDigits: 0
                                                        }).format(pkt.price ?? pkt.voucher_packet?.price ?? 0)}
                                                    </td>
                                                </tr>
                                            ))}
                                        </tbody>
                                    </table>
                                </div>
                            </div>
                        )}

                        {/* Sold Items Detail Block */}
                        <div className="space-y-2">
                            <h3 className="text-xs font-semibold text-foreground uppercase tracking-wider">Barang / Item Terjual (Pelengkap)</h3>
                            {selectedTransaction.items && selectedTransaction.items.length > 0 ? (
                                <div className="border rounded-xl overflow-hidden">
                                    <table className="w-full text-sm text-left">
                                        <thead className="bg-muted text-muted-foreground uppercase text-[10px] font-bold">
                                            <tr>
                                                <th className="px-4 py-2">Nama Barang</th>
                                                <th className="px-4 py-2">Qty</th>
                                                <th className="px-4 py-2">Harga Satuan</th>
                                                <th className="px-4 py-2 text-right">Subtotal</th>
                                            </tr>
                                        </thead>
                                        <tbody className="divide-y">
                                            {selectedTransaction.items.map((item: any) => {
                                                const isIncluded = Number(item.price) === 0;
                                                return (
                                                    <tr key={item.id} className="hover:bg-muted/10">
                                                        <td className="px-4 py-3 font-medium">
                                                            {item.item?.name || `Item ID: ${item.item_id}`}
                                                            {isIncluded && (
                                                                <Badge variant="secondary" className="ml-2 text-[9px] font-bold text-blue-600 bg-blue-50">
                                                                    INCLUDED (FREE)
                                                                </Badge>
                                                            )}
                                                        </td>
                                                        <td className="px-4 py-3">{item.quantity}</td>
                                                        <td className="px-4 py-3 font-medium">
                                                            {isIncluded ? "Rp 0" : new Intl.NumberFormat("id-ID", {
                                                                style: "currency", currency: "IDR", minimumFractionDigits: 0
                                                            }).format(item.price)}
                                                        </td>
                                                        <td className="px-4 py-3 text-right font-bold text-slate-800">
                                                            {isIncluded ? "Rp 0" : new Intl.NumberFormat("id-ID", {
                                                                style: "currency", currency: "IDR", minimumFractionDigits: 0
                                                            }).format(item.subtotal)}
                                                        </td>
                                                    </tr>
                                                );
                                            })}
                                        </tbody>
                                    </table>
                                </div>
                            ) : (
                                <div className="text-sm text-muted-foreground bg-muted/10 p-4 rounded-xl text-center border border-dashed">
                                    Tidak ada item pelengkap yang terjual dengan transaksi ini.
                                </div>
                            )}
                        </div>

                        {/* Grand Total Area */}
                        <div className="border-t pt-4 flex flex-col items-end space-y-1.5">
                            <div className="flex justify-between w-full max-w-xs text-sm">
                                <span className="text-muted-foreground">Grand Total:</span>
                                <span className="font-extrabold text-lg text-blue-600">
                                    {new Intl.NumberFormat("id-ID", {
                                        style: "currency", currency: "IDR", minimumFractionDigits: 0
                                    }).format(selectedTransaction.total_amount)}
                                </span>
                            </div>
                            {selectedTransaction.paid_amount !== null && selectedTransaction.paid_amount !== undefined && (
                                <div className="flex justify-between w-full max-w-xs text-sm">
                                    <span className="text-muted-foreground">Nominal Bayar:</span>
                                    <span className="font-medium text-slate-700">
                                        {new Intl.NumberFormat("id-ID", {
                                            style: "currency", currency: "IDR", minimumFractionDigits: 0
                                        }).format(selectedTransaction.paid_amount)}
                                    </span>
                                </div>
                            )}
                            {selectedTransaction.change_amount !== null && selectedTransaction.change_amount !== undefined && (
                                <div className="flex justify-between w-full max-w-xs text-sm">
                                    <span className="text-muted-foreground">Kembalian:</span>
                                    <span className="font-semibold text-emerald-600">
                                        {new Intl.NumberFormat("id-ID", {
                                            style: "currency", currency: "IDR", minimumFractionDigits: 0
                                        }).format(Math.max(0, selectedTransaction.change_amount))}
                                    </span>
                                </div>
                            )}
                        </div>
                    </div>

                    <div className="mt-6 flex justify-end">
                        <Button onClick={() => setSelectedTransaction(null)} className="px-6 bg-slate-900 text-white hover:bg-slate-800">
                            Tutup
                        </Button>
                    </div>
                </Modal>
            )}
        </AppLayout>
    );
}
