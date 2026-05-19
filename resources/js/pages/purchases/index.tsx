import Heading from "@/components/heading";
import { Button } from "@/components/ui/button";
import { Modal, ModalHeader } from "@/components/ui/modal";
import AppLayout from "@/layouts/app-layout";
import { BreadcrumbItem, PageProps, Paginated } from "@/types";
import { Head, usePage, useForm, router, Link } from "@inertiajs/react";
import { Plus, Trash2, Calendar, FileText, ShoppingCart, LoaderCircle, Truck, Info } from "lucide-react";
import { useState } from "react";
import { NumericFormat } from "react-number-format";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Badge } from "@/components/ui/badge";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { toast } from "sonner";
import { format } from "date-fns";
import { Pagination } from "@/components/ui/pagination";
import { DataTable } from "@/components/ui/data-table";
import { ColumnDef } from "@tanstack/react-table";

const breadcrumbs: BreadcrumbItem[] = [
    {
        title: "Pembelian Stok",
        href: "/purchases",
    },
];

interface ItemProp {
    id: number;
    sku: string | null;
    name: string;
    stock: number;
    price: number;
}

interface PurchaseItemProp {
    id: number;
    item_id: number;
    quantity: number;
    cost_price: number;
    subtotal: number;
    item: {
        sku: string | null;
        name: string;
    };
}

interface PurchaseProp {
    id: number;
    purchase_date: string;
    invoice_number: string | null;
    supplier_id: number | null;
    supplier: {
        id: number;
        name: string;
    } | null;
    total_amount: number;
    notes: string | null;
    items: PurchaseItemProp[];
    created_at: string;
}

export default function PurchaseIndex() {
    const { props } = usePage<
        PageProps<{
            purchases: Paginated<PurchaseProp>;
            items: ItemProp[];
            suppliers: Array<{ id: number; name: string; contact_person?: string }>;
        }>
    >();
    const purchases = props.purchases;
    const items = props.items;
    const suppliers = props.suppliers;

    const [isAddModalOpen, setIsAddModalOpen] = useState(false);
    const [selectedPurchaseDetail, setSelectedPurchaseDetail] = useState<PurchaseProp | null>(null);
    const [isDetailModalOpen, setIsDetailModalOpen] = useState(false);

    // Dynamic lines for the purchase form
    const [lines, setLines] = useState<Array<{ item_id: string; quantity: number; cost_price: string }>>([
        { item_id: "", quantity: 1, cost_price: "" }
    ]);

    const { data, setData, post, processing, errors, reset } = useForm({
        purchase_date: new Date().toISOString().substring(0, 10),
        invoice_number: "",
        supplier_id: "" as string | number,
        notes: "",
        items: [] as Array<{ item_id: number; quantity: number; cost_price: number }>,
    });

    const formatCurrency = (val: number) => {
        return new Intl.NumberFormat("id-ID", {
            style: "currency",
            currency: "IDR",
            minimumFractionDigits: 0,
        }).format(val);
    };

    function addLine() {
        setLines([...lines, { item_id: "", quantity: 1, cost_price: "" }]);
    }

    function removeLine(index: number) {
        if (lines.length > 1) {
            setLines(lines.filter((_, idx) => idx !== index));
        }
    }

    function handleLineChange(index: number, field: string, value: any) {
        const newLines = lines.map((line, idx) => {
            if (idx === index) {
                return { ...line, [field]: value };
            }
            return line;
        });
        setLines(newLines);
    }

    // Grand total calculation for current input lines
    const grandTotal = lines.reduce((total, line) => {
        const qty = line.quantity || 0;
        const price = parseFloat(line.cost_price) || 0;
        return total + qty * price;
    }, 0);

    function handleSubmit(e: React.FormEvent<HTMLFormElement>) {
        e.preventDefault();

        // Validate lines
        const formattedLines = lines
            .filter((l) => l.item_id !== "")
            .map((l) => ({
                item_id: parseInt(l.item_id),
                quantity: l.quantity,
                cost_price: parseFloat(l.cost_price) || 0,
            }));

        if (formattedLines.length === 0) {
            toast.error("Silakan pilih minimal satu barang untuk dibeli.");
            return;
        }

        // Since we want to send the compiled items, we can use router.post instead of the local form post
        router.post(route("purchases.store"), {
            ...data,
            items: formattedLines
        }, {
            onSuccess: () => {
                reset();
                setLines([{ item_id: "", quantity: 1, cost_price: "" }]);
                setIsAddModalOpen(false);
                toast.success("Pembelian stok berhasil disimpan.");
            },
            onError: (err: any) => {
                console.error("Purchase error", err);
                if (err.items) {
                    toast.error(err.items);
                } else {
                    toast.error("Terjadi kesalahan saat memproses pembelian.");
                }
            }
        });
    }

    const columns: ColumnDef<PurchaseProp>[] = [
        {
            accessorKey: "invoice_number",
            header: "No. Nota / Invoice",
            cell: ({ row }) => (
                <span className="font-semibold font-mono text-sm">
                    {row.original.invoice_number || (
                        <span className="text-muted-foreground italic font-sans font-normal">-</span>
                    )}
                </span>
            )
        },
        {
            accessorKey: "purchase_date",
            header: "Tanggal",
            cell: ({ row }) => (
                <div className="flex items-center gap-1.5 text-sm">
                    <Calendar className="h-3.5 w-3.5 text-muted-foreground" />
                    <span>{format(new Date(row.original.purchase_date), "dd MMM yyyy")}</span>
                </div>
            )
        },
        {
            id: "supplier",
            header: "Supplier",
            cell: ({ row }) => {
                const purchase = row.original;
                return purchase.supplier ? (
                    <div className="flex items-center gap-1.5">
                        <Truck className="h-3.5 w-3.5 text-blue-600 dark:text-blue-400" />
                        <span className="font-medium text-foreground">{purchase.supplier.name}</span>
                    </div>
                ) : (
                    <span className="text-muted-foreground text-xs italic">Tanpa Supplier</span>
                );
            }
        },
        {
            accessorKey: "notes",
            header: "Catatan",
            cell: ({ row }) => (
                <span className="text-xs text-muted-foreground line-clamp-2 max-w-xs block">
                    {row.original.notes || "-"}
                </span>
            )
        },
        {
            accessorKey: "total_amount",
            header: () => <div className="text-right">Total Pembelian</div>,
            cell: ({ row }) => (
                <div className="text-right font-extrabold text-blue-600 text-sm">
                    {formatCurrency(row.original.total_amount)}
                </div>
            )
        },
        {
            id: "actions",
            header: () => <div className="text-center w-24">Aksi</div>,
            cell: ({ row }) => (
                <div className="text-center">
                    <Button
                        size="sm"
                        variant="outline"
                        className="h-8 gap-1 font-semibold"
                        onClick={() => {
                            setSelectedPurchaseDetail(row.original);
                            setIsDetailModalOpen(true);
                        }}
                    >
                        <Info className="h-3.5 w-3.5" /> Detail
                    </Button>
                </div>
            )
        }
    ];

    return (
        <AppLayout breadcrumbs={breadcrumbs}>
            <Head title="Pembelian Stok Barang" />
            <div className="flex h-full flex-1 flex-col gap-4 rounded-xl p-4">
                <div className="flex justify-between items-center">
                    <Heading
                        title="Pembelian Stok (Purchasing)"
                        description="Catat pembelian stok barang masuk dari supplier untuk memperbarui persediaan."
                    />
                    <Button
                        variant="default"
                        onClick={() => setIsAddModalOpen(true)}
                        className="gap-2 bg-blue-600 hover:bg-blue-700 text-white font-semibold shadow-sm transition-colors duration-200"
                    >
                        <Plus className="h-4 w-4" /> Catat Pembelian
                    </Button>
                </div>

                <DataTable columns={columns} data={purchases.data} />

                {purchases && (
                    <div className="px-6 pb-6">
                        <Pagination
                            pagination={purchases}
                            label="pembelian stok"
                            className="border-none mt-0 pt-6"
                        />
                    </div>
                )}
            </div>

            {/* Record Purchase Modal */}
            <Modal open={isAddModalOpen} onClose={() => setIsAddModalOpen(false)} className="max-w-4xl">
                <ModalHeader title="Catat Pembelian Stok Baru" />
                <form onSubmit={handleSubmit} className="space-y-4 max-h-[80vh] overflow-y-auto px-1 py-2">
                    <div className="grid grid-cols-2 gap-4">
                        <div>
                            <Label htmlFor="purchase_date" required>
                                Tanggal Pembelian
                            </Label>
                            <Input
                                id="purchase_date"
                                type="date"
                                value={data.purchase_date}
                                onChange={(e) => setData("purchase_date", e.target.value)}
                                required
                            />
                            {errors.purchase_date && (
                                <p className="text-xs text-red-500 mt-1">{errors.purchase_date}</p>
                            )}
                        </div>

                        <div>
                            <Label htmlFor="invoice_number">Nomor Invoice / Kuitansi</Label>
                            <Input
                                id="invoice_number"
                                type="text"
                                placeholder="Contoh: INV-2026-0001"
                                value={data.invoice_number}
                                onChange={(e) => setData("invoice_number", e.target.value)}
                            />
                            {errors.invoice_number && (
                                <p className="text-xs text-red-500 mt-1">{errors.invoice_number}</p>
                            )}
                        </div>
                    </div>

                    <div>
                        <Label htmlFor="supplier_id">Supplier (Pemasok)</Label>
                        <Select
                            value={data.supplier_id ? String(data.supplier_id) : "none"}
                            onValueChange={(val) => setData("supplier_id", val === "none" ? "" : val)}
                        >
                            <SelectTrigger id="supplier_id" className="w-full">
                                <SelectValue placeholder="Pilih Supplier (Opsional)..." />
                            </SelectTrigger>
                            <SelectContent>
                                <SelectItem value="none">Pilih Supplier (Opsional)...</SelectItem>
                                {suppliers && suppliers.map((supplier: any) => (
                                    <SelectItem key={supplier.id} value={String(supplier.id)}>
                                        {supplier.name} {supplier.contact_person ? `(PIC: ${supplier.contact_person})` : ""}
                                    </SelectItem>
                                ))}
                            </SelectContent>
                        </Select>
                        {errors.supplier_id && (
                            <p className="text-xs text-red-500 mt-1">{errors.supplier_id}</p>
                        )}
                    </div>

                    <div>
                        <Label htmlFor="notes">Keterangan / Catatan Supplier</Label>
                        <Textarea
                            id="notes"
                            placeholder="Supplier: PT. Indowash, dll"
                            value={data.notes}
                            onChange={(e) => setData("notes", e.target.value)}
                        />
                        {errors.notes && <p className="text-xs text-red-500 mt-1">{errors.notes}</p>}
                    </div>

                    <hr className="my-4" />

                    <div>
                        <div className="flex justify-between items-center mb-2">
                            <Label className="text-sm font-semibold">Daftar Item Barang:</Label>
                            <Button
                                type="button"
                                variant="outline"
                                size="sm"
                                onClick={addLine}
                                className="h-8 gap-1.5"
                            >
                                <Plus className="h-3.5 w-3.5" /> Tambah Baris
                            </Button>
                        </div>

                        <div className="space-y-3">
                            {lines.map((line: any, idx: number) => (
                                <div key={idx} className="flex gap-2 items-end border p-3 rounded-md bg-muted/20">
                                    <div className="flex-1">
                                        <Label className="text-xs mb-1 block">Barang</Label>
                                        <Select
                                            value={line.item_id}
                                            onValueChange={(val) => handleLineChange(idx, "item_id", val)}
                                        >
                                            <SelectTrigger className="h-9">
                                                <SelectValue placeholder="Pilih barang" />
                                            </SelectTrigger>
                                            <SelectContent>
                                                {items.map((item: ItemProp) => (
                                                    <SelectItem key={item.id} value={item.id.toString()}>
                                                        {item.name} ({item.stock} unit)
                                                    </SelectItem>
                                                ))}
                                            </SelectContent>
                                        </Select>
                                    </div>

                                    <div className="w-20">
                                        <Label className="text-xs mb-1 block">Jumlah</Label>
                                        <Input
                                            type="number"
                                            min="1"
                                            className="h-9 text-center"
                                            value={line.quantity}
                                            onChange={(e) =>
                                                handleLineChange(
                                                    idx,
                                                    "quantity",
                                                    parseInt(e.target.value) || 1
                                                )
                                            }
                                            required
                                        />
                                    </div>

                                    <div className="w-32">
                                        <Label className="text-xs mb-1 block">Harga Beli (Satuan)</Label>
                                        <NumericFormat
                                            customInput={Input}
                                            prefix={"Rp "}
                                            thousandSeparator="."
                                            decimalSeparator=","
                                            className="h-9"
                                            placeholder="Rp"
                                            value={line.cost_price}
                                            onValueChange={(values) =>
                                                handleLineChange(idx, "cost_price", values.floatValue?.toString() || "")
                                            }
                                            required
                                        />
                                    </div>

                                    <Button
                                        type="button"
                                        variant="destructive"
                                        size="icon"
                                        className="h-9 w-9 shrink-0"
                                        onClick={() => removeLine(idx)}
                                        disabled={lines.length === 1}
                                    >
                                        <Trash2 className="h-4 w-4" />
                                    </Button>
                                </div>
                            ))}
                        </div>
                    </div>

                    <div className="flex justify-between items-center p-3 rounded-lg border bg-muted/30 mt-6">
                        <span className="font-bold text-sm">Total Pembelian:</span>
                        <span className="font-extrabold text-lg text-primary">
                            {formatCurrency(grandTotal)}
                        </span>
                    </div>

                    <div className="flex justify-end gap-2 pt-4 border-t">
                        <Button
                            type="button"
                            variant="secondary"
                            onClick={() => setIsAddModalOpen(false)}
                        >
                            Batal
                        </Button>
                        <Button type="submit" disabled={processing} className="bg-blue-600 hover:bg-blue-700 text-white font-semibold shadow-sm transition-colors duration-200">
                            {processing && <LoaderCircle className="mr-2 h-4 w-4 animate-spin" />}
                            Simpan Pembelian
                        </Button>
                    </div>
                </form>
            </Modal>

            {/* Purchase Detail Modal */}
            <Modal open={isDetailModalOpen} onClose={() => setIsDetailModalOpen(false)} className="max-w-4xl">
                <ModalHeader title="Detail Transaksi Pembelian" />
                {selectedPurchaseDetail && (
                    <div className="space-y-6 px-1 py-2 max-h-[80vh] overflow-y-auto">
                        {/* Summary Cards */}
                        <div className="grid grid-cols-2 gap-4">
                            <div className="bg-muted/30 p-3 rounded-lg border">
                                <span className="text-xs text-muted-foreground block mb-1">Invoice / No. Nota</span>
                                <span className="font-mono font-bold text-foreground">
                                    {selectedPurchaseDetail.invoice_number || "-"}
                                </span>
                            </div>
                            <div className="bg-muted/30 p-3 rounded-lg border">
                                <span className="text-xs text-muted-foreground block mb-1">Tanggal Transaksi</span>
                                <span className="font-semibold text-foreground">
                                    {format(new Date(selectedPurchaseDetail.purchase_date), "dd MMMM yyyy")}
                                </span>
                            </div>
                            <div className="bg-muted/30 p-3 rounded-lg border">
                                <span className="text-xs text-muted-foreground block mb-1">Supplier</span>
                                <span className="font-semibold text-foreground flex items-center gap-1">
                                    {selectedPurchaseDetail.supplier ? (
                                        <>
                                            <Truck className="h-3.5 w-3.5 text-blue-600 dark:text-blue-400" />
                                            {selectedPurchaseDetail.supplier.name}
                                        </>
                                    ) : (
                                        <span className="italic text-muted-foreground">Tanpa Supplier</span>
                                    )}
                                </span>
                            </div>
                            <div className="bg-muted/30 p-3 rounded-lg border">
                                <span className="text-xs text-muted-foreground block mb-1">Total Pembelian</span>
                                <span className="font-extrabold text-blue-600 dark:text-blue-400">
                                    {formatCurrency(selectedPurchaseDetail.total_amount)}
                                </span>
                            </div>
                        </div>

                        {selectedPurchaseDetail.notes && (
                            <div className="bg-amber-500/5 text-amber-800 dark:text-amber-300 border border-amber-500/10 p-3 rounded-lg text-sm">
                                <span className="font-bold block mb-1">Catatan / Keterangan:</span>
                                {selectedPurchaseDetail.notes}
                            </div>
                        )}

                        {/* Items Table */}
                        <div className="border rounded-lg overflow-hidden bg-card">
                            <Table>
                                <TableHeader className="bg-muted/40">
                                    <TableRow>
                                        <TableHead className="font-semibold">Nama Barang</TableHead>
                                        <TableHead className="font-semibold text-center">Jumlah</TableHead>
                                        <TableHead className="font-semibold text-right">Harga Beli</TableHead>
                                        <TableHead className="font-semibold text-right">Subtotal</TableHead>
                                    </TableRow>
                                </TableHeader>
                                <TableBody>
                                    {selectedPurchaseDetail.items.map((line) => (
                                        <TableRow key={line.id}>
                                            <TableCell>
                                                <span className="font-semibold block text-sm">{line.item?.name || "Barang Terhapus"}</span>
                                                {line.item?.sku && (
                                                    <span className="font-mono text-xs text-muted-foreground block uppercase mt-0.5">SKU: {line.item.sku}</span>
                                                )}
                                            </TableCell>
                                            <TableCell className="text-center font-medium">
                                                {line.quantity} unit
                                            </TableCell>
                                            <TableCell className="text-right text-muted-foreground">
                                                {formatCurrency(line.cost_price)}
                                            </TableCell>
                                            <TableCell className="text-right font-bold text-foreground">
                                                {formatCurrency(line.subtotal)}
                                            </TableCell>
                                        </TableRow>
                                    ))}
                                </TableBody>
                            </Table>
                        </div>

                        <div className="flex justify-end pt-2">
                            <Button variant="outline" onClick={() => setIsDetailModalOpen(false)} className="px-6">
                                Tutup
                            </Button>
                        </div>
                    </div>
                )}
            </Modal>
        </AppLayout>
    );
}
