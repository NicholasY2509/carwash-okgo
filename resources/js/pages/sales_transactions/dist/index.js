"use strict";
exports.__esModule = true;
var heading_1 = require("@/components/heading");
var button_1 = require("@/components/ui/button");
var data_table_1 = require("@/components/ui/data-table");
var input_1 = require("@/components/ui/input");
var badge_1 = require("@/components/ui/badge");
var app_layout_1 = require("@/layouts/app-layout");
var react_1 = require("@inertiajs/react");
var dropdown_menu_1 = require("@/components/ui/dropdown-menu");
var select_1 = require("@/components/ui/select");
var react_2 = require("react");
var use_debounce_1 = require("@/hooks/use-debounce");
var lucide_react_1 = require("lucide-react");
var breadcrumbs = [
    {
        title: "Master Transaksi",
        href: "/sales-transactions"
    },
];
function SalesTransactionIndex() {
    var props = react_1.usePage().props;
    var pagination = props.salesTransactions;
    var filters = props.filters;
    var _a = react_2.useState(pagination.per_page || 10), perPage = _a[0], setPerPage = _a[1];
    var _b = react_2.useState(filters.type || ""), selectedType = _b[0], setSelectedType = _b[1];
    // Search states
    var _c = react_2.useState(filters.search || ""), searchQuery = _c[0], setSearchQuery = _c[1];
    var debouncedSearchQuery = use_debounce_1.useDebounce(searchQuery, 500);
    var columns = [
        {
            id: "index",
            header: "No",
            cell: function (row) {
                return row.row.index +
                    1 +
                    (pagination.current_page - 1) * pagination.per_page;
            }
        },
        { accessorKey: "customer.name", header: "Customer" },
        { accessorKey: "car.plate_number", header: "Plat Nomor" },
        {
            accessorKey: "transaction_type",
            header: "Tipe Transaksi",
            cell: function (_a) {
                var row = _a.row;
                var type = row.original.transaction_type;
                var getVariant = function () {
                    if (type === 'Paket Voucher')
                        return 'default';
                    if (type === 'Cuci Mobil')
                        return 'secondary';
                    if (type === 'Cuci Mobil Voucher')
                        return 'outline';
                    if (type === 'Klaim Garansi')
                        return 'destructive';
                    return 'secondary';
                };
                return React.createElement(badge_1.Badge, { variant: getVariant() }, type);
            }
        },
        {
            accessorKey: "transaction_date",
            header: "Tanggal",
            cell: function (_a) {
                var row = _a.row;
                var date = row.original.transaction_date;
                return new Intl.DateTimeFormat("id-ID", {
                    day: "numeric",
                    month: "numeric",
                    year: "numeric",
                    hour: "2-digit",
                    minute: "2-digit",
                    timeZone: "Asia/Jakarta"
                }).format(new Date(date));
            }
        },
        {
            accessorKey: "total_amount",
            header: "Total",
            cell: function (_a) {
                var row = _a.row;
                return new Intl.NumberFormat("id-ID", {
                    style: "currency",
                    currency: "IDR",
                    minimumFractionDigits: 0
                }).format(row.original.total_amount);
            }
        },
        {
            accessorKey: "payment_method",
            header: "Metode Pembayaran"
        },
        {
            accessorKey: "staff.full_name",
            header: "Petugas"
        },
        {
            id: "actions",
            header: "Aksi",
            cell: function (_a) {
                var row = _a.row;
                var handlePrint = function () {
                    var _a, _b, _c, _d;
                    var transaction = row.original;
                    if (transaction.transaction_type === 'Paket Voucher') {
                        if (!transaction.purchased_packets || transaction.purchased_packets.length === 0) {
                            console.error("Data pembelian paket tidak lengkap untuk dicetak.");
                            return;
                        }
                        // Group by voucher_packet.name and count
                        var packetMap_1 = {};
                        transaction.purchased_packets.forEach(function (pp) {
                            var vp = pp.voucher_packet;
                            if (!vp)
                                return;
                            if (!packetMap_1[vp.name]) {
                                packetMap_1[vp.name] = { name: vp.name, count: 0 };
                            }
                            packetMap_1[vp.name].count += 1;
                        });
                        var transactionDate = new Date(transaction.transaction_date).toLocaleDateString("id-ID", {
                            day: "numeric",
                            month: "long",
                            year: "numeric"
                        });
                        var transactionTime = new Date(transaction.transaction_date).toLocaleTimeString("id-ID", {
                            hour: "2-digit",
                            minute: "2-digit"
                        });
                        var formattedPrice = new Intl.NumberFormat("id-ID", {
                            style: "currency",
                            currency: "IDR",
                            minimumFractionDigits: 0
                        }).format(transaction.total_amount);
                        var strukText_1 = "";
                        strukText_1 += "*** D+Robotic Car Wash & Coffee ***\n";
                        strukText_1 += "Jl. M.H Thamrin No.16A, Sidodadi\n";
                        strukText_1 += "Kec. Medan Tim., Kota Medan\n";
                        strukText_1 += "Sumatera Utara 20232\n";
                        strukText_1 += "Telp: 0821-6024-6588\n\n";
                        strukText_1 += "================================================\n";
                        strukText_1 += "No. Struk: " + transaction.id + "                    " + transactionDate + "\n";
                        strukText_1 += "                                    " + transactionTime + "\n";
                        strukText_1 += "------------------------------------------------\n";
                        strukText_1 += "Customer : " + (((_a = transaction.customer) === null || _a === void 0 ? void 0 : _a.name) || 'N/A') + "\n";
                        strukText_1 += "Kendaraan: " + (((_b = transaction.car) === null || _b === void 0 ? void 0 : _b.plate_number) || "N/A") + "\n";
                        strukText_1 += "------------------------------------------------\n";
                        strukText_1 += "PEMBELIAN PAKET:\n";
                        Object.values(packetMap_1).forEach(function (_a) {
                            var name = _a.name, count = _a.count;
                            strukText_1 += count + " x " + name + "\n";
                        });
                        strukText_1 += "================================================\n";
                        strukText_1 += "TOTAL                                    " + formattedPrice + "\n";
                        strukText_1 += "Bayar Via: " + transaction.payment_method + "\n\n";
                        strukText_1 += "                Terima Kasih!\n";
                        strukText_1 += "            Atas kunjungan Anda\n\n";
                        var encodedText = encodeURIComponent(strukText_1);
                        window.open("rawbt:" + encodedText);
                    }
                    else {
                        var transactionDate = new Date(transaction.transaction_date).toLocaleDateString("id-ID", {
                            day: "numeric",
                            month: "long",
                            year: "numeric"
                        });
                        var transactionTime = new Date(transaction.transaction_date).toLocaleTimeString("id-ID", {
                            hour: "2-digit",
                            minute: "2-digit"
                        });
                        var formattedPrice = new Intl.NumberFormat("id-ID", {
                            style: "currency",
                            currency: "IDR",
                            minimumFractionDigits: 0
                        }).format(transaction.total_amount);
                        var strukText = "";
                        strukText += "*** D+Robotic Car Wash & Coffee ***\n";
                        strukText += "Jl. M.H Thamrin No.16A, Sidodadi\n";
                        strukText += "Kec. Medan Tim., Kota Medan\n";
                        strukText += "Sumatera Utara 20232\n";
                        strukText += "Telp: 0821-6024-6588\n\n";
                        strukText += "================================================\n";
                        strukText += "No. Struk: " + transaction.id + "                    " + transactionDate + "\n";
                        strukText += "                                    " + transactionTime + "\n";
                        strukText += "------------------------------------------------\n";
                        strukText += "Customer : " + (((_c = transaction.customer) === null || _c === void 0 ? void 0 : _c.name) || 'N/A') + "\n";
                        strukText += "Kendaraan: " + (((_d = transaction.car) === null || _d === void 0 ? void 0 : _d.plate_number) || "N/A") + "\n";
                        strukText += "------------------------------------------------\n";
                        strukText += "LAYANAN:\n";
                        strukText += "Cuci Mobil                                    " + formattedPrice + "\n";
                        strukText += "================================================\n";
                        strukText += "TOTAL                                    " + formattedPrice + "\n";
                        strukText += "Bayar Via: " + transaction.payment_method + "\n\n";
                        strukText += "                Terima Kasih!\n";
                        strukText += "            Atas kunjungan Anda\n\n";
                        strukText += "*Struk wajib disimpan untuk garansi 1x24 jam\n\n";
                        var encodedText = encodeURIComponent(strukText);
                        window.open("rawbt:" + encodedText);
                    }
                };
                return (React.createElement(button_1.Button, { variant: "outline", size: "sm", onClick: handlePrint, className: "h-8 w-8 p-0", title: "Cetak Struk" },
                    React.createElement(lucide_react_1.Printer, { className: "h-4 w-4" })));
            }
        },
    ];
    var handlePageChange = function (page) {
        react_1.router.get(route("sales-transactions.index"), {
            page: page,
            per_page: perPage,
            search: debouncedSearchQuery,
            type: selectedType
        }, { preserveState: true });
    };
    var handlePerPageChange = function (newPerPage) {
        setPerPage(newPerPage);
        react_1.router.get(route("sales-transactions.index"), {
            page: 1,
            per_page: newPerPage,
            search: debouncedSearchQuery,
            type: selectedType
        }, { preserveState: true });
    };
    var handleTypeChange = function (type) {
        setSelectedType(type);
        react_1.router.get(route("sales-transactions.index"), {
            page: 1,
            per_page: perPage,
            search: debouncedSearchQuery,
            type: type
        }, { preserveState: true });
    };
    // Handle search changes
    react_2.useEffect(function () {
        react_1.router.get(route("sales-transactions.index"), {
            page: 1,
            per_page: perPage,
            search: debouncedSearchQuery,
            type: selectedType
        }, { preserveState: true });
    }, [debouncedSearchQuery]);
    var clearSearch = function () {
        setSearchQuery("");
    };
    return (React.createElement(app_layout_1["default"], { breadcrumbs: breadcrumbs },
        React.createElement(react_1.Head, { title: "Master Transaksi" }),
        React.createElement("div", { className: "flex h-full flex-1 flex-col gap-4 rounded-xl p-4" },
            React.createElement("div", { className: "flex justify-between" },
                React.createElement(heading_1["default"], { title: "Master Transaksi", description: "Lihat semua riwayat transaksi cuci mobil dan pembelian voucher." })),
            React.createElement("div", { className: "flex flex-col gap-2" },
                React.createElement("div", { className: "flex justify-between flex-row" },
                    React.createElement("div", { className: "flex items-center gap-2" },
                        React.createElement(button_1.Button, { variant: "outline", size: "sm", disabled: pagination.current_page === 1, onClick: function () {
                                return handlePageChange(pagination.current_page - 1);
                            } }, "Previous"),
                        React.createElement("span", { className: "mx-2 text-sm" },
                            "Halaman ",
                            pagination.current_page,
                            " dari",
                            " ",
                            pagination.last_page),
                        React.createElement(button_1.Button, { variant: "outline", size: "sm", disabled: pagination.current_page ===
                                pagination.last_page, onClick: function () {
                                return handlePageChange(pagination.current_page + 1);
                            } }, "Next")),
                    React.createElement("div", { className: "flex flex-row gap-2" },
                        React.createElement("div", { className: "flex items-center gap-2 justify-end" },
                            React.createElement("span", { className: "text-sm" }, "Baris per halaman:"),
                            React.createElement(dropdown_menu_1.DropdownMenu, null,
                                React.createElement(dropdown_menu_1.DropdownMenuTrigger, { asChild: true },
                                    React.createElement(button_1.Button, { variant: "outline", size: "sm", className: "min-w-[60px] justify-between" }, perPage)),
                                React.createElement(dropdown_menu_1.DropdownMenuContent, { align: "end" }, [5, 10, 20, 50, 100].map(function (size) { return (React.createElement(dropdown_menu_1.DropdownMenuItem, { key: size, onSelect: function () {
                                        return handlePerPageChange(size);
                                    } }, size)); })))),
                        React.createElement("div", { className: "flex items-center gap-2" },
                            React.createElement(select_1.Select, { value: selectedType, onValueChange: handleTypeChange },
                                React.createElement(select_1.SelectTrigger, { className: "w-[180px]" },
                                    React.createElement(select_1.SelectValue, { placeholder: "Semua Tipe" })),
                                React.createElement(select_1.SelectContent, null,
                                    React.createElement(select_1.SelectItem, { value: "" }, "Semua Tipe"),
                                    React.createElement(select_1.SelectItem, { value: "car_wash" }, "Cuci Mobil"),
                                    React.createElement(select_1.SelectItem, { value: "voucher" }, "Pembelian Voucher")))),
                        React.createElement("div", { className: "flex items-center gap-2" },
                            React.createElement("div", { className: "relative flex-1 max-w-md" },
                                React.createElement(lucide_react_1.Search, { className: "absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-muted-foreground" }),
                                React.createElement(input_1.Input, { placeholder: "Customer / Plat Nomor...", value: searchQuery, onChange: function (e) {
                                        return setSearchQuery(e.target.value);
                                    }, className: "pl-10 pr-10" }),
                                searchQuery && (React.createElement(button_1.Button, { variant: "ghost", size: "sm", onClick: clearSearch, className: "absolute right-1 top-1/2 transform -translate-y-1/2 h-6 w-6 p-0" },
                                    React.createElement(lucide_react_1.X, { className: "h-4 w-4" }))))))),
                React.createElement("div", null,
                    React.createElement(data_table_1.DataTable, { columns: columns, data: pagination.data }))))));
}
exports["default"] = SalesTransactionIndex;
