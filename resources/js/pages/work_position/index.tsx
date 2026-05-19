import Heading from "@/components/heading";
import { Button } from "@/components/ui/button";
import { DataTable } from "@/components/ui/data-table";
import { Modal, ModalHeader } from "@/components/ui/modal";
import AppLayout from "@/layouts/app-layout";
import { BreadcrumbItem, PageProps } from "@/types";
import { Head, usePage } from "@inertiajs/react";
import { ColumnDef } from "@tanstack/react-table";
import { Edit, Plus } from "lucide-react";
import { useState, useEffect } from "react";
import WorkPositionForm from "./forms/work-position-form";
import { DropdownMenu, DropdownMenuTrigger, DropdownMenuContent, DropdownMenuItem } from "@/components/ui/dropdown-menu";
import { Input } from "@/components/ui/input";
import { Search, X } from "lucide-react";
import { useDebounce } from "@/hooks/use-debounce";
import { router } from "@inertiajs/react";
import { Pagination } from "@/components/ui/pagination";

interface WorkPosition {
    id: number;
    name: string;
    description: string;
}

const breadcrumbs: BreadcrumbItem[] = [
    { title: "Work Position", href: "/work-position" },
];

export default function Stalls() {
    const { props } = usePage<PageProps<{ workPositions: any }>>();
    const workPositions = props.workPositions.data;
    const pagination = props.workPositions;

    const columns: ColumnDef<WorkPosition>[] = [
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
                        setIsModalEditOpen(true);
                        setSelectedWorkPosition(row.row.original);
                    }}
                >
                    <Edit />
                </Button>
            ),
        },
    ];

    const [isModalOpen, setIsModalOpen] = useState(false);
    const [isModalEditOpen, setIsModalEditOpen] = useState(false);
    const [selectedWorkPosition, setSelectedWorkPosition] =
        useState<WorkPosition | null>(null);
    const [perPage, setPerPage] = useState(pagination.per_page || 10);
    const [searchQuery, setSearchQuery] = useState("");
    const debouncedSearchQuery = useDebounce(searchQuery, 500);

    const handlePageChange = (page: number) => {
        router.get(
            route("work-positions.index"),
            { page, per_page: perPage, search: debouncedSearchQuery },
            { preserveState: true }
        );
    };

    const handlePerPageChange = (newPerPage: number) => {
        setPerPage(newPerPage);
        router.get(
            route("work-positions.index"),
            { page: 1, per_page: newPerPage, search: debouncedSearchQuery },
            { preserveState: true },
        );
    };

    useEffect(() => {
        router.get(
            route("work-positions.index"),
            { page: 1, per_page: perPage, search: debouncedSearchQuery },
            { preserveState: true },
        );
    }, [debouncedSearchQuery]);

    const clearSearch = () => {
        setSearchQuery("");
    };

    return (
        <AppLayout breadcrumbs={breadcrumbs}>
            <Head title="Work Position" />
            <div className="flex h-full flex-1 flex-col gap-4 rounded-xl p-4">
                <div className="flex justify-between">
                    <Heading
                        title="Posisi Kerja"
                        description="Lihat dan edit posisi kerja yang ada."
                    />
                    <Button
                        variant="default"
                        size="lg"
                        onClick={() => setIsModalOpen(true)}
                    >
                        Tambah Posisi Kerja <Plus />
                    </Button>
                </div>
                <div className="flex flex-col gap-4">
                    <div className="flex justify-end flex-row items-center gap-2">
                        <div className="flex items-center gap-2">
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
                                placeholder="Cari nama/desk..."
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
                    <DataTable columns={columns} data={workPositions} getRowId={row => row.id?.toString()} />
                    {pagination && (
                        <Pagination
                            pagination={pagination}
                            onPageChange={handlePageChange}
                            label="posisi kerja"
                        />
                    )}
                </div>
            </div>
            <Modal open={isModalOpen} onClose={() => setIsModalOpen(false)}>
                <ModalHeader title="Tambah Posisi Kerja" />
                <WorkPositionForm
                    onCancel={() => setIsModalOpen(false)}
                    onSuccess={() => setIsModalOpen(false)}
                />
            </Modal>
            <Modal
                open={isModalEditOpen}
                onClose={() => setIsModalEditOpen(false)}
            >
                <ModalHeader title="Edit Posisi Kerja" />
                <WorkPositionForm
                    workPosition={selectedWorkPosition}
                    onCancel={() => setIsModalEditOpen(false)}
                    onSuccess={() => setIsModalEditOpen(false)}
                />
            </Modal>
        </AppLayout>
    );
}
