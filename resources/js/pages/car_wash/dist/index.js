"use strict";
exports.__esModule = true;
var heading_1 = require("@/components/heading");
var data_table_1 = require("@/components/ui/data-table");
var input_1 = require("@/components/ui/input");
var app_layout_1 = require("@/layouts/app-layout");
var rupiah_formatter_1 = require("@/lib/rupiah-formatter");
var react_1 = require("@inertiajs/react");
var dropdown_menu_1 = require("@/components/ui/dropdown-menu");
var button_1 = require("@/components/ui/button");
var react_2 = require("react");
var use_debounce_1 = require("@/hooks/use-debounce");
var lucide_react_1 = require("lucide-react");
function CarWashIndex() {
    var props = react_1.usePage().props;
    var pagination = props.service_records;
    var _a = react_2.useState(pagination.per_page || 10), perPage = _a[0], setPerPage = _a[1];
    var _b = react_2.useState(""), searchQuery = _b[0], setSearchQuery = _b[1];
    var debouncedSearchQuery = use_debounce_1.useDebounce(searchQuery, 500);
    var breadcrumbs = [
        {
            title: "Pencucian Mobil",
            href: "/car-wash"
        },
    ];
    var columns = [
        {
            accessorKey: "index",
            header: "No",
            cell: function (row) { return row.row.index + 1; }
        },
        { accessorKey: "car.plate_number", header: "Plat Nomor" },
        { accessorKey: "car.customer.name", header: "Customer" },
        { accessorKey: "stall.name", header: "Stall" },
        { accessorKey: "payment_type", header: "Jenis Pembayaran" },
        {
            accessorKey: "total_amount",
            header: "Total",
            cell: function (_a) {
                var row = _a.row;
                var totalAmount = row.getValue("total_amount");
                return React.createElement("span", null, rupiah_formatter_1["default"](totalAmount));
            }
        },
        {
            accessorKey: "service_date",
            header: "Tanggal/Waktu",
            cell: function (_a) {
                var row = _a.row;
                var dateValue = row.getValue("service_date");
                if (!dateValue) {
                    return React.createElement("span", null, "-");
                }
                var date = new Date(dateValue);
                var formatted = new Intl.DateTimeFormat("id-ID", {
                    day: "numeric",
                    month: "numeric",
                    year: "numeric",
                    hour: "2-digit",
                    minute: "2-digit",
                    timeZone: "Asia/Jakarta"
                }).format(date);
                return React.createElement("span", null, formatted);
            }
        },
        {
            id: "actions",
            header: "Aksi",
            cell: function (_a) {
                var row = _a.row;
                var handlePrint = function () {
                    // Create a print function that matches the car wash receipt format
                    var transaction = row.original;
                    // Helper functions for formatting (same as receipt-formatter.ts)
                    var LINE_WIDTH = 48;
                    var centerText = function (text, width) {
                        if (width === void 0) { width = LINE_WIDTH; }
                        var padding = Math.floor((width - text.length) / 2);
                        return " ".repeat(Math.max(0, padding)) + text;
                    };
                    var leftRightText = function (leftText, rightText, width) {
                        if (width === void 0) { width = LINE_WIDTH; }
                        var spaceCount = width - leftText.length - rightText.length;
                        var spaces = " ".repeat(Math.max(0, spaceCount));
                        return leftText + spaces + rightText;
                    };
                    var drawLine = function (char, width) {
                        if (char === void 0) { char = "="; }
                        if (width === void 0) { width = LINE_WIDTH; }
                        return char.repeat(width);
                    };
                    var transactionDate = new Date(transaction.service_date).toLocaleDateString("id-ID", {
                        day: "numeric",
                        month: "long",
                        year: "numeric"
                    });
                    var transactionTime = new Date(transaction.service_date).toLocaleTimeString("id-ID", {
                        hour: "2-digit",
                        minute: "2-digit"
                    });
                    var formattedPrice = new Intl.NumberFormat("id-ID", {
                        style: "currency",
                        currency: "IDR",
                        minimumFractionDigits: 0
                    }).format(transaction.total_amount);
                    var strukText = "";
                    strukText += centerText("*** D+Robotic Car Wash & Coffee ***") + "\n";
                    strukText += centerText("Jl. M.H Thamrin No.16A, Sidodadi") + "\n";
                    strukText += centerText("Kec. Medan Tim., Kota Medan") + "\n";
                    strukText += centerText("Sumatera Utara 20232") + "\n";
                    strukText += centerText("Telp: 0821-6024-6588") + "\n\n";
                    strukText += drawLine("=") + "\n";
                    strukText += leftRightText("No. Struk: " + (transaction.id || 'N/A'), "" + transactionDate) + "\n";
                    strukText += leftRightText("", "" + transactionTime) + "\n";
                    strukText += drawLine("-") + "\n";
                    strukText += "Customer : " + transaction.car.customer.name + "\n";
                    strukText += "Kendaraan: " + transaction.car.plate_number + "\n";
                    strukText += drawLine("-") + "\n";
                    strukText += "LAYANAN:\n";
                    strukText += leftRightText("Cuci Mobil", formattedPrice) + "\n";
                    strukText += drawLine("=") + "\n";
                    strukText += leftRightText("TOTAL", formattedPrice) + "\n";
                    strukText += leftRightText("Bayar Via: " + transaction.payment_type, "") + "\n\n";
                    strukText += centerText("Terima Kasih!") + "\n";
                    strukText += centerText("Atas kunjungan Anda") + "\n\n";
                    strukText += "*Struk wajib disimpan untuk garansi 1x24 jam" + "\n\n";
                    var encodedText = encodeURIComponent(strukText);
                    window.open("rawbt:" + encodedText);
                };
                return (React.createElement(button_1.Button, { variant: "outline", size: "sm", onClick: handlePrint, className: "h-8 w-8 p-0", title: "Cetak Struk" },
                    React.createElement(lucide_react_1.Printer, { className: "h-4 w-4" })));
            }
        },
    ];
    var handlePageChange = function (page) {
        react_1.router.get(route("car-washes.index"), { page: page, per_page: perPage, search: debouncedSearchQuery }, { preserveState: true });
    };
    var handlePerPageChange = function (newPerPage) {
        setPerPage(newPerPage);
        react_1.router.get(route("car-washes.index"), { page: 1, per_page: newPerPage, search: debouncedSearchQuery }, { preserveState: true });
    };
    react_2.useEffect(function () {
        react_1.router.get(route("car-washes.index"), { page: 1, per_page: perPage, search: debouncedSearchQuery }, { preserveState: true });
    }, [debouncedSearchQuery]);
    var clearSearch = function () {
        setSearchQuery("");
    };
    return (React.createElement(app_layout_1["default"], { breadcrumbs: breadcrumbs },
        React.createElement(react_1.Head, { title: "Car Wash" }),
        React.createElement("div", { className: "flex h-full flex-1 flex-col gap-4 rounded-xl p-4" },
            React.createElement("div", { className: "flex justify-between" },
                React.createElement(heading_1["default"], { title: "Riwayat Cuci Mobil", description: "Lihat riwayat pencucian mobil." })),
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
                    React.createElement("div", { className: "flex flex-row items-center gap-2" },
                        React.createElement("div", { className: "flex items-center gap-2 justify-end" },
                            React.createElement("span", { className: "text-sm" }, "Baris per halaman:"),
                            React.createElement(dropdown_menu_1.DropdownMenu, null,
                                React.createElement(dropdown_menu_1.DropdownMenuTrigger, { asChild: true },
                                    React.createElement(button_1.Button, { variant: "outline", size: "sm", className: "min-w-[60px] justify-between" }, perPage)),
                                React.createElement(dropdown_menu_1.DropdownMenuContent, { align: "end" }, [5, 10, 20, 50, 100].map(function (size) { return (React.createElement(dropdown_menu_1.DropdownMenuItem, { key: size, onSelect: function () {
                                        return handlePerPageChange(size);
                                    } }, size)); })))),
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
exports["default"] = CarWashIndex;
