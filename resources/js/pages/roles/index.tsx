import Heading from "@/components/heading";
import { DataTable } from "@/components/ui/data-table";
import { Modal, ModalHeader } from "@/components/ui/modal";
import AppLayout from "@/layouts/app-layout";
import { BreadcrumbItem, PageProps, Permission, Role } from "@/types";
import { Head, router, usePage } from "@inertiajs/react";
import { ColumnDef } from "@tanstack/react-table";
import { format } from "date-fns";
import { id } from "date-fns/locale";
import { useState } from "react";
import RoleForm from "./forms/role-form";
import { Button } from "@/components/ui/button";
import { Edit, Trash } from "lucide-react";
import { Pagination } from "@/components/ui/pagination";
import {
    AlertDialogHeader,
    AlertDialogFooter,
    AlertDialog,
    AlertDialogContent,
    AlertDialogDescription,
    AlertDialogTitle,
} from "@/components/ui/alert-dialog";
import { Badge } from "@/components/ui/badge";
import {
    DropdownMenu,
    DropdownMenuTrigger,
    DropdownMenuContent,
    DropdownMenuItem,
} from "@/components/ui/dropdown-menu";

export default function RoleIndex() {
    const { roles, permissions } = usePage<PageProps>().props;
    const pagination = roles;
    const [perPage, setPerPage] = useState(pagination.per_page || 10);
    const [isCreateModalOpen, setIsCreateModalOpen] = useState(false);
    const [isEditModalOpen, setIsEditModalOpen] = useState(false);
    const [isDeleteAlertOpen, setIsDeleteAlertOpen] = useState(false);
    const [selectedRole, setSelectedRole] = useState<Role | null>(null);

    const breadcrumbs: BreadcrumbItem[] = [
        { title: "Roles", href: route("roles.index") },
    ];

    const columns: ColumnDef<Role>[] = [
        {
            accessorKey: "index",
            header: "No",
            cell: (row) => row.row.index + 1,
        },
        { accessorKey: "name", header: "Nama Role" },
        {
            accessorKey: "permissions",
            header: "Permissions",
            cell: ({ row }) => {
                const permissions = row.original.permissions;
                return (
                    <div className="flex flex-wrap gap-1">
                        {permissions.length > 0 ? (
                            permissions.map((permission) => (
                                <Badge key={permission.id} variant="secondary">
                                    {permission.name}
                                </Badge>
                            ))
                        ) : (
                            <span className="text-xs text-muted-foreground">
                                No Permissions
                            </span>
                        )}
                    </div>
                );
            },
        },
        {
            accessorKey: "created_at",
            header: "Tanggal Dibuat",
            cell: ({ row }) => {
                const date = new Date(row.getValue("created_at"));
                const formattedDate = format(date, "dd MMMM yyyy, HH:mm", {
                    locale: id,
                });
                return <div className="text-left text-sm">{formattedDate}</div>;
            },
        },
        {
            accessorKey: "actions",
            header: "Actions",
            cell: ({ row }) => (
                <div className="flex flex-row gap-2">
                    <>
                        <Button
                            size="icon"
                            variant={"outline"}
                            onClick={() => {
                                setSelectedRole(row.original);
                                setIsEditModalOpen(true);
                            }}
                        >
                            <Edit />
                        </Button>
                        {row.original.name !== "super-admin" && (
                            <Button
                                size="icon"
                                variant={"destructive"}
                                onClick={() => {
                                    setSelectedRole(row.original);
                                    setIsDeleteAlertOpen(true);
                                }}
                            >
                                <Trash />
                            </Button>
                        )}
                    </>
                </div>
            ),
        },
    ];

    function handleDelete(roleId: number) {
        router.delete(route("roles.destroy", roleId), {
            onSuccess: () => setIsDeleteAlertOpen(false),
            preserveScroll: true,
        });
    }

    const handlePageChange = (page: number) => {
        router.get(
            route("roles.index"),
            { page, per_page: perPage },
            { preserveState: true },
        );
    };
    const handlePerPageChange = (newPerPage: number) => {
        setPerPage(newPerPage);
        router.get(
            route("roles.index"),
            { page: 1, per_page: newPerPage },
            { preserveState: true },
        );
    };

    return (
        <AppLayout breadcrumbs={breadcrumbs}>
            <Head title="Roles" />
            <div className="flex h-full flex-1 flex-col gap-4 rounded-xl p-4 shadow-sme">
                <div className="flex justify-between items-center">
                    <Heading
                        title="Manajemen Roles"
                        description="Kelola semua role dan permission yang terhubung."
                    />
                    <Button onClick={() => setIsCreateModalOpen(true)}>
                        Tambah Role
                    </Button>
                </div>
                <div className="flex flex-col gap-4">
                    <div className="flex justify-end flex-row items-center gap-2">
                        <span className="text-sm text-muted-foreground">Baris per halaman:</span>
                        <DropdownMenu>
                            <DropdownMenuTrigger asChild>
                                <Button
                                    variant="outline"
                                    size="sm"
                                    className="min-w-[60px] justify-between h-8"
                                >
                                    {perPage}
                                </Button>
                            </DropdownMenuTrigger>
                            <DropdownMenuContent align="end">
                                {[5, 10, 20, 50, 100].map((size) => (
                                    <DropdownMenuItem
                                        key={size}
                                        onSelect={() =>
                                            handlePerPageChange(size)
                                        }
                                    >
                                        {size}
                                    </DropdownMenuItem>
                                ))}
                            </DropdownMenuContent>
                        </DropdownMenu>
                    </div>
                    <DataTable columns={columns} data={pagination.data} />
                    {pagination && (
                        <Pagination
                            pagination={pagination}
                            onPageChange={handlePageChange}
                            label="roles"
                        />
                    )}
                </div>
            </div>

            <Modal
                open={isCreateModalOpen}
                onClose={() => setIsCreateModalOpen(false)}
            >
                <ModalHeader title="Tambah Role Baru" />
                <RoleForm
                    availablePermissions={permissions}
                    onSuccess={() => setIsCreateModalOpen(false)}
                    onCancel={() => setIsCreateModalOpen(false)}
                />
            </Modal>

            <Modal
                open={isEditModalOpen}
                onClose={() => setIsEditModalOpen(false)}
            >
                <ModalHeader title={`Edit Role: ${selectedRole?.name}`} />
                <RoleForm
                    role={selectedRole}
                    availablePermissions={permissions}
                    onSuccess={() => setIsEditModalOpen(false)}
                    onCancel={() => setIsEditModalOpen(false)}
                />
            </Modal>

            <AlertDialog
                open={isDeleteAlertOpen}
                onOpenChange={setIsDeleteAlertOpen}
            >
                <AlertDialogContent>
                    <AlertDialogHeader>
                        <AlertDialogTitle>Apakah Anda Yakin?</AlertDialogTitle>
                        <AlertDialogDescription>
                            Anda akan menghapus role{" "}
                            <strong>{selectedRole?.name}</strong>. Setelah
                            dihapus, data tidak dapat dikembalikan dan semua
                            user yang memiliki role ini akan kehilangan hak
                            aksesnya.
                        </AlertDialogDescription>
                    </AlertDialogHeader>
                    <AlertDialogFooter>
                        <Button
                            variant={"secondary"}
                            onClick={() => setIsDeleteAlertOpen(false)}
                        >
                            Batal
                        </Button>
                        <Button
                            variant={"destructive"}
                            onClick={() => {
                                if (selectedRole?.id) {
                                    handleDelete(selectedRole.id);
                                }
                            }}
                        >
                            Ya, Hapus Role
                        </Button>
                    </AlertDialogFooter>
                </AlertDialogContent>
            </AlertDialog>
        </AppLayout>
    );
}
