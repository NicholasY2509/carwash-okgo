"use strict";
exports.__esModule = true;
var card_1 = require("@/components/ui/card");
function VoucherPacketSalesCard(_a) {
    var voucherPacketSales = _a.voucherPacketSales, voucherPurchaseRevenue = _a.voucherPurchaseRevenue;
    return (React.createElement(card_1.Card, { className: "" },
        React.createElement(card_1.CardHeader, null,
            React.createElement(card_1.CardTitle, { className: "text-sm font-medium" }, "Pembelian Voucher Hari ini")),
        React.createElement(card_1.CardContent, null,
            React.createElement("div", { className: "md:columns-2 md:gap-x-8" },
                voucherPacketSales.map(function (pkt) { return (React.createElement("div", { key: pkt.name, className: "break-inside-avoid mb-2" },
                    React.createElement("div", { className: "flex items-center justify-between" },
                        React.createElement("div", { className: "flex items-center gap-3" },
                            React.createElement("span", { className: "text-sm font-medium" }, pkt.name)),
                        React.createElement("div", { className: "text-lg font-bold text-primary" }, pkt.count)))); }),
                voucherPacketSales.length === 0 && (React.createElement("div", { className: "text-muted-foreground" }, "Belum ada pembelian voucher hari ini."))))));
}
exports["default"] = VoucherPacketSalesCard;
