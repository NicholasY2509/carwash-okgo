"use strict";
var __awaiter = (this && this.__awaiter) || function (thisArg, _arguments, P, generator) {
    function adopt(value) { return value instanceof P ? value : new P(function (resolve) { resolve(value); }); }
    return new (P || (P = Promise))(function (resolve, reject) {
        function fulfilled(value) { try { step(generator.next(value)); } catch (e) { reject(e); } }
        function rejected(value) { try { step(generator["throw"](value)); } catch (e) { reject(e); } }
        function step(result) { result.done ? resolve(result.value) : adopt(result.value).then(fulfilled, rejected); }
        step((generator = generator.apply(thisArg, _arguments || [])).next());
    });
};
var __generator = (this && this.__generator) || function (thisArg, body) {
    var _ = { label: 0, sent: function() { if (t[0] & 1) throw t[1]; return t[1]; }, trys: [], ops: [] }, f, y, t, g;
    return g = { next: verb(0), "throw": verb(1), "return": verb(2) }, typeof Symbol === "function" && (g[Symbol.iterator] = function() { return this; }), g;
    function verb(n) { return function (v) { return step([n, v]); }; }
    function step(op) {
        if (f) throw new TypeError("Generator is already executing.");
        while (_) try {
            if (f = 1, y && (t = op[0] & 2 ? y["return"] : op[0] ? y["throw"] || ((t = y["return"]) && t.call(y), 0) : y.next) && !(t = t.call(y, op[1])).done) return t;
            if (y = 0, t) op = [op[0] & 2, t.value];
            switch (op[0]) {
                case 0: case 1: t = op; break;
                case 4: _.label++; return { value: op[1], done: false };
                case 5: _.label++; y = op[1]; op = [0]; continue;
                case 7: op = _.ops.pop(); _.trys.pop(); continue;
                default:
                    if (!(t = _.trys, t = t.length > 0 && t[t.length - 1]) && (op[0] === 6 || op[0] === 2)) { _ = 0; continue; }
                    if (op[0] === 3 && (!t || (op[1] > t[0] && op[1] < t[3]))) { _.label = op[1]; break; }
                    if (op[0] === 6 && _.label < t[1]) { _.label = t[1]; t = op; break; }
                    if (t && _.label < t[2]) { _.label = t[2]; _.ops.push(op); break; }
                    if (t[2]) _.ops.pop();
                    _.trys.pop(); continue;
            }
            op = body.call(thisArg, _);
        } catch (e) { op = [6, e]; y = 0; } finally { f = t = 0; }
        if (op[0] & 5) throw op[1]; return { value: op[0] ? op[1] : void 0, done: true };
    }
};
exports.__esModule = true;
var heading_1 = require("@/components/heading");
var app_layout_1 = require("@/layouts/app-layout");
var react_1 = require("@inertiajs/react");
var react_2 = require("react");
var stat_card_1 = require("./components/stat-card");
var button_1 = require("@/components/ui/button");
var lucide_react_1 = require("lucide-react");
var use_permission_1 = require("@/hooks/use-permission");
var sonner_1 = require("sonner");
var alert_dialog_1 = require("@/components/ui/alert-dialog");
var total_revenue_card_1 = require("./components/total-revenue-card");
var voucher_packet_sales_card_1 = require("./components/voucher-packet-sales-card");
var latest_transactions_card_1 = require("./components/latest-transactions-card");
var revenue_trend_chart_1 = require("./components/revenue-trend-chart");
var reminder_alert_1 = require("./components/reminder-alert");
var axios_1 = require("axios");
var breadcrumbs = [
    {
        title: "Dashboard",
        href: "/dashboard"
    },
];
function Dashboard(_a) {
    var props = react_1.usePage().props;
    var revenue = props.todayCarWashRevenue || 0;
    var hasClosedTodayCash = props.hasClosedTodayCash;
    var reminders = props.reminders || [];
    var _b = react_2.useState(new Date()), currentTime = _b[0], setCurrentTime = _b[1];
    var hasRole = use_permission_1.usePermission().hasRole;
    react_2.useEffect(function () {
        var interval = setInterval(function () {
            setCurrentTime(new Date());
        }, 1000);
        return function () { return clearInterval(interval); };
    });
    var _c = react_2.useState(false), isModalKasOpen = _c[0], setIsModalKasOpen = _c[1];
    var _d = react_2.useState(false), isRefreshing = _d[0], setIsRefreshing = _d[1];
    var voucherPurchaseRevenue = props.voucherPurchaseRevenue || 0;
    var voucherPacketSales = props.voucherPacketSales || [];
    var cashCarWashRevenue = props.cashCarWashRevenue || 0;
    var otherCarWashRevenue = props.otherCarWashRevenue || 0;
    var latestTransactions = props.latestTransactions || [];
    var revenueTrend = props.revenueTrend || [];
    function handleKasClose() {
        if (!(hasClosedTodayCash === null || hasClosedTodayCash === void 0 ? void 0 : hasClosedTodayCash.id)) {
            sonner_1.toast.error("Error: ID Laporan kas tidak ditemukan.");
            console.error("Attempted to close cash log without a valid ID.", hasClosedTodayCash);
            return;
        }
        setIsModalKasOpen(false);
        react_1.router.patch(route("daily-cash-logs.kasir-close", hasClosedTodayCash.id), {}, {
            onSuccess: function () {
                sonner_1.toast.success("Kas Berhasil ditutup");
            },
            onError: function () {
                sonner_1.toast.error("Gagal menutup kas");
            }
        });
    }
    function handleRefresh() {
        return __awaiter(this, void 0, void 0, function () {
            var error_1;
            return __generator(this, function (_a) {
                switch (_a.label) {
                    case 0:
                        setIsRefreshing(true);
                        _a.label = 1;
                    case 1:
                        _a.trys.push([1, 3, 4, 5]);
                        return [4 /*yield*/, axios_1["default"].post(route("dashboard.clear-cache"))];
                    case 2:
                        _a.sent();
                        react_1.router.reload({ only: ["props"], data: { refresh: true } });
                        sonner_1.toast.success("Dashboard diperbarui");
                        return [3 /*break*/, 5];
                    case 3:
                        error_1 = _a.sent();
                        console.error("Error refreshing dashboard:", error_1);
                        sonner_1.toast.error("Gagal memperbarui dashboard");
                        return [3 /*break*/, 5];
                    case 4:
                        setIsRefreshing(false);
                        return [7 /*endfinally*/];
                    case 5: return [2 /*return*/];
                }
            });
        });
    }
    return (React.createElement(app_layout_1["default"], { breadcrumbs: breadcrumbs },
        React.createElement(react_1.Head, { title: "Dashboard" }),
        React.createElement("div", { className: "flex h-full flex-1 flex-col gap-4 rounded-xl p-4" },
            React.createElement("div", { className: "flex flex-row justify-between" },
                React.createElement(heading_1["default"], { title: "Dashboard", description: "Selamat datang di dashboard" }),
                React.createElement("div", { className: "flex gap-2" },
                    React.createElement(button_1.Button, { onClick: handleRefresh, disabled: isRefreshing, variant: "outline", size: "sm", className: "flex items-center gap-2" },
                        React.createElement(lucide_react_1.RefreshCw, { className: "h-4 w-4 " + (isRefreshing ? "animate-spin" : "") }),
                        React.createElement("span", null, "Refresh")),
                    hasRole("Kasir") && (React.createElement("div", null, hasClosedTodayCash && (React.createElement(button_1.Button, { onClick: function () { return setIsModalKasOpen(true); }, className: "flex items-center gap-2" },
                        React.createElement(lucide_react_1.Banknote, { className: "h-4 w-4" }),
                        React.createElement("span", null, "Tutup Kas Hari ini"))))))),
            React.createElement(reminder_alert_1["default"], { reminders: reminders }),
            React.createElement("div", { className: "grid grid-cols-1 lg:grid-cols-2 gap-4 *:data-[slot=card]:from-primary/5 *:data-[slot=card]:to-card dark:*:data-[slot=card]:bg-card *:data-[slot=card]:bg-gradient-to-t *:data-[slot=card]:shadow-xs " },
                React.createElement("div", { className: "grid grid-cols-1 lg:grid-cols-2 gap-4 *:data-[slot=card]:from-primary/5 *:data-[slot=card]:to-card dark:*:data-[slot=card]:bg-card *:data-[slot=card]:bg-gradient-to-t *:data-[slot=card]:shadow-xs " },
                    React.createElement(total_revenue_card_1["default"], { className: "col-span-1 lg:col-span-2", revenue: revenue, cashCarWashRevenue: cashCarWashRevenue, otherCarWashRevenue: otherCarWashRevenue }),
                    React.createElement(stat_card_1.PaymentTypeStats, { title: "Cuci Mobil Hari Ini", stats: props.todayCarWashByPayment }),
                    React.createElement(voucher_packet_sales_card_1["default"], { voucherPacketSales: voucherPacketSales, voucherPurchaseRevenue: voucherPurchaseRevenue })),
                React.createElement(latest_transactions_card_1["default"], { latestTransactions: latestTransactions }),
                React.createElement(revenue_trend_chart_1["default"], { data: revenueTrend, className: "col-span-1 lg:col-span-2" }))),
        React.createElement(alert_dialog_1.AlertDialog, { open: isModalKasOpen, onOpenChange: setIsModalKasOpen },
            React.createElement(alert_dialog_1.AlertDialogContent, null,
                React.createElement(alert_dialog_1.AlertDialogTitle, null, "Tutup Kas Hari Ini?"),
                React.createElement(alert_dialog_1.AlertDialogDescription, null, "Anda yakin ingin menutup kas hari ini?"),
                React.createElement(alert_dialog_1.AlertDialogFooter, null,
                    React.createElement(alert_dialog_1.AlertDialogCancel, null, "Batal"),
                    React.createElement(button_1.Button, { onClick: handleKasClose, variant: "destructive" }, "Tutup Kas"))))));
}
exports["default"] = Dashboard;
