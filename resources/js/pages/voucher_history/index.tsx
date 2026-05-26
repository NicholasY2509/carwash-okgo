import Heading from "@/components/heading";
import { Button } from "@/components/ui/button";
import { DataTable } from "@/components/ui/data-table";
import { Badge } from "@/components/ui/badge";
import { Input } from "@/components/ui/input";
import AppLayout from "@/layouts/app-layout";
import { BreadcrumbItem, PageProps } from "@/types";
import { Head, usePage, router } from "@inertiajs/react";
import { route } from "ziggy-js";
import { ColumnDef } from "@tanstack/react-table";
import { format } from "date-fns";
import { Search, X, Calendar as CalendarIcon } from "lucide-react";
import {
    DropdownMenu,
    DropdownMenuTrigger,
    DropdownMenuContent,
    DropdownMenuItem,
} from "@/components/ui/dropdown-menu";
import {
    Popover,
    PopoverContent,
    PopoverTrigger,
} from "@/components/ui/popover";
import { useState, useEffect } from "react";
import { useDebounce } from "@/hooks/use-debounce";
import { Pagination } from "@/components/ui/pagination";

const breadcrumbs: BreadcrumbItem[] = [
    {
        title: "Riwayat Voucher",
        href: "/voucher-history",
    },
];

interface HistoryRow {
    event_type: "generation" | "usage";
    event_id: string;
    event_date: string;
    actor_name: string;
    voucher_serials: string;
    voucher_count: number;
}

export default function VoucherHistoryIndex() {
    const { props } = usePage<PageProps<{ history: any }>>();
    const pagination = props.history || {
        data: [],
        per_page: 10,
        current_page: 1,
        last_page: 1,
    };

    // Check if query params exist for initial state
    const queryParams = new URLSearchParams(window.location.search);
    const initialSearch = queryParams.get("search") || "";
    const initialStartDate = queryParams.get("start_date") || "";
    const initialEndDate = queryParams.get("end_date") || "";

    const [perPage, setPerPage] = useState(pagination.per_page || 10);
    const [searchQuery, setSearchQuery] = useState(initialSearch);
    const [startDate, setStartDate] = useState(initialStartDate);
    const [endDate, setEndDate] = useState(initialEndDate);

    const debouncedSearchQuery = useDebounce(searchQuery, 500);

    const columns: ColumnDef<HistoryRow>[] = [
        {
            id: "index",
            header: "No",
            cell: (row) =>
                row.row.index +
                1 +
                (pagination.current_page - 1) * pagination.per_page,
        },
        {
            accessorKey: "event_type",
            header: "Event",
            cell: ({ row }) => {
                const type = row.original.event_type;
                if (type === "generation") {
                    return (
                        <Badge
                            variant="outline"
                            className="bg-blue-50 text-blue-700 border-blue-300"
                        >
                            Generated
                        </Badge>
                    );
                }
                return (
                    <Badge
                        variant="outline"
                        className="bg-green-50 text-green-700 border-green-300"
                    >
                        Used
                    </Badge>
                );
            },
        },
        {
            accessorKey: "event_date",
            header: "Tanggal",
            cell: ({ row }) => {
                return format(
                    new Date(row.original.event_date),
                    "dd MMM yyyy HH:mm",
                );
            },
        },
        {
            accessorKey: "actor_name",
            header: "Oleh",
            cell: ({ row }) => {
                const name = row.original.actor_name;
                const type = row.original.event_type;
                if (!name) return "-";
                return (
                    <div className="flex flex-col">
                        <span className="font-medium">{name}</span>
                        <span className="text-[10px] text-muted-foreground uppercase tracking-wider">
                            {type === "generation" ? "Staff Kasir" : "Customer"}
                        </span>
                    </div>
                );
            },
        },
        {
            accessorKey: "voucher_serials",
            header: "Voucher",
            cell: ({ row }) => {
                const serials = row.original.voucher_serials;
                const type = row.original.event_type;

                if (!serials)
                    return (
                        <span className="text-muted-foreground italic">
                            Pending / Assign on use
                        </span>
                    );

                if (type === "usage") {
                    return (
                        <span className="font-mono font-semibold tracking-wider">
                            {serials}
                        </span>
                    );
                }

                // Generation might have multiple
                const serialArray = serials.split(",").map((s) => s.trim());
                if (serialArray.length <= 3) {
                    return (
                        <div className="flex flex-col gap-1">
                            {serialArray.map((s) => (
                                <span
                                    key={s}
                                    className="font-mono text-sm tracking-wider bg-muted px-1.5 py-0.5 rounded w-max"
                                >
                                    {s}
                                </span>
                            ))}
                        </div>
                    );
                }

                return (
                    <Popover>
                        <PopoverTrigger asChild>
                            <div className="flex flex-col gap-1 cursor-pointer hover:opacity-80 transition-opacity">
                                {serialArray.slice(0, 2).map((s) => (
                                    <span
                                        key={s}
                                        className="font-mono text-sm tracking-wider bg-muted px-1.5 py-0.5 rounded w-max"
                                    >
                                        {s}
                                    </span>
                                ))}
                                <span className="text-xs text-muted-foreground font-medium bg-muted/50 px-1.5 py-0.5 rounded w-max hover:bg-muted/80">
                                    +{serialArray.length - 2} voucher lainnya
                                </span>
                            </div>
                        </PopoverTrigger>
                        <PopoverContent className="w-64 max-h-[300px] overflow-y-auto">
                            <div className="space-y-2">
                                <h4 className="font-semibold text-sm">Daftar Voucher</h4>
                                <div className="grid gap-1">
                                    {serialArray.map((s) => (
                                        <span
                                            key={s}
                                            className="font-mono text-sm tracking-wider bg-muted px-2 py-1 rounded border text-center"
                                        >
                                            {s}
                                        </span>
                                    ))}
                                </div>
                            </div>
                        </PopoverContent>
                    </Popover>
                );
            },
        },
        {
            accessorKey: "voucher_count",
            header: "Jumlah",
            cell: ({ row }) => {
                return (
                    <span className="font-medium">
                        {row.original.voucher_count}
                    </span>
                );
            },
        },
    ];

    const fetchHistory = (
        page = 1,
        currentPerPage = perPage,
        currentSearch = debouncedSearchQuery,
        currentStart = startDate,
        currentEnd = endDate,
    ) => {
        router.get(
            route("voucher-history.index"),
            {
                page,
                per_page: currentPerPage,
                search: currentSearch,
                start_date: currentStart,
                end_date: currentEnd,
            },
            { preserveState: true },
        );
    };

    const handlePageChange = (page: number) => {
        fetchHistory(page);
    };

    const handlePerPageChange = (newPerPage: number) => {
        setPerPage(newPerPage);
        fetchHistory(1, newPerPage);
    };

    useEffect(() => {
        // Prevent fetching on initial render if debouncedSearchQuery matches initial state
        if (debouncedSearchQuery !== initialSearch) {
            fetchHistory(1);
        }
    }, [debouncedSearchQuery]);

    const handleDateChange = () => {
        fetchHistory(1);
    };

    const clearSearch = () => setSearchQuery("");

    const clearDates = () => {
        setStartDate("");
        setEndDate("");
        fetchHistory(1, perPage, debouncedSearchQuery, "", "");
    };

    return (
        <AppLayout breadcrumbs={breadcrumbs}>
            <Head title="Riwayat Voucher" />
            <div className="flex h-full flex-1 flex-col gap-4 rounded-xl p-4">
                <div className="flex justify-between">
                    <Heading
                        title="Riwayat Penggunaan & Pembuatan Voucher"
                        description="Pantau semua aktivitas voucher secara kronologis."
                    />
                </div>

                <div className="flex flex-col gap-4">
                    <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4 bg-white p-4 rounded-lg border">
                        <div className="flex flex-wrap items-center gap-3 w-full md:w-auto">
                            <div className="flex items-center gap-2 border rounded-md px-3 py-1.5 bg-background">
                                <CalendarIcon className="h-4 w-4 text-muted-foreground" />
                                <div className="flex items-center gap-2">
                                    <Input
                                        type="date"
                                        value={startDate}
                                        onChange={(e) =>
                                            setStartDate(e.target.value)
                                        }
                                        className="h-7 w-auto border-none shadow-none focus-visible:ring-0 px-0"
                                    />
                                    <span className="text-muted-foreground">
                                        -
                                    </span>
                                    <Input
                                        type="date"
                                        value={endDate}
                                        onChange={(e) =>
                                            setEndDate(e.target.value)
                                        }
                                        className="h-7 w-auto border-none shadow-none focus-visible:ring-0 px-0"
                                    />
                                </div>
                                {(startDate || endDate) && (
                                    <Button
                                        variant="ghost"
                                        size="sm"
                                        onClick={clearDates}
                                        className="h-6 w-6 p-0 ml-1 rounded-full"
                                    >
                                        <X className="h-3 w-3" />
                                    </Button>
                                )}
                            </div>
                            <Button
                                size="sm"
                                onClick={handleDateChange}
                                disabled={!startDate && !endDate}
                            >
                                Filter Tanggal
                            </Button>
                        </div>

                        <div className="flex items-center gap-2 w-full md:w-auto">
                            <div className="flex items-center gap-2">
                                <span className="text-sm text-muted-foreground whitespace-nowrap">
                                    Baris per halaman:
                                </span>
                                <DropdownMenu>
                                    <DropdownMenuTrigger asChild>
                                        <Button
                                            variant="outline"
                                            size="sm"
                                            className="min-w-[60px] justify-between h-9"
                                        >
                                            {perPage}
                                        </Button>
                                    </DropdownMenuTrigger>
                                    <DropdownMenuContent align="end">
                                        {[10, 20, 50, 100].map((size) => (
                                            <DropdownMenuItem
                                                key={size}
                                                onSelect={() =>
                                                    handlePerPageChange(size)
                                                }
                                            >
                                                {size}
                                            </DropdownMenuItem>
                                        ))}
                                    </DropdownMenuContent>
                                </DropdownMenu>
                            </div>
                            <div className="relative w-full md:w-64">
                                <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                                <Input
                                    placeholder="Serial / Nama..."
                                    value={searchQuery}
                                    onChange={(e) =>
                                        setSearchQuery(e.target.value)
                                    }
                                    className="pl-9 pr-8 h-9 text-sm w-full"
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
                    <DataTable columns={columns} data={pagination.data || []} />
                    {pagination && pagination.data.length > 0 && (
                        <Pagination
                            pagination={pagination}
                            onPageChange={handlePageChange}
                            label="riwayat voucher"
                        />
                    )}
                </div>
            </div>
        </AppLayout>
    );
}
