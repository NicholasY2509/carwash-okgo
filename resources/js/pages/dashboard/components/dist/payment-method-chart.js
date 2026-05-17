"use strict";
exports.__esModule = true;
exports.PaymentMethodChart = void 0;
var card_1 = require("@/components/ui/card");
var recharts_1 = require("recharts");
// Custom Tooltip Component
var CustomTooltip = function (_a) {
    var active = _a.active, payload = _a.payload, label = _a.label;
    if (active && payload && payload.length) {
        var formatCurrency = function (value) {
            return new Intl.NumberFormat("id-ID", {
                style: "currency",
                currency: "IDR",
                minimumFractionDigits: 0
            }).format(value);
        };
        return (React.createElement("div", { className: "bg-background border border-border rounded-lg shadow-lg p-3" },
            React.createElement("p", { className: "font-medium text-foreground" }, "" + label),
            React.createElement("p", { className: "text-sm text-muted-foreground" }, "Pendapatan: " + formatCurrency(payload[0].value))));
    }
    return null;
};
function PaymentMethodChart(_a) {
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
    var COLORS = ["#3b82f6", "#10b981", "#f59e0b", "#ef4444", "#8b5cf6"];
    // Filter out zero values and ensure we have valid data
    var validData = data.filter(function (item) { return item.value > 0; });
    // If no valid data, show a message
    if (validData.length === 0) {
        return (React.createElement(card_1.Card, { className: className },
            React.createElement(card_1.CardHeader, null,
                React.createElement(card_1.CardTitle, { className: "text-lg font-semibold" }, "Distribusi Metode Pembayaran")),
            React.createElement(card_1.CardContent, null,
                React.createElement("div", { className: "flex items-center justify-center h-[300px] text-muted-foreground" },
                    React.createElement("p", null, "Tidak ada data pembayaran hari ini")))));
    }
    return (React.createElement(card_1.Card, { className: className },
        React.createElement(card_1.CardHeader, null,
            React.createElement(card_1.CardTitle, { className: "text-lg font-semibold" }, "Distribusi Metode Pembayaran")),
        React.createElement(card_1.CardContent, null,
            React.createElement(recharts_1.ResponsiveContainer, { width: "100%", height: 300 },
                React.createElement(recharts_1.PieChart, null,
                    React.createElement(recharts_1.Pie, { data: validData, cx: "50%", cy: "50%", labelLine: false, label: function (_a) {
                            var name = _a.name, percent = _a.percent;
                            return name + " " + (percent * 100).toFixed(0) + "%";
                        }, outerRadius: 80, fill: "#8884d8", dataKey: "value" }, validData.map(function (entry, index) { return (React.createElement(recharts_1.Cell, { key: "cell-" + index, fill: COLORS[index % COLORS.length] })); })),
                    React.createElement(recharts_1.Tooltip, { content: React.createElement(CustomTooltip, null) }),
                    React.createElement(recharts_1.Legend, null))))));
}
exports.PaymentMethodChart = PaymentMethodChart;
exports["default"] = PaymentMethodChart;
