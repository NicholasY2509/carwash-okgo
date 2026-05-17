"use strict";
exports.__esModule = true;
var badge_1 = require("@/components/ui/badge");
var card_1 = require("@/components/ui/card");
var lucide_react_1 = require("lucide-react");
function VoucherPacketCard(_a) {
    var voucherPacket = _a.voucherPacket, onClick = _a.onClick;
    var formattedPrice = new Intl.NumberFormat("id-ID", {
        style: "currency",
        currency: "IDR",
        minimumFractionDigits: 0
    }).format(voucherPacket.price);
    return (React.createElement(card_1.Card, { onClick: onClick, className: "flex h-full cursor-pointer flex-col transition-all hover:-translate-y-2 hover:shadow-lg hover:shadow-primary/30 dark:hover:shadow-primary/50 focus:shadow-lg focus:-translate-y-2 focus:shadow-primary/30 dark:focus:shadow-primary/50" },
        React.createElement(card_1.CardHeader, { className: "flex-grow-0" },
            React.createElement("div", { className: "flex items-start flex-col lg:flex-row justify-between" },
                React.createElement("div", null,
                    React.createElement(card_1.CardTitle, { className: "lg:text-md font-bold" }, voucherPacket.name),
                    React.createElement(card_1.CardDescription, null, voucherPacket.description)),
                React.createElement(badge_1.Badge, { variant: "outline", className: "self-end lg:self-baseline mt-2 lg:mt-0" },
                    "Voucher ",
                    voucherPacket.voucher_type.name))),
        React.createElement(card_1.CardContent, { className: "flex-grow flex flex-col justify-end space-y-4" },
            React.createElement("div", { className: "text-center" },
                React.createElement("p", { className: "text-3xl lg:text-4xl font-extrabold text-primary mb-2" }, formattedPrice)),
            React.createElement("div", { className: "space-y-3 text-sm text-muted-foreground" },
                React.createElement("div", { className: "flex items-center" },
                    React.createElement(lucide_react_1.Ticket, { className: "mr-2 h-4 w-4" }),
                    React.createElement("span", null,
                        voucherPacket.quantity,
                        " Lembar Voucher")),
                React.createElement("div", { className: "flex items-center" },
                    React.createElement(lucide_react_1.Clock, { className: "mr-2 h-4 w-4" }),
                    React.createElement("span", null,
                        "Masa Aktif: ",
                        voucherPacket.valid_period_months,
                        " ",
                        "Bulan"))))));
}
exports["default"] = VoucherPacketCard;
