import Heading from "@/components/heading";
import { DataTable } from "@/components/ui/data-table";
import { Modal, ModalHeader } from "@/components/ui/modal";
import AppLayout from "@/layouts/app-layout";
import { BreadcrumbItem } from "@/types";
import { Head, router, usePage } from "@inertiajs/react";
import { ColumnDef } from "@tanstack/react-table";
import { format } from "date-fns";
import { id } from "date-fns/locale";
import { useState } from "react";
import PermissionForm from "./forms/permission-form";
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
import {
    DropdownMenu,
    DropdownMenuTrigger,
    DropdownMenuContent,
    DropdownMenuItem,
} from "@/components/ui/dropdown-menu";

interface Permission {
    id: number;
    name: string;
    created_at: string;
}

export default function PermissionIndex() {
    const { props } = usePage<{ permissions: any }>();
    const pagination = props.permissions;
    const [perPage, setPerPage] = useState(pagination.per_page || 10);
    const [isModalOpen, setIsModalOpen] = useState(false);
    const [isEditModalOpen, setIsEditModalOpen] = useState(false);
    const [isDeleteAlertOpen, setIsDeleteAlertOpen] = useState(false);
    const [selectedPermission, setSelectedPermission] =
        useState<Permission | null>(null);

    const breadcrumbs: BreadcrumbItem[] = [
        { title: "Permissions", href: "/permissions" },
    ];

    const columns: ColumnDef<Permission>[] = [
        {
            accessorKey: "index",
            header: "No",
            cell: (row) => row.row.index + 1,
        },
        { accessorKey: "name", header: "Name" },
        {
            accessorKey: "created_at",
            header: "Tanggal Dibuat",
            cell: ({ row }) => {
                const date = new Date(row.getValue("created_at"));
                const formattedDate = format(date, "dd MMMM yyyy, HH:mm", {
                    locale: id,
                });
                return <div className="text-left">{formattedDate}</div>;
            },
        },
        {
            accessorKey: "actions",
            header: "Actions",
            cell: (info) => (
                <div className="flex flex-row gap-1">
                    <Button
                        size="icon"
                        variant={"outline"}
                        onClick={() => {
                            setIsEditModalOpen(true);
                            setSelectedPermission(info.row.original);
                        }}
                    >
                        <Edit />
                    </Button>
                    <Button
                        size="icon"
                        variant={"destructive"}
                        onClick={() => {
                            setSelectedPermission(info.row.original);
                            setIsDeleteAlertOpen(true);
                        }}
                    >
                        <Trash />
                    </Button>
                </div>
            ),
        },
    ];

    function handleDelete(id: number) {
        router.delete(route("permissions.destroy", id), {
            onSuccess: () => setIsDeleteAlertOpen(false),
        });
    }

    const handlePageChange = (page: number) => {
        router.get(
            route("permissions.index"),
            { page, per_page: perPage },
            { preserveState: true },
        );
    };
    const handlePerPageChange = (newPerPage: number) => {
        setPerPage(newPerPage);
        router.get(
            route("permissions.index"),
            { page: 1, per_page: newPerPage },
            { preserveState: true },
        );
    };

    return (
        <AppLayout breadcrumbs={breadcrumbs}>
            <Head title="Permissions" />
            <div className="flex h-full flex-1 flex-col gap-4 rounded-xl p-4">
                <div className="flex justify-between">
                    <Heading
                        title="Permissions"
                        description="List dari semua permissions"
                    />
                    <Button onClick={() => setIsModalOpen(true)}>
                        Tambah Permission
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
                            label="permissions"
                        />
                    )}
                </div>
            </div>

            <Modal open={isModalOpen} onClose={() => setIsModalOpen(false)}>
                <ModalHeader title="Tambah Permission" />
                <PermissionForm
                    onSuccess={() => setIsModalOpen(false)}
                    onCancel={() => setIsModalOpen(false)}
                />
            </Modal>

            <Modal
                open={isEditModalOpen}
                onClose={() => setIsEditModalOpen(false)}
            >
                <ModalHeader title="Edit Permission" />
                <PermissionForm
                    permission={selectedPermission}
                    onSuccess={() => setIsEditModalOpen(false)}
                    onCancel={() => setIsEditModalOpen(false)}
                />
            </Modal>

            <AlertDialog open={isDeleteAlertOpen}>
                <AlertDialogContent>
                    <AlertDialogHeader>
                        <AlertDialogTitle>
                            Hapus Permission{" "}
                            <strong>{selectedPermission?.name}</strong> ?
                        </AlertDialogTitle>
                        <AlertDialogDescription>
                            Anda akan menghapus permission{" "}
                            <strong>{selectedPermission?.name}</strong>
                        </AlertDialogDescription>
                    </AlertDialogHeader>
                    <AlertDialogFooter>
                        <Button
                            variant={"secondary"}
                            onClick={() => setIsDeleteAlertOpen(false)}
                        >
                            Cancel
                        </Button>
                        <Button
                            type="submit"
                            variant={"destructive"}
                            onClick={() => {
                                if (selectedPermission?.id) {
                                    handleDelete(selectedPermission.id);
                                }
                            }}
                        >
                            Hapus
                        </Button>
                    </AlertDialogFooter>
                </AlertDialogContent>
            </AlertDialog>
        </AppLayout>
    );
}
