import Heading from "@/components/heading";
import { Button } from "@/components/ui/button";
import {
    Sheet,
    SheetContent,
    SheetDescription,
    SheetFooter,
    SheetHeader,
    SheetTitle,
} from "@/components/ui/sheet";
import AppLayout from "@/layouts/app-layout";
import { BreadcrumbItem, PageProps } from "@/types";
import { Head, usePage, router } from "@inertiajs/react";
import { ColumnDef } from "@tanstack/react-table";
import { Edit, Plus, Search, X } from "lucide-react";
import { useRef, useState, useEffect } from "react";
import { DataTable } from "@/components/ui/data-table";
import StaffForm, { CreateStaffHandle } from "./forms/staff-form";
import { DropdownMenu, DropdownMenuTrigger, DropdownMenuContent, DropdownMenuItem } from "@/components/ui/dropdown-menu";
import { Input } from "@/components/ui/input";
import { useDebounce } from "@/hooks/use-debounce";
import { Pagination } from "@/components/ui/pagination";

interface WorkPosition {
    id: number;
    name: string;
}

interface User {
    id: number;
    name: string;
    email: string;
}

interface Staff {
    id: number;
    nik: string;
    full_name: string;
    first_name: string;
    last_name: string;
    phone: string;
    work_position_id: number | null;
    work_position: WorkPosition;
    user_id: number | null;
    user: User | null;
}

const breadcrumbs: BreadcrumbItem[] = [{ title: "Staff", href: "/staffs" }];

export default function StaffIndex() {
    const { props } = usePage<PageProps<{ staffs: any }>>();
    const staffs = props.staffs.data;
    const pagination = props.staffs;

    const staffFormRef = useRef<CreateStaffHandle>(null);
    const [isSheetOpen, setIsSheetOpen] = useState(false);
    const [isSheetEditOpen, setIsSheetEditOpen] = useState(false);
    const [selectedStaff, setSelectedStaff] = useState<Staff | null>(null);
    const [perPage, setPerPage] = useState(pagination.per_page || 10);
    const [searchQuery, setSearchQuery] = useState("");
    const debouncedSearchQuery = useDebounce(searchQuery, 500);

    const columns: ColumnDef<Staff>[] = [
        {
            accessorKey: "index",
            header: "No",
            cell: ({ row }) => (
                <div className="text-center">
                    {row.index + 1 + (pagination.current_page - 1) * pagination.per_page}
                </div>
            ),
        },
        { accessorKey: "nik", header: "NIK" },
        { accessorKey: "full_name", header: "Nama" },
        { accessorKey: "phone", header: "No Telepon" },
        { accessorKey: "work_position.name", header: "Posisi Kerja" },
        {
            accessorKey: "user.email",
            header: "Akun User",
            cell: ({ row }) => {
                const user = row.original.user;
                return user ? (
                    user.email
                ) : (
                    <span className="text-gray-500">Tidak ada</span>
                );
            },
        },
        {
            accessorKey: "actions",
            header: "Aksi",
            cell: ({ row }) => (
                <Button
                    size="icon"
                    variant={"outline"}
                    onClick={() => {
                        setIsSheetEditOpen(true);
                        setSelectedStaff(row.original);
                    }}
                >
                    <Edit className="h-4 w-4" />
                </Button>
            ),
        },
    ];

    const handlePageChange = (page: number) => {
        router.get(
            route("staffs.index"),
            { page, per_page: perPage, search: debouncedSearchQuery },
            { preserveState: true },
        );
    };

    const handlePerPageChange = (newPerPage: number) => {
        setPerPage(newPerPage);
        router.get(
            route("staffs.index"),
            { page: 1, per_page: newPerPage, search: debouncedSearchQuery },
            { preserveState: true },
        );
    };

    useEffect(() => {
        router.get(
            route("staffs.index"),
            { page: 1, per_page: perPage, search: debouncedSearchQuery },
            { preserveState: true },
        );
    }, [debouncedSearchQuery]);

    const clearSearch = () => {
        setSearchQuery("");
    };

    return (
        <AppLayout breadcrumbs={breadcrumbs}>
            <Head title="Staffs" />
            <div className="flex h-full flex-1 flex-col gap-4 rounded-xl p-4">
                <div className="flex justify-between">
                    <Heading title="Staff" description="Data dari karyawan." />
                    <Button
                        variant="default"
                        size="lg"
                        onClick={() => {
                            setSelectedStaff(null);
                            setIsSheetOpen(true);
                        }}
                    >
                        Tambah Staff <Plus className="ml-2 h-4 w-4" />
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
                                placeholder="Cari nama/NIK/telepon/posisi..."
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
                    <DataTable data={staffs} columns={columns} getRowId={row => row.id?.toString()} />
                    {pagination && (
                        <Pagination
                            pagination={pagination}
                            onPageChange={handlePageChange}
                            label="staff"
                        />
                    )}
                </div>
            </div>
            <Sheet open={isSheetOpen} onOpenChange={setIsSheetOpen}>
                <SheetContent className="overflow-y-auto">
                    <SheetHeader>
                        <SheetTitle>Tambah Staff</SheetTitle>
                        <SheetDescription>
                            Masukkan informasi dari staff yang akan ditambahkan.
                        </SheetDescription>
                    </SheetHeader>
                    <StaffForm
                        ref={staffFormRef}
                        onCancel={() => setIsSheetOpen(false)}
                        onSuccess={() => setIsSheetOpen(false)}
                    />
                    <SheetFooter className="pt-4">
                        <Button
                            variant={"secondary"}
                            onClick={() => setIsSheetOpen(false)}
                        >
                            Batal
                        </Button>
                        <Button
                            variant={"default"}
                            onClick={() => staffFormRef.current?.submit()}
                        >
                            Simpan Data Karyawan
                        </Button>
                    </SheetFooter>
                </SheetContent>
            </Sheet>

            {/* Sheet untuk Edit Staff */}
            <Sheet open={isSheetEditOpen} onOpenChange={setIsSheetEditOpen}>
                <SheetContent className="overflow-y-auto">
                    <SheetHeader>
                        <SheetTitle>Edit Staff</SheetTitle>
                        <SheetDescription>
                            Ubah informasi dari staff.
                        </SheetDescription>
                    </SheetHeader>
                    <StaffForm
                        ref={staffFormRef}
                        staff={selectedStaff}
                        onCancel={() => setIsSheetEditOpen(false)}
                        onSuccess={() => setIsSheetEditOpen(false)}
                    />
                    <SheetFooter className="pt-4">
                        <Button
                            variant={"secondary"}
                            onClick={() => setIsSheetEditOpen(false)}
                        >
                            Batal
                        </Button>
                        <Button
                            variant={"default"}
                            onClick={() => staffFormRef.current?.submit()}
                        >
                            Update Data Karyawan
                        </Button>
                    </SheetFooter>
                </SheetContent>
            </Sheet>
        </AppLayout>
    );
}
