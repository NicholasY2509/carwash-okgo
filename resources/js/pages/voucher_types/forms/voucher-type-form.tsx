import { Button } from "@/components/ui/button";
import { Checkbox } from "@/components/ui/checkbox";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { useForm } from "@inertiajs/react";
import { LoaderCircle } from "lucide-react";
import { toast } from "sonner";
import React from "react";

interface VoucherType {
    id: number;
    name: string;
    is_free: boolean;
    only_one_car: boolean;
    description: string;
}

interface Props {
    voucherType?: VoucherType | null;
    onSuccess: () => void;
    onCancel: () => void;
}

export default function VoucherTypeForm({
    voucherType,
    onSuccess,
    onCancel,
}: Props) {
    const isEditMode = !!voucherType;

    const { data, setData, post, patch, processing, errors, reset } = useForm({
        name: voucherType?.name || "",
        description: voucherType?.description || "",
        is_free: voucherType?.is_free || false,
        only_one_car: voucherType?.only_one_car || false,
    });

    function handleSubmit(e: React.FormEvent<HTMLFormElement>) {
        e.preventDefault();

        const handleSuccess = () => {
            reset();
            toast.success(
                `Tipe Voucher telah berhasil ${
                    isEditMode ? "diperbarui" : "ditambahkan"
                }.`,
            );
            onSuccess();
        };

        if (isEditMode) {
            patch(route("voucher-types.update", voucherType.id), {
                onSuccess: handleSuccess,
                onError: () => {},
            });
        } else {
            post(route("voucher-types.store"), {
                onSuccess: handleSuccess,
                onError: () => {},
            });
        }
    }

    return (
        <>
            <form onSubmit={handleSubmit}>
                <Label htmlFor="name">Nama Tipe</Label>
                <Input
                    id="name"
                    type="text"
                    value={data.name}
                    onChange={(e) => setData("name", e.target.value)}
                    className="mb-2"
                />
                {errors.name && (
                    <p className="text-sm text-red-600">{errors.name}</p>
                )}

                <Label htmlFor="description">Deskripsi</Label>
                <Textarea
                    id="description"
                    value={data.description}
                    onChange={(e) => setData("description", e.target.value)}
                    className="mb-2"
                />
                {errors.description && (
                    <p className="text-sm text-red-600">{errors.description}</p>
                )}

                <div className="flex items-center space-x-4 my-4">
                    <div className="flex items-center space-x-2">
                        <Checkbox
                            id="is_free"
                            checked={data.is_free}
                            onCheckedChange={(checked) => {
                                setData("is_free", !!checked);
                            }}
                        />
                        <Label
                            htmlFor="is_free"
                            className="text-sm font-medium leading-none peer-disabled:cursor-not-allowed peer-disabled:opacity-70"
                        >
                            Gratis
                        </Label>
                    </div>
                    <div className="flex items-center space-x-2">
                        <Checkbox
                            id="only_one_car"
                            checked={!data.only_one_car}
                            onCheckedChange={(checked) => {
                                setData("only_one_car", !checked);
                            }}
                        />
                        <Label
                            htmlFor="only_one_car"
                            className="text-sm font-medium leading-none peer-disabled:cursor-not-allowed peer-disabled:opacity-70"
                        >
                            Bebas Nopol
                        </Label>
                    </div>
                </div>
                {errors.is_free && (
                    <p className="text-sm text-red-600">{errors.is_free}</p>
                )}
                {errors.only_one_car && (
                    <p className="text-sm text-red-600">
                        {errors.only_one_car}
                    </p>
                )}

                <div className="mt-4 flex justify-end gap-2">
                    <Button
                        type="button"
                        variant="ghost"
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
                            <LoaderCircle className="h-4 w-4 animate-spin mr-2" />
                        )}
                        {isEditMode ? "Update" : "Tambahkan"}
                    </Button>
                </div>
            </form>
        </>
    );
}
