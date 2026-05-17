"use strict";
exports.__esModule = true;
var heading_1 = require("@/components/heading");
var button_1 = require("@/components/ui/button");
var sheet_1 = require("@/components/ui/sheet");
var app_layout_1 = require("@/layouts/app-layout");
var react_1 = require("@inertiajs/react");
var lucide_react_1 = require("lucide-react");
var react_2 = require("react");
var data_table_1 = require("@/components/ui/data-table");
var voucher_packet_form_1 = require("./forms/voucher-packet-form");
function VoucherPacketIndex() {
    var props = react_1.usePage().props;
    var voucherPackets = props.voucherPackets;
    var voucherTypes = props.voucherTypes;
    var voucherPacketFormRef = react_2.useRef(null);
    var _a = react_2.useState(false), isSheetOpen = _a[0], setIsSheetOpen = _a[1];
    var _b = react_2.useState(false), isEditSheetOpen = _b[0], setIsEditSheetOpen = _b[1];
    var _c = react_2.useState(null), selectedVoucherPacket = _c[0], setSelectedVoucherPacket = _c[1];
    var breadcrumbs = [
        {
            title: "Packet Voucher",
            href: "/voucher-packets"
        },
    ];
    var renderSubComponent = function (_a) {
        var row = _a.row;
        return (React.createElement("div", { className: "bg-muted/50 p-4" },
            React.createElement("p", { className: "text-sm text-foreground" },
                React.createElement("span", { className: "font-semibold" }, "Deskripsi:"),
                " ",
                row.original.description || "Tidak ada deskripsi.")));
    };
    var columns = [
        {
            accessorKey: "index",
            header: "No",
            cell: function (row) { return row.row.index + 1; }
        },
        { accessorKey: "name", header: "Nama Packet" },
        {
            accessorKey: "price",
            header: "Harga",
            cell: function (info) {
                return new Intl.NumberFormat("id-ID", {
                    style: "currency",
                    currency: "IDR",
                    minimumFractionDigits: 0
                }).format(info.getValue());
            }
        },
        { accessorKey: "quantity", header: "Jumlah/Packet" },
        { accessorKey: "voucher_type.name", header: "Tipe Voucher" },
        { accessorKey: "valid_period_months", header: "Lama Berlaku" },
        {
            accessorKey: "has_unlimited_issuance",
            header: "Dapat Diperbarui",
            cell: function (info) { return (info.getValue() ? "Iya" : "Tidak"); }
        },
        {
            accessorKey: "assign_on_sale",
            header: "Assign on Sale",
            cell: function (info) { return (info.getValue() ? "Iya" : "Tidak"); }
        },
        { accessorKey: "voucher_type.name", header: "Tipe Voucher" },
        {
            id: "expander",
            header: function () { return null; },
            cell: function (_a) {
                var row = _a.row;
                return row.getCanExpand() ? (React.createElement("button", { className: "cursor-pointer", onClick: row.getToggleExpandedHandler() }, row.getIsExpanded() ? (React.createElement(lucide_react_1.ChevronDown, { size: 16 })) : (React.createElement(lucide_react_1.ChevronRight, { size: 16 })))) : null;
            }
        },
        {
            accessorKey: "actions",
            header: "Actions",
            cell: function (row) { return (React.createElement(button_1.Button, { size: "icon", variant: "outline", onClick: function () {
                    setIsEditSheetOpen(true);
                    setSelectedVoucherPacket(row.row.original);
                } },
                React.createElement(lucide_react_1.Edit, null))); }
        },
    ];
    return (React.createElement(app_layout_1["default"], { breadcrumbs: breadcrumbs },
        React.createElement(react_1.Head, { title: "Packet Voucher" }),
        React.createElement("div", { className: "flex h-full flex-1 flex-col gap-4 rounded-xl p-4" },
            React.createElement("div", { className: "flex justify-between" },
                React.createElement(heading_1["default"], { title: "Packet Voucher", description: "Tambahkan, ubah, dan hapus packet voucher." }),
                React.createElement(button_1.Button, { variant: "default", onClick: function () { return setIsSheetOpen(true); } },
                    "Tambah Packet Voucher ",
                    React.createElement(lucide_react_1.Plus, null))),
            React.createElement(data_table_1.DataTable, { columns: columns, data: voucherPackets, renderSubComponent: renderSubComponent, getRowCanExpand: function () { return true; } })),
        React.createElement(sheet_1.Sheet, { open: isSheetOpen, onOpenChange: setIsSheetOpen },
            React.createElement(sheet_1.SheetContent, null,
                React.createElement(sheet_1.SheetHeader, null,
                    React.createElement(sheet_1.SheetTitle, null, "Tambah Packet Voucher"),
                    React.createElement(sheet_1.SheetDescription, null, "Masukkan data packet voucher")),
                React.createElement(voucher_packet_form_1["default"], { ref: voucherPacketFormRef, voucherTypes: voucherTypes, onSuccess: function () { return setIsSheetOpen(false); }, onCancel: function () { return setIsSheetOpen(false); } }),
                React.createElement(sheet_1.SheetFooter, null,
                    React.createElement(button_1.Button, { variant: "default", onClick: function () { var _a; return (_a = voucherPacketFormRef.current) === null || _a === void 0 ? void 0 : _a.submit(); } }, "Tambah Packet Voucher"),
                    React.createElement(sheet_1.SheetClose, { asChild: true },
                        React.createElement(button_1.Button, { variant: "secondary", onClick: function () { return setIsSheetOpen(false); } }, "Cancel"))))),
        React.createElement(sheet_1.Sheet, { open: isEditSheetOpen, onOpenChange: setIsEditSheetOpen },
            React.createElement(sheet_1.SheetContent, null,
                React.createElement(sheet_1.SheetHeader, null,
                    React.createElement(sheet_1.SheetTitle, null, "Edit Packet Voucher"),
                    React.createElement(sheet_1.SheetDescription, null, "Masukkan data packet voucher")),
                React.createElement(voucher_packet_form_1["default"], { ref: voucherPacketFormRef, voucherTypes: voucherTypes, voucherPacket: selectedVoucherPacket, onSuccess: function () { return setIsSheetOpen(false); }, onCancel: function () { return setIsSheetOpen(false); } }),
                React.createElement(sheet_1.SheetFooter, null,
                    React.createElement(button_1.Button, { variant: "default", onClick: function () { var _a; return (_a = voucherPacketFormRef.current) === null || _a === void 0 ? void 0 : _a.submit(); } }, "Edit Packet Voucher"),
                    React.createElement(sheet_1.SheetClose, { asChild: true },
                        React.createElement(button_1.Button, { variant: "secondary", onClick: function () { return setIsSheetOpen(false); } }, "Cancel")))))));
}
exports["default"] = VoucherPacketIndex;
