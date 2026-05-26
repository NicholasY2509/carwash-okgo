import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { useForm } from "@inertiajs/react";
import { LoaderCircle } from "lucide-react";
import { toast } from "sonner";
import React from "react";
import { NumericFormat } from "react-number-format";

interface CashierIncentiveTier {
    id: number;
    name: string;
    min_packets: number;
    max_packets: number | null;
    commission_per_packet: number;
}

interface Props {
    tier?: CashierIncentiveTier | null;
    onSuccess: () => void;
    onCancel: () => void;
}

export default function CashierIncentiveTierForm({ tier, onSuccess, onCancel }: Props) {
    const isEditMode = !!tier;

    const { data, setData, post, patch, processing, errors, reset, transform } = useForm({
        name: tier?.name || "",
        min_packets: tier?.min_packets ?? 0,
        max_packets: tier?.max_packets ?? "",
        commission_per_packet: tier?.commission_per_packet?.toString() || "0",
    });

    // Use transform to prepare the payload before it is submitted
    React.useEffect(() => {
        transform((data) => ({
            ...data,
            max_packets: data.max_packets === "" ? null : Number(data.max_packets),
            commission_per_packet: Number(data.commission_per_packet) || 0,
        }));
    }, [data.max_packets, data.commission_per_packet]);

    function handleSubmit(e: React.FormEvent<HTMLFormElement>) {
        e.preventDefault();

        if (isEditMode) {
            patch(route("cashier-incentive-tiers.update", tier.id), {
                onSuccess: () => {
                    toast.success("Tier insentif berhasil diperbarui.");
                    onSuccess();
                },
                onError: (err) => {
                    console.error("Update failed:", err);
                },
            });
        } else {
            post(route("cashier-incentive-tiers.store"), {
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
                        <Label htmlFor="min_packets" required>
                            Minimal Paket
                        </Label>
                        <Input
                            id="min_packets"
                            type="number"
                            placeholder="Contoh: 1000"
                            value={data.min_packets}
                            onChange={(e) => setData("min_packets", Number(e.target.value))}
                            className="mt-1"
                            min="0"
                            required
                        />
                        {errors.min_packets && (
                            <p className="text-sm text-red-600 mt-1">{errors.min_packets}</p>
                        )}
                    </div>

                    <div>
                        <Label htmlFor="max_packets">Maksimal Paket (Kosongkan jika tidak ada batas)</Label>
                        <Input
                            id="max_packets"
                            type="number"
                            placeholder="Contoh: 1200"
                            value={data.max_packets}
                            onChange={(e) => setData("max_packets", e.target.value)}
                            className="mt-1"
                            min="0"
                        />
                        {errors.max_packets && (
                            <p className="text-sm text-red-600 mt-1">{errors.max_packets}</p>
                        )}
                    </div>
                </div>

                <div>
                    <Label htmlFor="commission_per_packet" required>
                        Komisi per Paket
                    </Label>
                    <NumericFormat
                        id="commission_per_packet"
                        customInput={Input}
                        prefix={"Rp "}
                        thousandSeparator="."
                        decimalSeparator=","
                        placeholder="Contoh: Rp 400"
                        value={data.commission_per_packet}
                        onValueChange={(values) => setData("commission_per_packet", values.floatValue?.toString() || "")}
                        className="mt-1"
                        required
                    />
                    {errors.commission_per_packet && (
                        <p className="text-sm text-red-600 mt-1">{errors.commission_per_packet}</p>
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
