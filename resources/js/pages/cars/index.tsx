import Heading from "@/components/heading";
import { Button } from "@/components/ui/button";
import { DataTable } from "@/components/ui/data-table";
import AppLayout from "@/layouts/app-layout";
import { BreadcrumbItem, PageProps } from "@/types";
import { Head, router, usePage } from "@inertiajs/react";
import { Pagination } from "@/components/ui/pagination";
import { ColumnDef } from "@tanstack/react-table";
import { InfoIcon } from "lucide-react";
import { DropdownMenu, DropdownMenuTrigger, DropdownMenuContent, DropdownMenuItem } from "@/components/ui/dropdown-menu";
import { Input } from "@/components/ui/input";
import { Search, X } from "lucide-react";
import { useDebounce } from "@/hooks/use-debounce";
import { useState, useEffect } from "react";

interface CarProp {
    id: string;
    plate_number: string;
    model: string;
    color: string;
    photo: string;
    customer: {
        name: string;
    };
    car_type?: {
        name: string;
    } | null;
}

export default function CustomerIndex() {
    const { props } = usePage<PageProps<{ cars: CarProp }>>();
    const cars = props.cars.data;
    const pagination = props.cars;
    const [perPage, setPerPage] = useState(pagination.per_page || 10);
    const [searchQuery, setSearchQuery] = useState("");
    const debouncedSearchQuery = useDebounce(searchQuery, 500);

    const handlePageChange = (page: number) => {
        router.get(
            route("cars.index"),
            { page, per_page: perPage, search: debouncedSearchQuery },
            { preserveState: true },
        );
    };

    const handlePerPageChange = (newPerPage: number) => {
        setPerPage(newPerPage);
        router.get(
            route("cars.index"),
            { page: 1, per_page: newPerPage, search: debouncedSearchQuery },
            { preserveState: true },
        );
    };

    useEffect(() => {
        router.get(
            route("cars.index"),
            { page: 1, per_page: perPage, search: debouncedSearchQuery },
            { preserveState: true },
        );
    }, [debouncedSearchQuery]);

    const clearSearch = () => {
        setSearchQuery("");
    };

    const columns: ColumnDef<CarProp>[] = [
        { accessorKey: "plate_number", header: "Plat Nomor" },
        { accessorKey: "model", header: "Model" },
        { accessorKey: "color", header: "Warna" },
        { 
            accessorKey: "car_type.name", 
            header: "Tipe Mobil",
            cell: (info) => (info.getValue() as string) || <span className="text-muted-foreground/50 italic">-</span>
        },
        { accessorKey: "customer.name", header: "Customer" },
        {
            accessorKey: "actions",
            header: "Actions",
            cell: (info) => (
                <Button
                    size="icon"
                    variant={"outline"}
                    onClick={() => {
                        const carId = info.row.original.id;
                        router.visit(route("cars.show", carId));
                    }}
                >
                    <InfoIcon />
                </Button>
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
                        title="Daftar Mobil Customers"
                        description="Lihat daftar mobil."
                    />
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
                                placeholder="Cari plat/model/warna/customer..."
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
                    <DataTable columns={columns} data={cars} getRowId={row => row.id?.toString()} />
                    {pagination && (
                        <Pagination
                            pagination={pagination}
                            onPageChange={handlePageChange}
                            label="mobil"
                        />
                    )}
                </div>
            </div>
        </AppLayout>
    );
}
