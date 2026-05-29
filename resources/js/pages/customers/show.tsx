import Heading from "@/components/heading";
import AppLayout from "@/layouts/app-layout";
import { PageProps } from "@/types";
import { Head, Link, usePage, router } from "@inertiajs/react";
import { Pagination } from "@/components/ui/pagination";
import {
    Card,
    CardContent,
    CardHeader,
    CardTitle,
    CardDescription,
} from "@/components/ui/card";
import {
    Table,
    TableBody,
    TableCell,
    TableHead,
    TableHeader,
    TableRow,
} from "@/components/ui/table";
import { User, Palette, Phone, Mail, CarIcon } from "lucide-react";
import { Button } from "@/components/ui/button";
import { useState } from "react";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import {
    Dialog,
    DialogContent,
    DialogHeader,
    DialogTitle,
    DialogDescription,
    DialogFooter,
} from "@/components/ui/dialog";
import { useForm as useInertiaForm } from "@inertiajs/react";
import axios from "axios";

interface SalesTransaction {
    id: number | string;
    transaction_date: string;
    total_amount: number;
    payment_method: string;
    transaction_type: string;
    staff: {
        full_name: string;
    };
}

interface Car {
    id: string;
    plate_number: string;
    car_type: string | null;
}

interface CustomerProps {
    id: string;
    name: string;
    phone: string;
    email: string;
    ktp_photo: string;
    cars: Car[];
}
const formatRupiah = (amount: number) => {
    return new Intl.NumberFormat("id-ID", {
        style: "currency",
        currency: "IDR",
        minimumFractionDigits: 0,
    }).format(amount);
};

const formatIndonesianDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString("id-ID", {
        day: "numeric",
        month: "numeric",
        year: "numeric",
    });
};

export default function CarShow() {
    const { props } = usePage<
        PageProps<{
            customer: CustomerProps;
            salesTransactions: any;
            filters: any;
        }>
    >();
    const customer = props.customer;
    const salesTransactions = props.salesTransactions;
    const filters = props.filters || {};

    const [startDate, setStartDate] = useState(filters.start_date || "");
    const [endDate, setEndDate] = useState(filters.end_date || "");

    const [isPasswordDialogOpen, setIsPasswordDialogOpen] = useState(false);
    const [isEditDialogOpen, setIsEditDialogOpen] = useState(false);
    const [isUnlocked, setIsUnlocked] = useState(false);
    const [passwordError, setPasswordError] = useState("");
    const [passwordInput, setPasswordInput] = useState("");

    const {
        data: editData,
        setData: setEditData,
        put,
        processing,
        errors: editErrors,
        reset: resetEdit,
    } = useInertiaForm({
        name: customer.name,
        phone: customer.phone,
        email: customer.email,
    });

    const handleEditClick = () => {
        if (isUnlocked) {
            setIsEditDialogOpen(true);
        } else {
            setIsPasswordDialogOpen(true);
        }
    };

    const handleVerifyPassword = async (e: React.FormEvent) => {
        e.preventDefault();
        setPasswordError("");
        try {
            await axios.post(route("customers.verify-edit-password"), {
                password: passwordInput,
            });
            setIsUnlocked(true);
            setIsPasswordDialogOpen(false);
            setPasswordInput("");
            setIsEditDialogOpen(true);
        } catch (error: any) {
            if (error.response?.status === 403) {
                setPasswordError(error.response.data.message);
            } else if (error.response?.status === 422) {
                setPasswordError(error.response.data.errors.password[0]);
            } else {
                setPasswordError("An unexpected error occurred.");
            }
        }
    };

    const handleEditSubmit = (e: React.FormEvent) => {
        e.preventDefault();
        put(route("customers.update", customer.id), {
            onSuccess: () => {
                setIsEditDialogOpen(false);
            },
        });
    };

    const applyFilters = () => {
        router.get(
            route("customers.show", customer.id),
            { start_date: startDate, end_date: endDate },
            { preserveScroll: true, preserveState: true },
        );
    };

    const clearFilters = () => {
        setStartDate("");
        setEndDate("");
        router.get(
            route("customers.show", customer.id),
            {},
            { preserveScroll: true, preserveState: true },
        );
    };

    const handlePageChange = (page: number) => {
        router.get(
            route("customers.show", customer.id),
            { page, start_date: startDate, end_date: endDate },
            { preserveScroll: true, preserveState: true },
        );
    };

    return (
        <AppLayout>
            <Head title={`Detail Customer - ${customer.name}`} />
            <div className="flex h-full flex-1 flex-col gap-6 p-4 md:p-6">
                <div className="flex justify-between items-start">
                    <Heading
                        title="Detail Customer"
                        description={`Informasi lengkap untuk customer ${customer.name}.`}
                    />
                    <div className="flex gap-2">
                        <Button variant="outline" onClick={handleEditClick}>
                            Edit
                        </Button>
                        <Link href={route("customers.index")}>
                            <Button variant="secondary">Kembali</Button>
                        </Link>
                    </div>
                </div>
                <div className="grid gap-6 lg:grid-cols-3">
                    <div className="lg:col-span-1 flex flex-col gap-6">
                        <Card>
                            <CardHeader>
                                <CardTitle className="text-2xl">
                                    {customer.name}
                                </CardTitle>
                            </CardHeader>
                            <CardContent className="space-y-4">
                                <div className="space-y-3 pt-2">
                                    <div className="flex items-center justify-between">
                                        <span className="text-muted-foreground flex items-center gap-2">
                                            <Phone className="h-4 w-4" />
                                            Nomor Telepon
                                        </span>
                                        <span className="font-medium">
                                            {customer.phone}
                                        </span>
                                    </div>
                                    <div className="flex items-center justify-between">
                                        <span className="text-muted-foreground flex items-center gap-2">
                                            <Mail className="h-4 w-4" />
                                            Email
                                        </span>
                                        <span className="font-medium">
                                            {customer.email}
                                        </span>
                                    </div>
                                </div>
                            </CardContent>
                        </Card>
                    </div>

                    <div className="lg:col-span-2 flex flex-col gap-6">
                        <Card>
                            <CardHeader>
                                <CardTitle className="flex items-center gap-2">
                                    Daftar Mobil
                                </CardTitle>
                                <CardDescription>
                                    Semua kendaraan yang terdaftar atas nama{" "}
                                    {customer.name}.
                                </CardDescription>
                            </CardHeader>
                            <CardContent>
                                <Table>
                                    <TableHeader>
                                        <TableRow>
                                            <TableHead>No. Polisi</TableHead>
                                            <TableHead>Tipe</TableHead>
                                        </TableRow>
                                    </TableHeader>
                                    <TableBody>
                                        {customer.cars.length > 0 ? (
                                            customer.cars.map((car: Car) => (
                                                <TableRow key={car.id}>
                                                    <TableCell className="font-medium">
                                                        {car.plate_number}
                                                    </TableCell>
                                                    <TableCell>
                                                        {car.car_type}
                                                    </TableCell>
                                                </TableRow>
                                            ))
                                        ) : (
                                            <TableRow>
                                                <TableCell
                                                    colSpan={4}
                                                    className="text-center h-24"
                                                >
                                                    Belum ada mobil terdaftar.
                                                </TableCell>
                                            </TableRow>
                                        )}
                                    </TableBody>
                                </Table>
                            </CardContent>
                        </Card>
                        <Card>
                            <CardHeader>
                                <CardTitle>
                                    Riwayat Transaksi Penjualan
                                </CardTitle>
                                <CardDescription>
                                    Daftar semua transaksi penjualan yang
                                    terkait dengan customer ini.
                                </CardDescription>
                            </CardHeader>
                            <CardContent>
                                <div className="mb-4 flex flex-wrap items-end gap-4">
                                    <div className="flex flex-col gap-1.5">
                                        <label
                                            htmlFor="start_date"
                                            className="text-sm font-medium text-muted-foreground"
                                        >
                                            Mulai Tanggal
                                        </label>
                                        <Input
                                            id="start_date"
                                            type="date"
                                            value={startDate}
                                            onChange={(e) =>
                                                setStartDate(e.target.value)
                                            }
                                            className="w-[150px]"
                                        />
                                    </div>
                                    <div className="flex flex-col gap-1.5">
                                        <label
                                            htmlFor="end_date"
                                            className="text-sm font-medium text-muted-foreground"
                                        >
                                            Sampai Tanggal
                                        </label>
                                        <Input
                                            id="end_date"
                                            type="date"
                                            value={endDate}
                                            onChange={(e) =>
                                                setEndDate(e.target.value)
                                            }
                                            className="w-[150px]"
                                        />
                                    </div>
                                    <div className="flex items-center gap-2">
                                        <Button onClick={applyFilters}>
                                            Filter
                                        </Button>
                                        {(startDate || endDate) && (
                                            <Button
                                                variant="ghost"
                                                onClick={clearFilters}
                                            >
                                                Reset
                                            </Button>
                                        )}
                                    </div>
                                </div>
                                <Table>
                                    <TableHeader>
                                        <TableRow>
                                            <TableHead>
                                                Tanggal Transaksi
                                            </TableHead>
                                            <TableHead>Jumlah</TableHead>
                                            <TableHead>
                                                Jenis Transaksi
                                            </TableHead>
                                            <TableHead>
                                                Metode Pembayaran
                                            </TableHead>
                                            <TableHead>Staf</TableHead>
                                        </TableRow>
                                    </TableHeader>
                                    <TableBody>
                                        {salesTransactions.data.length > 0 ? (
                                            salesTransactions.data.map(
                                                (
                                                    transaction: SalesTransaction,
                                                ) => (
                                                    <TableRow
                                                        key={transaction.id}
                                                    >
                                                        <TableCell>
                                                            {formatIndonesianDate(
                                                                transaction.transaction_date,
                                                            )}
                                                        </TableCell>
                                                        <TableCell>
                                                            {formatRupiah(
                                                                transaction.total_amount,
                                                            )}
                                                        </TableCell>
                                                        <TableCell>
                                                            {
                                                                transaction.transaction_type
                                                            }
                                                        </TableCell>
                                                        <TableCell>
                                                            {
                                                                transaction.payment_method
                                                            }
                                                        </TableCell>
                                                        <TableCell>
                                                            {
                                                                transaction
                                                                    .staff
                                                                    .full_name
                                                            }
                                                        </TableCell>
                                                    </TableRow>
                                                ),
                                            )
                                        ) : (
                                            <TableRow>
                                                <TableCell
                                                    colSpan={4}
                                                    className="text-center h-24"
                                                >
                                                    Belum ada riwayat transaksi.
                                                </TableCell>
                                            </TableRow>
                                        )}
                                    </TableBody>
                                </Table>
                                {salesTransactions &&
                                    salesTransactions.data.length > 0 && (
                                        <div className="mt-4">
                                            <Pagination
                                                pagination={salesTransactions}
                                                onPageChange={handlePageChange}
                                                label="transaksi"
                                            />
                                        </div>
                                    )}
                            </CardContent>
                        </Card>
                    </div>
                </div>
            </div>

            {/* Password Prompt Dialog */}
            <Dialog
                open={isPasswordDialogOpen}
                onOpenChange={setIsPasswordDialogOpen}
            >
                <DialogContent>
                    <DialogHeader>
                        <DialogTitle>Masukkan Password</DialogTitle>
                        <DialogDescription>
                            Data customer dilindungi. Silakan masukkan password
                            untuk mengubah data.
                        </DialogDescription>
                    </DialogHeader>
                    <form onSubmit={handleVerifyPassword}>
                        <div className="grid gap-4 py-4">
                            <div className="grid gap-2">
                                <Label htmlFor="edit_password">Password</Label>
                                <Input
                                    id="edit_password"
                                    type="password"
                                    value={passwordInput}
                                    onChange={(e) =>
                                        setPasswordInput(e.target.value)
                                    }
                                    placeholder="Masukkan password..."
                                />
                                {passwordError && (
                                    <span className="text-sm text-red-500">
                                        {passwordError}
                                    </span>
                                )}
                            </div>
                        </div>
                        <DialogFooter>
                            <Button
                                type="button"
                                variant="outline"
                                onClick={() => setIsPasswordDialogOpen(false)}
                            >
                                Batal
                            </Button>
                            <Button type="submit">Lanjut</Button>
                        </DialogFooter>
                    </form>
                </DialogContent>
            </Dialog>

            {/* Edit Customer Dialog */}
            <Dialog open={isEditDialogOpen} onOpenChange={setIsEditDialogOpen}>
                <DialogContent>
                    <DialogHeader>
                        <DialogTitle>Edit Customer</DialogTitle>
                        <DialogDescription>
                            Ubah informasi detail customer.
                        </DialogDescription>
                    </DialogHeader>
                    <form onSubmit={handleEditSubmit}>
                        <div className="grid gap-4 py-4">
                            <div className="grid gap-2">
                                <Label htmlFor="name">Nama</Label>
                                <Input
                                    id="name"
                                    value={editData.name}
                                    onChange={(e) =>
                                        setEditData("name", e.target.value)
                                    }
                                />
                                {editErrors.name && (
                                    <span className="text-sm text-red-500">
                                        {editErrors.name}
                                    </span>
                                )}
                            </div>
                            <div className="grid gap-2">
                                <Label htmlFor="phone">Nomor Telepon</Label>
                                <Input
                                    id="phone"
                                    value={editData.phone}
                                    onChange={(e) =>
                                        setEditData("phone", e.target.value)
                                    }
                                />
                                {editErrors.phone && (
                                    <span className="text-sm text-red-500">
                                        {editErrors.phone}
                                    </span>
                                )}
                            </div>
                            <div className="grid gap-2">
                                <Label htmlFor="email">Email</Label>
                                <Input
                                    id="email"
                                    type="email"
                                    value={editData.email}
                                    onChange={(e) =>
                                        setEditData("email", e.target.value)
                                    }
                                />
                                {editErrors.email && (
                                    <span className="text-sm text-red-500">
                                        {editErrors.email}
                                    </span>
                                )}
                            </div>
                        </div>
                        <DialogFooter>
                            <Button
                                type="button"
                                variant="outline"
                                onClick={() => setIsEditDialogOpen(false)}
                            >
                                Batal
                            </Button>
                            <Button type="submit" disabled={processing}>
                                Simpan
                            </Button>
                        </DialogFooter>
                    </form>
                </DialogContent>
            </Dialog>
        </AppLayout>
    );
}
