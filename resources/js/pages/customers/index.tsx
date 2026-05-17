import Heading from "@/components/heading";
import { Button } from "@/components/ui/button";
import { DataTable } from "@/components/ui/data-table";
import AppLayout from "@/layouts/app-layout";
import { BreadcrumbItem, PageProps } from "@/types";
import { Head, router, usePage } from "@inertiajs/react";
import { ColumnDef } from "@tanstack/react-table";
import { Download, InfoIcon } from "lucide-react";
import { DropdownMenu, DropdownMenuTrigger, DropdownMenuContent, DropdownMenuItem } from "@/components/ui/dropdown-menu";
import { Input } from "@/components/ui/input";
import { Search, X } from "lucide-react";
import { useDebounce } from "@/hooks/use-debounce";
import { useState, useEffect } from "react";

interface cars {
    id: string;
    plate_number: string;
    model: string;
    color: string;
    photo: string;
}

interface CustomerProps {
    id: string;
    name: string;
    phone: string;
    email: string;
    ktp_photo: string;
    cars: cars[];
}

export default function CustomerIndex() {
    const { props } = usePage<PageProps<{ customers: CustomerProps }>>();
    const customers = props.customers.data;
    const pagination = props.customers;
    const [perPage, setPerPage] = useState(pagination.per_page || 10);
    const [searchQuery, setSearchQuery] = useState("");
    const debouncedSearchQuery = useDebounce(searchQuery, 500);

    const handlePageChange = (page: number) => {
        router.get(
            route("customers.index"),
            { page, per_page: perPage, search: debouncedSearchQuery },
            { preserveState: true },
        );
    };

    const handlePerPageChange = (newPerPage: number) => {
        setPerPage(newPerPage);
        router.get(
            route("customers.index"),
            { page: 1, per_page: newPerPage, search: debouncedSearchQuery },
            { preserveState: true },
        );
    };

    useEffect(() => {
        router.get(
            route("customers.index"),
            { page: 1, per_page: perPage, search: debouncedSearchQuery },
            { preserveState: true },
        );
    }, [debouncedSearchQuery]);

    const clearSearch = () => {
        setSearchQuery("");
    };

    const columns: ColumnDef<CustomerProps>[] = [
        { accessorKey: "name", header: "Name" },
        { accessorKey: "phone", header: "Phone" },
        { accessorKey: "email", header: "Email" },
        {
            accessorKey: "actions",
            header: "Actions",
            cell: (info) => (
                <>
                    <Button
                        size="icon"
                        variant={"outline"}
                        onClick={() => {
                            const customerId = info.row.original.id;
                            router.visit(route("customers.show", customerId));
                        }}
                    >
                        <InfoIcon />
                    </Button>
                </>
            ),
        },
    ];

    const breadcrumbs: BreadcrumbItem[] = [
        { title: "Customers", href: "/customers" },
    ];

    return (
        <AppLayout breadcrumbs={breadcrumbs}>
            <Head title="Customers" />
            <div className="flex h-full flex-1 flex-col gap-4 rounded-xl p-4">
                <div className="flex justify-between">
                    <Heading
                        title="Daftar Customers"
                        description="Lihat Data Customer."
                    />
                    <Button
                        className="bg-green-600"
                        onClick={() => {
                            window.open(route("customers.export"), "_blank");
                        }}
                    >
                        <Download />
                        Export Data Customer
                    </Button>
                </div>
                <div className="flex flex-col gap-2">
                    <div className="flex justify-between flex-row">
                        <div className="flex items-center gap-2">
                            <Button
                                variant="outline"
                                size="sm"
                                disabled={pagination.current_page === 1}
                                onClick={() => handlePageChange(pagination.current_page - 1)}
                            >
                                Previous
                            </Button>
                            <span className="mx-2 text-sm">
                                Halaman {pagination.current_page} dari {pagination.last_page}
                            </span>
                            <Button
                                variant="outline"
                                size="sm"
                                disabled={pagination.current_page === pagination.last_page}
                                onClick={() => handlePageChange(pagination.current_page + 1)}
                            >
                                Next
                            </Button>
                        </div>
                        <div className="flex flex-row items-center gap-2">
                            <div className="flex items-center gap-2 justify-end">
                                <span className="text-sm">Baris per halaman:</span>
                                <DropdownMenu>
                                    <DropdownMenuTrigger asChild>
                                        <Button
                                            variant="outline"
                                            size="sm"
                                            className="min-w-[60px] justify-between"
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
                            <div className="relative flex-1 max-w-md">
                                <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                                <Input
                                    placeholder="Cari nama/telepon/email..."
                                    value={searchQuery}
                                    onChange={(e) => setSearchQuery(e.target.value)}
                                    className="pl-10 pr-10"
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
                    </div>
                    <DataTable columns={columns} data={customers} getRowId={row => row.id?.toString()} />
                    <div className="text-sm text-muted-foreground mt-2">Total: {pagination.total} data</div>
                </div>
            </div>
        </AppLayout>
    );
}
