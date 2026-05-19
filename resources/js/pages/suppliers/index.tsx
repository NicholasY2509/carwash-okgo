import Heading from "@/components/heading";
import { Button } from "@/components/ui/button";
import { Modal, ModalHeader } from "@/components/ui/modal";
import AppLayout from "@/layouts/app-layout";
import { BreadcrumbItem, PageProps, Paginated } from "@/types";
import { Head, usePage, useForm, Link, router } from "@inertiajs/react";
import { Edit, Plus, Trash2, Truck, Phone, Mail, MapPin, User, LoaderCircle } from "lucide-react";
import { useState } from "react";
import { Label } from "@/components/ui/label";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { DataTable } from "@/components/ui/data-table";
import { ColumnDef } from "@tanstack/react-table";
import { Badge } from "@/components/ui/badge";
import Swal from "sweetalert2";
import { toast } from "sonner";
import { Pagination } from "@/components/ui/pagination";

const breadcrumbs: BreadcrumbItem[] = [
    {
        title: "Daftar Supplier",
        href: "/suppliers",
    },
];

interface SupplierProp {
    id: number;
    name: string;
    phone: string;
    email: string;
    contact_person: string;
    address: string;
    purchases_count: number;
}

export default function SupplierIndex() {
    const { props } = usePage<
        PageProps<{
            suppliers: Paginated<SupplierProp>;
        }>
    >();
    const suppliers = props.suppliers;

    const [isAddModalOpen, setIsAddModalOpen] = useState(false);
    const [isEditModalOpen, setIsEditModalOpen] = useState(false);
    const [selectedSupplier, setSelectedSupplier] = useState<SupplierProp | null>(null);

    const { data, setData, post, put, processing, errors, reset, clearErrors } = useForm({
        name: "",
        phone: "",
        email: "",
        contact_person: "",
        address: "",
    });

    const openAddModal = () => {
        reset();
        clearErrors();
        setIsAddModalOpen(true);
    };

    const openEditModal = (supplier: SupplierProp) => {
        clearErrors();
        setSelectedSupplier(supplier);
        setData({
            name: supplier.name,
            phone: supplier.phone === "-" ? "" : supplier.phone,
            email: supplier.email === "-" ? "" : supplier.email,
            contact_person: supplier.contact_person === "-" ? "" : supplier.contact_person,
            address: supplier.address === "-" ? "" : supplier.address,
        });
        setIsEditModalOpen(true);
    };

    const handleAddSubmit = (e: React.FormEvent) => {
        e.preventDefault();
        post(route("suppliers.store"), {
            onSuccess: () => {
                setIsAddModalOpen(false);
                reset();
                toast.success("Supplier berhasil ditambahkan!");
            },
            onError: () => {
                toast.error("Gagal menambahkan supplier. Silakan periksa kembali inputan Anda.");
            }
        });
    };

    const handleEditSubmit = (e: React.FormEvent) => {
        e.preventDefault();
        if (!selectedSupplier) return;
        put(route("suppliers.update", selectedSupplier.id), {
            onSuccess: () => {
                setIsEditModalOpen(false);
                reset();
                toast.success("Detail supplier berhasil diperbarui!");
            },
            onError: () => {
                toast.error("Gagal memperbarui supplier. Silakan periksa kembali inputan Anda.");
            }
        });
    };

    const handleDelete = (supplier: SupplierProp) => {
        if (supplier.purchases_count > 0) {
            Swal.fire({
                icon: "error",
                title: "Tidak Dapat Dihapus",
                text: `Supplier "${supplier.name}" sudah memiliki ${supplier.purchases_count} riwayat transaksi pembelian stok. Hubungan ini tidak boleh diputus!`,
                confirmButtonColor: "#3b82f6",
            });
            return;
        }

        Swal.fire({
            title: "Apakah Anda yakin?",
            text: `Supplier "${supplier.name}" akan dihapus secara permanen dari sistem!`,
            icon: "warning",
            showCancelButton: true,
            confirmButtonColor: "#ef4444",
            cancelButtonColor: "#6b7280",
            confirmButtonText: "Ya, Hapus!",
            cancelButtonText: "Batal",
        }).then((result) => {
            if (result.isConfirmed) {
                router.delete(route("suppliers.destroy", supplier.id), {
                    onSuccess: () => {
                        toast.success("Supplier berhasil dihapus.");
                    },
                    onError: (err) => {
                        toast.error(err.message || "Gagal menghapus supplier.");
                    },
                });
            }
        });
    };

    const columns: ColumnDef<SupplierProp>[] = [
        {
            accessorKey: "name",
            header: "Nama Supplier",
            cell: ({ row }) => {
                const supplier = row.original;
                return (
                    <div className="flex items-center gap-3">
                        <div className="p-2 rounded-lg bg-blue-50 dark:bg-blue-950/50 text-blue-600 dark:text-blue-400">
                            <Truck className="h-4 w-4" />
                        </div>
                        <div className="flex flex-col">
                            <span className="font-semibold text-foreground">{supplier.name}</span>
                            <span className="text-[10px] text-muted-foreground uppercase font-mono tracking-wider">ID: SPL-{supplier.id}</span>
                        </div>
                    </div>
                );
            }
        },
        {
            accessorKey: "contact_person",
            header: "Kontak Person",
            cell: ({ row }) => (
                <div className="flex items-center gap-2 text-sm text-foreground">
                    <User className="h-3.5 w-3.5 text-muted-foreground" />
                    <span>{row.original.contact_person}</span>
                </div>
            )
        },
        {
            id: "contact_info",
            header: "Telepon & Email",
            cell: ({ row }) => {
                const supplier = row.original;
                return (
                    <div className="flex flex-col space-y-1 text-xs">
                        <div className="flex items-center gap-1.5 text-muted-foreground">
                            <Phone className="h-3.5 w-3.5 shrink-0" />
                            <span>{supplier.phone}</span>
                        </div>
                        <div className="flex items-center gap-1.5 text-muted-foreground">
                            <Mail className="h-3.5 w-3.5 shrink-0" />
                            <span className="lowercase">{supplier.email}</span>
                        </div>
                    </div>
                );
            }
        },
        {
            accessorKey: "address",
            header: "Alamat",
            cell: ({ row }) => (
                <div className="flex items-start gap-1.5 text-xs text-muted-foreground max-w-xs line-clamp-2">
                    <MapPin className="h-3.5 w-3.5 shrink-0 mt-0.5" />
                    <span>{row.original.address}</span>
                </div>
            )
        },
        {
            accessorKey: "purchases_count",
            header: () => <div className="text-center">Total Pembelian</div>,
            cell: ({ row }) => (
                <div className="text-center">
                    <Badge variant={row.original.purchases_count > 0 ? "default" : "secondary"}>
                        {row.original.purchases_count} Transaksi
                    </Badge>
                </div>
            )
        },
        {
            id: "actions",
            header: () => <div className="text-center w-28">Aksi</div>,
            cell: ({ row }) => {
                const supplier = row.original;
                return (
                    <div className="flex items-center justify-center gap-2">
                        <Button
                            size="icon"
                            variant="outline"
                            className="h-8 w-8 text-blue-600 hover:text-blue-700 hover:bg-blue-50 dark:hover:bg-blue-950/20"
                            onClick={() => openEditModal(supplier)}
                        >
                            <Edit className="h-4 w-4" />
                        </Button>
                        <Button
                            size="icon"
                            variant="destructive"
                            className="h-8 w-8"
                            onClick={() => handleDelete(supplier)}
                        >
                            <Trash2 className="h-4 w-4" />
                        </Button>
                    </div>
                );
            }
        }
    ];

    return (
        <AppLayout breadcrumbs={breadcrumbs}>
            <Head title="Master Supplier" />
            <div className="flex h-full flex-1 flex-col gap-4 rounded-xl p-4">
                <div className="flex justify-between items-center">
                    <Heading
                        title="Master Supplier (Pemasok)"
                        description="Kelola daftar pemasok untuk pembelian stok barang dan inventaris salon cuci."
                    />
                    <Button
                        variant="default"
                        onClick={openAddModal}
                        className="gap-2 bg-blue-600 hover:bg-blue-700 text-white font-semibold shadow-sm transition-colors duration-200"
                    >
                        <Plus className="h-4 w-4" /> Tambah Supplier
                    </Button>
                </div>

                <DataTable columns={columns} data={suppliers.data} />

                {suppliers && (
                    <div className="px-6 pb-6 ">
                        <Pagination
                            pagination={suppliers}
                            label="supplier"
                            className="border-none mt-0 pt-6"
                        />
                    </div>
                )}
            </div>

            {/* Add Modal */}
            <Modal open={isAddModalOpen} onClose={() => setIsAddModalOpen(false)}>
                <ModalHeader title="Tambah Supplier Baru" />
                <div className="p-3">
                    <form onSubmit={handleAddSubmit} className="space-y-4">
                        <div className="space-y-2">
                            <Label htmlFor="name" required>Nama Supplier / Instansi</Label>
                            <Input
                                id="name"
                                value={data.name}
                                onChange={(e) => setData("name", e.target.value)}
                                placeholder="Contoh: PT. Sumber Kimia Bersaudara"
                                required
                            />
                            {errors.name && <p className="text-xs text-red-500">{errors.name}</p>}
                        </div>

                        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                            <div className="space-y-2">
                                <Label htmlFor="contact_person">Kontak Person (Sales/PIC)</Label>
                                <Input
                                    id="contact_person"
                                    value={data.contact_person}
                                    onChange={(e) => setData("contact_person", e.target.value)}
                                    placeholder="Nama PIC..."
                                />
                                {errors.contact_person && <p className="text-xs text-red-500">{errors.contact_person}</p>}
                            </div>

                            <div className="space-y-2">
                                <Label htmlFor="phone">Nomor Telepon</Label>
                                <Input
                                    id="phone"
                                    value={data.phone}
                                    onChange={(e) => setData("phone", e.target.value)}
                                    placeholder="Contoh: 0812XXXXXXXX"
                                />
                                {errors.phone && <p className="text-xs text-red-500">{errors.phone}</p>}
                            </div>
                        </div>

                        <div className="space-y-2">
                            <Label htmlFor="email">Email</Label>
                            <Input
                                id="email"
                                type="email"
                                value={data.email}
                                onChange={(e) => setData("email", e.target.value)}
                                placeholder="Contoh: sales@sumberkimia.com"
                            />
                            {errors.email && <p className="text-xs text-red-500">{errors.email}</p>}
                        </div>

                        <div className="space-y-2">
                            <Label htmlFor="address">Alamat Kantor/Gudang</Label>
                            <Textarea
                                id="address"
                                value={data.address}
                                onChange={(e) => setData("address", e.target.value)}
                                placeholder="Alamat lengkap..."
                                rows={3}
                            />
                            {errors.address && <p className="text-xs text-red-500">{errors.address}</p>}
                        </div>

                        <div className="flex justify-end gap-3 pt-4 border-t">
                            <Button
                                type="button"
                                variant="outline"
                                onClick={() => setIsAddModalOpen(false)}
                                disabled={processing}
                            >
                                Batal
                            </Button>
                            <Button type="submit" disabled={processing} className="gap-1 bg-blue-600 hover:bg-blue-700 text-white font-semibold shadow-sm transition-colors duration-200">
                                {processing && <LoaderCircle className="h-4 w-4 animate-spin" />}
                                Simpan Supplier
                            </Button>
                        </div>
                    </form>
                </div>
            </Modal>

            {/* Edit Modal */}
            <Modal open={isEditModalOpen} onClose={() => setIsEditModalOpen(false)}>
                <ModalHeader title="Edit Detail Supplier" />
                <div className="p-3">
                    <form onSubmit={handleEditSubmit} className="space-y-4">
                        <div className="space-y-2">
                            <Label htmlFor="edit_name" required>Nama Supplier / Instansi</Label>
                            <Input
                                id="edit_name"
                                value={data.name}
                                onChange={(e) => setData("name", e.target.value)}
                                required
                            />
                            {errors.name && <p className="text-xs text-red-500">{errors.name}</p>}
                        </div>

                        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                            <div className="space-y-2">
                                <Label htmlFor="edit_contact_person">Kontak Person (Sales/PIC)</Label>
                                <Input
                                    id="edit_contact_person"
                                    value={data.contact_person}
                                    onChange={(e) => setData("contact_person", e.target.value)}
                                />
                                {errors.contact_person && <p className="text-xs text-red-500">{errors.contact_person}</p>}
                            </div>

                            <div className="space-y-2">
                                <Label htmlFor="edit_phone">Nomor Telepon</Label>
                                <Input
                                    id="edit_phone"
                                    value={data.phone}
                                    onChange={(e) => setData("phone", e.target.value)}
                                />
                                {errors.phone && <p className="text-xs text-red-500">{errors.phone}</p>}
                            </div>
                        </div>

                        <div className="space-y-2">
                            <Label htmlFor="edit_email">Email</Label>
                            <Input
                                id="edit_email"
                                type="email"
                                value={data.email}
                                onChange={(e) => setData("email", e.target.value)}
                            />
                            {errors.email && <p className="text-xs text-red-500">{errors.email}</p>}
                        </div>

                        <div className="space-y-2">
                            <Label htmlFor="edit_address">Alamat Kantor/Gudang</Label>
                            <Textarea
                                id="edit_address"
                                value={data.address}
                                onChange={(e) => setData("address", e.target.value)}
                                rows={3}
                            />
                            {errors.address && <p className="text-xs text-red-500">{errors.address}</p>}
                        </div>

                        <div className="flex justify-end gap-3 pt-4 border-t">
                            <Button
                                type="button"
                                variant="outline"
                                onClick={() => setIsEditModalOpen(false)}
                                disabled={processing}
                            >
                                Batal
                            </Button>
                            <Button type="submit" disabled={processing} className="gap-1 bg-blue-600 hover:bg-blue-700 text-white font-semibold shadow-sm transition-colors duration-200">
                                {processing && <LoaderCircle className="h-4 w-4 animate-spin" />}
                                Perbarui Supplier
                            </Button>
                        </div>
                    </form>
                </div>
            </Modal>
        </AppLayout>
    );
}
