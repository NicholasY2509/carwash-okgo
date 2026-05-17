import Heading from "@/components/heading";
import AppLayout from "@/layouts/app-layout";
import { PageProps } from "@/types";
import { Head, Link, usePage } from "@inertiajs/react";
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
    const { props } = usePage<PageProps<{ customer: CustomerProps }>>();
    const customer = props.customer;

    return (
        <AppLayout>
            <Head title={`Detail Customer - ${customer.name}`} />
            <div className="flex h-full flex-1 flex-col gap-6 p-4 md:p-6">
                <div className="flex justify-between items-start">
                    <Heading
                        title="Detail Customer"
                        description={`Informasi lengkap untuk customer ${customer.name}.`}
                    />
                    <Link href={route("customers.index")}>
                        <Button variant="secondary">Kembali</Button>
                    </Link>
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
                                <div className="aspect-video overflow-hidden rounded-lg border">
                                    <img
                                        src={customer.ktp_photo}
                                        alt={`Foto KTP ${customer.name}`}
                                        className="h-full w-full object-cover"
                                        onError={(e) => {
                                            e.currentTarget.onerror = null;
                                            e.currentTarget.src = `https://placehold.co/600x400/e2e8f0/64748b?text=Foto+Mobil`;
                                        }}
                                    />
                                </div>
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
                                            <TableHead className="w-[80px]">
                                                Foto
                                            </TableHead>
                                            <TableHead>No. Polisi</TableHead>
                                            <TableHead>Model</TableHead>
                                            <TableHead>Warna</TableHead>
                                        </TableRow>
                                    </TableHeader>
                                    <TableBody>
                                        {customer.cars.length > 0 ? (
                                            customer.cars.map((car: Car) => (
                                                <TableRow key={car.id}>
                                                    <TableCell>
                                                        <img
                                                            src={car.photo}
                                                            alt={`Foto ${car.model}`}
                                                            className="h-12 w-16 rounded-md object-cover"
                                                            onError={(e) => {
                                                                e.currentTarget.onerror =
                                                                    null;
                                                                e.currentTarget.src = `https://placehold.co/128x96/e2e8f0/64748b?text=Foto`;
                                                            }}
                                                        />
                                                    </TableCell>
                                                    <TableCell className="font-medium">
                                                        {car.plate_number}
                                                    </TableCell>
                                                    <TableCell>
                                                        {car.model}
                                                    </TableCell>
                                                    <TableCell>
                                                        {car.color}
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
                                    terkait dengan mobil ini.
                                </CardDescription>
                            </CardHeader>
                            <CardContent>
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
                                        {customer.sales_transactions.length >
                                        0 ? (
                                            customer.sales_transactions.map(
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
                            </CardContent>
                        </Card>
                    </div>
                </div>
            </div>
        </AppLayout>
    );
}
