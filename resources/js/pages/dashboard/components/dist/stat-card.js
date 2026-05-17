"use strict";
exports.__esModule = true;
exports.PaymentTypeStats = exports.TotalRevenue = void 0;
var card_1 = require("@/components/ui/card");
var utils_1 = require("@/lib/utils");
var lucide_react_1 = require("lucide-react");
var getIconForType = function (type) {
    switch (type.toLowerCase()) {
        case "salestransaction":
            return React.createElement(lucide_react_1.Banknote, { className: "h-4 w-4 text-muted-foreground" });
        case "voucher":
            return React.createElement(lucide_react_1.Ticket, { className: "h-4 w-4 text-muted-foreground" });
        default:
            return React.createElement(lucide_react_1.Shield, { className: "h-4 w-4 text-muted-foreground" });
    }
};
var getLabelForType = function (type) {
    switch (type.toLowerCase()) {
        case "salestransaction":
            return "Tunai / Cash";
        case "voucher":
            return "Voucher";
        default:
            return "Return";
    }
};
function TotalRevenue(_a) {
    var title = _a.title, value = _a.value, icon = _a.icon;
    return (React.createElement(card_1.Card, { className: "" },
        React.createElement(card_1.CardHeader, { className: "flex flex-row items-center justify-between space-y-0 pb-2" },
            React.createElement(card_1.CardTitle, { className: "text-sm font-medium" }, title),
            icon ? (icon) : (React.createElement(lucide_react_1.Banknote, { className: "h-4 w-4 text-muted-foreground" }))),
        React.createElement(card_1.CardContent, { className: "h-full items-center" },
            React.createElement("div", { className: "md:text-3xl lg:text-4xl font-semibold text-primary" }, value))));
}
exports.TotalRevenue = TotalRevenue;
function PaymentTypeStats(_a) {
    var title = _a.title, stats = _a.stats, className = _a.className;
    if (!stats || stats.length === 0) {
        return (React.createElement(card_1.Card, null,
            React.createElement(card_1.CardHeader, null,
                React.createElement(card_1.CardTitle, null, title)),
            React.createElement(card_1.CardContent, null,
                React.createElement("p", { className: "text-sm text-muted-foreground" }, "Belum ada transaksi hari ini."))));
    }
    return (React.createElement(card_1.Card, { className: utils_1.cn("@container/card", className) },
        React.createElement(card_1.CardHeader, { className: "flex flex-row items-center justify-between space-y-0 pb-2" },
            React.createElement(card_1.CardTitle, { className: "text-sm font-medium" }, title)),
        React.createElement(card_1.CardContent, null,
            React.createElement("div", { className: "md:columns-2 md:gap-x-8" }, stats.map(function (stat, index) { return (React.createElement("div", { key: stat.type, className: "break-inside-avoid mb-2" },
                React.createElement("div", { className: "flex items-center justify-between" },
                    React.createElement("div", { className: "flex items-center gap-3" },
                        React.createElement("span", { className: "text-sm font-medium" }, stat.type)),
                    React.createElement("div", { className: "text-lg font-bold text-primary" }, stat.total)))); })))));
}
exports.PaymentTypeStats = PaymentTypeStats;
