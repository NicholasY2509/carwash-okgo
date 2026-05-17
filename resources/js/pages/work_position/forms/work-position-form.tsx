import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { useForm } from "@inertiajs/react";
import { LoaderCircle } from "lucide-react";
import React from "react";
import { toast } from "sonner";

// Define an interface for the work position data structure
interface WorkPosition {
    id: number;
    name: string;
    description: string;
}

// Update the props to optionally receive a workPosition object for editing
interface WorkPositionFormProps {
    workPosition?: WorkPosition | null;
    onSuccess: () => void;
    onCancel: () => void;
}

export default function WorkPositionForm({
    workPosition,
    onSuccess,
    onCancel,
}: WorkPositionFormProps) {
    const isEditMode = !!workPosition;

    const { data, setData, post, patch, processing, errors, reset } = useForm({
        name: workPosition?.name || "",
        description: workPosition?.description || "",
    });

    function handleSubmit(e: React.FormEvent<HTMLFormElement>) {
        e.preventDefault();

        const handleSuccess = () => {
            reset();
            toast.success(
                `Posisi kerja telah berhasil ${
                    isEditMode ? "diperbarui" : "ditambahkan"
                }.`,
            );
            onSuccess();
        };

        if (isEditMode) {
            patch(route("work-positions.update", workPosition.id), {
                onSuccess: handleSuccess,
                onError: () => {},
            });
        } else {
            post(route("work-positions.store"), {
                onSuccess: handleSuccess,
                onError: () => {},
            });
        }
    }

    return (
        <>
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
                        <p className="-mt-3 mb-3 text-sm text-red-600">
                            {errors.name}
                        </p>
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
                    />
                    {errors.description && (
                        <p className="-mt-3 mb-3 text-sm text-red-600">
                            {errors.description}
                        </p>
                    )}
                </div>

                <div className="mt-4 flex justify-end gap-2">
                    <Button
                        type="button"
                        variant="ghost"
                        size="lg"
                        onClick={onCancel}
                        disabled={processing}
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
                            <LoaderCircle className="mr-2 h-4 w-4 animate-spin" />
                        )}
                        {isEditMode ? "Update" : "Tambahkan"}
                    </Button>
                </div>
            </form>
            {errors &&
                Object.keys(errors).length > 0 &&
                !errors.name &&
                !errors.description && (
                    <div className="mt-4 flex justify-end">
                        <p className="mb-4 text-sm text-red-600">
                            Terjadi kesalahan tidak terduga. Silakan coba lagi.
                        </p>
                    </div>
                )}
        </>
    );
}
