import Heading from "@/components/heading";
import { Button } from "@/components/ui/button";
import { Modal, ModalHeader } from "@/components/ui/modal";
import {
    Select,
    SelectContent,
    SelectItem,
    SelectTrigger,
    SelectValue,
} from "@/components/ui/select";
import { Label } from "@/components/ui/label";
import { Input } from "@/components/ui/input";
import AppLayout from "@/layouts/app-layout";
import { BreadcrumbItem, PageProps } from "@/types";
import { Head, usePage, router } from "@inertiajs/react";
import { Pagination } from "@/components/ui/pagination";
import { format } from "date-fns";
import { id } from "date-fns/locale";
import { Plus, Filter, X, Search, Calendar, CheckSquare, Printer } from "lucide-react";
import { useState, useEffect, useCallback } from "react";
import { useDebounce } from "@/hooks/use-debounce";
import CreateVoucher from "./forms/create-voucher";
import { DataTable } from "@/components/ui/data-table";
import { ColumnDef } from "@tanstack/react-table";
import { Badge } from "@/components/ui/badge";
import {
    DropdownMenu,
    DropdownMenuTrigger,
    DropdownMenuContent,
    DropdownMenuItem,
} from "@/components/ui/dropdown-menu";
import EditVoucherModal from "./forms/edit-voucher-modal";
import { toast } from "sonner";
import axios from "axios";

interface VoucherTypeProp {
    id: string;
    name: string;
}

export interface VoucherProp {
    id: string;
    serial_number: string;
    sales_code?: string;
    voucher_type: {
        name: string;
    };
    status: string;
    redeemed_at: string | null;
    expired_at: string | null;
    purchased_packet?: {
        id: string;
        expired_at: string | null;
    } | null;
}

/** Resolve effective expiration: prefer purchased_packet.expired_at, fallback to voucher.expired_at */
function resolveExpiry(voucher: VoucherProp): string | null {
    return voucher.purchased_packet?.expired_at ?? voucher.expired_at ?? null;
}

function formatExpiry(raw: string | null): string {
    if (!raw) return "-";
    try {
        return format(new Date(raw), "dd MMM yyyy", { locale: id });
    } catch {
        return raw;
    }
}

// ─── Single Edit Modal ────────────────────────────────────────────────────────
interface SingleEditExpiryProps {
    open: boolean;
    voucher: VoucherProp | null;
    onClose: () => void;
}

function SingleEditExpiryModal({ open, voucher, onClose }: SingleEditExpiryProps) {
    const current = voucher ? (voucher.expired_at ?? "") : "";
    const [date, setDate] = useState(current);
    const [saving, setSaving] = useState(false);

    useEffect(() => {
        setDate(voucher?.expired_at ?? "");
    }, [voucher]);

    const handleSave = () => {
        if (!voucher || !date) return;
        setSaving(true);
        router.post(
            route("vouchers.update-expiration"),
            { voucher_ids: [voucher.id], expired_at: date },
            {
                onSuccess: () => {
                    toast.success("Tanggal kadaluarsa berhasil diperbarui.");
                    onClose();
                },
                onError: () => toast.error("Gagal memperbarui tanggal kadaluarsa."),
                onFinish: () => setSaving(false),
            },
        );
    };

    if (!open || !voucher) return null;

    return (
        <Modal open={open} onClose={onClose} className="max-w-sm">
            <ModalHeader title="Edit Tanggal Kadaluarsa" />
            <div className="space-y-4">
                <p className="text-sm text-muted-foreground">
                    Voucher: <span className="font-mono font-medium">{voucher.serial_number}</span>
                </p>
                {voucher.purchased_packet?.expired_at && (
                    <div className="rounded-md bg-amber-50 dark:bg-amber-950 border border-amber-200 dark:border-amber-800 px-3 py-2 text-xs text-amber-700 dark:text-amber-300">
                        Voucher ini terhubung ke paket pelanggan. Mengubah di sini <strong>hanya</strong> memengaruhi field <code>expired_at</code> pada voucher, bukan paket pelanggan.
                    </div>
                )}
                <div className="space-y-1.5">
                    <Label htmlFor="single-expiry-date">Tanggal Kadaluarsa</Label>
                    <Input
                        id="single-expiry-date"
                        type="date"
                        value={date}
                        onChange={(e) => setDate(e.target.value)}
                    />
                </div>
                <div className="flex justify-end gap-2 pt-2">
                    <Button variant="outline" onClick={onClose} disabled={saving}>Batal</Button>
                    <Button onClick={handleSave} disabled={saving || !date}>
                        {saving ? "Menyimpan..." : "Simpan"}
                    </Button>
                </div>
            </div>
        </Modal>
    );
}

// ─── Batch Edit Modal ─────────────────────────────────────────────────────────
interface BatchEditExpiryProps {
    open: boolean;
    onClose: () => void;
    voucherTypes: VoucherTypeProp[];
}

interface SearchedVoucher {
    id: string;
    serial_number: string;
    status: string;
    expired_at: string | null;
    purchased_packet?: { expired_at: string | null } | null;
}

function BatchEditExpiryModal({ open, onClose, voucherTypes }: BatchEditExpiryProps) {
    const [searchQuery, setSearchQuery] = useState("");
    const [filterType, setFilterType] = useState("all");
    const [results, setResults] = useState<SearchedVoucher[]>([]);
    const [searching, setSearching] = useState(false);
    // Map<id, voucher> so we keep full objects even when search changes
    const [selectedMap, setSelectedMap] = useState<Map<string, SearchedVoucher>>(new Map());
    const [batchDate, setBatchDate] = useState("");
    const [saving, setSaving] = useState(false);

    const debouncedQuery = useDebounce(searchQuery, 400);

    const search = useCallback(async () => {
        setSearching(true);
        try {
            const params: Record<string, string> = { per_page: "50" };
            if (debouncedQuery) params.search = debouncedQuery;
            if (filterType !== "all") params.voucher_type = filterType;
            const res = await axios.get(route("vouchers.search"), { params });
            setResults(res.data ?? []);
        } catch {
            setResults([]);
        } finally {
            setSearching(false);
        }
    }, [debouncedQuery, filterType]);

    useEffect(() => {
        if (open) search();
    }, [open, search]);

    const toggleSelect = (v: SearchedVoucher) => {
        setSelectedMap((prev) => {
            const next = new Map(prev);
            next.has(v.id) ? next.delete(v.id) : next.set(v.id, v);
            return next;
        });
    };

    const deselectOne = (id: string) => {
        setSelectedMap((prev) => {
            const next = new Map(prev);
            next.delete(id);
            return next;
        });
    };

    const clearAll = () => setSelectedMap(new Map());

    const toggleAll = () => {
        const allInResults = results.every((v) => selectedMap.has(v.id));
        setSelectedMap((prev) => {
            const next = new Map(prev);
            if (allInResults) {
                results.forEach((v) => next.delete(v.id));
            } else {
                results.forEach((v) => next.set(v.id, v));
            }
            return next;
        });
    };

    const handleSave = () => {
        if (selectedMap.size === 0 || !batchDate) return;
        setSaving(true);
        router.post(
            route("vouchers.update-expiration"),
            { voucher_ids: Array.from(selectedMap.keys()), expired_at: batchDate },
            {
                onSuccess: () => {
                    toast.success(`${selectedMap.size} voucher berhasil diperbarui.`);
                    setSelectedMap(new Map());
                    setBatchDate("");
                    onClose();
                },
                onError: () => toast.error("Gagal memperbarui tanggal kadaluarsa."),
                onFinish: () => setSaving(false),
            },
        );
    };

    const handleClose = () => {
        setSearchQuery("");
        setFilterType("all");
        setResults([]);
        setSelectedMap(new Map());
        setBatchDate("");
        onClose();
    };

    const allInResults = results.length > 0 && results.every((v) => selectedMap.has(v.id));
    const selectedList = Array.from(selectedMap.values());

    return (
        <Modal open={open} onClose={handleClose} className="max-w-2xl">
            <ModalHeader title="Batch Edit Tanggal Kadaluarsa" />
            <div className="space-y-3">
                {/* Search & filter row */}
                <div className="flex gap-2">
                    <div className="relative flex-1">
                        <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                        <Input
                            placeholder="Cari nomor seri / kode sales..."
                            value={searchQuery}
                            onChange={(e) => setSearchQuery(e.target.value)}
                            className="pl-9"
                        />
                    </div>
                    <Select value={filterType} onValueChange={setFilterType}>
                        <SelectTrigger className="w-[180px]">
                            <SelectValue placeholder="Tipe Voucher" />
                        </SelectTrigger>
                        <SelectContent>
                            <SelectItem value="all">Semua Tipe</SelectItem>
                            {voucherTypes.map((t) => (
                                <SelectItem key={t.id} value={t.id}>{t.name}</SelectItem>
                            ))}
                        </SelectContent>
                    </Select>
                </div>

                {/* Two-panel layout: search results | selected board */}
                <div className="grid grid-cols-2 gap-3">

                    {/* Left: Search results */}
                    <div className="border rounded-md overflow-hidden flex flex-col">
                        <div className="flex items-center gap-2 px-2.5 py-1.5 bg-muted border-b text-xs font-medium text-muted-foreground">
                            <button
                                type="button"
                                onClick={toggleAll}
                                className="flex items-center gap-1.5 hover:text-foreground transition-colors"
                            >
                                <CheckSquare className="h-3.5 w-3.5" />
                                {allInResults ? "Hapus Semua" : `Pilih Semua (${results.length})`}
                            </button>
                        </div>
                        <div className="max-h-60 overflow-y-auto divide-y flex-1">
                            {searching && (
                                <p className="text-center text-xs text-muted-foreground py-6">Mencari...</p>
                            )}
                            {!searching && results.length === 0 && (
                                <p className="text-center text-xs text-muted-foreground py-6">
                                    Tidak ada voucher ditemukan.
                                </p>
                            )}
                            {results.map((v) => (
                                <label
                                    key={v.id}
                                    className="flex items-center gap-2 px-2.5 py-1 cursor-pointer hover:bg-muted/50 transition-colors"
                                >
                                    <input
                                        type="checkbox"
                                        checked={selectedMap.has(v.id)}
                                        onChange={() => toggleSelect(v)}
                                        className="accent-primary shrink-0"
                                    />
                                    <span className="font-mono text-xs flex-1 truncate">{v.serial_number}</span>
                                    <Badge
                                        variant={v.status.toLowerCase() === "active" ? "default" : "secondary"}
                                        className="text-[10px] px-1 py-0 h-4"
                                    >
                                        {v.status}
                                    </Badge>
                                </label>
                            ))}
                        </div>
                    </div>

                    {/* Right: Selected board */}
                    <div className="border rounded-md overflow-hidden flex flex-col">
                        <div className="flex items-center justify-between px-2.5 py-1.5 bg-muted border-b text-xs font-medium text-muted-foreground">
                            <span>{selectedList.length} dipilih</span>
                            {selectedList.length > 0 && (
                                <button
                                    type="button"
                                    onClick={clearAll}
                                    className="hover:text-destructive transition-colors"
                                >
                                    Hapus semua
                                </button>
                            )}
                        </div>
                        <div className="max-h-60 overflow-y-auto flex-1">
                            {selectedList.length === 0 ? (
                                <p className="text-center text-xs text-muted-foreground py-6">
                                    Belum ada voucher dipilih.
                                </p>
                            ) : (
                                <div className="p-2 flex flex-wrap gap-1.5">
                                    {selectedList.map((v) => (
                                        <span
                                            key={v.id}
                                            className="inline-flex items-center gap-1 bg-primary/10 text-primary text-[10px] font-mono px-2 py-0.5 rounded-full"
                                        >
                                            {v.serial_number}
                                            <button
                                                type="button"
                                                onClick={() => deselectOne(v.id)}
                                                className="hover:text-destructive transition-colors ml-0.5"
                                                title="Hapus"
                                            >
                                                <X className="h-3 w-3" />
                                            </button>
                                        </span>
                                    ))}
                                </div>
                            )}
                        </div>
                    </div>
                </div>

                {/* Date picker + action */}
                <div className="flex items-end gap-3 pt-1">
                    <div className="flex-1 space-y-1.5">
                        <Label htmlFor="batch-expiry-date">Tanggal Kadaluarsa Baru</Label>
                        <Input
                            id="batch-expiry-date"
                            type="date"
                            value={batchDate}
                            onChange={(e) => setBatchDate(e.target.value)}
                        />
                    </div>
                    <div className="flex gap-2">
                        <Button variant="outline" onClick={handleClose} disabled={saving}>Batal</Button>
                        <Button
                            onClick={handleSave}
                            disabled={saving || selectedMap.size === 0 || !batchDate}
                        >
                            {saving ? "Menyimpan..." : `Simpan (${selectedMap.size})`}
                        </Button>
                    </div>
                </div>
            </div>
        </Modal>
    );
}



// ─── Print Barcode Modal ──────────────────────────────────────────────────────
interface PrintBarcodeModalProps {
    open: boolean;
    onClose: () => void;
}

function PrintBarcodeModal({ open, onClose }: PrintBarcodeModalProps) {
    const [startSerial, setStartSerial] = useState("");
    const [endSerial, setEndSerial] = useState("");
    const [format, setFormat] = useState("pdf");

    const handlePrint = () => {
        if (!startSerial || !endSerial) {
            toast.error("Silakan isi rentang nomor seri");
            return;
        }

        const url = route("vouchers.print-barcodes", {
            start_serial: startSerial,
            end_serial: endSerial,
            format: format,
        });

        window.open(url, "_blank");
        onClose();
    };

    if (!open) return null;

    return (
        <Modal open={open} onClose={onClose} className="max-w-md">
            <ModalHeader title="Print Barcode Voucher" />
            <div className="space-y-4">
                <div className="grid grid-cols-2 gap-4">
                    <div className="space-y-1.5">
                        <Label htmlFor="start-serial">Dari Nomor Seri</Label>
                        <Input
                            id="start-serial"
                            placeholder="Contoh: V001"
                            value={startSerial}
                            onChange={(e) => setStartSerial(e.target.value)}
                        />
                    </div>
                    <div className="space-y-1.5">
                        <Label htmlFor="end-serial">Sampai Nomor Seri</Label>
                        <Input
                            id="end-serial"
                            placeholder="Contoh: V100"
                            value={endSerial}
                            onChange={(e) => setEndSerial(e.target.value)}
                        />
                    </div>
                </div>
                <div className="space-y-1.5">
                    <Label htmlFor="print-format">Format Print</Label>
                    <Select value={format} onValueChange={setFormat}>
                        <SelectTrigger>
                            <SelectValue placeholder="Pilih Format" />
                        </SelectTrigger>
                        <SelectContent>
                            <SelectItem value="pdf">PDF (Grid 3x4 per halaman)</SelectItem>
                            <SelectItem value="excel">Excel</SelectItem>
                        </SelectContent>
                    </Select>
                </div>
                <div className="flex justify-end gap-2 pt-2">
                    <Button variant="outline" onClick={onClose}>Batal</Button>
                    <Button onClick={handlePrint}>Print / Export</Button>
                </div>
            </div>
        </Modal>
    );
}



// ─── Main Page ────────────────────────────────────────────────────────────────
export default function VoucherIndex() {
    const { props } = usePage<
        PageProps<{
            voucherTypes: VoucherTypeProp[];
            vouchers: any;
            flash?: { success?: string };
        }>
    >();

    const voucher_types = props.voucherTypes;
    const vouchers = props.vouchers.data as VoucherProp[];
    const pagination = props.vouchers;

    const [isModalOpen, setIsModalOpen] = useState(false);
    const [isEditModalOpen, setIsEditModalOpen] = useState(false);
    const [isReportModalOpen, setIsReportModalOpen] = useState(false);
    const [isSingleExpiryOpen, setIsSingleExpiryOpen] = useState(false);
    const [isBatchExpiryOpen, setIsBatchExpiryOpen] = useState(false);
    const [isPrintBarcodeOpen, setIsPrintBarcodeOpen] = useState(false);
    const [editingVoucher, setEditingVoucher] = useState<VoucherProp | null>(null);

    const [perPage, setPerPage] = useState(pagination.per_page || 10);
    const [selectedVoucherType, setSelectedVoucherType] = useState<string>("all");
    const [selectedStatus, setSelectedStatus] = useState<string>("all");
    const [reportStartDate, setReportStartDate] = useState<string>(format(new Date(), "yyyy-MM-dd"));
    const [reportEndDate, setReportEndDate] = useState<string>(format(new Date(), "yyyy-MM-dd"));
    const [reportVoucherType, setReportVoucherType] = useState<string>("all");
    const [searchQuery, setSearchQuery] = useState("");
    const debouncedSearchQuery = useDebounce(searchQuery, 500);

    const breadcrumbs: BreadcrumbItem[] = [{ title: "Voucher", href: "/vouchers" }];

    const statusOptions = [
        { value: "all", label: "Semua Status" },
        { value: "Active", label: "Active" },
        { value: "Sold", label: "Sold" },
        { value: "Redeemed", label: "Redeemed" },
        { value: "Expired", label: "Expired" },
    ];

    const columns: ColumnDef<VoucherProp>[] = [
        {
            id: "index",
            header: "No",
            cell: ({ row }) => (
                <span>{row.index + 1 + (pagination.current_page - 1) * pagination.per_page}</span>
            ),
        },
        {
            accessorKey: "serial_number",
            header: "Nomor Seri",
        },
        {
            accessorKey: "sales_code",
            header: "Kode Sales",
            cell: ({ row }) => (row.getValue("sales_code") as string) || "-",
        },
        {
            accessorKey: "voucher_type.name",
            header: "Tipe Voucher",
        },
        {
            accessorKey: "status",
            header: "Status",
            cell: ({ row }) => {
                const status = row.getValue("status") as string;
                const getVariant = () => {
                    const s = status.toLowerCase();
                    if (s === "redeemed") return "destructive";
                    if (s === "active" || s === "available") return "default";
                    return "secondary";
                };
                return <Badge variant={getVariant()}>{status}</Badge>;
            },
        },
        {
            id: "expired_at",
            header: "Kadaluarsa",
            cell: ({ row }) => {
                const voucher = row.original;
                const expiry = resolveExpiry(voucher);
                const display = formatExpiry(expiry);
                const fromPacket = !!voucher.purchased_packet?.expired_at;
                return (
                    <div className="flex items-center gap-1.5 min-w-[110px]">
                        <span className={!expiry ? "text-muted-foreground" : ""}>
                            {display}
                        </span>
                        {fromPacket && (
                            <span
                                title="Kadaluarsa dari paket pelanggan"
                                className="text-[10px] text-muted-foreground bg-muted px-1 rounded"
                            >
                                paket
                            </span>
                        )}
                    </div>
                );
            },
        },
        {
            accessorKey: "redeemed_at",
            header: "Tanggal Redeem",
            cell: ({ row }) => {
                const redeemedAt = row.getValue("redeemed_at") as string | null;
                if (!redeemedAt) return <span className="text-muted-foreground">-</span>;
                return <div className="text-left">{format(new Date(redeemedAt), "dd MMM yyyy", { locale: id })}</div>;
            },
        },
        {
            id: "actions",
            header: "",
            cell: ({ row }) => {
                const voucher = row.original;
                return (
                    <Button
                        variant="ghost"
                        size="sm"
                        className="h-7 px-2 text-xs"
                        title="Edit tanggal kadaluarsa"
                        onClick={() => {
                            setEditingVoucher(voucher);
                            setIsSingleExpiryOpen(true);
                        }}
                    >
                        <Calendar className="h-3.5 w-3.5 mr-1" />
                        Kadaluarsa
                    </Button>
                );
            },
        },
    ];

    const buildParams = (overrides: Record<string, any> = {}) => {
        const params: Record<string, any> = {
            page: 1,
            per_page: perPage,
            ...overrides,
        };
        if (selectedVoucherType !== "all") params.voucher_type = selectedVoucherType;
        if (selectedStatus !== "all") params.status = selectedStatus;
        if (debouncedSearchQuery) params.search = debouncedSearchQuery;
        return params;
    };

    useEffect(() => {
        router.get(route("vouchers.index"), buildParams({ page: 1 }), { preserveState: true });
    }, [debouncedSearchQuery]);

    useEffect(() => {
        if (props.flash?.success) toast.success(props.flash.success);
    }, [props.flash?.success]);

    const handlePageChange = (page: number) =>
        router.get(route("vouchers.index"), buildParams({ page }), { preserveState: true });

    const handlePerPageChange = (newPerPage: number) => {
        setPerPage(newPerPage);
        router.get(route("vouchers.index"), buildParams({ page: 1, per_page: newPerPage }), { preserveState: true });
    };

    const handleVoucherTypeChange = (value: string) => {
        setSelectedVoucherType(value);
        const params = buildParams({ page: 1 });
        if (value !== "all") params.voucher_type = value;
        else delete params.voucher_type;
        router.get(route("vouchers.index"), params, { preserveState: true });
    };

    const handleStatusChange = (value: string) => {
        setSelectedStatus(value);
        const params = buildParams({ page: 1 });
        if (value !== "all") params.status = value;
        else delete params.status;
        router.get(route("vouchers.index"), params, { preserveState: true });
    };

    const clearFilters = () => {
        setSelectedVoucherType("all");
        setSelectedStatus("all");
        setSearchQuery("");
        router.get(route("vouchers.index"), { page: 1, per_page: perPage }, { preserveState: true });
    };

    const hasActiveFilters =
        selectedVoucherType !== "all" || selectedStatus !== "all" || searchQuery;

    return (
        <AppLayout breadcrumbs={breadcrumbs}>
            <Head title="Voucher" />
            <div className="flex h-full flex-1 flex-col gap-4 rounded-xl p-4">
                <div className="flex justify-between">
                    <Heading
                        title="Voucher"
                        description="Tambahkan dan kelola daftar voucher yang tersedia."
                    />
                    <div className="flex gap-2 flex-wrap justify-end">
                        <Button variant="default" onClick={() => setIsModalOpen(true)}>
                            Tambah Voucher <Plus className="ml-2 h-4 w-4" />
                        </Button>
                        <Button variant="secondary" onClick={() => setIsEditModalOpen(true)}>
                            Edit
                        </Button>
                        <Button
                            variant="outline"
                            onClick={() => setIsBatchExpiryOpen(true)}
                        >
                            <Calendar className="mr-2 h-4 w-4" />
                            Edit Kadaluarsa
                        </Button>
                        <Button
                            variant="outline"
                            onClick={() => setIsPrintBarcodeOpen(true)}
                        >
                            <Printer className="mr-2 h-4 w-4" />
                            Print Barcode
                        </Button>
                        <Button variant="default" onClick={() => setIsReportModalOpen(true)}>
                            Tarik Laporan
                        </Button>
                    </div>
                </div>

                {/* Filters */}
                <div className="flex items-center gap-4 p-4 border rounded-lg flex-wrap">
                    <div className="flex items-center gap-2">
                        <Filter className="h-4 w-4 text-muted-foreground" />
                        <Label className="text-sm font-medium">Filter:</Label>
                    </div>

                    <div className="flex items-center gap-2">
                        <Label className="text-sm">Tipe Voucher:</Label>
                        <Select value={selectedVoucherType} onValueChange={handleVoucherTypeChange}>
                            <SelectTrigger className="w-[200px]">
                                <SelectValue placeholder="Pilih tipe voucher" />
                            </SelectTrigger>
                            <SelectContent>
                                <SelectItem value="all">Semua Tipe</SelectItem>
                                {voucher_types.map((type: VoucherTypeProp) => (
                                    <SelectItem key={type.id} value={type.id}>{type.name}</SelectItem>
                                ))}
                            </SelectContent>
                        </Select>
                    </div>

                    <div className="flex items-center gap-2">
                        <Label className="text-sm">Status:</Label>
                        <Select value={selectedStatus} onValueChange={handleStatusChange}>
                            <SelectTrigger className="w-[150px]">
                                <SelectValue placeholder="Pilih status" />
                            </SelectTrigger>
                            <SelectContent>
                                {statusOptions.map((option) => (
                                    <SelectItem key={option.value} value={option.value}>
                                        {option.label}
                                    </SelectItem>
                                ))}
                            </SelectContent>
                        </Select>
                    </div>

                    <div className="flex items-center gap-2">
                        <div className="relative flex-1 max-w-md">
                            <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                            <Input
                                placeholder="Nomor seri/Kode Sales..."
                                value={searchQuery}
                                onChange={(e) => setSearchQuery(e.target.value)}
                                className="pl-10 pr-10"
                            />
                            {searchQuery && (
                                <Button
                                    variant="ghost"
                                    size="sm"
                                    onClick={() => setSearchQuery("")}
                                    className="absolute right-1 top-1/2 transform -translate-y-1/2 h-6 w-6 p-0"
                                >
                                    <X className="h-4 w-4" />
                                </Button>
                            )}
                        </div>
                    </div>

                    {hasActiveFilters && (
                        <Button variant="outline" size="sm" onClick={clearFilters} className="ml-auto">
                            <X className="h-4 w-4 mr-1" />
                            Bersihkan Filter
                        </Button>
                    )}
                </div>

                <div className="flex flex-col gap-4">
                    <div className="flex justify-end flex-row items-center gap-2">
                        <span className="text-sm text-muted-foreground">Baris per halaman:</span>
                        <DropdownMenu>
                            <DropdownMenuTrigger asChild>
                                <Button variant="outline" size="sm" className="min-w-[60px] justify-between h-8">
                                    {perPage}
                                </Button>
                            </DropdownMenuTrigger>
                            <DropdownMenuContent align="end">
                                {[5, 10, 20, 50, 100].map((size) => (
                                    <DropdownMenuItem key={size} onSelect={() => handlePerPageChange(size)}>
                                        {size}
                                    </DropdownMenuItem>
                                ))}
                            </DropdownMenuContent>
                        </DropdownMenu>
                    </div>
                    <DataTable
                        columns={columns}
                        data={vouchers}
                        getRowId={(row) => row.id?.toString()}
                    />
                    {pagination && (
                        <Pagination
                            pagination={pagination}
                            onPageChange={handlePageChange}
                            label="voucher"
                        />
                    )}
                </div>
            </div>

            {/* Create Voucher Modal */}
            <Modal open={isModalOpen} onClose={() => setIsModalOpen(false)} className="max-w-3xl">
                <ModalHeader title="Tambah Voucher" />
                <CreateVoucher categories={voucher_types} onSuccess={() => setIsModalOpen(false)} />
            </Modal>

            {/* Batch Status Edit Modal */}
            <EditVoucherModal
                open={isEditModalOpen}
                onClose={() => setIsEditModalOpen(false)}
                voucherTypes={voucher_types}
                onSuccess={() => setIsEditModalOpen(false)}
            />

            {/* Single Expiry Edit Modal */}
            <SingleEditExpiryModal
                open={isSingleExpiryOpen}
                voucher={editingVoucher}
                onClose={() => {
                    setIsSingleExpiryOpen(false);
                    setEditingVoucher(null);
                }}
            />

            {/* Batch Expiry Edit Modal */}
            <BatchEditExpiryModal
                open={isBatchExpiryOpen}
                onClose={() => setIsBatchExpiryOpen(false)}
                voucherTypes={voucher_types}
            />

            {/* Print Barcode Modal */}
            <PrintBarcodeModal
                open={isPrintBarcodeOpen}
                onClose={() => setIsPrintBarcodeOpen(false)}
            />

            {/* Report Modal */}
            <Modal open={isReportModalOpen} onClose={() => setIsReportModalOpen(false)} className="max-w-md">
                <ModalHeader title="Tarik Laporan Voucher" />
                <div className="space-y-4">
                    <div className="space-y-2">
                        <Label htmlFor="start-date">Tanggal Mulai</Label>
                        <Input
                            id="start-date"
                            type="date"
                            value={reportStartDate}
                            onChange={(e) => setReportStartDate(e.target.value)}
                            className="w-full"
                        />
                    </div>
                    <div className="space-y-2">
                        <Label htmlFor="end-date">Tanggal Selesai</Label>
                        <Input
                            id="end-date"
                            type="date"
                            value={reportEndDate}
                            onChange={(e) => setReportEndDate(e.target.value)}
                            className="w-full"
                        />
                    </div>
                    <div className="space-y-2">
                        <Label htmlFor="voucher-type">Tipe Voucher</Label>
                        <Select value={reportVoucherType} onValueChange={setReportVoucherType}>
                            <SelectTrigger>
                                <SelectValue placeholder="Pilih tipe voucher" />
                            </SelectTrigger>
                            <SelectContent>
                                <SelectItem value="all">Semua Tipe</SelectItem>
                                {voucher_types.map((type: VoucherTypeProp) => (
                                    <SelectItem key={type.id} value={type.id}>{type.name}</SelectItem>
                                ))}
                            </SelectContent>
                        </Select>
                    </div>
                    <div className="flex justify-end gap-2 pt-4">
                        <Button variant="outline" onClick={() => setIsReportModalOpen(false)}>Batal</Button>
                        <Button
                            onClick={async () => {
                                if (!reportStartDate || !reportEndDate) {
                                    toast.error("Tanggal mulai dan selesai harus diisi");
                                    return;
                                }
                                try {
                                    const response = await axios.post(
                                        route("vouchers.generate-report"),
                                        {
                                            start_date: reportStartDate,
                                            end_date: reportEndDate,
                                            voucher_type: reportVoucherType !== "all" ? reportVoucherType : undefined,
                                        },
                                        { responseType: "blob" },
                                    );
                                    const url = window.URL.createObjectURL(new Blob([response.data]));
                                    const link = document.createElement("a");
                                    link.href = url;
                                    link.setAttribute("download", `laporan-voucher-${reportStartDate}-${reportEndDate}.xlsx`);
                                    document.body.appendChild(link);
                                    link.click();
                                    link.remove();
                                    window.URL.revokeObjectURL(url);
                                    setIsReportModalOpen(false);
                                    toast.success("Laporan berhasil diunduh");
                                } catch {
                                    toast.error("Gagal mengunduh laporan");
                                }
                            }}
                        >
                            Tarik Laporan
                        </Button>
                    </div>
                </div>
            </Modal>
        </AppLayout>
    );
}
