"use strict";
exports.__esModule = true;
var badge_1 = require("@/components/ui/badge");
var card_1 = require("@/components/ui/card");
var date_fns_1 = require("date-fns");
var locale_1 = require("date-fns/locale");
function VoucherCard(_a) {
    var voucher = _a.voucher;
    var getVariant = function () {
        var status = voucher.status.toLowerCase();
        if (status === "redeemed")
            return "destructive";
        if (status === "active" || status === "available")
            return "default";
        return "secondary";
    };
    return (React.createElement(card_1.Card, null,
        React.createElement(card_1.CardHeader, { className: "pb-2" },
            React.createElement("div", { className: "flex justify-between items-start" },
                React.createElement(card_1.CardTitle, { className: "text-lg font-bold" }, voucher.serial_number),
                React.createElement(badge_1.Badge, { variant: getVariant() }, voucher.status))),
        React.createElement(card_1.CardContent, { className: "text-sm" },
            React.createElement("div", { className: "space-y-2 text-muted-foreground" },
                React.createElement("div", { className: "flex justify-between" },
                    React.createElement("span", null, "Tipe:"),
                    React.createElement("span", { className: "font-medium text-foreground" }, voucher.voucher_type.name)),
                React.createElement("div", { className: "flex justify-between" },
                    React.createElement("span", null, "Ditebus:"),
                    React.createElement("span", { className: "font-medium text-foreground" }, voucher.redeemed_at
                        ? date_fns_1.format(new Date(voucher.redeemed_at), "dd MMM yyyy", { locale: locale_1.id })
                        : "-"))))));
}
exports["default"] = VoucherCard;
