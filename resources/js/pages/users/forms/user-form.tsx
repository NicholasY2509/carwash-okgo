import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import {
    Select,
    SelectContent,
    SelectItem,
    SelectTrigger,
    SelectValue,
} from "@/components/ui/select";
import { useForm } from "@inertiajs/react";
import { LoaderCircle } from "lucide-react";
import { toast } from "sonner";
import Swal from "sweetalert2";

// Define the shape of the Role and User objects
interface Role {
    id: number;
    name: string;
}

interface User {
    id: number;
    name: string;
    email: string;
    roles: Role[]; // A user can have roles
}

interface Props {
    user?: User | null;
    roles: Role[]; // The form now expects a list of available roles
    onSuccess: () => void;
    onCancel: () => void;
}

export default function UserForm({ user, roles, onSuccess, onCancel }: Props) {
    const isEditMode = !!user;

    const { data, setData, post, patch, processing, errors, reset } = useForm({
        name: user?.name || "",
        email: user?.email || "",
        password: "",
        password_confirmation: "",
        role_id: user?.roles?.[0]?.id.toString() || "",
    });

    function handleSubmit(e: React.FormEvent<HTMLFormElement>) {
        e.preventDefault();

        const handleSuccess = () => {
            reset();
            toast.success(
                `User telah berhasil ${isEditMode ? "diedit" : "ditambahkan"}.`,
            );
            onSuccess();
        };

        if (isEditMode) {
            patch(route("users.update", user.id), {
                onSuccess: handleSuccess,
            });
        } else {
            post(route("users.store"), {
                onSuccess: handleSuccess,
            });
        }
    }

    return (
        <form onSubmit={handleSubmit} className="space-y-4">
            <div>
                <Label htmlFor="name">Nama</Label>
                <Input
                    id="name"
                    value={data.name}
                    onChange={(e) => setData("name", e.target.value)}
                />
                {errors.name && (
                    <p className="text-sm text-red-600 mt-1">{errors.name}</p>
                )}
            </div>

            <div>
                <Label htmlFor="email">Email</Label>
                <Input
                    id="email"
                    type="email"
                    value={data.email}
                    onChange={(e) => setData("email", e.target.value)}
                />
                {errors.email && (
                    <p className="text-sm text-red-600 mt-1">{errors.email}</p>
                )}
            </div>

            <div>
                <Label htmlFor="role_id">Role (Opsional)</Label>
                <Select
                    value={data.role_id}
                    onValueChange={(value) => {
                        setData("role_id", value === "none" ? "" : value);
                    }}
                >
                    <SelectTrigger>
                        <SelectValue placeholder="Pilih role..." />
                    </SelectTrigger>
                    <SelectContent>
                        <SelectItem value="none">Tidak ada role</SelectItem>
                        {roles.map((role) => (
                            <SelectItem key={role.id} value={String(role.id)}>
                                {role.name}
                            </SelectItem>
                        ))}
                    </SelectContent>
                </Select>
                {errors.role_id && (
                    <p className="text-sm text-red-600 mt-1">
                        {errors.role_id}
                    </p>
                )}
            </div>

            <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
                <div>
                    <Label htmlFor="password">Password</Label>
                    <Input
                        id="password"
                        type="password"
                        value={data.password}
                        onChange={(e) => setData("password", e.target.value)}
                    />
                    {errors.password && (
                        <p className="text-sm text-red-600 mt-1">
                            {errors.password}
                        </p>
                    )}
                </div>
                <div>
                    <Label htmlFor="password_confirmation">
                        Konfirmasi Password
                    </Label>
                    <Input
                        id="password_confirmation"
                        type="password"
                        value={data.password_confirmation}
                        onChange={(e) =>
                            setData("password_confirmation", e.target.value)
                        }
                    />
                </div>
            </div>
            {isEditMode && (
                <p className="text-xs text-muted-foreground">
                    Kosongkan password jika tidak ingin mengubahnya.
                </p>
            )}

            <div className="mt-6 flex justify-end gap-2">
                <Button type="button" variant="ghost" onClick={onCancel}>
                    Kembali
                </Button>
                <Button type="submit" disabled={processing}>
                    {processing && (
                        <LoaderCircle className="mr-2 h-4 w-4 animate-spin" />
                    )}
                    {isEditMode ? "Simpan Perubahan" : "Tambahkan User"}
                </Button>
            </div>
        </form>
    );
}
