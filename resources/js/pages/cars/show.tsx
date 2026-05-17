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
import { User, Palette, Car } from "lucide-react";
import { Button } from "@/components/ui/button";

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
        name: string;
    } | null;
    sales_transactions: SalesTransaction[];
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
    const { props } = usePage<PageProps<{ car: CarProp }>>();
    const car = props.car;

    return (
        <AppLayout>
            <Head title={`Detail Mobil - ${car.plate_number}`} />
            <div className="flex h-full flex-1 flex-col gap-6 p-4 md:p-6">
                <div className="flex justify-between items-start">
                    <Heading
                        title="Detail Mobil"
                        description={`Informasi lengkap untuk mobil dengan plat nomor ${car.plate_number}.`}
                    />
                    <Link href={route("cars.index")}>
                        <Button variant="secondary">Kembali</Button>
                    </Link>
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
                                <div className="aspect-video overflow-hidden rounded-lg border">
                                    <img
                                        src={car.photo}
                                        alt={`Foto ${car.model} ${car.plate_number}`}
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
                                            <Car className="h-4 w-4" />
                                            Tipe Mobil
                                        </span>
                                        <span className="font-medium">
                                            {car.car_type?.name || "-"}
                                        </span>
                                    </div>
                                    <div className="flex items-center justify-between">
                                        <span className="text-muted-foreground flex items-center gap-2">
                                            <Palette className="h-4 w-4" />
                                            Warna
                                        </span>
                                        <span className="font-medium">
                                            {car.color}
                                        </span>
                                    </div>
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
                                        {car.sales_transactions.length > 0 ? (
                                            car.sales_transactions.map(
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
                            </CardContent>
                        </Card>
                    </div>
                </div>
            </div>
        </AppLayout>
    );
}
