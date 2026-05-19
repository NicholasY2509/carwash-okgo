import Heading from "@/components/heading";
import { DataTable } from "@/components/ui/data-table";
import { Modal, ModalHeader } from "@/components/ui/modal";
import AppLayout from "@/layouts/app-layout";
import { BreadcrumbItem, PageProps } from "@/types";
import { Head, router, usePage } from "@inertiajs/react";
import { ColumnDef } from "@tanstack/react-table";
import { useState, useEffect } from "react";
import CarTypeForm from "./forms/car-type-form";
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

interface CarType {
    id: number;
    name: string;
    description: string | null;
}

interface PaginationProp {
    current_page: number;
    last_page: number;
    per_page: number;
    total: number;
    data: CarType[];
}

export default function CarTypeIndex() {
    const { props } = usePage<PageProps<{ carTypes: PaginationProp; filters: { search: string; per_page: number } }>>();
    const pagination = props.carTypes;
    const [perPage, setPerPage] = useState(props.filters?.per_page || 10);
    const [searchQuery, setSearchQuery] = useState(props.filters?.search || "");
    const debouncedSearchQuery = useDebounce(searchQuery, 500);

    const [isModalOpen, setIsModalOpen] = useState(false);
    const [isEditModalOpen, setIsEditModalOpen] = useState(false);
    const [isDeleteAlertOpen, setIsDeleteAlertOpen] = useState(false);
    const [selectedCarType, setSelectedCarType] = useState<CarType | null>(null);

    const breadcrumbs: BreadcrumbItem[] = [
        { title: "Customers", href: "/customers" },
        { title: "Tipe Mobil", href: "/car-types" },
    ];

    const columns: ColumnDef<CarType>[] = [
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
            header: "Nama Tipe Mobil",
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
                            setSelectedCarType(info.row.original);
                        }}
                    >
                        <Edit className="h-4 w-4" />
                    </Button>
                    <Button
                        size="icon"
                        variant={"destructive"}
                        onClick={() => {
                            setSelectedCarType(info.row.original);
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
        router.delete(route("car-types.destroy", id), {
            onSuccess: () => setIsDeleteAlertOpen(false),
        });
    }

    const handlePageChange = (page: number) => {
        router.get(
            route("car-types.index"),
            { page, per_page: perPage, search: debouncedSearchQuery },
            { preserveState: true }
        );
    };

    const handlePerPageChange = (newPerPage: number) => {
        setPerPage(newPerPage);
        router.get(
            route("car-types.index"),
            { page: 1, per_page: newPerPage, search: debouncedSearchQuery },
            { preserveState: true }
        );
    };

    useEffect(() => {
        router.get(
            route("car-types.index"),
            { page: 1, per_page: perPage, search: debouncedSearchQuery },
            { preserveState: true, replace: true }
        );
    }, [debouncedSearchQuery]);

    const clearSearch = () => {
        setSearchQuery("");
    };

    return (
        <AppLayout breadcrumbs={breadcrumbs}>
            <Head title="Tipe Mobil" />
            <div className="flex h-full flex-1 flex-col gap-4 rounded-xl p-4">
                <div className="flex justify-between items-center">
                    <Heading
                        title="Master Tipe Mobil"
                        description="Kelola kategori / tipe mobil yang dilayani oleh car wash."
                    />
                    <Button onClick={() => setIsModalOpen(true)} className="flex items-center gap-1">
                        <Plus className="h-4 w-4" /> Tambah Tipe Mobil
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
                                placeholder="Cari tipe mobil..."
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
                    <DataTable columns={columns} data={pagination.data} />
                    {pagination && (
                        <Pagination
                            pagination={pagination}
                            onPageChange={handlePageChange}
                            label="tipe mobil"
                        />
                    )}
                </div>
            </div>

            <Modal open={isModalOpen} onClose={() => setIsModalOpen(false)}>
                <ModalHeader title="Tambah Tipe Mobil" />
                <CarTypeForm
                    onSuccess={() => setIsModalOpen(false)}
                    onCancel={() => setIsModalOpen(false)}
                />
            </Modal>

            <Modal
                open={isEditModalOpen}
                onClose={() => setIsEditModalOpen(false)}
            >
                <ModalHeader title="Edit Tipe Mobil" />
                <CarTypeForm
                    carType={selectedCarType}
                    onSuccess={() => setIsEditModalOpen(false)}
                    onCancel={() => setIsEditModalOpen(false)}
                />
            </Modal>

            <AlertDialog open={isDeleteAlertOpen}>
                <AlertDialogContent>
                    <AlertDialogHeader>
                        <AlertDialogTitle>
                            Hapus Tipe Mobil{" "}
                            <strong>{selectedCarType?.name}</strong> ?
                        </AlertDialogTitle>
                        <AlertDialogDescription>
                            Tindakan ini tidak dapat dibatalkan. Anda yakin ingin menghapus tipe mobil{" "}
                            <strong>{selectedCarType?.name}</strong>?
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
                                if (selectedCarType?.id) {
                                    handleDelete(selectedCarType.id);
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
