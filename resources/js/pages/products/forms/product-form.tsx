import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Checkbox } from "@/components/ui/checkbox";
import { useForm } from "@inertiajs/react";
import { LoaderCircle, Plus, Trash } from "lucide-react";
import { NumericFormat } from "react-number-format";
import { toast } from "sonner";
import Swal from "sweetalert2";
import React, { useMemo } from "react";

interface ProductSplitProp {
    id: number;
    product_id: number;
    party_id: number;
    percentage: number;
    party?: {
        id: number;
        name: string;
    };
}

interface Product {
    id: number | string;
    name: string;
    description: string;
    price: number;
    is_active: boolean;
    is_split_profits: boolean;
    splits?: ProductSplitProp[];
}

interface Props {
    product?: Product;
    parties: { id: number; name: string }[];
    onSuccess: () => void;
    onCancel: () => void;
}

export default function ProductForm({
    product,
    parties,
    onSuccess,
    onCancel,
}: Props) {
    const isEditMode = !!product;

    const initialSplits =
        product?.splits?.map((s) => ({
            party_id: s.party_id.toString(),
            percentage: s.percentage.toString(),
        })) || [];

    const { data, setData, post, patch, processing, errors, reset } = useForm({
        name: product?.name || "",
        description: product?.description || "",
        price: product?.price?.toString() || "",
        is_active: product?.is_active ?? true,
        is_split_profits: product?.is_split_profits || false,
        splits: initialSplits as { party_id: string; percentage: string }[],
    });

    const totalPercentage = useMemo(() => {
        return data.splits.reduce(
            (acc, curr) => acc + (parseFloat(curr.percentage) || 0),
            0,
        );
    }, [data.splits]);

    function handleAddSplit() {
        // Find a party that is not yet selected, if any
        const selectedPartyIds = data.splits.map((s) => s.party_id);
        const availableParty = parties.find(
            (p) => !selectedPartyIds.includes(p.id.toString()),
        );

        setData("splits", [
            ...data.splits,
            {
                party_id: availableParty ? availableParty.id.toString() : "",
                percentage: "",
            },
        ]);
    }

    function handleRemoveSplit(index: number) {
        setData(
            "splits",
            data.splits.filter((_, i) => i !== index),
        );
    }

    function handleSplitChange(
        index: number,
        field: "party_id" | "percentage",
        value: string,
    ) {
        const newSplits = [...data.splits];
        newSplits[index] = {
            ...newSplits[index],
            [field]: value,
        };
        setData("splits", newSplits);
    }

    function handleSubmit(e: React.FormEvent<HTMLFormElement>) {
        e.preventDefault();

        if (data.is_split_profits) {
            if (data.splits.length === 0) {
                Swal.fire({
                    icon: "error",
                    title: "Bagi Hasil Kosong",
                    text: "Silakan tambahkan minimal satu pihak pembagian hasil.",
                    confirmButtonText: "OK",
                    confirmButtonColor: "#3b82f6",
                });
                return;
            }

            if (
                data.splits.some(
                    (s) =>
                        !s.party_id ||
                        !s.percentage ||
                        parseFloat(s.percentage) <= 0,
                )
            ) {
                Swal.fire({
                    icon: "error",
                    title: "Data Tidak Valid",
                    text: "Harap pastikan semua pihak dipilih dan persentase diisi dengan angka positif.",
                    confirmButtonText: "OK",
                    confirmButtonColor: "#3b82f6",
                });
                return;
            }

            if (Math.abs(totalPercentage - 100) > 0.01) {
                Swal.fire({
                    icon: "error",
                    title: "Total Persentase Salah",
                    text: `Total persentase pembagian hasil harus tepat 100%. Saat ini: ${totalPercentage}%`,
                    confirmButtonText: "OK",
                    confirmButtonColor: "#3b82f6",
                });
                return;
            }
        }

        if (isEditMode) {
            patch(route("products.update", product.id), {
                onSuccess: () => {
                    toast.success(
                        "Perubahan pada produk telah berhasil disimpan.",
                    );
                    onSuccess();
                },
                onError: (errors) => {
                    console.error("Update failed:", errors);
                },
            });
        } else {
            post(route("products.store"), {
                onSuccess: () => {
                    reset();
                    toast.success("Produk baru telah berhasil ditambahkan.");
                    onSuccess();
                },
                onError: (errors) => {
                    console.error("Creation failed:", errors);
                },
            });
        }
    }

    return (
        <form
            onSubmit={handleSubmit}
            className="space-y-6 max-h-[75vh] overflow-y-auto"
        >
            <fieldset disabled={processing} className="space-y-4">
                <div>
                    <Label htmlFor="name" required>
                        Nama Produk
                    </Label>
                    <Input
                        id="name"
                        type="text"
                        value={data.name}
                        onChange={(e) => setData("name", e.target.value)}
                        placeholder="Contoh: Cuci Body Premium"
                        className="mt-1"
                    />
                    {errors.name && (
                        <p className="text-sm text-red-600 mt-1">
                            {errors.name}
                        </p>
                    )}
                </div>

                <div>
                    <Label htmlFor="price" required>
                        Harga Produk
                    </Label>
                    <NumericFormat
                        id="price"
                        customInput={Input}
                        prefix={"Rp "}
                        thousandSeparator="."
                        decimalSeparator=","
                        value={data.price}
                        onValueChange={(values) => {
                            setData(
                                "price",
                                values.floatValue?.toString() || "",
                            );
                        }}
                        placeholder="Contoh: Rp 50.000"
                        className="mt-1"
                    />
                    {errors.price && (
                        <p className="text-sm text-red-600 mt-1">
                            {errors.price}
                        </p>
                    )}
                </div>

                <div>
                    <Label htmlFor="description">Deskripsi Produk</Label>
                    <Textarea
                        id="description"
                        value={data.description}
                        onChange={(e) => setData("description", e.target.value)}
                        placeholder="Keterangan mengenai produk..."
                        className="mt-1"
                    />
                    {errors.description && (
                        <p className="text-sm text-red-600 mt-1">
                            {errors.description}
                        </p>
                    )}
                </div>

                {/* Is Active Checkbox Section */}
                <div className="pt-4 border-t space-y-4">
                    <div className="flex items-center gap-3">
                        <Checkbox
                            id="is_active"
                            checked={data.is_active}
                            onCheckedChange={(checked) => {
                                setData("is_active", !!checked);
                            }}
                        />
                        <div className="grid gap-1.5 leading-none">
                            <Label
                                htmlFor="is_active"
                                className="cursor-pointer font-semibold text-sm"
                            >
                                Status Aktif
                            </Label>
                            <p className="text-xs text-muted-foreground">
                                Centang jika produk ini masih aktif dan dapat dipilih saat transaksi.
                            </p>
                        </div>
                    </div>
                </div>

                {/* Profit Split Checkbox Section */}
                <div className="pt-4 border-t space-y-4">
                    <div className="flex items-center gap-3">
                        <Checkbox
                            id="is_split_profits"
                            checked={data.is_split_profits}
                            onCheckedChange={(checked) => {
                                setData("is_split_profits", !!checked);
                                if (checked && data.splits.length === 0) {
                                    // Add first split automatically
                                    const firstParty = parties[0];
                                    setData("splits", [
                                        {
                                            party_id: firstParty
                                                ? firstParty.id.toString()
                                                : "",
                                            percentage: "100",
                                        },
                                    ]);
                                }
                            }}
                        />
                        <div className="grid gap-1.5 leading-none">
                            <Label
                                htmlFor="is_split_profits"
                                className="cursor-pointer font-semibold text-sm"
                            >
                                Aktifkan Pembagian Hasil (Profit Sharing)
                            </Label>
                            <p className="text-xs text-muted-foreground">
                                Centang jika laba / omset dari penjualan produk
                                ini dibagi ke beberapa pihak (misal: owner,
                                investor).
                            </p>
                        </div>
                    </div>

                    {/* Dynamic Splits Management */}
                    {data.is_split_profits && (
                        <div className="bg-muted/30 border rounded-lg p-4 space-y-4">
                            <div className="flex justify-between items-center">
                                <Label className="text-sm font-semibold">
                                    Pengaturan Bagi Hasil
                                </Label>
                                <Button
                                    type="button"
                                    variant="outline"
                                    size="sm"
                                    onClick={handleAddSplit}
                                    disabled={
                                        data.splits.length >= parties.length
                                    }
                                    className="h-8 text-xs flex items-center gap-1"
                                >
                                    <Plus className="h-3 w-3" /> Tambah Pihak
                                </Button>
                            </div>

                            {parties.length === 0 ? (
                                <div className="text-xs text-destructive italic">
                                    Belum ada data Pihak master. Harap tambahkan
                                    Master Pihak Bagi Hasil terlebih dahulu.
                                </div>
                            ) : (
                                <div className="space-y-2">
                                    {data.splits.map((split, index) => (
                                        <div
                                            key={index}
                                            className="flex items-center gap-2"
                                        >
                                            {/* Select Party */}
                                            <div className="flex-1">
                                                <select
                                                    value={split.party_id}
                                                    onChange={(e) =>
                                                        handleSplitChange(
                                                            index,
                                                            "party_id",
                                                            e.target.value,
                                                        )
                                                    }
                                                    className="flex h-9 w-full rounded-md border border-input bg-card px-3 py-1 text-sm shadow-xs focus-visible:outline-hidden focus-visible:ring-1 focus-visible:ring-ring"
                                                >
                                                    <option value="" disabled>
                                                        -- Pilih Pihak --
                                                    </option>
                                                    {parties.map((p) => {
                                                        // Disable option if it is selected in another row
                                                        const isSelectedElsewhere =
                                                            data.splits.some(
                                                                (s, idx) =>
                                                                    s.party_id ===
                                                                        p.id.toString() &&
                                                                    idx !==
                                                                        index,
                                                            );
                                                        return (
                                                            <option
                                                                key={p.id}
                                                                value={p.id.toString()}
                                                                disabled={
                                                                    isSelectedElsewhere
                                                                }
                                                            >
                                                                {p.name}
                                                            </option>
                                                        );
                                                    })}
                                                </select>
                                            </div>

                                            {/* Percentage */}
                                            <div className="w-[120px] flex items-center gap-1">
                                                <Input
                                                    type="number"
                                                    min="0"
                                                    max="100"
                                                    placeholder="Laba %"
                                                    value={split.percentage}
                                                    onChange={(e) =>
                                                        handleSplitChange(
                                                            index,
                                                            "percentage",
                                                            e.target.value,
                                                        )
                                                    }
                                                    className="text-center h-9"
                                                />
                                                <span className="text-sm font-semibold">
                                                    %
                                                </span>
                                            </div>

                                            {/* Remove Button */}
                                            <Button
                                                type="button"
                                                variant="ghost"
                                                size="icon"
                                                onClick={() =>
                                                    handleRemoveSplit(index)
                                                }
                                                className="h-9 w-9 text-destructive hover:bg-destructive/10"
                                            >
                                                <Trash className="h-4 w-4" />
                                            </Button>
                                        </div>
                                    ))}

                                    {/* Splits Total / Validation */}
                                    <div className="flex justify-between items-center pt-2 border-t text-xs">
                                        <span className="text-muted-foreground">
                                            Total Persentase:
                                        </span>
                                        <span
                                            className={`font-bold ${Math.abs(totalPercentage - 100) < 0.01 ? "text-emerald-600" : "text-red-500"}`}
                                        >
                                            {totalPercentage}%{" "}
                                            {Math.abs(totalPercentage - 100) <
                                            0.01
                                                ? "✓ (Sesuai)"
                                                : "✗ (Harus 100%)"}
                                        </span>
                                    </div>
                                    {errors.splits && (
                                        <p className="text-xs text-red-600 mt-1">
                                            {errors.splits}
                                        </p>
                                    )}
                                </div>
                            )}
                        </div>
                    )}
                </div>
            </fieldset>

            <div className="flex justify-end gap-2 mt-6">
                <Button
                    type="button"
                    variant="secondary"
                    size="lg"
                    onClick={onCancel}
                >
                    Batal
                </Button>
                <Button
                    type="submit"
                    variant="default"
                    size="lg"
                    disabled={processing}
                >
                    {processing && (
                        <LoaderCircle className="mr-2 h-4 w-4 animate-spin" />
                    )}
                    {isEditMode ? "Simpan Perubahan" : "Tambahkan Produk"}
                </Button>
            </div>
        </form>
    );
}
