"use strict";
exports.__esModule = true;
exports.TransactionFooter = void 0;
var button_1 = require("@/components/ui/button");
var input_1 = require("@/components/ui/input");
var label_1 = require("@/components/ui/label");
var select_1 = require("@/components/ui/select");
var react_number_format_1 = require("react-number-format");
var react_1 = require("react");
var currency_formatter_1 = require("@/lib/currency-formatter");
exports.TransactionFooter = react_1.memo(function TransactionFooter(_a) {
    var products = _a.products, stalls = _a.stalls, activeForm = _a.activeForm, selectedProduct = _a.selectedProduct, onProductChange = _a.onProductChange, selectedStallId = _a.selectedStallId, onStallChange = _a.onStallChange, paymentMethod = _a.paymentMethod, onPaymentMethodChange = _a.onPaymentMethodChange, nominalBayar = _a.nominalBayar, onNominalBayarChange = _a.onNominalBayarChange, totalHarga = _a.totalHarga, kembalian = _a.kembalian, onFinalSubmit = _a.onFinalSubmit, onClose = _a.onClose, footerError = _a.footerError, _b = _a.canSubmit, canSubmit = _b === void 0 ? true : _b;
    // Memoize expensive calculations
    var nilaiBayar = react_1.useMemo(function () { return parseFloat(nominalBayar) || 0; }, [nominalBayar]);
    var formattedTotalHarga = react_1.useMemo(function () { return currency_formatter_1.currencyFormatter.format(totalHarga); }, [totalHarga]);
    var formattedNilaiBayar = react_1.useMemo(function () { return currency_formatter_1.currencyFormatter.format(nilaiBayar); }, [nilaiBayar]);
    var formattedKembalian = react_1.useMemo(function () { return currency_formatter_1.currencyFormatter.format(kembalian); }, [kembalian]);
    var handleNominalBayarChange = react_1.useCallback(function (values) {
        onNominalBayarChange(values.value);
    }, [onNominalBayarChange]);
    var handleClose = react_1.useCallback(function () {
        onClose();
    }, [onClose]);
    var handleFinalSubmit = react_1.useCallback(function () {
        onFinalSubmit();
    }, [onFinalSubmit]);
    var productOptions = react_1.useMemo(function () {
        return products.map(function (product) { return ({
            id: product.id,
            name: product.name,
            price: product.price,
            formattedPrice: currency_formatter_1.currencyFormatter.format(product.price),
            displayText: product.name + " - " + currency_formatter_1.currencyFormatter.format(product.price)
        }); });
    }, [products]);
    return (React.createElement("div", { className: "flex-col px-4 mb-3 border-t-2 pt-4" },
        React.createElement("div", { className: "flex flex-col lg:flex-row gap-4" },
            React.createElement("div", { className: "flex flex-col w-full lg:w-3/5 gap-2" },
                React.createElement("div", { className: "flex flex-col sm:flex-row sm:items-center sm:justify-between gap-2" },
                    React.createElement(label_1.Label, null, "Stall"),
                    React.createElement(select_1.Select, { value: selectedStallId, onValueChange: onStallChange },
                        React.createElement(select_1.SelectTrigger, { className: "w-full sm:w-3/5" },
                            React.createElement(select_1.SelectValue, { placeholder: "Pilih stall..." })),
                        React.createElement(select_1.SelectContent, null, stalls.map(function (stall) { return (React.createElement(select_1.SelectItem, { key: stall.id, value: String(stall.id) }, stall.name)); })))),
                React.createElement("div", { className: "flex flex-col sm:flex-row sm:items-center sm:justify-between gap-2" },
                    React.createElement(label_1.Label, null, "Produk"),
                    React.createElement(select_1.Select, { value: String((selectedProduct === null || selectedProduct === void 0 ? void 0 : selectedProduct.id) || ""), onValueChange: onProductChange },
                        React.createElement(select_1.SelectTrigger, { className: "w-full sm:w-3/5" },
                            React.createElement(select_1.SelectValue, { placeholder: "Pilih produk..." })),
                        React.createElement(select_1.SelectContent, null, productOptions.map(function (product) { return (React.createElement(select_1.SelectItem, { key: product.id, value: String(product.id) }, product.displayText)); })))),
                activeForm === "Cash" && (React.createElement("div", { className: "flex flex-col sm:flex-row sm:items-center sm:justify-between gap-2" },
                    React.createElement(label_1.Label, null, "Metode Pembayaran"),
                    React.createElement(select_1.Select, { value: paymentMethod, onValueChange: onPaymentMethodChange },
                        React.createElement(select_1.SelectTrigger, { className: "w-full sm:w-3/5" },
                            React.createElement(select_1.SelectValue, { placeholder: "Pilih metode..." })),
                        React.createElement(select_1.SelectContent, null,
                            React.createElement(select_1.SelectItem, { value: "Cash" }, "Cash"),
                            React.createElement(select_1.SelectItem, { value: "Debit/Credit" }, "Debit/Credit"),
                            React.createElement(select_1.SelectItem, { value: "Transfer" }, "Transfer"),
                            React.createElement(select_1.SelectItem, { value: "QRIS" }, "QRIS"))))),
                paymentMethod === "Cash" && (React.createElement("div", { className: "flex flex-col sm:flex-row sm:items-center sm:justify-between gap-2" },
                    React.createElement(label_1.Label, { htmlFor: "nominal_bayar" }, "Nominal Dibayar"),
                    React.createElement(react_number_format_1.NumericFormat, { className: "w-full sm:w-3/5", id: "nominal_bayar", customInput: input_1.Input, prefix: "Rp ", thousandSeparator: ".", decimalSeparator: ",", value: nominalBayar, onValueChange: handleNominalBayarChange })))),
            React.createElement("div", { className: "space-y-2 rounded-lg border p-3 w-full lg:w-2/5" },
                React.createElement("div", { className: "space-y-2 text-sm " },
                    React.createElement("div", { className: "flex justify-between font-medium items-center" },
                        React.createElement("span", null, "Total Harga:"),
                        React.createElement("span", { className: "text-xl sm:text-2xl font-bold" }, formattedTotalHarga)),
                    paymentMethod === "Cash" && nilaiBayar > 0 && (React.createElement("div", { className: "flex justify-between" },
                        React.createElement("span", { className: "text-muted-foreground" }, "Bayar:"),
                        React.createElement("span", null, formattedNilaiBayar))),
                    paymentMethod === "Cash" && kembalian > 0 && (React.createElement("div", { className: "flex justify-between border-t pt-2 mt-2" },
                        React.createElement("span", { className: "font-semibold text-base sm:text-lg" }, "Kembalian:"),
                        React.createElement("span", { className: "font-bold text-base sm:text-lg text-primary" }, formattedKembalian)))),
                footerError && (React.createElement("p", { className: "text-sm text-red-600 text-center pb-2" }, footerError)))),
        React.createElement("div", { className: "grid grid-cols-2 gap-2 mt-3" },
            React.createElement(button_1.Button, { variant: "outline", onClick: handleClose }, "Cancel"),
            React.createElement(button_1.Button, { variant: "default", onClick: handleFinalSubmit }, "Buat Pembayaran"))));
});
