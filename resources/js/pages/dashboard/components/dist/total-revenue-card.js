"use strict";
exports.__esModule = true;
var card_1 = require("@/components/ui/card");
var rupiah_formatter_1 = require("@/lib/rupiah-formatter");
function TotalRevenueCard(_a) {
    var revenue = _a.revenue, cashCarWashRevenue = _a.cashCarWashRevenue, otherCarWashRevenue = _a.otherCarWashRevenue, className = _a.className;
    return (React.createElement(card_1.Card, { className: "" + className },
        React.createElement(card_1.CardHeader, null,
            React.createElement(card_1.CardTitle, { className: "text-sm font-medium" }, "Total Transaksi Hari Ini")),
        React.createElement(card_1.CardContent, null,
            React.createElement("div", { className: "flex flex-col gap-2" },
                React.createElement("div", { className: "flex items-center justify-between" },
                    React.createElement("span", { className: "text-muted-foreground" }, "Total Transaksi"),
                    React.createElement("span", { className: "text-2xl font-bold text-primary" }, rupiah_formatter_1["default"](revenue))),
                React.createElement("div", { className: "flex items-center justify-between mt-2" },
                    React.createElement("span", { className: "text-muted-foreground" }, "Cash"),
                    React.createElement("span", { className: "font-semibold" }, rupiah_formatter_1["default"](cashCarWashRevenue))),
                React.createElement("div", { className: "flex items-center justify-between" },
                    React.createElement("span", { className: "text-muted-foreground" }, "Lainnya"),
                    React.createElement("span", { className: "font-semibold" }, rupiah_formatter_1["default"](otherCarWashRevenue)))))));
}
exports["default"] = TotalRevenueCard;
