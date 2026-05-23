import Heading from "@/components/heading";
import AppLayout from "@/layouts/app-layout";
import { PageProps } from "@/types";
import { Head, Link, router, usePage } from "@inertiajs/react";
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
import { User, Palette, Car } from "lucide-react";
import { Button } from "@/components/ui/button";
import { useState } from "react";
import { Input } from "@/components/ui/input";
import { Pagination } from "@/components/ui/pagination";
import { Label } from "@/components/ui/label";
import {
    Dialog,
    DialogContent,
    DialogHeader,
    DialogTitle,
    DialogDescription,
    DialogFooter,
} from "@/components/ui/dialog";
import {
    Select,
    SelectContent,
    SelectItem,
    SelectTrigger,
    SelectValue,
} from "@/components/ui/select";
import { useForm as useInertiaForm } from "@inertiajs/react";
import axios from "axios";

interface SalesTransaction {
    id: number | string;
    transaction_date: string;
    total_amount: number;
    payment_method: string;
    staff: {
        full_name: string;
    };
}

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
        id: number;
        name: string;
    } | null;
    sales_transactions: { data: SalesTransaction[] };
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
        month: "long",
        year: "numeric",
    });
};

export default function CarShow() {
    const { props } = usePage<
        PageProps<{
            car: CarProp;
            salesTransactions: any;
            carTypes: any[];
            filters: any;
        }>
    >();
    const car = props.car;
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
    } = useInertiaForm({
        plate_number: car.plate_number || "",
        model: car.model || "",
        color: car.color || "",
        car_type_id: car.car_type?.id?.toString() || "",
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
            await axios.post(route("cars.verify-edit-password"), {
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
        put(route("cars.update", car.id), {
            onSuccess: () => {
                setIsEditDialogOpen(false);
            },
        });
    };

    const applyFilters = () => {
        router.get(
            route("cars.show", car.id),
            { start_date: startDate, end_date: endDate },
            { preserveScroll: true, preserveState: true },
        );
    };

    const clearFilters = () => {
        setStartDate("");
        setEndDate("");
        router.get(
            route("cars.show", car.id),
            {},
            { preserveScroll: true, preserveState: true },
        );
    };

    const handlePageChange = (page: number) => {
        router.get(
            route("cars.show", car.id),
            { page, start_date: startDate, end_date: endDate },
            { preserveScroll: true, preserveState: true },
        );
    };

    return (
        <AppLayout>
            <Head title={`Detail Mobil - ${car.plate_number}`} />
            <div className="flex h-full flex-1 flex-col gap-6 p-4 md:p-6">
                <div className="flex justify-between items-start">
                    <Heading
                        title="Detail Mobil"
                        description={`Informasi lengkap untuk mobil dengan plat nomor ${car.plate_number}.`}
                    />
                    <div className="flex gap-2">
                        <Button variant="outline" onClick={handleEditClick}>
                            Edit
                        </Button>
                        <Link href={route("cars.index")}>
                            <Button variant="secondary">Kembali</Button>
                        </Link>
                    </div>
                </div>
                <div className="grid gap-6 lg:grid-cols-3">
                    <div className="lg:col-span-1 flex flex-col gap-6">
                        <Card>
                            <CardHeader>
                                <CardTitle className="text-2xl">
                                    {car.plate_number}
                                </CardTitle>
                                <CardDescription>{car.model}</CardDescription>
                            </CardHeader>
                            <CardContent className="space-y-4">
                                <div className="space-y-3 pt-2">
                                    <div className="flex items-center justify-between">
                                        <span className="text-muted-foreground flex items-center gap-2">
                                            <Car className="h-4 w-4" />
                                            Tipe Mobil
                                        </span>
                                        <span className="font-medium">
                                            {car.car_type?.name || "-"}
                                        </span>
                                    </div>
                                    <div className="flex items-center justify-between"></div>
                                    <div className="flex items-center justify-between">
                                        <span className="text-muted-foreground flex items-center gap-2">
                                            <User className="h-4 w-4" />
                                            Pemilik
                                        </span>
                                        <span className="font-medium">
                                            {car.customer.name}
                                        </span>
                                    </div>
                                </div>
                            </CardContent>
                        </Card>
                    </div>

                    <div className="lg:col-span-2">
                        <Card>
                            <CardHeader>
                                <CardTitle>
                                    Riwayat Transaksi Penjualan
                                </CardTitle>
                                <CardDescription>
                                    Daftar semua transaksi penjualan yang
                                    terkait dengan mobil ini.
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
                            Data mobil dilindungi. Silakan masukkan password
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

            {/* Edit Car Dialog */}
            <Dialog open={isEditDialogOpen} onOpenChange={setIsEditDialogOpen}>
                <DialogContent>
                    <DialogHeader>
                        <DialogTitle>Edit Mobil</DialogTitle>
                        <DialogDescription>
                            Ubah informasi detail mobil.
                        </DialogDescription>
                    </DialogHeader>
                    <form onSubmit={handleEditSubmit}>
                        <div className="grid gap-4 py-4">
                            <div className="grid gap-2">
                                <Label htmlFor="plate_number">No. Polisi</Label>
                                <Input
                                    id="plate_number"
                                    value={editData.plate_number}
                                    onChange={(e) =>
                                        setEditData(
                                            "plate_number",
                                            e.target.value,
                                        )
                                    }
                                />
                                {editErrors.plate_number && (
                                    <span className="text-sm text-red-500">
                                        {editErrors.plate_number}
                                    </span>
                                )}
                            </div>
                            <div className="grid gap-2">
                                <Label htmlFor="car_type_id">Tipe Mobil</Label>
                                <Select
                                    value={editData.car_type_id}
                                    onValueChange={(value) =>
                                        setEditData("car_type_id", value)
                                    }
                                >
                                    <SelectTrigger>
                                        <SelectValue placeholder="Pilih tipe mobil..." />
                                    </SelectTrigger>
                                    <SelectContent>
                                        {props.carTypes?.map((type: any) => (
                                            <SelectItem
                                                key={type.id}
                                                value={type.id.toString()}
                                            >
                                                {type.name}
                                            </SelectItem>
                                        ))}
                                    </SelectContent>
                                </Select>
                                {editErrors.car_type_id && (
                                    <span className="text-sm text-red-500">
                                        {editErrors.car_type_id}
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
