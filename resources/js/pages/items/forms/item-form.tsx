import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Checkbox } from "@/components/ui/checkbox";
import { useForm } from "@inertiajs/react";
import { LoaderCircle, Search } from "lucide-react";
import { NumericFormat } from "react-number-format";
import { toast } from "sonner";
import { useState } from "react";

interface ProductProp {
    id: number;
    name: string;
    price: number;
}

interface ItemServiceProp {
    id: number;
    pivot: {
        quantity: number;
    };
}

interface Item {
    id: number;
    sku?: string | null;
    name: string;
    description?: string | null;
    price: number | string;
    stock?: number;
    products?: ItemServiceProp[];
}

interface Props {
    item?: Item;
    products: ProductProp[];
    onSuccess: () => void;
    onCancel: () => void;
}

export default function ItemForm({ item, products, onSuccess, onCancel }: Props) {
    const isEditMode = !!item;
    const [searchQuery, setSearchQuery] = useState("");

    // Initialize services that are already associated with the item
    const initialServices = item?.products?.map((p) => ({
        id: p.id,
        quantity: p.pivot.quantity,
    })) || [];

    const { data, setData, post, patch, processing, errors, reset } = useForm({
        sku: item?.sku || "",
        name: item?.name || "",
        description: item?.description || "",
        price: item?.price?.toString() || "",
        stock: item?.stock?.toString() || "0", // Initial stock only for creation
        services: initialServices as { id: number; quantity: number }[],
    });

    const filteredProducts = products.filter((p) =>
        p.name.toLowerCase().includes(searchQuery.toLowerCase())
    );

    function handleServiceToggle(productId: number, checked: boolean) {
        if (checked) {
            setData("services", [...data.services, { id: productId, quantity: 1 }]);
        } else {
            setData(
                "services",
                data.services.filter((s) => s.id !== productId)
            );
        }
    }

    function handleServiceQtyChange(productId: number, qty: number) {
        setData(
            "services",
            data.services.map((s) => (s.id === productId ? { ...s, quantity: qty } : s))
        );
    }

    function handleSubmit(e: React.FormEvent<HTMLFormElement>) {
        e.preventDefault();

        if (isEditMode) {
            patch(route("items.update", item.id), {
                onSuccess: () => {
                    toast.success("Barang berhasil diperbarui.");
                    onSuccess();
                },
                onError: (err) => {
                    console.error("Update failed:", err);
                },
            });
        } else {
            post(route("items.store"), {
                onSuccess: () => {
                    reset();
                    toast.success("Barang baru berhasil ditambahkan.");
                    onSuccess();
                },
                onError: (err) => {
                    console.error("Creation failed:", err);
                },
            });
        }
    }

    return (
        <form onSubmit={handleSubmit} className="space-y-6">
            <fieldset disabled={processing} className="space-y-4">
                <div className="grid grid-cols-2 gap-4">
                    <div>
                        <Label htmlFor="sku">SKU (Kode Barang)</Label>
                        <Input
                            id="sku"
                            type="text"
                            placeholder="Contoh: SHM-01"
                            value={data.sku}
                            onChange={(e) => setData("sku", e.target.value)}
                        />
                        {errors.sku && <p className="text-xs text-red-500 mt-1">{errors.sku}</p>}
                    </div>

                    <div>
                        <Label htmlFor="name" required>
                            Nama Barang
                        </Label>
                        <Input
                            id="name"
                            type="text"
                            placeholder="Contoh: Shampoo Salju premium"
                            value={data.name}
                            onChange={(e) => setData("name", e.target.value)}
                        />
                        {errors.name && <p className="text-xs text-red-500 mt-1">{errors.name}</p>}
                    </div>
                </div>

                <div className="grid grid-cols-2 gap-4">
                    <div>
                        <Label htmlFor="price" required>
                            Harga Jual (Rp)
                        </Label>
                        <NumericFormat
                            id="price"
                            customInput={Input}
                            prefix={"Rp "}
                            thousandSeparator="."
                            decimalSeparator=","
                            value={data.price}
                            onValueChange={(values) => {
                                setData("price", values.floatValue?.toString() || "");
                            }}
                        />
                        {errors.price && <p className="text-xs text-red-500 mt-1">{errors.price}</p>}
                    </div>

                    {!isEditMode && (
                        <div>
                            <Label htmlFor="stock">Stok Awal</Label>
                            <Input
                                id="stock"
                                type="number"
                                min="0"
                                value={data.stock}
                                onChange={(e) => setData("stock", e.target.value)}
                            />
                            {errors.stock && (
                                <p className="text-xs text-red-500 mt-1">{errors.stock}</p>
                            )}
                        </div>
                    )}
                </div>

                <div>
                    <Label htmlFor="description">Deskripsi</Label>
                    <Textarea
                        id="description"
                        placeholder="Deskripsi singkat mengenai barang"
                        value={data.description}
                        onChange={(e) => setData("description", e.target.value)}
                    />
                    {errors.description && (
                        <p className="text-xs text-red-500 mt-1">{errors.description}</p>
                    )}
                </div>

                <hr className="my-4" />

                <div>
                    <Label className="text-sm font-semibold block mb-2">
                        Pilih Layanan / Service Cuci Yang Menggunakan Barang Ini:
                    </Label>
                    <p className="text-xs text-muted-foreground mb-4">
                        Tentukan layanan mana saja yang menggunakan barang ini secara otomatis ketika dicuci, beserta jumlah penggunaannya.
                    </p>

                    <div className="relative mb-3">
                        <Search className="absolute left-2.5 top-2.5 h-4 w-4 text-muted-foreground" />
                        <Input
                            type="text"
                            placeholder="Cari layanan cuci..."
                            value={searchQuery}
                            onChange={(e) => setSearchQuery(e.target.value)}
                            className="pl-8"
                        />
                    </div>

                    <div className="border rounded-md max-h-48 overflow-y-auto divide-y">
                        {filteredProducts.length === 0 ? (
                            <div className="p-4 text-center text-sm text-muted-foreground">
                                Tidak ada layanan cuci ditemukan.
                            </div>
                        ) : (
                            filteredProducts.map((p) => {
                                const selectedSvc = data.services.find((s) => s.id === p.id);
                                const isChecked = !!selectedSvc;

                                return (
                                    <div
                                        key={p.id}
                                        className="flex items-center justify-between p-3 hover:bg-muted/50 transition-colors"
                                    >
                                        <div className="flex items-center gap-3">
                                            <Checkbox
                                                id={`svc-${p.id}`}
                                                checked={isChecked}
                                                onCheckedChange={(checked) =>
                                                    handleServiceToggle(p.id, !!checked)
                                                }
                                            />
                                            <Label
                                                htmlFor={`svc-${p.id}`}
                                                className="cursor-pointer font-medium text-sm"
                                            >
                                                {p.name}
                                            </Label>
                                        </div>

                                        {isChecked && (
                                            <div className="flex items-center gap-2">
                                                <span className="text-xs text-muted-foreground">Jumlah dikonsumsi:</span>
                                                <Input
                                                    type="number"
                                                    min="1"
                                                    className="w-16 h-8 text-center"
                                                    value={selectedSvc.quantity}
                                                    onChange={(e) =>
                                                        handleServiceQtyChange(
                                                            p.id,
                                                            parseInt(e.target.value) || 1
                                                        )
                                                    }
                                                />
                                            </div>
                                        )}
                                    </div>
                                );
                            })
                        )}
                    </div>
                </div>
            </fieldset>

            <div className="flex justify-end gap-2 pt-2 border-t">
                <Button type="button" variant="secondary" onClick={onCancel}>
                    Batal
                </Button>
                <Button type="submit" disabled={processing}>
                    {processing && <LoaderCircle className="mr-2 h-4 w-4 animate-spin" />}
                    {isEditMode ? "Simpan Perubahan" : "Tambah Barang"}
                </Button>
            </div>
        </form>
    );
}
