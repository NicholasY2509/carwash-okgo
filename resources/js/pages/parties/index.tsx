import Heading from "@/components/heading";
import { DataTable } from "@/components/ui/data-table";
import { Modal, ModalHeader } from "@/components/ui/modal";
import AppLayout from "@/layouts/app-layout";
import { BreadcrumbItem, PageProps } from "@/types";
import { Head, router, usePage } from "@inertiajs/react";
import { ColumnDef } from "@tanstack/react-table";
import { useState, useEffect } from "react";
import PartyForm from "./forms/party-form";
import { Button } from "@/components/ui/button";
import { Edit, Trash, Plus, Search, X } from "lucide-react";
import { Input } from "@/components/ui/input";
import { useDebounce } from "@/hooks/use-debounce";
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

interface Party {
    id: number;
    name: string;
    description: string | null;
}

interface PaginationProp {
    current_page: number;
    last_page: number;
    per_page: number;
    total: number;
    data: Party[];
}

export default function PartyIndex() {
    const { props } = usePage<PageProps<{ parties: PaginationProp; filters: { search: string; per_page: number } }>>();
    const pagination = props.parties;
    const [perPage, setPerPage] = useState(props.filters?.per_page || 10);
    const [searchQuery, setSearchQuery] = useState(props.filters?.search || "");
    const debouncedSearchQuery = useDebounce(searchQuery, 500);

    const [isModalOpen, setIsModalOpen] = useState(false);
    const [isEditModalOpen, setIsEditModalOpen] = useState(false);
    const [isDeleteAlertOpen, setIsDeleteAlertOpen] = useState(false);
    const [selectedParty, setSelectedParty] = useState<Party | null>(null);

    const breadcrumbs: BreadcrumbItem[] = [
        { title: "Dashboard", href: "/dashboard" },
        { title: "Pihak Bagi Hasil", href: "/parties" },
    ];

    const columns: ColumnDef<Party>[] = [
        {
            accessorKey: "index",
            header: "No",
            cell: (row) => {
                const globalIndex = (pagination.current_page - 1) * pagination.per_page + row.row.index + 1;
                return <div>{globalIndex}</div>;
            },
        },
        { 
            accessorKey: "name", 
            header: "Nama Pihak",
            cell: (info) => <div className="font-medium text-foreground">{info.getValue() as string}</div>
        },
        { 
            accessorKey: "description", 
            header: "Deskripsi",
            cell: (info) => (
                <div className="max-w-[400px] truncate text-muted-foreground">
                    {info.getValue() as string || <span className="text-gray-300 italic">Tidak ada deskripsi</span>}
                </div>
            )
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
                            setSelectedParty(info.row.original);
                        }}
                    >
                        <Edit className="h-4 w-4" />
                    </Button>
                    <Button
                        size="icon"
                        variant={"destructive"}
                        onClick={() => {
                            setSelectedParty(info.row.original);
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
        router.delete(route("parties.destroy", id), {
            onSuccess: () => setIsDeleteAlertOpen(false),
        });
    }

    const handlePageChange = (page: number) => {
        router.get(
            route("parties.index"),
            { page, per_page: perPage, search: debouncedSearchQuery },
            { preserveState: true }
        );
    };

    const handlePerPageChange = (newPerPage: number) => {
        setPerPage(newPerPage);
        router.get(
            route("parties.index"),
            { page: 1, per_page: newPerPage, search: debouncedSearchQuery },
            { preserveState: true }
        );
    };

    useEffect(() => {
        router.get(
            route("parties.index"),
            { page: 1, per_page: perPage, search: debouncedSearchQuery },
            { preserveState: true, replace: true }
        );
    }, [debouncedSearchQuery]);

    const clearSearch = () => {
        setSearchQuery("");
    };

    return (
        <AppLayout breadcrumbs={breadcrumbs}>
            <Head title="Pihak Bagi Hasil" />
            <div className="flex h-full flex-1 flex-col gap-4 rounded-xl p-4">
                <div className="flex justify-between items-center">
                    <Heading
                        title="Master Pihak Bagi Hasil"
                        description="Kelola pihak-pihak penerima pembagian hasil laba/omset produk."
                    />
                    <Button onClick={() => setIsModalOpen(true)} className="flex items-center gap-1">
                        <Plus className="h-4 w-4" /> Tambah Pihak
                    </Button>
                </div>
                <div className="flex flex-col gap-4">
                    <div className="flex justify-end flex-row items-center gap-2">
                        <div className="flex items-center gap-2">
                            <span className="text-sm text-muted-foreground whitespace-nowrap">Baris per halaman:</span>
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
                                            onSelect={() => handlePerPageChange(size)}
                                        >
                                            {size}
                                        </DropdownMenuItem>
                                    ))}
                                </DropdownMenuContent>
                            </DropdownMenu>
                        </div>
                        <div className="relative w-full max-w-xs">
                            <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                            <Input
                                placeholder="Cari pihak..."
                                value={searchQuery}
                                onChange={(e) => setSearchQuery(e.target.value)}
                                className="pl-9 pr-8 h-8 text-sm"
                            />
                            {searchQuery && (
                                <Button
                                    variant="ghost"
                                    size="sm"
                                    onClick={clearSearch}
                                    className="absolute right-1 top-1/2 transform -translate-y-1/2 h-6 w-6 p-0"
                                >
                                    <X className="h-4 w-4" />
                                </Button>
                            )}
                        </div>
                    </div>
                    <DataTable columns={columns} data={pagination?.data || []} />
                    {pagination && (
                        <Pagination
                            pagination={pagination}
                            onPageChange={handlePageChange}
                            label="pihak bagi hasil"
                        />
                    )}
                </div>
            </div>

            <Modal open={isModalOpen} onClose={() => setIsModalOpen(false)}>
                <ModalHeader title="Tambah Pihak Bagi Hasil" />
                <PartyForm
                    onSuccess={() => setIsModalOpen(false)}
                    onCancel={() => setIsModalOpen(false)}
                />
            </Modal>

            <Modal
                open={isEditModalOpen}
                onClose={() => setIsEditModalOpen(false)}
            >
                <ModalHeader title="Edit Pihak Bagi Hasil" />
                <PartyForm
                    party={selectedParty}
                    onSuccess={() => setIsEditModalOpen(false)}
                    onCancel={() => setIsEditModalOpen(false)}
                />
            </Modal>

            <AlertDialog open={isDeleteAlertOpen}>
                <AlertDialogContent>
                    <AlertDialogHeader>
                        <AlertDialogTitle>
                            Hapus Pihak <strong>{selectedParty?.name}</strong> ?
                        </AlertDialogTitle>
                        <AlertDialogDescription>
                            Tindakan ini tidak dapat dibatalkan. Anda yakin ingin menghapus pihak{" "}
                            <strong>{selectedParty?.name}</strong>? Semua persentase produk terkait pihak ini juga akan dihapus.
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
                            type="button"
                            variant={"destructive"}
                            onClick={() => {
                                if (selectedParty?.id) {
                                    handleDelete(selectedParty.id);
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
