import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { useForm } from "@inertiajs/react";
import { LoaderCircle } from "lucide-react";
import { NumericFormat } from "react-number-format";
import { toast } from "sonner";
import Swal from "sweetalert2";

interface Product {
    id: number | string;
    name: string;
    description: string;
    price: number;
}

interface Props {
    product?: Product;
    onSuccess: () => void;
    onCancel: () => void;
}

export default function ProductForm({ product, onSuccess, onCancel }: Props) {
    const isEditMode = !!product;

    const { data, setData, post, patch, processing, errors, reset } = useForm({
        name: product?.name || "",
        description: product?.description || "",
        price: product?.price?.toString() || "",
    });

    function handleSubmit(e: React.FormEvent<HTMLFormElement>) {
        e.preventDefault();

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
        <form onSubmit={handleSubmit}>
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
                    />
                    {errors.name && (
                        <p className="text-sm text-red-600">{errors.name}</p>
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
                    />
                    {errors.price && (
                        <p className="text-sm text-red-600">{errors.price}</p>
                    )}
                </div>

                <div>
                    <Label htmlFor="description">Deskripsi Produk</Label>
                    <Textarea
                        id="description"
                        value={data.description}
                        onChange={(e) => setData("description", e.target.value)}
                    />
                    {errors.description && (
                        <p className="text-sm text-red-600">
                            {errors.description}
                        </p>
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
