import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { useForm } from "@inertiajs/react";
import { LoaderCircle } from "lucide-react";
import React from "react";
import { toast } from "sonner";

interface Stall {
    id: number;
    name: string;
    description: string;
}

interface CreateStallProps {
    stall?: Stall | null;
    onSuccess: () => void;
    onCancel: () => void;
}

export default function StallForm({
    stall,
    onSuccess,
    onCancel,
}: CreateStallProps) {
    const isEditMode = !!stall;

    const { data, setData, post, patch, processing, errors, reset } = useForm({
        name: stall?.name || "",
        description: stall?.description || "",
    });

    function handleSubmit(e: React.FormEvent<HTMLFormElement>) {
        e.preventDefault();

        if (isEditMode) {
            patch(route("stalls.update", stall.id), {
                onSuccess: () => {
                    toast.success("Stall telah berhasil diperbarui.");
                    onSuccess();
                },
                onError: (errors) => {
                    console.error("Update failed:", errors);
                },
            });
        } else {
            post(route("stalls.store"), {
                onSuccess: () => {
                    reset();
                    toast.success("Stall telah berhasil ditambahkan.");
                    onSuccess();
                },
                onError: () => {},
            });
        }
    }

    return (
        <>
            {" "}
            <form onSubmit={handleSubmit}>
                <div>
                    <Label htmlFor="name" className="mb-1 block">
                        Nama
                    </Label>
                    <Input
                        id="name"
                        type="text"
                        value={data.name}
                        onChange={(e) => setData("name", e.target.value)}
                        className="mb-4 block"
                        required
                    />
                    {errors.name && (
                        <p className="text-sm text-red-600">{errors.name}</p>
                    )}
                </div>

                <div>
                    <Label htmlFor="description" className="mb-1 block">
                        Deskripsi
                    </Label>
                    <Textarea
                        id="description"
                        value={data.description}
                        onChange={(e) => setData("description", e.target.value)}
                        className="mb-4 block"
                        required
                    />
                    {errors.description && (
                        <p className="text-sm text-red-600">
                            {errors.description}
                        </p>
                    )}
                </div>

                <div className="flex justify-end gap-2">
                    <Button
                        type="button"
                        variant="secondary"
                        size="lg"
                        onClick={onCancel}
                    >
                        Kembali
                    </Button>
                    <Button
                        type="submit"
                        variant="default"
                        size="lg"
                        disabled={processing}
                    >
                        {processing && (
                            <LoaderCircle className="h-4 w-4 animate-spin" />
                        )}
                        {isEditMode ? "Simpan Perubahan" : "Tambahkan Stall"}
                    </Button>
                </div>
            </form>
        </>
    );
}
