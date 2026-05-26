import Heading from "@/components/heading";
import { Button } from "@/components/ui/button";
import { DataTable } from "@/components/ui/data-table";
import { Modal, ModalHeader } from "@/components/ui/modal";
import AppLayout from "@/layouts/app-layout";
import { BreadcrumbItem, PageProps } from "@/types";
import { Head, usePage } from "@inertiajs/react";
import { ColumnDef } from "@tanstack/react-table";
import { Edit, Plus } from "lucide-react";
import { useState } from "react";
import VoucherTypeForm from "./forms/voucher-type-form";

interface VoucherTypeProps {
    id: number;
    name: string;
    is_free: boolean;
    only_one_car: boolean;
    description: string;
}

export default function VoucherTypeIndex() {
    const { props } =
        usePage<PageProps<{ voucherTypes: VoucherTypeProps[] }>>();
    const voucherTypes = props.voucherTypes;

    const [isModalOpen, setIsModalOpen] = useState(false);
    const [isModalEditOpen, setIsModalEditOpen] = useState(false);
    const [selectedVoucherType, setSelectedVoucherType] =
        useState<VoucherTypeProps | null>(null);

    const breadcrumbs: BreadcrumbItem[] = [
        { title: "Voucher Types", href: "/voucher-types" },
    ];

    const columns: ColumnDef<VoucherTypeProps>[] = [
        {
            header: "No",
            accessorKey: "index",
            cell: (row) => row.row.index + 1,
        },
        { accessorKey: "name", header: "Name" },
        { accessorKey: "voucher_suffix", header: "Suffix" },
        { accessorKey: "description", header: "Description" },
        {
            accessorKey: "is_free",
            header: "Berbayar",
            cell: (info) => (info.getValue() ? "Tidak" : "Iya"),
        },
        {
            accessorKey: "only_one_car",
            header: "Bebas Nopol",
            cell: (info) => (info.getValue() ? "Tidak" : "Iya"),
        },
        {
            accessorKey: "actions",
            header: "Actions",
            cell: (row) => (
                <Button
                    size="icon"
                    variant={"outline"}
                    onClick={() => {
                        setIsModalEditOpen(true);
                        setSelectedVoucherType(row.row.original);
                    }}
                >
                    <Edit />
                </Button>
            ),
        },
    ];

    return (
        <AppLayout breadcrumbs={breadcrumbs}>
            <Head title="Tipe Voucher" />
            <div className="flex h-full flex-1 flex-col gap-4 rounded-xl p-4">
                <div className="flex justify-between">
                    <Heading
                        title="Tipe Voucher"
                        description="Lihat dan edit tipe voucher"
                    />
                    <Button
                        variant="default"
                        size="lg"
                        onClick={() => setIsModalOpen(true)}
                    >
                        Tambah Tipe Voucher <Plus />
                    </Button>
                </div>
                <DataTable columns={columns} data={voucherTypes} />
            </div>

            <Modal open={isModalOpen} onClose={() => setIsModalOpen(false)}>
                <ModalHeader title="Tambah Tipe Voucher" />
                <VoucherTypeForm
                    onSuccess={() => setIsModalOpen(false)}
                    onCancel={() => setIsModalOpen(false)}
                />
            </Modal>

            <Modal
                open={isModalEditOpen}
                onClose={() => setIsModalEditOpen(false)}
            >
                <ModalHeader title="Edit Tipe Voucher" />
                <VoucherTypeForm
                    onSuccess={() => setIsModalEditOpen(false)}
                    onCancel={() => setIsModalEditOpen(false)}
                    voucherType={selectedVoucherType}
                />
            </Modal>
        </AppLayout>
    );
}
