import Heading from "@/components/heading";
import { DataTable } from "@/components/ui/data-table";
import { Modal, ModalHeader } from "@/components/ui/modal";
import AppLayout from "@/layouts/app-layout";
import { BreadcrumbItem } from "@/types";
import { Head, router, usePage } from "@inertiajs/react";
import { ColumnDef } from "@tanstack/react-table";
import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Edit, Trash, Plus } from "lucide-react";
import CashierIncentiveTierForm from "./forms/incentive-tier-form";
import {
    AlertDialogHeader,
    AlertDialogFooter,
    AlertDialog,
    AlertDialogContent,
    AlertDialogDescription,
    AlertDialogTitle,
} from "@/components/ui/alert-dialog";

interface CashierIncentiveTier {
    id: number;
    name: string;
    min_packets: number;
    max_packets: number | null;
    commission_per_packet: number;
}

interface PageProps {
    tiers: CashierIncentiveTier[];
}

const formatToIDR = (value: number) => {
    return new Intl.NumberFormat("id-ID", {
        style: "currency",
        currency: "IDR",
        minimumFractionDigits: 0,
    }).format(value);
};

export default function CashierIncentiveTiersIndex() {
    const { props } = usePage<any>();
    const tiers = (props.tiers as CashierIncentiveTier[]) || [];

    const [isModalOpen, setIsModalOpen] = useState(false);
    const [isEditModalOpen, setIsEditModalOpen] = useState(false);
    const [isDeleteAlertOpen, setIsDeleteAlertOpen] = useState(false);
    const [selectedTier, setSelectedTier] = useState<CashierIncentiveTier | null>(null);

    const breadcrumbs: BreadcrumbItem[] = [
        { title: "Settings", href: "/settings/profile" },
        { title: "Master Tier Insentif Kasir", href: "/settings/cashier-incentive-tiers" },
    ];

    const columns: ColumnDef<CashierIncentiveTier>[] = [
        {
            id: "index",
            header: "No",
            cell: (row) => <div>{row.row.index + 1}</div>,
        },
        {
            accessorKey: "name",
            header: "Nama Tier",
            cell: (info) => <div className="font-semibold text-foreground">{info.getValue() as string}</div>,
        },
        {
            header: "Rentang Jumlah Paket",
            cell: (row) => {
                const tier = row.row.original;
                if (tier.max_packets === null) {
                    return <span>&gt; {tier.min_packets} Paket</span>;
                }
                return <span>{tier.min_packets} - {tier.max_packets} Paket</span>;
            },
        },
        {
            accessorKey: "commission_per_packet",
            header: "Komisi per Paket",
            cell: (info) => (
                <div className="font-medium text-emerald-600 dark:text-emerald-400">
                    {formatToIDR(info.getValue() as number)}
                </div>
            ),
        },
        {
            id: "actions",
            header: "Aksi",
            cell: (info) => (
                <div className="flex flex-row gap-1">
                    <Button
                        size="icon"
                        variant="outline"
                        onClick={() => {
                            setSelectedTier(info.row.original);
                            setIsEditModalOpen(true);
                        }}
                    >
                        <Edit className="h-4 w-4" />
                    </Button>
                    <Button
                        size="icon"
                        variant="destructive"
                        onClick={() => {
                            setSelectedTier(info.row.original);
                            setIsDeleteAlertOpen(true);
                        }}
                    >
                        <Trash className="h-4 w-4" />
                    </Button>
                </div>
            ),
        },
    ];

    function handleDelete(id: number) {
        router.delete(route("cashier-incentive-tiers.destroy", id), {
            onSuccess: () => setIsDeleteAlertOpen(false),
        });
    }

    return (
        <AppLayout breadcrumbs={breadcrumbs}>
            <Head title="Master Tier Insentif Kasir" />
            <div className="flex h-full flex-1 flex-col gap-4 rounded-xl p-4 lg:p-6">
                <div className="flex justify-between items-center">
                    <Heading
                        title="Master Tier Insentif Kasir"
                        description="Konfigurasi rentang jumlah cucian paket dan komisi insentif per paket."
                    />
                    <Button onClick={() => setIsModalOpen(true)} className="flex items-center gap-1">
                        <Plus className="h-4 w-4" /> Tambah Tier Insentif
                    </Button>
                </div>

                <DataTable columns={columns} data={tiers} />
            </div>

            <Modal open={isModalOpen} onClose={() => setIsModalOpen(false)}>
                <ModalHeader title="Tambah Tier Insentif" />
                <CashierIncentiveTierForm
                    onSuccess={() => setIsModalOpen(false)}
                    onCancel={() => setIsModalOpen(false)}
                />
            </Modal>

            <Modal open={isEditModalOpen} onClose={() => setIsEditModalOpen(false)}>
                <ModalHeader title="Edit Tier Insentif" />
                <CashierIncentiveTierForm
                    tier={selectedTier}
                    onSuccess={() => setIsEditModalOpen(false)}
                    onCancel={() => setIsEditModalOpen(false)}
                />
            </Modal>

            <AlertDialog open={isDeleteAlertOpen}>
                <AlertDialogContent>
                    <AlertDialogHeader>
                        <AlertDialogTitle>
                            Hapus Tier Insentif <strong>{selectedTier?.name}</strong>?
                        </AlertDialogTitle>
                        <AlertDialogDescription>
                            Tindakan ini tidak dapat dibatalkan. Anda yakin ingin menghapus tier insentif ini?
                        </AlertDialogDescription>
                    </AlertDialogHeader>
                    <AlertDialogFooter>
                        <Button
                            variant="secondary"
                            onClick={() => setIsDeleteAlertOpen(false)}
                        >
                            Batal
                        </Button>
                        <Button
                            type="button"
                            variant="destructive"
                            onClick={() => {
                                if (selectedTier?.id) {
                                    handleDelete(selectedTier.id);
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
