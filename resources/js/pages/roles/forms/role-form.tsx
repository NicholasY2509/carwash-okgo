import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { useForm } from "@inertiajs/react";
import { LoaderCircle, Check, ChevronsUpDown, X } from "lucide-react";
import { Role, Permission } from "@/types"; // Pastikan tipe diimpor dari file types Anda
import {
    Popover,
    PopoverContent,
    PopoverTrigger,
} from "@/components/ui/popover";
import {
    Command,
    CommandEmpty,
    CommandGroup,
    CommandInput,
    CommandItem,
    CommandList,
} from "@/components/ui/command";
import { Badge } from "@/components/ui/badge";
import { cn } from "@/lib/utils";
import { useState } from "react";

// Tipe props tetap sama
interface RoleFormProps {
    role?: Role | null;
    availablePermissions: Permission[];
    onSuccess: () => void;
    onCancel: () => void;
}

export default function RoleForm({
    role,
    availablePermissions,
    onSuccess,
    onCancel,
}: RoleFormProps) {
    const isEditMode = !!role;

    const [isPopoverOpen, setIsPopoverOpen] = useState(false);

    const { data, setData, post, patch, processing, errors, reset } = useForm({
        name: role?.name ?? "",
        permission_ids: role?.permissions.map((p) => p.id) || [],
    });

    const handleSuccess = () => {
        reset();
        onSuccess();
    };

    function handleSubmit(e: React.FormEvent) {
        e.preventDefault();
        if (isEditMode) {
            patch(route("roles.update", role.id), {
                onSuccess: handleSuccess,
            });
        } else {
            post(route("roles.store"), {
                onSuccess: handleSuccess,
            });
        }
    }

    const handlePermissionUnselect = (permissionId: number) => {
        setData(
            "permission_ids",
            data.permission_ids.filter((id) => id !== permissionId),
        );
    };

    return (
        <form onSubmit={handleSubmit} className="space-y-6 p-1">
            <div>
                <Label htmlFor="name" className="mb-1 block">
                    Nama Role
                </Label>
                <Input
                    id="name"
                    type="text"
                    value={data.name}
                    onChange={(e) => setData("name", e.target.value)}
                    className="block"
                    disabled={role?.name === "super-admin" || processing}
                />
                {errors.name && (
                    <p className="text-sm text-red-600 mt-1">{errors.name}</p>
                )}
            </div>
            <div>
                <Label htmlFor="permissions" className="mb-1 block">
                    Permissions
                </Label>
                <Popover open={isPopoverOpen} onOpenChange={setIsPopoverOpen}>
                    <PopoverTrigger asChild>
                        <Button
                            id="permissions"
                            variant="outline"
                            role="combobox"
                            className="w-full justify-between h-auto min-h-[40px] font-normal"
                            disabled={
                                role?.name === "super-admin" || processing
                            }
                        >
                            <div className="flex gap-1 flex-wrap">
                                {data.permission_ids.length === 0 ? (
                                    <span className="text-muted-foreground">
                                        Pilih permission...
                                    </span>
                                ) : (
                                    availablePermissions
                                        .filter((p) =>
                                            data.permission_ids.includes(p.id),
                                        )
                                        .map((permission) => (
                                            <Badge
                                                variant="secondary"
                                                key={permission.id}
                                                className="cursor-pointer"
                                                onClick={(e) => {
                                                    e.preventDefault();
                                                    e.stopPropagation();
                                                    handlePermissionUnselect(
                                                        permission.id,
                                                    );
                                                }}
                                            >
                                                {permission.name}
                                                <X className="ml-1 h-3 w-3" />
                                            </Badge>
                                        ))
                                )}
                            </div>
                            <ChevronsUpDown className="ml-2 h-4 w-4 shrink-0 opacity-50" />
                        </Button>
                    </PopoverTrigger>
                    <PopoverContent className="w-full p-0">
                        <Command className="w-full">
                            <CommandInput placeholder="Cari permission..." />
                            <CommandList>
                                <CommandEmpty>
                                    Permission tidak ditemukan.
                                </CommandEmpty>
                                <CommandGroup>
                                    {availablePermissions.map((permission) => (
                                        <CommandItem
                                            key={permission.id}
                                            onSelect={() => {
                                                const newIds =
                                                    data.permission_ids.includes(
                                                        permission.id,
                                                    )
                                                        ? data.permission_ids.filter(
                                                              (id) =>
                                                                  id !==
                                                                  permission.id,
                                                          )
                                                        : [
                                                              ...data.permission_ids,
                                                              permission.id,
                                                          ];
                                                setData(
                                                    "permission_ids",
                                                    newIds,
                                                );
                                            }}
                                        >
                                            <Check
                                                className={cn(
                                                    "mr-2 h-4 w-4",
                                                    data.permission_ids.includes(
                                                        permission.id,
                                                    )
                                                        ? "opacity-100"
                                                        : "opacity-0",
                                                )}
                                            />
                                            {permission.name}
                                        </CommandItem>
                                    ))}
                                </CommandGroup>
                            </CommandList>
                        </Command>
                    </PopoverContent>
                </Popover>
                {errors.permission_ids && (
                    <p className="text-sm text-red-600 mt-1">
                        {errors.permission_ids}
                    </p>
                )}
            </div>

            <div className="flex justify-end gap-2 pt-4">
                <Button
                    type="button"
                    variant="secondary"
                    onClick={onCancel}
                    disabled={processing}
                >
                    Batal
                </Button>
                <Button
                    type="submit"
                    disabled={processing || role?.name === "super-admin"}
                >
                    {processing && (
                        <LoaderCircle className="mr-2 h-4 w-4 animate-spin" />
                    )}
                    {isEditMode ? "Simpan Perubahan" : "Tambah Role"}
                </Button>
            </div>
        </form>
    );
}
