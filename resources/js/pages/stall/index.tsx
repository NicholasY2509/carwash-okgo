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
import StallForm from "./forms/stall-form";

interface Stall {
    id: number;
    name: string;
    description: string;
}

const breadcrumbs: BreadcrumbItem[] = [{ title: "Stalls", href: "/stalls" }];

export default function Stalls() {
    const { props } = usePage<PageProps<{ stalls: Stall[] }>>();
    const stalls = props.stalls;

    const [isModalOpen, setIsModalOpen] = useState(false);
    const [isEditModalOpen, setIsEditModalOpen] = useState(false);
    const [selectedStall, setSelectedStall] = useState<Stall | null>(null);

    const columns: ColumnDef<Stall>[] = [
        { accessorKey: "name", header: "Name" },
        { accessorKey: "description", header: "Description" },
        {
            accessorKey: "actions",
            header: "Actions",
            cell: (row) => (
                <Button
                    size="icon"
                    variant={"outline"}
                    onClick={() => {
                        setIsEditModalOpen(true);
                        setSelectedStall(row.row.original);
                    }}
                >
                    <Edit />
                </Button>
            ),
        },
    ];

    return (
        <AppLayout breadcrumbs={breadcrumbs}>
            <Head title="Stalls" />
            <div className="flex h-full flex-1 flex-col gap-4 rounded-xl p-4">
                <div className="flex justify-between">
                    <Heading
                        title="Stall"
                        description="Lihat dan edit pengaturan stall."
                    />
                    <Button
                        variant="default"
                        size="lg"
                        onClick={() => setIsModalOpen(true)}
                    >
                        Tambah Stall <Plus />
                    </Button>
                </div>
                <DataTable columns={columns} data={stalls} />

                <Modal open={isModalOpen} onClose={() => setIsModalOpen(false)}>
                    <ModalHeader title="Tambah Stall" />
                    <StallForm
                        onCancel={() => setIsModalOpen(false)}
                        onSuccess={() => setIsModalOpen(false)}
                    />
                </Modal>
                <Modal
                    open={isEditModalOpen}
                    onClose={() => setIsEditModalOpen(false)}
                >
                    <ModalHeader title="Edit Stall" />
                    <StallForm
                        onCancel={() => setIsEditModalOpen(false)}
                        onSuccess={() => setIsEditModalOpen(false)}
                        stall={selectedStall}
                    />
                </Modal>
            </div>
        </AppLayout>
    );
}
