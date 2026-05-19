import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { useForm } from "@inertiajs/react";
import { LoaderCircle } from "lucide-react";
import { toast } from "sonner";
import React from "react";
import { NumericFormat } from "react-number-format";

interface IncentiveTier {
    id: number;
    name: string;
    min_cars: number;
    max_cars: number | null;
    commission: number;
}

interface Props {
    tier?: IncentiveTier | null;
    onSuccess: () => void;
    onCancel: () => void;
}

export default function IncentiveTierForm({ tier, onSuccess, onCancel }: Props) {
    const isEditMode = !!tier;

    const { data, setData, post, patch, processing, errors, reset, transform } = useForm({
        name: tier?.name || "",
        min_cars: tier?.min_cars ?? 0,
        max_cars: tier?.max_cars ?? "",
        commission: tier?.commission?.toString() || "0",
    });

    // Use transform to prepare the payload before it is submitted
    React.useEffect(() => {
        transform((data) => ({
            ...data,
            max_cars: data.max_cars === "" ? null : Number(data.max_cars),
            commission: Number(data.commission) || 0,
        }));
    }, [data.max_cars, data.commission]);

    function handleSubmit(e: React.FormEvent<HTMLFormElement>) {
        e.preventDefault();

        if (isEditMode) {
            patch(route("incentive-tiers.update", tier.id), {
                onSuccess: () => {
                    toast.success("Tier insentif berhasil diperbarui.");
                    onSuccess();
                },
                onError: (err) => {
                    console.error("Update failed:", err);
                },
            });
        } else {
            post(route("incentive-tiers.store"), {
                onSuccess: () => {
                    reset();
                    toast.success("Tier insentif baru berhasil ditambahkan.");
                    onSuccess();
                },
                onError: (err) => {
                    console.error("Creation failed:", err);
                },
            });
        }
    }

    return (
        <form onSubmit={handleSubmit}>
            <fieldset disabled={processing} className="space-y-4">
                <div>
                    <Label htmlFor="name" required>
                        Nama Tier
                    </Label>
                    <Input
                        id="name"
                        type="text"
                        placeholder="Contoh: Tier 1, Tier 2, etc."
                        value={data.name}
                        onChange={(e) => setData("name", e.target.value)}
                        className="mt-1"
                        required
                    />
                    {errors.name && (
                        <p className="text-sm text-red-600 mt-1">{errors.name}</p>
                    )}
                </div>

                <div className="grid grid-cols-2 gap-4">
                    <div>
                        <Label htmlFor="min_cars" required>
                            Minimal Mobil
                        </Label>
                        <Input
                            id="min_cars"
                            type="number"
                            placeholder="Contoh: 1000"
                            value={data.min_cars}
                            onChange={(e) => setData("min_cars", Number(e.target.value))}
                            className="mt-1"
                            min="0"
                            required
                        />
                        {errors.min_cars && (
                            <p className="text-sm text-red-600 mt-1">{errors.min_cars}</p>
                        )}
                    </div>

                    <div>
                        <Label htmlFor="max_cars">Maksimal Mobil (Kosongkan jika tidak ada batas)</Label>
                        <Input
                            id="max_cars"
                            type="number"
                            placeholder="Contoh: 1200"
                            value={data.max_cars}
                            onChange={(e) => setData("max_cars", e.target.value)}
                            className="mt-1"
                            min="0"
                        />
                        {errors.max_cars && (
                            <p className="text-sm text-red-600 mt-1">{errors.max_cars}</p>
                        )}
                    </div>
                </div>

                <div>
                    <Label htmlFor="commission" required>
                        Komisi per Mobil
                    </Label>
                    <NumericFormat
                        id="commission"
                        customInput={Input}
                        prefix={"Rp "}
                        thousandSeparator="."
                        decimalSeparator=","
                        placeholder="Contoh: Rp 400"
                        value={data.commission}
                        onValueChange={(values) => setData("commission", values.floatValue?.toString() || "")}
                        className="mt-1"
                        required
                    />
                    {errors.commission && (
                        <p className="text-sm text-red-600 mt-1">{errors.commission}</p>
                    )}
                </div>
            </fieldset>

            <div className="flex justify-end gap-2 mt-6">
                <Button
                    type="button"
                    variant="secondary"
                    onClick={onCancel}
                >
                    Batal
                </Button>
                <Button
                    type="submit"
                    variant="default"
                    disabled={processing}
                >
                    {processing && (
                        <LoaderCircle className="mr-2 h-4 w-4 animate-spin" />
                    )}
                    {isEditMode ? "Simpan Perubahan" : "Tambah Tier"}
                </Button>
            </div>
        </form>
    );
}
