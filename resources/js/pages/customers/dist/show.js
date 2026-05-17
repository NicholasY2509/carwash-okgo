"use strict";
exports.__esModule = true;
var heading_1 = require("@/components/heading");
var app_layout_1 = require("@/layouts/app-layout");
var react_1 = require("@inertiajs/react");
var card_1 = require("@/components/ui/card");
var table_1 = require("@/components/ui/table");
var lucide_react_1 = require("lucide-react");
var button_1 = require("@/components/ui/button");
var formatRupiah = function (amount) {
    return new Intl.NumberFormat("id-ID", {
        style: "currency",
        currency: "IDR",
        minimumFractionDigits: 0
    }).format(amount);
};
var formatIndonesianDate = function (dateString) {
    return new Date(dateString).toLocaleDateString("id-ID", {
        day: "numeric",
        month: "numeric",
        year: "numeric"
    });
};
function CarShow() {
    var props = react_1.usePage().props;
    var customer = props.customer;
    return (React.createElement(app_layout_1["default"], null,
        React.createElement(react_1.Head, { title: "Detail Customer - " + customer.name }),
        React.createElement("div", { className: "flex h-full flex-1 flex-col gap-6 p-4 md:p-6" },
            React.createElement("div", { className: "flex justify-between items-start" },
                React.createElement(heading_1["default"], { title: "Detail Customer", description: "Informasi lengkap untuk customer " + customer.name + "." }),
                React.createElement(react_1.Link, { href: route("customers.index") },
                    React.createElement(button_1.Button, { variant: "secondary" }, "Kembali"))),
            React.createElement("div", { className: "grid gap-6 lg:grid-cols-3" },
                React.createElement("div", { className: "lg:col-span-1 flex flex-col gap-6" },
                    React.createElement(card_1.Card, null,
                        React.createElement(card_1.CardHeader, null,
                            React.createElement(card_1.CardTitle, { className: "text-2xl" }, customer.name)),
                        React.createElement(card_1.CardContent, { className: "space-y-4" },
                            React.createElement("div", { className: "aspect-video overflow-hidden rounded-lg border" },
                                React.createElement("img", { src: customer.ktp_photo, alt: "Foto KTP " + customer.name, className: "h-full w-full object-cover", onError: function (e) {
                                        e.currentTarget.onerror = null;
                                        e.currentTarget.src = "https://placehold.co/600x400/e2e8f0/64748b?text=Foto+Mobil";
                                    } })),
                            React.createElement("div", { className: "space-y-3 pt-2" },
                                React.createElement("div", { className: "flex items-center justify-between" },
                                    React.createElement("span", { className: "text-muted-foreground flex items-center gap-2" },
                                        React.createElement(lucide_react_1.Phone, { className: "h-4 w-4" }),
                                        "Nomor Telepon"),
                                    React.createElement("span", { className: "font-medium" }, customer.phone)),
                                React.createElement("div", { className: "flex items-center justify-between" },
                                    React.createElement("span", { className: "text-muted-foreground flex items-center gap-2" },
                                        React.createElement(lucide_react_1.Mail, { className: "h-4 w-4" }),
                                        "Email"),
                                    React.createElement("span", { className: "font-medium" }, customer.email)))))),
                React.createElement("div", { className: "lg:col-span-2 flex flex-col gap-6" },
                    React.createElement(card_1.Card, null,
                        React.createElement(card_1.CardHeader, null,
                            React.createElement(card_1.CardTitle, { className: "flex items-center gap-2" }, "Daftar Mobil"),
                            React.createElement(card_1.CardDescription, null,
                                "Semua kendaraan yang terdaftar atas nama",
                                " ",
                                customer.name,
                                ".")),
                        React.createElement(card_1.CardContent, null,
                            React.createElement(table_1.Table, null,
                                React.createElement(table_1.TableHeader, null,
                                    React.createElement(table_1.TableRow, null,
                                        React.createElement(table_1.TableHead, { className: "w-[80px]" }, "Foto"),
                                        React.createElement(table_1.TableHead, null, "No. Polisi"),
                                        React.createElement(table_1.TableHead, null, "Model"),
                                        React.createElement(table_1.TableHead, null, "Warna"))),
                                React.createElement(table_1.TableBody, null, customer.cars.length > 0 ? (customer.cars.map(function (car) { return (React.createElement(table_1.TableRow, { key: car.id },
                                    React.createElement(table_1.TableCell, null,
                                        React.createElement("img", { src: car.photo, alt: "Foto " + car.model, className: "h-12 w-16 rounded-md object-cover", onError: function (e) {
                                                e.currentTarget.onerror =
                                                    null;
                                                e.currentTarget.src = "https://placehold.co/128x96/e2e8f0/64748b?text=Foto";
                                            } })),
                                    React.createElement(table_1.TableCell, { className: "font-medium" }, car.plate_number),
                                    React.createElement(table_1.TableCell, null, car.model),
                                    React.createElement(table_1.TableCell, null, car.color))); })) : (React.createElement(table_1.TableRow, null,
                                    React.createElement(table_1.TableCell, { colSpan: 4, className: "text-center h-24" }, "Belum ada mobil terdaftar."))))))),
                    React.createElement(card_1.Card, null,
                        React.createElement(card_1.CardHeader, null,
                            React.createElement(card_1.CardTitle, null, "Riwayat Transaksi Penjualan"),
                            React.createElement(card_1.CardDescription, null, "Daftar semua transaksi penjualan yang terkait dengan mobil ini.")),
                        React.createElement(card_1.CardContent, null,
                            React.createElement(table_1.Table, null,
                                React.createElement(table_1.TableHeader, null,
                                    React.createElement(table_1.TableRow, null,
                                        React.createElement(table_1.TableHead, null, "Tanggal Transaksi"),
                                        React.createElement(table_1.TableHead, null, "Jumlah"),
                                        React.createElement(table_1.TableHead, null, "Jenis Transaksi"),
                                        React.createElement(table_1.TableHead, null, "Metode Pembayaran"),
                                        React.createElement(table_1.TableHead, null, "Staf"))),
                                React.createElement(table_1.TableBody, null, customer.sales_transactions.length >
                                    0 ? (customer.sales_transactions.map(function (transaction) { return (React.createElement(table_1.TableRow, { key: transaction.id },
                                    React.createElement(table_1.TableCell, null, formatIndonesianDate(transaction.transaction_date)),
                                    React.createElement(table_1.TableCell, null, formatRupiah(transaction.total_amount)),
                                    React.createElement(table_1.TableCell, null, transaction.transaction_type),
                                    React.createElement(table_1.TableCell, null, transaction.payment_method),
                                    React.createElement(table_1.TableCell, null, transaction
                                        .staff
                                        .full_name))); })) : (React.createElement(table_1.TableRow, null,
                                    React.createElement(table_1.TableCell, { colSpan: 4, className: "text-center h-24" }, "Belum ada riwayat transaksi."))))))))))));
}
exports["default"] = CarShow;
