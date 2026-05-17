"use strict";
var __spreadArrays = (this && this.__spreadArrays) || function () {
    for (var s = 0, i = 0, il = arguments.length; i < il; i++) s += arguments[i].length;
    for (var r = Array(s), k = 0, i = 0; i < il; i++)
        for (var a = arguments[i], j = 0, jl = a.length; j < jl; j++, k++)
            r[k] = a[j];
    return r;
};
exports.__esModule = true;
var app_layout_1 = require("@/layouts/app-layout");
var react_1 = require("@inertiajs/react");
var voucher_packet_card_1 = require("./components/voucher-packet-card");
var lucide_react_1 = require("lucide-react");
var react_2 = require("react");
var sheet_1 = require("@/components/ui/sheet");
var button_1 = require("@/components/ui/button");
var select_1 = require("@/components/ui/select");
var input_1 = require("@/components/ui/input");
var react_number_format_1 = require("react-number-format");
var create_purchased_packets_1 = require("./forms/create-purchased-packets");
var axios_1 = require("axios");
var heading_1 = require("@/components/heading");
var voucher_selection_modal_1 = require("./components/voucher-selection-modal");
var sonner_1 = require("sonner");
function CreatePurchasedPacket() {
    var props = react_1.usePage().props;
    console.log(props);
    var voucherPackets = props.voucherPackets;
    var _a = react_2.useState(null), selectedVoucherPacket = _a[0], setSelectedVoucherPacket = _a[1];
    var _b = react_2.useState(false), isSheetOpen = _b[0], setIsSheetOpen = _b[1];
    var purchasedPacketFormRef = react_2.useRef(null);
    var _c = react_2.useState(null), selectedMetodePembayaran = _c[0], setSelectedMetodePembayaran = _c[1];
    var _d = react_2.useState(""), nominalBayar = _d[0], setNominalBayar = _d[1];
    var _e = react_2.useState(null), footerError = _e[0], setFooterError = _e[1];
    var _f = react_2.useState(false), isAlertOpen = _f[0], setAlertOpen = _f[1];
    var _g = react_2.useState([]), availableVouchers = _g[0], setAvailableVouchers = _g[1];
    var _h = react_2.useState([]), selectedVoucherIds = _h[0], setSelectedVoucherIds = _h[1];
    var _j = react_2.useState(false), isVoucherLoading = _j[0], setIsVoucherLoading = _j[1];
    var _k = react_2.useState(1), quantity = _k[0], setQuantity = _k[1];
    var totalHarga = ((selectedVoucherPacket === null || selectedVoucherPacket === void 0 ? void 0 : selectedVoucherPacket.price) || 0) * quantity;
    var nilaiBayar = parseFloat(nominalBayar) || 0;
    var kembalian = nilaiBayar > totalHarga ? nilaiBayar - totalHarga : 0;
    var requiredVoucherCount = ((selectedVoucherPacket === null || selectedVoucherPacket === void 0 ? void 0 : selectedVoucherPacket.quantity) || 0) * quantity;
    var breadcrumbs = [
        {
            title: "Pembelian Packet Voucher",
            href: "/purchased-packets/create"
        },
    ];
    react_2.useEffect(function () {
        if (isAlertOpen && selectedVoucherPacket) {
            setIsVoucherLoading(true);
            axios_1["default"]
                .get("/api/vouchers/available?voucher_type_id=" + selectedVoucherPacket.voucher_type.id)
                .then(function (response) {
                setAvailableVouchers(response.data);
            })["catch"](function (error) {
                console.error("Gagal mengambil voucher:", error);
                sonner_1.toast.error("Gagal memuat voucher.");
            })["finally"](function () {
                setIsVoucherLoading(false);
            });
        }
    }, [isAlertOpen, selectedVoucherPacket]);
    var handleCardClick = function (packet) {
        setSelectedVoucherPacket(packet);
        setIsSheetOpen(true);
    };
    var handleSheetOpenChange = function (open) {
        setIsSheetOpen(open);
        if (!open) {
            setSelectedVoucherPacket(null);
            setSelectedMetodePembayaran(null);
            setFooterError(null);
            setSelectedVoucherIds([]);
        }
    };
    var handleFinalSubmit = function () {
        if (!selectedMetodePembayaran) {
            setFooterError("Pilih metode pembayaran terlebih dahulu.");
            return;
        }
        if ((selectedVoucherPacket === null || selectedVoucherPacket === void 0 ? void 0 : selectedVoucherPacket.assign_on_sale) &&
            selectedVoucherIds.length !== requiredVoucherCount) {
            setFooterError("Anda harus memilih tepat " + requiredVoucherCount + " voucher.");
            return;
        }
        setFooterError(null);
        var footerData = {
            payment_method: selectedMetodePembayaran,
            nominal_pembayaran: nilaiBayar,
            voucher_ids: selectedVoucherIds,
            quantity: quantity
        };
        if (purchasedPacketFormRef.current) {
            purchasedPacketFormRef.current.submit(footerData);
        }
    };
    var handleVoucherCheckboxChange = function (voucherId, checked) {
        setSelectedVoucherIds(function (prevIds) {
            if (checked) {
                if (prevIds.length >= requiredVoucherCount) {
                    sonner_1.toast.error("Anda hanya dapat memilih " + requiredVoucherCount + " voucher.");
                    return prevIds;
                }
                return __spreadArrays(prevIds, [voucherId]);
            }
            else {
                return prevIds.filter(function (id) { return id !== voucherId; });
            }
        });
    };
    var handleSaveSelectedVouchers = function () {
        if (selectedVoucherIds.length !== requiredVoucherCount) {
            sonner_1.toast.error("Anda harus memilih tepat " + requiredVoucherCount + " voucher.");
            return;
        }
        setAlertOpen(false);
    };
    return (React.createElement(app_layout_1["default"], { breadcrumbs: breadcrumbs },
        React.createElement(react_1.Head, { title: "Beli Packet Voucher" }),
        React.createElement("div", { className: "flex h-full flex-1 flex-col gap-4 rounded-xl p-4" },
            React.createElement("div", { className: "flex justify-between" },
                React.createElement(heading_1["default"], { title: "Pembelian Voucher", description: "Pilih Paket Voucher yang akan dibeli." })),
            React.createElement("div", { className: "grid gap-4 md:grid-cols-2 lg:grid-cols-3" }, voucherPackets.length > 0 ? (voucherPackets.map(function (voucherPackage) { return (React.createElement(voucher_packet_card_1["default"], { key: voucherPackage.id, voucherPacket: voucherPackage, onClick: function () {
                    return handleCardClick(voucherPackage);
                } })); })) : (React.createElement("div", { className: "col-span-3 flex flex-col items-center justify-center rounded-md border-2 border-dashed p-10 text-center" },
                React.createElement(lucide_react_1.Ticket, { className: "text-muted-foreground h-10 w-10" }),
                React.createElement("h3", { className: "mt-4 text-lg font-semibold" }, "Belum Ada Packet Voucher Terdaftar"),
                React.createElement("p", { className: "text-muted-foreground mt-2 text-sm" }, "Tambahkan Packet voucher terlebih dahulu untuk memulai."))))),
        React.createElement(sheet_1.Sheet, { open: isSheetOpen, onOpenChange: handleSheetOpenChange }, selectedVoucherPacket && (React.createElement(sheet_1.SheetContent, { className: "flex flex-col gap-4 sm:max-w-2xl" },
            React.createElement(sheet_1.SheetHeader, null,
                React.createElement(sheet_1.SheetTitle, null, selectedVoucherPacket.name),
                React.createElement(sheet_1.SheetDescription, null, selectedVoucherPacket.description)),
            React.createElement("div", { className: "flex-1 overflow-y-auto py-2" },
                React.createElement(create_purchased_packets_1["default"], { ref: purchasedPacketFormRef, voucherPacketId: selectedVoucherPacket.id, onlyOneCar: selectedVoucherPacket.voucher_type
                        .only_one_car, onSuccess: function () { return handleSheetOpenChange(false); } })),
            React.createElement(sheet_1.SheetFooter, null,
                React.createElement("div", { className: "w-full space-y-4 border-t-2 pt-4" },
                    React.createElement("div", { className: "flex flex-col lg:flex-row gap-4" },
                        React.createElement("div", { className: "w-full lg:w-3/5 gap-2 flex flex-col" },
                            React.createElement("div", { className: "flex items-center justify-between gap-2" },
                                React.createElement("p", { className: "text-muted-foreground text-sm" }, "Jumlah Paket"),
                                React.createElement("div", { className: "flex items-center gap-2" },
                                    React.createElement(button_1.Button, { type: "button", variant: "outline", size: "icon", onClick: function () {
                                            return setQuantity(function (q) {
                                                return Math.max(1, q - 1);
                                            });
                                        }, disabled: quantity <= 1 }, "-"),
                                    React.createElement("span", { className: "px-3 text-lg font-semibold" }, quantity),
                                    React.createElement(button_1.Button, { type: "button", variant: "outline", size: "icon", onClick: function () {
                                            return setQuantity(function (q) { return q + 1; });
                                        } }, "+"))),
                            React.createElement("div", { className: "flex flex-col sm:flex-row sm:items-center sm:justify-between gap-2" },
                                React.createElement("p", { className: "text-muted-foreground text-sm" }, "Metode Pembayaran"),
                                React.createElement(select_1.Select, { value: selectedMetodePembayaran !== null && selectedMetodePembayaran !== void 0 ? selectedMetodePembayaran : "", onValueChange: setSelectedMetodePembayaran },
                                    React.createElement(select_1.SelectTrigger, { className: "mt-1 w-full sm:w-3/5" },
                                        React.createElement(select_1.SelectValue, { placeholder: "Pilih Metode..." })),
                                    React.createElement(select_1.SelectContent, null,
                                        React.createElement(select_1.SelectItem, { value: "Cash" }, "Cash"),
                                        React.createElement(select_1.SelectItem, { value: "Debit/Credit" }, "Debit/Credit"),
                                        React.createElement(select_1.SelectItem, { value: "Transfer" }, "Transfer"),
                                        React.createElement(select_1.SelectItem, { value: "QRIS" }, "QRIS")))),
                            selectedMetodePembayaran ===
                                "Cash" && (React.createElement("div", { className: "flex flex-col sm:flex-row sm:items-center sm:justify-between gap-2" },
                                React.createElement("p", { className: "text-muted-foreground text-sm" }, "Nominal Dibayar"),
                                React.createElement(react_number_format_1.NumericFormat, { className: "mt-1 w-full sm:w-3/5", customInput: input_1.Input, prefix: "Rp ", thousandSeparator: ".", decimalSeparator: ",", value: nominalBayar, onValueChange: function (values) {
                                        return setNominalBayar(values.value);
                                    } })))),
                        React.createElement("div", { className: "space-y-2 rounded-lg border p-3 w-full lg:w-2/5" },
                            React.createElement("div", { className: "space-y-2 text-sm" },
                                React.createElement("div", { className: "flex justify-between font-medium items-center" },
                                    React.createElement("span", null, "Total Harga:"),
                                    React.createElement("span", { className: "text-xl sm:text-2xl font-bold" }, new Intl.NumberFormat("id-ID", {
                                        style: "currency",
                                        currency: "IDR",
                                        minimumFractionDigits: 0
                                    }).format(totalHarga))),
                                selectedMetodePembayaran ===
                                    "Cash" &&
                                    nilaiBayar > 0 && (React.createElement("div", { className: "flex justify-between" },
                                    React.createElement("span", { className: "text-muted-foreground" }, "Bayar:"),
                                    React.createElement("span", null, new Intl.NumberFormat("id-ID", {
                                        style: "currency",
                                        currency: "IDR",
                                        minimumFractionDigits: 0,
                                        maximumFractionDigits: 0
                                    }).format(nilaiBayar)))),
                                selectedMetodePembayaran ===
                                    "Cash" &&
                                    kembalian > 0 && (React.createElement("div", { className: "flex justify-between border-t pt-2 mt-2" },
                                    React.createElement("span", { className: "font-semibold text-base sm:text-lg" }, "Kembalian:"),
                                    React.createElement("span", { className: "font-bold text-base sm:text-lg text-primary" }, new Intl.NumberFormat("id-ID", {
                                        style: "currency",
                                        currency: "IDR",
                                        minimumFractionDigits: 0,
                                        maximumFractionDigits: 0
                                    }).format(kembalian))))))),
                    React.createElement("div", { className: "pt-2" },
                        footerError && (React.createElement("p", { className: "text-sm text-red-600 text-center pb-2" }, footerError)),
                        React.createElement("div", { className: "flex flex-col sm:flex-row w-full gap-2" },
                            React.createElement(button_1.Button, { variant: "outline", className: "w-full", onClick: function () {
                                    return handleSheetOpenChange(false);
                                } }, "Batal"),
                            !!selectedVoucherPacket.assign_on_sale && (React.createElement(button_1.Button, { variant: "secondary", className: "w-full", onClick: function () {
                                    return setAlertOpen(true);
                                } },
                                "Pilih Voucher (",
                                selectedVoucherIds.length,
                                "/",
                                requiredVoucherCount,
                                ")")),
                            React.createElement(button_1.Button, { variant: "default", onClick: handleFinalSubmit, className: "w-full" }, "Konfirmasi & Bayar")))))))),
        React.createElement(voucher_selection_modal_1.VoucherSelectionModal, { isOpen: isAlertOpen, onOpenChange: setAlertOpen, isLoading: isVoucherLoading, availableVouchers: availableVouchers, selectedVoucherIds: selectedVoucherIds, onVoucherCheckboxChange: handleVoucherCheckboxChange, onSave: handleSaveSelectedVouchers, selectedVoucherPacket: selectedVoucherPacket, packetAmount: quantity })));
}
exports["default"] = CreatePurchasedPacket;
