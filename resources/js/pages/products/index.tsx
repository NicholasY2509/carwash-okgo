import Heading from "@/components/heading";
import { Button } from "@/components/ui/button";
import { Modal, ModalHeader } from "@/components/ui/modal";
import AppLayout from "@/layouts/app-layout";
import { BreadcrumbItem, PageProps } from "@/types";
import { Head, Link, usePage } from "@inertiajs/react";
import { Edit, Plus, Trash } from "lucide-react";
import { useState } from "react";
import { ColumnDef } from "@tanstack/react-table";
import { DataTable } from "@/components/ui/data-table";
import ProductForm from "./forms/product-form";

const breadcrumbs: BreadcrumbItem[] = [
    {
        title: "Products",
        href: "/products",
    },
];

interface ProductSplitProp {
    id: number;
    product_id: number;
    party_id: number;
    percentage: number;
    party?: {
        id: number;
        name: string;
    };
}

interface ProductProp {
    id: number;
    name: string;
    description: string;
    price: number;
    is_active: boolean;
    is_split_profits: boolean;
    splits?: ProductSplitProp[];
    created_at: string;
}

interface PaginationProp {
    current_page: number;
    last_page: number;
    per_page: number;
    total: number;
}

export default function ProductIndex() {
    const { props } = usePage<
        PageProps<{
            products: ProductProp[];
            parties: { id: number; name: string }[];
            pagination: PaginationProp;
        }>
    >();
    const products = props.products;
    const parties = props.parties || [];
    const pagination = props.pagination;

    const [isModalOpen, setIsModalOpen] = useState(false);
    const [isEditModalOpen, setIsEditModalOpen] = useState(false);
    const [selectedProduct, setSelectedProduct] = useState<ProductProp | null>(
        null,
    );

    const columns: ColumnDef<ProductProp>[] = [
        { accessorKey: "name", header: "Name" },
        { accessorKey: "description", header: "Description" },
        {
            accessorKey: "price",
            header: "Price",
            cell: (info) =>
                new Intl.NumberFormat("id-ID", {
                    style: "currency",
                    currency: "IDR",
                    minimumFractionDigits: 0,
                }).format(info.getValue() as number),
        },
        {
            accessorKey: "is_active",
            header: "Status",
            cell: ({ row }) => {
                const active = row.original.is_active;
                return (
                    <span className={`text-xs font-semibold ${active ? "text-emerald-600 dark:text-emerald-400" : "text-muted-foreground italic"}`}>
                        {active ? "Aktif" : "Tidak Aktif"}
                    </span>
                );
            }
        },
        {
            accessorKey: "is_split_profits",
            header: "Bagi Hasil",
            cell: ({ row }) => {
                const active = row.original.is_split_profits;
                if (!active) return <span className="text-muted-foreground text-xs italic">Tidak Aktif</span>;
                const splitStr = row.original.splits?.map(s => `${s.party?.name}: ${Math.round(s.percentage)}%`).join(", ");
                return (
                    <div className="flex flex-col gap-1">
                        <span className="text-xs font-semibold text-emerald-600 dark:text-emerald-400">Aktif</span>
                        {splitStr && <span className="text-[10px] text-muted-foreground max-w-[200px] truncate" title={splitStr}>{splitStr}</span>}
                    </div>
                );
            }
        },
        {
            accessorKey: "actions",
            header: "Actions",
            cell: (row) => (
                <div className="flex flex-row gap-2">
                    <Button
                        size="icon"
                        variant={"outline"}
                        onClick={() => {
                            setIsEditModalOpen(true);
                            setSelectedProduct(row.row.original);
                        }}
                    >
                        <Edit />
                    </Button>
                    <Button
                        size="icon"
                        variant={"destructive"}
                        onClick={() => {
                            const productId = row.row.original.id;
                        }}
                    >
                        <Trash />
                    </Button>
                </div>
            ),
        },
    ];

    return (
        <AppLayout>
            <Head title="Products" />
            <div className="flex h-full flex-1 flex-col gap-4 rounded-xl p-4">
                <div className="flex justify-between">
                    <Heading
                        title="Daftar Produk"
                        description="Lihat dan edit produk."
                    />
                    <Button
                        variant="default"
                        onClick={() => setIsModalOpen(true)}
                    >
                        Tambah Produk <Plus />
                    </Button>
                </div>
                <DataTable columns={columns} data={products} />

                {/* Pagination Info */}
                {pagination && (
                    <div className="flex justify-between items-center text-sm text-muted-foreground">
                        <div>
                            Showing{" "}
                            {(pagination.current_page - 1) *
                                pagination.per_page +
                                1}{" "}
                            to{" "}
                            {Math.min(
                                pagination.current_page * pagination.per_page,
                                pagination.total,
                            )}{" "}
                            of {pagination.total} products
                        </div>
                        <div>
                            Page {pagination.current_page} of{" "}
                            {pagination.last_page}
                        </div>
                    </div>
                )}
            </div>
            <Modal open={isModalOpen} onClose={() => setIsModalOpen(false)}>
                <ModalHeader title="Tambah Produk" />
                <ProductForm
                    parties={parties}
                    onSuccess={() => setIsModalOpen(false)}
                    onCancel={() => setIsModalOpen(false)}
                />
            </Modal>
            <Modal
                open={isEditModalOpen}
                onClose={() => setIsEditModalOpen(false)}
            >
                <ModalHeader title="Edit Produk" />
                {selectedProduct && (
                    <ProductForm
                        product={selectedProduct}
                        parties={parties}
                        onSuccess={() => setIsEditModalOpen(false)}
                        onCancel={() => setIsEditModalOpen(false)}
                    />
                )}
            </Modal>
        </AppLayout>
    );
}
