"use strict";
exports.__esModule = true;
var react_1 = require("react");
var card_1 = require("@/components/ui/card");
var table_1 = require("@/components/ui/table");
var modal_1 = require("@/components/ui/modal");
function LatestTransactionsCard(_a) {
    var _b, _c;
    var latestTransactions = _a.latestTransactions;
    var _d = react_1.useState(false), open = _d[0], setOpen = _d[1];
    var _e = react_1.useState(null), selected = _e[0], setSelected = _e[1];
    function handleRowClick(tx) {
        setSelected(tx);
        setOpen(true);
    }
    function formatRupiah(amount) {
        if (typeof amount !== "number")
            return "-";
        return amount.toLocaleString("id-ID", {
            style: "currency",
            currency: "IDR"
        });
    }
    return (React.createElement(card_1.Card, { className: "flex flex-col h-full" },
        React.createElement(card_1.CardHeader, null,
            React.createElement(card_1.CardTitle, { className: "text-sm font-medium" }, "5 Cuci Mobil Terakhir")),
        React.createElement(card_1.CardContent, { className: "flex-1 flex flex-col" },
            React.createElement("div", { className: "flex-1 flex flex-col" },
                React.createElement(table_1.Table, null,
                    React.createElement(table_1.TableHeader, null,
                        React.createElement(table_1.TableRow, null,
                            React.createElement(table_1.TableHead, null, "Customer"),
                            React.createElement(table_1.TableHead, null, "Plat"),
                            React.createElement(table_1.TableHead, null, "Jam"),
                            React.createElement(table_1.TableHead, null, "Stall"))),
                    React.createElement(table_1.TableBody, null, latestTransactions.length === 0 ? (React.createElement(table_1.TableRow, null,
                        React.createElement(table_1.TableCell, { colSpan: 4, className: "text-center text-muted-foreground py-2" }, "Tidak ada transaksi terbaru."))) : (latestTransactions.map(function (tx) {
                        var _a, _b;
                        return (React.createElement(table_1.TableRow, { key: tx.id, className: "cursor-pointer hover:bg-primary/10", onClick: function () { return handleRowClick(tx); } },
                            React.createElement(table_1.TableCell, null, ((_a = tx.customer) === null || _a === void 0 ? void 0 : _a.name) || "-"),
                            React.createElement(table_1.TableCell, null, ((_b = tx.car) === null || _b === void 0 ? void 0 : _b.plate_number) || "-"),
                            React.createElement(table_1.TableCell, null, tx.transaction_date
                                ? new Date(tx.transaction_date).toLocaleTimeString("id-ID", {
                                    hour: "2-digit",
                                    minute: "2-digit"
                                })
                                : "-"),
                            React.createElement(table_1.TableCell, null, tx.service_records &&
                                tx.service_records.length > 0 &&
                                tx.service_records[0].stall
                                ? tx.service_records[0].stall
                                    .name
                                : "-")));
                    }))))),
            React.createElement(modal_1.Modal, { open: open, onClose: function () { return setOpen(false); } },
                React.createElement(modal_1.ModalHeader, { title: "Detail Lengkap Transaksi" }),
                selected && (React.createElement("div", { className: "space-y-2 text-sm" },
                    React.createElement("div", null,
                        React.createElement("b", null, "ID:"),
                        " ",
                        selected.id),
                    React.createElement("div", null,
                        React.createElement("b", null, "Customer:"),
                        " ",
                        ((_b = selected.customer) === null || _b === void 0 ? void 0 : _b.name) || "-"),
                    React.createElement("div", null,
                        React.createElement("b", null, "Plat:"),
                        " ",
                        ((_c = selected.car) === null || _c === void 0 ? void 0 : _c.plate_number) || "-"),
                    React.createElement("div", null,
                        React.createElement("b", null, "Jam:"),
                        " ",
                        selected.transaction_date
                            ? new Date(selected.transaction_date).toLocaleTimeString("id-ID", {
                                hour: "2-digit",
                                minute: "2-digit"
                            })
                            : "-"),
                    React.createElement("div", null,
                        React.createElement("b", null, "Tanggal:"),
                        " ",
                        selected.transaction_date
                            ? new Date(selected.transaction_date).toLocaleDateString("id-ID")
                            : "-"),
                    React.createElement("div", null,
                        React.createElement("b", null, "Jenis Transaksi:"),
                        " ",
                        selected.transaction_type || "-"),
                    React.createElement("div", null,
                        React.createElement("b", null, "Total:"),
                        " ",
                        formatRupiah(selected.total_amount)),
                    React.createElement("div", null,
                        React.createElement("b", null, "Status:"),
                        " ",
                        selected.status || "-"),
                    React.createElement("div", null,
                        React.createElement("b", null, "Service Records:"),
                        selected.service_records &&
                            selected.service_records.length > 0 ? (React.createElement("ul", { className: "ml-4 list-disc" }, selected.service_records.map(function (sr, idx) {
                            var _a;
                            return (React.createElement("li", { key: sr.id || idx, className: "mb-2" },
                                React.createElement("div", null,
                                    React.createElement("b", null, "Stall:"),
                                    " ",
                                    ((_a = sr.stall) === null || _a === void 0 ? void 0 : _a.name) || "-"),
                                React.createElement("div", null,
                                    React.createElement("b", null, "Service:"),
                                    " ",
                                    sr.service_name || "-"),
                                React.createElement("div", null,
                                    React.createElement("b", null, "Waktu:"),
                                    " ",
                                    sr.created_at
                                        ? new Date(sr.created_at).toLocaleString("id-ID")
                                        : "-")));
                        }))) : (" -"))))))));
}
exports["default"] = LatestTransactionsCard;
