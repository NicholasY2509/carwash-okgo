import Heading from "@/components/heading";
import { Button } from "@/components/ui/button";
import { Modal, ModalHeader } from "@/components/ui/modal";
import AppLayout from "@/layouts/app-layout";
import { BreadcrumbItem, PageProps } from "@/types";
import { Head, usePage } from "@inertiajs/react";
import { Edit, Plus } from "lucide-react";
import { useState } from "react";
import { ColumnDef } from "@tanstack/react-table";
import { DataTable } from "@/components/ui/data-table";
import { format } from "date-fns";
import { id } from "date-fns/locale";
import UserForm from "./forms/user-form";
import { Badge } from "@/components/ui/badge";

interface Role {
    id: number;
    name: string;
}

interface User {
    id: number;
    name: string;
    email: string;
    created_at: Date;
    roles: Role[];
}

export default function UserIndex() {
    // FIX: Correctly define the shape of the props coming from your controller
    const { props } = usePage<PageProps<{ users: User[]; roles: Role[] }>>();
    const users = props.users || [];
    const roles = props.roles || [];

    const [isModalOpen, setIsModalOpen] = useState(false);
    const [isEditModalOpen, setIsEditModalOpen] = useState(false);
    const [selectedUser, setSelectedUser] = useState<User | null>(null);

    const breadcrumbs: BreadcrumbItem[] = [{ title: "Users", href: "/users" }];

    const columns: ColumnDef<User>[] = [
        {
            header: "No",
            cell: (row) => row.row.index + 1,
        },
        { accessorKey: "name", header: "Name" },
        { accessorKey: "email", header: "Email" },
        // NEW: Add a column to display the user's role
        {
            header: "Role",
            accessorKey: "roles",
            cell: ({ row }) => {
                const userRoles = row.original.roles;
                // If the user has a role, display it in a badge
                if (userRoles && userRoles.length > 0) {
                    return <Badge variant="outline">{userRoles[0].name}</Badge>;
                }
                // Otherwise, show a placeholder
                return <span className="text-muted-foreground">-</span>;
            },
        },
        {
            accessorKey: "created_at",
            header: "Tanggal Dibuat",
            cell: ({ row }) => {
                const date = new Date(row.getValue("created_at"));
                return format(date, "dd MMM yyyy, HH:mm", { locale: id });
            },
        },
        {
            id: "actions",
            header: "Actions",
            cell: ({ row }) => (
                <Button
                    size="icon"
                    variant={"outline"}
                    onClick={() => {
                        setSelectedUser(row.original);
                        setIsEditModalOpen(true);
                    }}
                >
                    <Edit className="h-4 w-4" />
                </Button>
            ),
        },
    ];

    return (
        <AppLayout breadcrumbs={breadcrumbs}>
            <Head title="Users" />
            <div className="flex h-full flex-1 flex-col gap-4 rounded-xl p-4">
                <div className="flex justify-between">
                    <Heading
                        title="User"
                        description="Daftar user yang ter-register di sistem."
                    />
                    <Button
                        variant="default"
                        size="lg"
                        onClick={() => setIsModalOpen(true)}
                    >
                        Tambah User <Plus className="ml-2 h-4 w-4" />
                    </Button>
                </div>
                <DataTable columns={columns} data={users} />

                {/* Modal for Creating a User */}
                <Modal open={isModalOpen} onClose={() => setIsModalOpen(false)}>
                    <ModalHeader title="Tambah User Baru" />
                    <div className="p-4">
                        <UserForm
                            roles={roles}
                            onCancel={() => setIsModalOpen(false)}
                            onSuccess={() => setIsModalOpen(false)}
                        />
                    </div>
                </Modal>

                <Modal
                    open={isEditModalOpen}
                    onClose={() => setIsEditModalOpen(false)}
                >
                    <ModalHeader title="Edit User" />
                    <div className="p-4">
                        <UserForm
                            roles={roles}
                            user={selectedUser}
                            onCancel={() => setIsEditModalOpen(false)}
                            onSuccess={() => setIsEditModalOpen(false)}
                        />
                    </div>
                </Modal>
            </div>
        </AppLayout>
    );
}
