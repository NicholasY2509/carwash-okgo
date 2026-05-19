import Heading from "@/components/heading";
import { Button } from "@/components/ui/button";
import { Modal, ModalHeader } from "@/components/ui/modal";
import AppLayout from "@/layouts/app-layout";
import { BreadcrumbItem, PageProps } from "@/types";
import { Pagination } from "@/components/ui/pagination";
import { Head, usePage, useForm, router } from "@inertiajs/react";
import { Plus, Search, LoaderCircle, Calendar, ArrowUpRight, ArrowDownRight, Trash2, ArrowUpDown } from "lucide-react";
import { useState, useEffect } from "react";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Badge } from "@/components/ui/badge";
import { DataTable } from "@/components/ui/data-table";
import { ColumnDef } from "@tanstack/react-table";
import { toast } from "sonner";
import { format } from "date-fns";
import { useDebounce } from "@/hooks/use-debounce";

const breadcrumbs: BreadcrumbItem[] = [
    {
        title: "Penyesuaian Stok",
        href: "/stock-adjustments",
    },
];

interface ItemProp {
    id: number;
    sku: string | null;
    name: string;
    stock: number;
}

interface StockMovementProp {
    id: number;
    item_id: number;
    quantity: number;
    resulting_stock: number;
    type: string;
    reason: string | null;
    created_at: string;
    item?: {
        sku: string | null;
        name: string;
    };
}

interface PaginationProp {
    current_page: number;
    last_page: number;
    per_page: number;
    total: number;
    data: StockMovementProp[];
}

export default function StockAdjustmentIndex() {
    const { props } = usePage<
        PageProps<{
            movements: PaginationProp;
            items: ItemProp[];
            filters: {
                search: string;
                per_page: number;
            };
        }>
    >();

    const movements = props.movements;
    const items = props.items;
    const filters = props.filters;

    const [isAdjustModalOpen, setIsAdjustModalOpen] = useState(false);
    const [searchQuery, setSearchQuery] = useState(filters.search || "");
    const debouncedSearchQuery = useDebounce(searchQuery, 400);

    const { data, setData, post, processing, errors, reset } = useForm({
        item_id: "",
        quantity: "",
        type: "addition", // addition, subtraction, waste
        reason: "",
    });

    // Handle search query updates
    useEffect(() => {
        router.get(
            route("stock-adjustments.index"),
            { search: debouncedSearchQuery, per_page: movements.per_page, page: 1 },
            { preserveState: true, replace: true }
        );
    }, [debouncedSearchQuery]);

    function handlePageChange(page: number) {
        router.get(
            route("stock-adjustments.index"),
            { search: searchQuery, per_page: movements.per_page, page },
            { preserveState: true }
        );
    }

    function handleSubmit(e: React.FormEvent<HTMLFormElement>) {
        e.preventDefault();

        post(route("stock-adjustments.store"), {
            onSuccess: () => {
                reset();
                setIsAdjustModalOpen(false);
                toast.success("Penyesuaian stok berhasil disimpan.");
            },
            onError: (err) => {
                console.error("Adjustment error", err);
                toast.error("Terjadi kesalahan saat memproses penyesuaian stok.");
            }
        });
    }

    const columns: ColumnDef<StockMovementProp>[] = [
        {
            accessorKey: "created_at",
            header: "Waktu & Tanggal",
            cell: (info) => (
                <div className="flex items-center gap-1 text-sm font-medium">
                    <Calendar className="h-3.5 w-3.5 text-muted-foreground" />
                    {format(new Date(info.getValue() as string), "dd MMM yyyy HH:mm")}
                </div>
            ),
        },
        {
            accessorKey: "item.name",
            header: "Nama Barang",
            cell: (info) => (
                <div className="flex flex-col">
                    <span className="font-semibold text-sm">{info.row.original.item?.name || "Barang Terhapus"}</span>
                    {info.row.original.item?.sku && (
                        <span className="font-mono text-xs text-muted-foreground uppercase">
                            SKU: {info.row.original.item.sku}
                        </span>
                    )}
                </div>
            ),
        },
        {
            accessorKey: "type",
            header: "Tipe Perubahan",
            cell: (info) => {
                const type = info.getValue() as string;
                const qty = info.row.original.quantity;

                if (type === "purchase") {
                    return <Badge className="bg-green-600 hover:bg-green-600 font-semibold gap-1"><ArrowUpRight className="h-3 w-3" /> Pembelian</Badge>;
                }
                if (type === "waste") {
                    return <Badge className="bg-red-600 hover:bg-red-600 font-semibold gap-1"><Trash2 className="h-3 w-3" /> Waste / Dibuang</Badge>;
                }
                if (type === "service_usage") {
                    return <Badge className="bg-blue-600 hover:bg-blue-600 font-semibold gap-1"><ArrowDownRight className="h-3 w-3" /> Pemakaian Cuci</Badge>;
                }
                if (type === "service_cancellation") {
                    return <Badge className="bg-indigo-600 hover:bg-indigo-600 font-semibold gap-1"><ArrowUpRight className="h-3 w-3" /> Pembatalan Cuci</Badge>;
                }

                // Adjustment
                if (qty > 0) {
                    return <Badge className="bg-emerald-600 hover:bg-emerald-600 font-semibold gap-1"><ArrowUpRight className="h-3 w-3" /> Penyesuaian (+)</Badge>;
                } else {
                    return <Badge className="bg-orange-600 hover:bg-orange-600 font-semibold gap-1"><ArrowDownRight className="h-3 w-3" /> Penyesuaian (-)</Badge>;
                }
            },
        },
        {
            accessorKey: "quantity",
            header: "Jumlah",
            cell: (info) => {
                const qty = info.getValue() as number;
                const sign = qty > 0 ? "+" : "";
                const colorClass = qty > 0 ? "text-green-600 dark:text-green-400 font-bold" : "text-red-600 dark:text-red-400 font-bold";
                return <span className={colorClass}>{sign}{qty} unit</span>;
            },
        },
        {
            accessorKey: "resulting_stock",
            header: "Stok Akhir",
            cell: (info) => <Badge variant="outline" className="font-semibold">{info.getValue() as number} unit</Badge>,
        },
        {
            accessorKey: "reason",
            header: "Alasan / Keterangan",
            cell: (info) => (
                <p className="text-sm max-w-sm break-words whitespace-pre-line leading-relaxed text-muted-foreground font-medium">
                    {info.getValue() as string || "-"}
                </p>
            ),
        },
    ];

    return (
        <AppLayout breadcrumbs={breadcrumbs}>
            <Head title="Riwayat Stok & Penyesuaian" />
            <div className="flex h-full flex-1 flex-col gap-4 rounded-xl p-4">
                <div className="flex justify-between items-center">
                    <Heading
                        title="Penyesuaian & Riwayat Stok"
                        description="Sesuaikan persediaan barang masuk/keluar, catat barang rusak (waste), dan lihat mutasi stok lengkap."
                    />
                    <Button
                        variant="default"
                        onClick={() => setIsAdjustModalOpen(true)}
                        className="gap-2 bg-blue-600 hover:bg-blue-700 text-white font-semibold shadow-sm transition-colors duration-200"
                    >
                        <ArrowUpDown className="h-4 w-4" /> Sesuaikan Stok
                    </Button>
                </div>

                <div className="flex items-center gap-2 max-w-sm mb-2">
                    <div className="relative w-full">
                        <Search className="absolute left-2.5 top-2.5 h-4 w-4 text-muted-foreground" />
                        <Input
                            type="text"
                            placeholder="Cari nama barang..."
                            value={searchQuery}
                            onChange={(e) => setSearchQuery(e.target.value)}
                            className="pl-8"
                        />
                    </div>
                </div>

                <DataTable columns={columns} data={movements.data} />

                {/* Pagination Bar */}
                {movements && (
                    <Pagination
                        pagination={movements}
                        onPageChange={handlePageChange}
                        label="riwayat mutasi"
                    />
                )}
            </div>

            {/* Adjustment Modal */}
            <Modal open={isAdjustModalOpen} onClose={() => setIsAdjustModalOpen(false)}>
                <ModalHeader title="Penyesuaian Stok Manual (Adjustment)" />
                <form onSubmit={handleSubmit} className="space-y-4 py-2">
                    <div>
                        <Label htmlFor="item_id" required>
                            Pilih Barang (Barang/Item)
                        </Label>
                        <Select
                            value={data.item_id}
                            onValueChange={(val) => setData("item_id", val)}
                        >
                            <SelectTrigger className="h-10 mt-1">
                                <SelectValue placeholder="Pilih barang" />
                            </SelectTrigger>
                            <SelectContent>
                                {items.map((item: ItemProp) => (
                                    <SelectItem key={item.id} value={item.id.toString()}>
                                        {item.name} (Stok: {item.stock} unit)
                                    </SelectItem>
                                ))}
                            </SelectContent>
                        </Select>
                        {errors.item_id && <p className="text-xs text-red-500 mt-1">{errors.item_id}</p>}
                    </div>

                    <div className="grid grid-cols-2 gap-4">
                        <div>
                            <Label htmlFor="type" required>
                                Tipe Penyesuaian
                            </Label>
                            <Select
                                value={data.type}
                                onValueChange={(val: any) => setData("type", val)}
                            >
                                <SelectTrigger className="h-10 mt-1">
                                    <SelectValue placeholder="Pilih tipe" />
                                </SelectTrigger>
                                <SelectContent>
                                    <SelectItem value="addition">Penambahan (+)</SelectItem>
                                    <SelectItem value="subtraction">Pengurangan (-)</SelectItem>
                                    <SelectItem value="waste">Buang Barang Rusak (Waste)</SelectItem>
                                </SelectContent>
                            </Select>
                            {errors.type && <p className="text-xs text-red-500 mt-1">{errors.type}</p>}
                        </div>

                        <div>
                            <Label htmlFor="quantity" required>
                                Jumlah Unit
                            </Label>
                            <Input
                                id="quantity"
                                type="number"
                                min="1"
                                className="h-10 mt-1"
                                placeholder="Masukkan jumlah unit"
                                value={data.quantity}
                                onChange={(e) => setData("quantity", e.target.value)}
                                required
                            />
                            {errors.quantity && <p className="text-xs text-red-500 mt-1">{errors.quantity}</p>}
                        </div>
                    </div>

                    <div>
                        <Label htmlFor="reason" required>
                            Alasan Penyesuaian / Keterangan Waste
                        </Label>
                        <Textarea
                            id="reason"
                            placeholder="Tulis alasan lengkap mengapa stok disesuaikan atau dibuang (wajib)..."
                            value={data.reason}
                            onChange={(e) => setData("reason", e.target.value)}
                            required
                        />
                        {errors.reason && <p className="text-xs text-red-500 mt-1">{errors.reason}</p>}
                    </div>

                    <div className="flex justify-end gap-2 pt-4 border-t">
                        <Button
                            type="button"
                            variant="secondary"
                            onClick={() => setIsAdjustModalOpen(false)}
                        >
                            Batal
                        </Button>
                        <Button type="submit" disabled={processing} className="bg-blue-600 hover:bg-blue-700 text-white font-semibold shadow-sm transition-colors duration-200">
                            {processing && <LoaderCircle className="mr-2 h-4 w-4 animate-spin" />}
                            Simpan Penyesuaian
                        </Button>
                    </div>
                </form>
            </Modal>
        </AppLayout>
    );
}
