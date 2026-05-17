import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { router, useForm } from "@inertiajs/react";
import { NumericFormat } from "react-number-format";
import { toast } from "sonner";
import Swal from "sweetalert2";

interface KasFormProp {
    onSubmit: () => void;
    onCancel: () => void;
}

export default function KasForm({ onCancel, onSubmit }: KasFormProp) {
    const { data, setData, post, patch, processing, errors, reset } = useForm({
        nominal: "",
    });

    function handleSubmit() {
        router.post(route("daily-cash-logs.store"), data, {
            onSuccess: () => {
                toast.success(
                    "Silahkan tunggu approval dari admin untuk melanjutkan.",
                );
                reset();
            },
        });
    }

    return (
        <form onSubmit={handleSubmit}>
            <Label htmlFor="nominal">Nominal</Label>
            <NumericFormat
                id="price"
                customInput={Input}
                prefix={"Rp "}
                thousandSeparator="."
                decimalSeparator=","
                value={data.nominal}
                onValueChange={(values) => {
                    setData("nominal", values.floatValue?.toString() || "");
                }}
                className="mt-1"
            />
            {errors.nominal && (
                <p className="mt-1 text-sm text-red-600">{errors.nominal}</p>
            )}
            <div className="mt-6 flex flex-row justify-end gap-2">
                <Button
                    type="button"
                    variant="secondary"
                    onClick={() => onCancel()}
                >
                    Batal
                </Button>
                <Button type="submit" disabled={processing}>
                    Simpan
                </Button>
            </div>
        </form>
    );
}
