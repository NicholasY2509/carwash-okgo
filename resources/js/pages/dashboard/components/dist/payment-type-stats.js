"use strict";
exports.__esModule = true;
var card_1 = require("@/components/ui/card");
var utils_1 = require("@/lib/utils");
function PaymentTypeStats(_a) {
    var title = _a.title, stats = _a.stats, className = _a.className;
    if (!stats || stats.length === 0) {
        return (React.createElement(card_1.Card, { className: className },
            React.createElement(card_1.CardHeader, null,
                React.createElement(card_1.CardTitle, null, title)),
            React.createElement(card_1.CardContent, null,
                React.createElement("p", { className: "text-sm text-muted-foreground" }, "Belum ada transaksi hari ini."))));
    }
    return (React.createElement(card_1.Card, { className: utils_1.cn(className) },
        React.createElement(card_1.CardHeader, { className: "flex flex-row items-center justify-between space-y-0 pb-2" },
            React.createElement(card_1.CardTitle, { className: "text-sm font-medium" }, title)),
        React.createElement(card_1.CardContent, null,
            React.createElement("div", { className: "md:columns-2 md:gap-x-8" }, stats.map(function (stat) { return (React.createElement("div", { key: stat.type, className: "break-inside-avoid mb-2" },
                React.createElement("div", { className: "flex items-center justify-between" },
                    React.createElement("div", { className: "flex items-center gap-3" },
                        React.createElement("span", { className: "text-sm font-medium" }, stat.type)),
                    React.createElement("div", { className: "text-lg font-bold text-primary" }, stat.total)))); })))));
}
exports["default"] = PaymentTypeStats;
