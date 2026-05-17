import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { useForm } from "@inertiajs/react";
import { LoaderCircle } from "lucide-react";
import { toast } from "sonner";

interface Permission {
    id: number;
    name: string;
    created_at: string;
}

interface PermissionFormProps {
    onSuccess: () => void;
    onCancel: () => void;
    permission?: Permission | null;
}

export default function PermissionForm({
    onSuccess,
    onCancel,
    permission,
}: PermissionFormProps) {
    const isEditMode = !!permission;

    const { data, setData, post, patch, processing, errors, reset } = useForm({
        name: permission?.name ?? "",
    });

    const handleSuccess = () => {
        reset();
        onSuccess();
    };

    function handleSubmit() {
        if (isEditMode) {
            patch(route("permissions.update", permission.id), {
                onSuccess: () => {
                    handleSuccess();
                },
                onError: () => {},
            });
        } else {
            post(route("permissions.store"), {
                onSuccess: () => {
                    handleSuccess();
                },
                onError: () => {},
            });
        }
    }

    return (
        <form onSubmit={handleSubmit}>
            <div>
                <Label htmlFor="name" className="mb-1 block" required>
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
                    {isEditMode ? "Simpan Perubahan" : "Tambah Permission"}
                </Button>
            </div>
        </form>
    );
}
