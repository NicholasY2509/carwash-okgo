"use strict";
exports.__esModule = true;
var heading_1 = require("@/components/heading");
var button_1 = require("@/components/ui/button");
var data_table_1 = require("@/components/ui/data-table");
var label_1 = require("@/components/ui/label");
var input_1 = require("@/components/ui/input");
var app_layout_1 = require("@/layouts/app-layout");
var react_1 = require("@inertiajs/react");
var date_fns_1 = require("date-fns");
var lucide_react_1 = require("lucide-react");
var dropdown_menu_1 = require("@/components/ui/dropdown-menu");
var react_2 = require("react");
var use_debounce_1 = require("@/hooks/use-debounce");
var breadcrumbs = [
    {
        title: "Pembelian Packet",
        href: "/purchased-packets"
    },
];
function PurchasedPacketDetails(_a) {
    var row = _a.row;
    var purchased_packets = row.original.purchased_packets;
    if (!Array.isArray(purchased_packets) || purchased_packets.length === 0) {
        return (React.createElement("div", { className: "p-4 text-center text-muted-foreground" }, "Tidak ada detail paket yang dibeli."));
    }
    var firstPacket = purchased_packets[0];
    return (React.createElement("div", { className: "p-4 space-y-4 bg-muted/50" },
        React.createElement("div", { className: "grid gap-4 md:grid-cols-2 lg:grid-cols-3" },
            React.createElement("div", null,
                React.createElement(label_1.Label, { className: "text-sm font-semibold" }, "Tanggal Berlaku"),
                React.createElement("p", { className: "text-lg font-medium" }, date_fns_1.format(new Date(firstPacket.purchased_at), "dd MMMM yyyy"))),
            React.createElement("div", null,
                React.createElement(label_1.Label, { className: "text-sm font-semibold" }, "Tanggal Kedaluwarsa"),
                React.createElement("p", { className: "text-lg font-medium" }, date_fns_1.format(new Date(firstPacket.expired_at), "dd MMMM yyyy")))),
        React.createElement("div", null,
            React.createElement(label_1.Label, { className: "text-sm font-semibold" }, "Detail Voucher"),
            React.createElement("div", { className: "mt-2 space-y-3" }, purchased_packets.map(function (packet) {
                var _a;
                return (React.createElement("div", { key: packet.id, className: "p-3 border rounded-md" },
                    React.createElement("p", { className: "font-medium text-base" }, ((_a = packet.voucher_packet) === null || _a === void 0 ? void 0 : _a.name) || "Nama Paket Tidak Tersedia"),
                    React.createElement("p", { className: "text-sm text-muted-foreground" }, "Nomor Seri Voucher:"),
                    React.createElement("p", { className: "font-mono text-base font-semibold tracking-wider" }, packet.vouchers.map(function (voucher) { return voucher.serial_number; }).join(", "))));
            })))));
}
function PurchasedPacketIndex() {
    var props = react_1.usePage().props;
    var pagination = props.salesTransactions;
    var _a = react_2.useState(pagination.per_page || 10), perPage = _a[0], setPerPage = _a[1];
    // Search states
    var _b = react_2.useState(""), searchQuery = _b[0], setSearchQuery = _b[1];
    var debouncedSearchQuery = use_debounce_1.useDebounce(searchQuery, 500);
    var columns = [
        {
            id: "expand",
            header: "",
            cell: function (_a) {
                var row = _a.row;
                return (React.createElement(button_1.Button, { variant: "ghost", size: "sm", onClick: function () { return row.toggleExpanded(); }, className: "h-8 w-8 p-0" }, row.getIsExpanded() ? (React.createElement(lucide_react_1.ChevronDown, { className: "h-4 w-4" })) : (React.createElement(lucide_react_1.ChevronRight, { className: "h-4 w-4" }))));
            }
        },
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
            header: "Jumlah Paket",
            cell: function (_a) {
                var row = _a.row;
                return Array.isArray(row.original.purchased_packets)
                    ? row.original.purchased_packets.length
                    : 0;
            }
        },
        {
            header: "Nama Paket",
            cell: function (_a) {
                var _b;
                var row = _a.row;
                return Array.isArray(row.original.purchased_packets) &&
                    row.original.purchased_packets.length > 0
                    ? ((_b = row.original.purchased_packets[0].voucher_packet) === null || _b === void 0 ? void 0 : _b.name) ||
                        ""
                    : "";
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
                    var _a, _b;
                    var transaction = row.original;
                    if (!transaction.purchased_packets || transaction.purchased_packets.length === 0) {
                        console.error("Data pembelian paket tidak lengkap untuk dicetak.");
                        return;
                    }
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
                    // Group by voucher_packet.name and count
                    var packetMap = {};
                    transaction.purchased_packets.forEach(function (pp) {
                        var vp = pp.voucher_packet;
                        if (!vp)
                            return;
                        if (!packetMap[vp.name]) {
                            packetMap[vp.name] = { name: vp.name, count: 0 };
                        }
                        packetMap[vp.name].count += 1;
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
                    var strukText = "";
                    strukText += centerText("*** D+Robotic Car Wash & Coffee ***") + "\n";
                    strukText += centerText("Jl. M.H Thamrin No.16A, Sidodadi") + "\n";
                    strukText += centerText("Kec. Medan Tim., Kota Medan") + "\n";
                    strukText += centerText("Sumatera Utara 20232") + "\n";
                    strukText += centerText("Telp: 0821-6024-6588") + "\n\n";
                    strukText += drawLine("=") + "\n";
                    strukText += leftRightText("No. Struk: " + transaction.id, "" + transactionDate) + "\n";
                    strukText += leftRightText("", "" + transactionTime) + "\n";
                    strukText += drawLine("-") + "\n";
                    strukText += "Customer : " + (((_a = transaction.customer) === null || _a === void 0 ? void 0 : _a.name) || 'N/A') + "\n";
                    strukText += "Kendaraan: " + (((_b = transaction.car) === null || _b === void 0 ? void 0 : _b.plate_number) || "N/A") + "\n";
                    strukText += drawLine("-") + "\n";
                    strukText += "PEMBELIAN PAKET:\n";
                    Object.values(packetMap).forEach(function (_a) {
                        var name = _a.name, count = _a.count;
                        strukText += leftRightText(count + " x " + name, "") + "\n";
                    });
                    strukText += drawLine("=") + "\n";
                    strukText += leftRightText("TOTAL", formattedPrice) + "\n";
                    strukText += leftRightText("Bayar Via: " + transaction.payment_method, "") + "\n\n";
                    strukText += centerText("Terima Kasih!") + "\n";
                    strukText += centerText("Atas kunjungan Anda") + "\n\n";
                    var encodedText = encodeURIComponent(strukText);
                    window.open("rawbt:" + encodedText);
                };
                return (React.createElement(button_1.Button, { variant: "outline", size: "sm", onClick: handlePrint, className: "h-8 w-8 p-0", title: "Cetak Struk" },
                    React.createElement(lucide_react_1.Printer, { className: "h-4 w-4" })));
            }
        },
    ];
    var handlePageChange = function (page) {
        react_1.router.get(route("purchased-packets.index"), { page: page, per_page: perPage, search: debouncedSearchQuery }, { preserveState: true });
    };
    var handlePerPageChange = function (newPerPage) {
        setPerPage(newPerPage);
        react_1.router.get(route("purchased-packets.index"), { page: 1, per_page: newPerPage, search: debouncedSearchQuery }, { preserveState: true });
    };
    // Handle search changes
    react_2.useEffect(function () {
        react_1.router.get(route("purchased-packets.index"), { page: 1, per_page: perPage, search: debouncedSearchQuery }, { preserveState: true });
    }, [debouncedSearchQuery]);
    var clearSearch = function () {
        setSearchQuery("");
    };
    return (React.createElement(app_layout_1["default"], { breadcrumbs: breadcrumbs },
        React.createElement(react_1.Head, { title: "Pembelian Packet" }),
        React.createElement("div", { className: "flex h-full flex-1 flex-col gap-4 rounded-xl p-4" },
            React.createElement("div", { className: "flex justify-between" },
                React.createElement(heading_1["default"], { title: "Riwayat Pembelian Packet Voucher", description: "Lihat riwayat pembelian packet." })),
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
                            React.createElement("div", { className: "relative flex-1 max-w-md" },
                                React.createElement(lucide_react_1.Search, { className: "absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-muted-foreground" }),
                                React.createElement(input_1.Input, { placeholder: "Customer / Plat Nomor...", value: searchQuery, onChange: function (e) {
                                        return setSearchQuery(e.target.value);
                                    }, className: "pl-10 pr-10" }),
                                searchQuery && (React.createElement(button_1.Button, { variant: "ghost", size: "sm", onClick: clearSearch, className: "absolute right-1 top-1/2 transform -translate-y-1/2 h-6 w-6 p-0" },
                                    React.createElement(lucide_react_1.X, { className: "h-4 w-4" }))))))),
                React.createElement("div", null,
                    React.createElement(data_table_1.DataTable, { columns: columns, data: pagination.data, renderSubComponent: PurchasedPacketDetails, getRowCanExpand: function () { return true; } }))))));
}
exports["default"] = PurchasedPacketIndex;
