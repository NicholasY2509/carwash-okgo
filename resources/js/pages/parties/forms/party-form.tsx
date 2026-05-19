import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { useForm } from "@inertiajs/react";
import { LoaderCircle } from "lucide-react";
import { toast } from "sonner";
import React from "react";

interface Party {
    id: number;
    name: string;
    description: string | null;
}

interface Props {
    party?: Party | null;
    onSuccess: () => void;
    onCancel: () => void;
}

export default function PartyForm({ party, onSuccess, onCancel }: Props) {
    const isEditMode = !!party;

    const { data, setData, post, patch, processing, errors, reset } = useForm({
        name: party?.name || "",
        description: party?.description || "",
    });

    function handleSubmit(e: React.FormEvent<HTMLFormElement>) {
        e.preventDefault();

        if (isEditMode) {
            patch(route("parties.update", party.id), {
                onSuccess: () => {
                    toast.success("Pihak bagi hasil berhasil diperbarui.");
                    onSuccess();
                },
                onError: (errors) => {
                    console.error("Update failed:", errors);
                },
            });
        } else {
            post(route("parties.store"), {
                onSuccess: () => {
                    reset();
                    toast.success("Pihak bagi hasil baru berhasil ditambahkan.");
                    onSuccess();
                },
                onError: (errors) => {
                    console.error("Creation failed:", errors);
                },
            });
        }
    }

    return (
        <form onSubmit={handleSubmit}>
            <fieldset disabled={processing} className="space-y-4">
                <div>
                    <Label htmlFor="name" required>
                        Nama Pihak Bagi Hasil
                    </Label>
                    <Input
                        id="name"
                        type="text"
                        placeholder="Contoh: Owner, Pengelola, Investor, Kas"
                        value={data.name}
                        onChange={(e) => setData("name", e.target.value)}
                        className="mt-1"
                    />
                    {errors.name && (
                        <p className="text-sm text-red-600 mt-1">{errors.name}</p>
                    )}
                </div>

                <div>
                    <Label htmlFor="description">Deskripsi (Opsional)</Label>
                    <Textarea
                        id="description"
                        placeholder="Keterangan opsional tentang pihak ini..."
                        value={data.description}
                        onChange={(e) => setData("description", e.target.value)}
                        className="mt-1 min-h-[100px]"
                    />
                    {errors.description && (
                        <p className="text-sm text-red-600 mt-1">
                            {errors.description}
                        </p>
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
                    {isEditMode ? "Simpan Perubahan" : "Tambah Pihak"}
                </Button>
            </div>
        </form>
    );
}
