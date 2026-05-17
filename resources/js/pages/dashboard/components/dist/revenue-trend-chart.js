"use strict";
exports.__esModule = true;
exports.RevenueTrendChart = void 0;
var card_1 = require("@/components/ui/card");
var recharts_1 = require("recharts");
var date_fns_1 = require("date-fns");
var locale_1 = require("date-fns/locale");
// Custom Tooltip Component
var CustomTooltip = function (_a) {
    var active = _a.active, payload = _a.payload, label = _a.label;
    if (active && payload && payload.length) {
        var formatCurrency_1 = function (value) {
            return new Intl.NumberFormat("id-ID", {
                style: "currency",
                currency: "IDR",
                minimumFractionDigits: 0
            }).format(value);
        };
        var formatDate = function (date) {
            return date_fns_1.format(new Date(date), "dd MMM yyyy", { locale: locale_1.id });
        };
        return (React.createElement("div", { className: "bg-background border border-border rounded-lg shadow-lg p-3" },
            React.createElement("p", { className: "font-medium text-foreground" }, formatDate(label)),
            payload.map(function (entry, index) { return (React.createElement("p", { key: index, className: "text-sm text-muted-foreground", style: { color: entry.color } }, entry.name + ": " + formatCurrency_1(entry.value))); })));
    }
    return null;
};
function RevenueTrendChart(_a) {
    var data = _a.data, className = _a.className;
    var formatCurrency = function (value) {
        return new Intl.NumberFormat("id-ID", {
            style: "currency",
            currency: "IDR",
            minimumFractionDigits: 0,
            notation: "compact",
            maximumFractionDigits: 1
        }).format(value);
    };
    var formatDate = function (date) {
        return date_fns_1.format(new Date(date), "dd MMM", { locale: locale_1.id });
    };
    return (React.createElement(card_1.Card, { className: className },
        React.createElement(card_1.CardHeader, null,
            React.createElement(card_1.CardTitle, { className: "text-lg font-semibold" }, "Tren Pendapatan 7 Hari Terakhir")),
        React.createElement(card_1.CardContent, null,
            React.createElement(recharts_1.ResponsiveContainer, { width: "100%", height: 300 },
                React.createElement(recharts_1.AreaChart, { data: data },
                    React.createElement("defs", null,
                        React.createElement("linearGradient", { id: "totalRevenue", x1: "0", y1: "0", x2: "0", y2: "1" },
                            React.createElement("stop", { offset: "5%", stopColor: "#3b82f6", stopOpacity: 0.8 }),
                            React.createElement("stop", { offset: "95%", stopColor: "#3b82f6", stopOpacity: 0.1 })),
                        React.createElement("linearGradient", { id: "carWash", x1: "0", y1: "0", x2: "0", y2: "1" },
                            React.createElement("stop", { offset: "5%", stopColor: "#10b981", stopOpacity: 0.8 }),
                            React.createElement("stop", { offset: "95%", stopColor: "#10b981", stopOpacity: 0.1 })),
                        React.createElement("linearGradient", { id: "voucherSales", x1: "0", y1: "0", x2: "0", y2: "1" },
                            React.createElement("stop", { offset: "5%", stopColor: "#f59e0b", stopOpacity: 0.8 }),
                            React.createElement("stop", { offset: "95%", stopColor: "#f59e0b", stopOpacity: 0.1 }))),
                    React.createElement(recharts_1.XAxis, { dataKey: "date", tickFormatter: formatDate, tick: { fontSize: 12 }, axisLine: false, tickLine: false }),
                    React.createElement(recharts_1.YAxis, { tickFormatter: formatCurrency, tick: { fontSize: 12 }, axisLine: false, tickLine: false }),
                    React.createElement(recharts_1.Tooltip, { content: React.createElement(CustomTooltip, null) }),
                    React.createElement(recharts_1.Area, { type: "monotone", dataKey: "revenue", stroke: "#3b82f6", strokeWidth: 2, fill: "url(#totalRevenue)", name: "Total Pendapatan" }),
                    React.createElement(recharts_1.Area, { type: "monotone", dataKey: "carWash", stroke: "#10b981", strokeWidth: 2, fill: "url(#carWash)", name: "Cuci Mobil" }),
                    React.createElement(recharts_1.Area, { type: "monotone", dataKey: "voucherSales", stroke: "#f59e0b", strokeWidth: 2, fill: "url(#voucherSales)", name: "Penjualan Voucher" }))),
            React.createElement("div", { className: "flex justify-center gap-6 mt-4 text-sm" },
                React.createElement("div", { className: "flex items-center gap-2" },
                    React.createElement("div", { className: "w-3 h-3 rounded-full bg-blue-500" }),
                    React.createElement("span", null, "Total Pendapatan")),
                React.createElement("div", { className: "flex items-center gap-2" },
                    React.createElement("div", { className: "w-3 h-3 rounded-full bg-green-500" }),
                    React.createElement("span", null, "Cuci Mobil")),
                React.createElement("div", { className: "flex items-center gap-2" },
                    React.createElement("div", { className: "w-3 h-3 rounded-full bg-yellow-500" }),
                    React.createElement("span", null, "Penjualan Voucher"))))));
}
exports.RevenueTrendChart = RevenueTrendChart;
exports["default"] = RevenueTrendChart;
