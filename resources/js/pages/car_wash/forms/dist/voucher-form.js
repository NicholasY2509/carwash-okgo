"use strict";
var __assign = (this && this.__assign) || function () {
    __assign = Object.assign || function(t) {
        for (var s, i = 1, n = arguments.length; i < n; i++) {
            s = arguments[i];
            for (var p in s) if (Object.prototype.hasOwnProperty.call(s, p))
                t[p] = s[p];
        }
        return t;
    };
    return __assign.apply(this, arguments);
};
exports.__esModule = true;
var heading_1 = require("@/components/heading");
var button_1 = require("@/components/ui/button");
var input_1 = require("@/components/ui/input");
var label_1 = require("@/components/ui/label");
var use_transaction_handler_1 = require("@/hooks/use-transaction-handler");
var receipt_formatter_1 = require("@/lib/receipt-formatter");
var react_1 = require("@inertiajs/react");
var axios_1 = require("axios");
var lucide_react_1 = require("lucide-react");
var react_2 = require("react");
var use_debounce_1 = require("@/hooks/use-debounce");
var car_information_card_1 = require("@/components/car-information-card");
var CreateVoucherPurchase = react_2.forwardRef(function (_a, ref) {
    var _b;
    var onSuccess = _a.onSuccess;
    var _c = react_1.useForm({
        serial_number: "",
        plate_number: "",
        voucher_id: "",
        customer_id: "",
        car_id: "",
        purchased_packet_id: ""
    }), data = _c.data, setData = _c.setData, post = _c.post, processing = _c.processing, errors = _c.errors, reset = _c.reset;
    var _d = react_2.useState(null), foundVoucher = _d[0], setFoundVoucher = _d[1];
    var _e = react_2.useState(null), searchError = _e[0], setSearchError = _e[1];
    var _f = react_2.useState(false), isSearching = _f[0], setIsSearching = _f[1];
    var _g = use_transaction_handler_1.useTransactionHandler({
        onSuccess: onSuccess,
        reset: reset
    }), handleSuccess = _g.handleSuccess, handleError = _g.handleError;
    var _h = react_2.useState({}), localErrors = _h[0], setLocalErrors = _h[1];
    // Car search states
    var _j = react_2.useState(""), carPlateSearch = _j[0], setCarPlateSearch = _j[1];
    var _k = react_2.useState([]), carPlateResults = _k[0], setCarPlateResults = _k[1];
    var _l = react_2.useState(false), isCarPlateSearching = _l[0], setIsCarPlateSearching = _l[1];
    var _m = react_2.useState(false), showCarPlateDropdown = _m[0], setShowCarPlateDropdown = _m[1];
    var _o = react_2.useState(null), selectedCar = _o[0], setSelectedCar = _o[1];
    var debouncedCarPlateSearch = use_debounce_1.useDebounce(carPlateSearch, 300);
    // Car plate search effect
    react_2.useEffect(function () {
        if (debouncedCarPlateSearch.length < 2) {
            setCarPlateResults([]);
            return;
        }
        setIsCarPlateSearching(true);
        axios_1["default"]
            .get("/api/cars/search?plate=" + debouncedCarPlateSearch)
            .then(function (response) {
            setCarPlateResults(response.data);
            setShowCarPlateDropdown(true);
        })["finally"](function () { return setIsCarPlateSearching(false); });
    }, [debouncedCarPlateSearch]);
    var handleCarPlateChange = function (value) {
        var upperValue = value.toUpperCase();
        setCarPlateSearch(upperValue);
        setData("plate_number", upperValue);
        setData("car_id", "");
        setSelectedCar(null);
        setShowCarPlateDropdown(false);
    };
    var handleCarPlateSelect = function (result) {
        setShowCarPlateDropdown(false);
        setCarPlateSearch(result.car.plate_number);
        setSelectedCar(result);
        setData(__assign(__assign({}, data), { car_id: result.car.id, plate_number: result.car.plate_number }));
    };
    function checkValidity() {
        if (data.serial_number.length == 0) {
            errors.serial_number = "Nomor seri harus diisi.";
        }
        if (data.plate_number.length == 0) {
            errors.plate_number = "Nomor polisi harus diisi.";
        }
        setIsSearching(true);
        setSearchError(null);
        setFoundVoucher(null);
        axios_1["default"]
            .get("/api/vouchers/check-validity?serial_number=" + data.serial_number + "&plate_number=" + data.plate_number)
            .then(function (response) {
            var _a, _b, _c;
            var voucherData = response.data.foundVoucher;
            setFoundVoucher(voucherData);
            setData(__assign(__assign({}, data), { voucher_id: voucherData.id, customer_id: (_a = voucherData.purchased_packet) === null || _a === void 0 ? void 0 : _a.customer.id, car_id: (_b = voucherData.purchased_packet) === null || _b === void 0 ? void 0 : _b.car.id, purchased_packet_id: (_c = voucherData.purchased_packet) === null || _c === void 0 ? void 0 : _c.id }));
        })["catch"](function (error) {
            var _a, _b;
            setSearchError(((_b = (_a = error.response) === null || _a === void 0 ? void 0 : _a.data) === null || _b === void 0 ? void 0 : _b.message) || "Terjadi kesalahan.");
        })["finally"](function () {
            setIsSearching(false);
        });
    }
    var handleSubmit = function (footerData) {
        var _a, _b, _c;
        // Validation: car_id or plate_number must not be null/empty
        if (!data.car_id && !data.plate_number) {
            setLocalErrors({
                plate_number: "Nomor polisi harus diisi atau pilih mobil terdaftar."
            });
            return;
        }
        setLocalErrors({});
        var finalData = __assign(__assign({}, data), { voucher_id: data.voucher_id || (foundVoucher === null || foundVoucher === void 0 ? void 0 : foundVoucher.id) || "", customer_id: data.customer_id || ((_b = (_a = foundVoucher === null || foundVoucher === void 0 ? void 0 : foundVoucher.purchased_packet) === null || _a === void 0 ? void 0 : _a.customer) === null || _b === void 0 ? void 0 : _b.id) ||
                "", purchased_packet_id: data.purchased_packet_id || ((_c = foundVoucher === null || foundVoucher === void 0 ? void 0 : foundVoucher.purchased_packet) === null || _c === void 0 ? void 0 : _c.id) ||
                "", product_id: footerData.product_id, stall_id: footerData.stall_id });
        react_1.router.post(route("car-washes.voucher"), finalData, {
            onSuccess: function (page) { return handleSuccess(page, receipt_formatter_1.printTransactionReceipt); },
            onError: handleError
        });
    };
    react_2.useImperativeHandle(ref, function () { return ({
        submit: handleSubmit,
        canSubmit: function () {
            return !!foundVoucher &&
                (foundVoucher.status === "Active" ||
                    foundVoucher.status === "Sold");
        }
    }); });
    return (React.createElement("div", { className: "px-4" },
        React.createElement("form", { onSubmit: function (e) { return e.preventDefault(); } },
            React.createElement("div", { className: "w-full" },
                React.createElement("div", { className: "flex flex-col sm:flex-row w-full items-end gap-2 mb-2" },
                    React.createElement("div", { className: "w-full sm:w-2/5" },
                        React.createElement(label_1.Label, { htmlFor: "serial_number" }, "Nomor Seri"),
                        React.createElement(input_1.Input, { id: "serial_number", type: "text", value: data.serial_number, onChange: function (e) {
                                return setData("serial_number", e.target.value);
                            }, placeholder: "Nomor Seri..." }),
                        errors.serial_number && (React.createElement("p", { className: "text-sm text-red-600" }, errors.serial_number))),
                    React.createElement("div", { className: "w-full sm:w-2/5 relative" },
                        React.createElement(label_1.Label, { htmlFor: "plate_number", required: true }, "Nomor Polisi"),
                        React.createElement(input_1.Input, { id: "plate_number", type: "text", value: carPlateSearch, onChange: function (e) {
                                return handleCarPlateChange(e.target.value);
                            }, placeholder: "Cari plat nomor...", autoComplete: "off" }),
                        (errors.plate_number ||
                            localErrors.plate_number) && (React.createElement("p", { className: "text-sm text-red-600" }, errors.plate_number ||
                            localErrors.plate_number)),
                        showCarPlateDropdown &&
                            (isCarPlateSearching ||
                                carPlateResults.length > 0) && (React.createElement("div", { className: "absolute z-10 mt-1 w-full rounded-md border bg-popover p-1 text-popover-foreground shadow-md" },
                            isCarPlateSearching && (React.createElement("div", { className: "flex items-center gap-2 p-2 text-sm text-muted-foreground" },
                                React.createElement(lucide_react_1.LoaderCircle, { className: "animate-spin w-4 h-4" }),
                                "Mencari...")),
                            carPlateResults.map(function (result) { return (React.createElement("div", { key: result.car.id, className: "cursor-pointer rounded-sm p-2 text-sm hover:bg-accent", onClick: function () {
                                    return handleCarPlateSelect(result);
                                } },
                                result.car.plate_number,
                                " -",
                                " ",
                                result.car.model,
                                " (",
                                result.customer.name,
                                ")")); })))),
                    React.createElement(button_1.Button, { disabled: isSearching || processing, className: "w-full lg:w-1/5", onClick: checkValidity }, isSearching ? (React.createElement(lucide_react_1.LoaderCircle, { className: "h-4 w-4 animate-spin" })) : ("Check"))))),
        selectedCar && (React.createElement("div", { className: "mb-4" },
            React.createElement(heading_1["default"], { title: "Informasi Mobil", className: "mt-4" }),
            React.createElement(car_information_card_1["default"], { car: selectedCar.car, customer: selectedCar.customer }))),
        React.createElement("div", null,
            React.createElement(heading_1["default"], { title: "Informasi Voucher", className: "mt-4" }),
            foundVoucher ? (React.createElement("div", { className: " rounded-lg shadow p-4 mt-2 border space-y-4" },
                React.createElement("div", { className: "flex items-center justify-between mb-2" },
                    React.createElement("span", { className: "text-muted-foreground font-medium" }, "Status:"),
                    React.createElement("span", { className: "text-2xl font-bold " + (foundVoucher.status === "Active" ||
                            foundVoucher.status === "Sold"
                            ? "text-primary"
                            : "text-muted-foreground") }, foundVoucher.status)),
                React.createElement("div", { className: "grid grid-cols-2 gap-2" },
                    React.createElement("div", null,
                        React.createElement("span", { className: "text-muted-foreground" }, "Nomor Seri:"),
                        React.createElement("div", { className: "font-medium" }, foundVoucher.serial_number)),
                    React.createElement("div", null,
                        React.createElement("span", { className: "text-muted-foreground" }, "Tipe:"),
                        React.createElement("div", { className: "font-medium" }, foundVoucher.voucher_type.name)),
                    foundVoucher.purchased_packet && (React.createElement(React.Fragment, null,
                        React.createElement("div", null,
                            React.createElement("span", { className: "text-muted-foreground" }, "Nama Paket:"),
                            React.createElement("div", { className: "font-medium" }, foundVoucher.purchased_packet.name)),
                        React.createElement("div", null,
                            React.createElement("span", { className: "text-muted-foreground" }, "Tanggal Pembelian:"),
                            React.createElement("div", { className: "font-medium" }, foundVoucher.purchased_packet
                                .purchased_at)),
                        React.createElement("div", null,
                            React.createElement("span", { className: "text-muted-foreground" }, "Tanggal Expired:"),
                            React.createElement("div", { className: "font-medium" }, foundVoucher.purchased_packet
                                .expired_at)),
                        React.createElement("div", null,
                            React.createElement("span", { className: "text-muted-foreground" }, "Nama Customer:"),
                            React.createElement("div", { className: "font-medium" }, foundVoucher.purchased_packet
                                .customer.name)),
                        React.createElement("div", null,
                            React.createElement("span", { className: "text-muted-foreground" }, "Nomor Polisi:"),
                            React.createElement("div", { className: "font-medium" }, ((_b = foundVoucher.purchased_packet.car) === null || _b === void 0 ? void 0 : _b.plate_number) || "-"))))),
                !(foundVoucher.status === "Active" ||
                    foundVoucher.status === "Sold") && (React.createElement("div", { className: "mt-2 text-sm text-red-600 font-semibold" }, "Voucher tidak dapat digunakan. Status harus \"Active\" atau \"Sold\".")))) : (React.createElement("p", { className: "text-sm text-muted-foreground" },
                "Masukkan nomor seri dan klik \"Check\" untuk melihat detail.",
                searchError && (React.createElement("p", { className: "text-sm text-red-500" }, searchError)))))));
});
exports["default"] = CreateVoucherPurchase;
