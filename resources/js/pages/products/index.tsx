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

interface ProductProp {
    id: number;
    name: string;
    description: string;
    price: number;
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
            pagination: PaginationProp;
        }>
    >();
    const products = props.products;
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
                        onSuccess={() => setIsEditModalOpen(false)}
                        onCancel={() => setIsEditModalOpen(false)}
                    />
                )}
            </Modal>
        </AppLayout>
    );
}
