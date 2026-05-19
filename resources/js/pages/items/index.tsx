import Heading from "@/components/heading";
import { Button } from "@/components/ui/button";
import { Modal, ModalHeader } from "@/components/ui/modal";
import AppLayout from "@/layouts/app-layout";
import { BreadcrumbItem, PageProps, Paginated } from "@/types";
import { Head, usePage, Link, router } from "@inertiajs/react";
import { Pagination } from "@/components/ui/pagination";
import { Edit, Plus, Trash2, Package } from "lucide-react";
import { useState } from "react";
import { ColumnDef } from "@tanstack/react-table";
import { DataTable } from "@/components/ui/data-table";
import { Badge } from "@/components/ui/badge";
import ItemForm from "./forms/item-form";
import Swal from "sweetalert2";
import { toast } from "sonner";

const breadcrumbs: BreadcrumbItem[] = [
    {
        title: "Daftar Barang",
        href: "/items",
    },
];

interface ProductProp {
    id: number;
    name: string;
    price: number;
}

interface ItemServiceProp {
    id: number;
    name: string;
    pivot: {
        quantity: number;
    };
}

interface ItemProp {
    id: number;
    sku: string | null;
    name: string;
    description: string | null;
    stock: number;
    price: number;
    products: ItemServiceProp[];
}

export default function ItemIndex() {
    const { props } = usePage<
        PageProps<{
            items: Paginated<ItemProp>;
            products: ProductProp[];
        }>
    >();
    const items = props.items;
    const products = props.products;

    const [isAddModalOpen, setIsAddModalOpen] = useState(false);
    const [isEditModalOpen, setIsEditModalOpen] = useState(false);
    const [selectedItem, setSelectedItem] = useState<ItemProp | null>(null);

    const columns: ColumnDef<ItemProp>[] = [
        {
            accessorKey: "sku",
            header: "SKU",
            cell: (info) => info.getValue() ? (
                <span className="font-mono text-xs font-semibold text-muted-foreground uppercase bg-muted px-1.5 py-0.5 rounded">
                    {info.getValue() as string}
                </span>
            ) : (
                <span className="text-muted-foreground text-xs italic">-</span>
            ),
        },
        {
            accessorKey: "name",
            header: "Nama Barang",
            cell: (info) => (
                <div className="flex flex-col">
                    <span className="font-semibold text-sm">{info.getValue() as string}</span>
                    {info.row.original.description && (
                        <span className="text-xs text-muted-foreground line-clamp-1">
                            {info.row.original.description}
                        </span>
                    )}
                </div>
            ),
        },
        {
            accessorKey: "stock",
            header: "Stok Sekarang",
            cell: (info) => {
                const stock = info.getValue() as number;
                let badgeVariant: "default" | "secondary" | "destructive" = "default";
                if (stock === 0) badgeVariant = "destructive";
                else if (stock < 5) badgeVariant = "secondary";

                return (
                    <Badge variant={badgeVariant} className="font-semibold">
                        {stock} unit
                    </Badge>
                );
            },
        },
        {
            accessorKey: "price",
            header: "Harga Jual",
            cell: (info) =>
                new Intl.NumberFormat("id-ID", {
                    style: "currency",
                    currency: "IDR",
                    minimumFractionDigits: 0,
                }).format(info.getValue() as number),
        },
        {
            accessorKey: "products",
            header: "Digunakan di Layanan",
            cell: (info) => {
                const svcs = info.getValue() as ItemServiceProp[];
                if (!svcs || svcs.length === 0) {
                    return <span className="text-xs text-muted-foreground italic">Tidak digunakan</span>;
                }
                return (
                    <div className="flex flex-wrap gap-1 max-w-xs">
                        {svcs.map((svc) => (
                            <Badge key={svc.id} variant="outline" className="text-xs">
                                {svc.name} ({svc.pivot.quantity}x)
                            </Badge>
                        ))}
                    </div>
                );
            },
        },
        {
            accessorKey: "actions",
            header: "Aksi",
            cell: (row) => (
                <div className="flex flex-row gap-2">
                    <Button
                        size="icon"
                        variant="outline"
                        onClick={() => {
                            setSelectedItem(row.row.original);
                            setIsEditModalOpen(true);
                        }}
                    >
                        <Edit className="h-4 w-4" />
                    </Button>
                    <Button
                        size="icon"
                        variant="destructive"
                        onClick={() => handleDelete(row.row.original)}
                    >
                        <Trash2 className="h-4 w-4" />
                    </Button>
                </div>
            ),
        },
    ];

    function handleDelete(item: ItemProp) {
        Swal.fire({
            title: "Apakah Anda yakin?",
            text: `Barang "${item.name}" akan dihapus secara permanen!`,
            icon: "warning",
            showCancelButton: true,
            confirmButtonColor: "#ef4444",
            cancelButtonColor: "#6b7280",
            confirmButtonText: "Ya, Hapus!",
            cancelButtonText: "Batal",
        }).then((result) => {
            if (result.isConfirmed) {
                router.delete(route("items.destroy", item.id), {
                    onSuccess: () => {
                        toast.success("Barang berhasil dihapus.");
                    },
                    onError: (err) => {
                        toast.error("Gagal menghapus barang.");
                    },
                });
            }
        });
    }

    return (
        <AppLayout breadcrumbs={breadcrumbs}>
            <Head title="Master Barang (Items)" />
            <div className="flex h-full flex-1 flex-col gap-4 rounded-xl p-4">
                <div className="flex justify-between items-center">
                    <Heading
                        title="Master Barang (Barang/Items)"
                        description="Kelola daftar barang, harga jual, dan hubungkan dengan layanan cuci mobil."
                    />
                    <Button
                        variant="default"
                        onClick={() => setIsAddModalOpen(true)}
                        className="gap-2 bg-blue-600 hover:bg-blue-700 text-white font-semibold shadow-sm transition-colors duration-200"
                    >
                        <Plus className="h-4 w-4" /> Tambah Barang
                    </Button>
                </div>

                <DataTable columns={columns} data={items.data} />

                {items && (
                    <Pagination
                        pagination={items}
                        label="barang"
                    />
                )}
            </div>

            {/* Add Modal */}
            <Modal open={isAddModalOpen} onClose={() => setIsAddModalOpen(false)}>
                <ModalHeader title="Tambah Barang Baru" />
                <div className="p-1">
                    <ItemForm
                        products={products}
                        onSuccess={() => setIsAddModalOpen(false)}
                        onCancel={() => setIsAddModalOpen(false)}
                    />
                </div>
            </Modal>

            {/* Edit Modal */}
            <Modal open={isEditModalOpen} onClose={() => setIsEditModalOpen(false)}>
                <ModalHeader title="Edit Detail Barang" />
                <div className="p-1">
                    {selectedItem && (
                        <ItemForm
                            item={selectedItem}
                            products={products}
                            onSuccess={() => setIsEditModalOpen(false)}
                            onCancel={() => setIsEditModalOpen(false)}
                        />
                    )}
                </div>
            </Modal>
        </AppLayout>
    );
}
