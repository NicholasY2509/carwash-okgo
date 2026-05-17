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
var sonner_1 = require("sonner");
var ReturnForm = react_2.forwardRef(function (_a, ref) {
    var onSuccess = _a.onSuccess, onCancel = _a.onCancel;
    var _b = react_1.useForm({
        plate_number: "",
        service_record_id: ""
    }), data = _b.data, setData = _b.setData, processing = _b.processing, reset = _b.reset, errors = _b.errors;
    // --- STATE DIPERBARUI UNTUK MENYIMPAN STRUKTUR BARU ---
    var _c = react_2.useState(null), foundData = _c[0], setFoundData = _c[1];
    var _d = react_2.useState(null), searchError = _d[0], setSearchError = _d[1];
    var _e = react_2.useState(false), isSearching = _e[0], setIsSearching = _e[1];
    var _f = react_2.useState({}), localErrors = _f[0], setLocalErrors = _f[1];
    var _g = use_transaction_handler_1.useTransactionHandler({
        onSuccess: onSuccess,
        reset: reset
    }), handleSuccess = _g.handleSuccess, handleError = _g.handleError;
    function checkServiceRecord() {
        if (data.plate_number.length == 0) {
            errors.plate_number = "Nomor polisi harus diisi.";
        }
        setIsSearching(true);
        setSearchError(null);
        setFoundData(null);
        axios_1["default"]
            .get("/api/service-records/search?plate_number=" + data.plate_number)
            .then(function (response) {
            setFoundData(response.data);
            setData(__assign(__assign({}, data), { service_record_id: response.data.service_record.id.toString() }));
        })["catch"](function (error) {
            var _a, _b;
            setSearchError(((_b = (_a = error.response) === null || _a === void 0 ? void 0 : _a.data) === null || _b === void 0 ? void 0 : _b.message) || "Terjadi kesalahan.");
        })["finally"](function () {
            setIsSearching(false);
        });
    }
    var handleSubmit = function (footerData) {
        if (!data.plate_number) {
            setLocalErrors({ plate_number: "Nomor polisi harus diisi." });
            return;
        }
        setLocalErrors({});
        if (!foundData || !foundData.return_info.is_eligible) {
            onCancel();
            sonner_1.toast.error("Garansi tidak valid atau sudah diklaim.");
            return;
        }
        var finalData = {
            service_record_id: data.service_record_id,
            stall_id: footerData.stall_id
        };
        react_1.router.post(route("car-washes.return"), finalData, {
            onSuccess: function (page) {
                return handleSuccess(page, receipt_formatter_1.printTransactionReceipt);
            },
            onError: handleError
        });
    };
    react_2.useImperativeHandle(ref, function () { return ({
        submit: handleSubmit,
        canSubmit: function () {
            return !!foundData &&
                !!foundData.return_info &&
                foundData.return_info.is_eligible;
        }
    }); });
    var serviceRecord = foundData === null || foundData === void 0 ? void 0 : foundData.service_record;
    var returnInfo = foundData === null || foundData === void 0 ? void 0 : foundData.return_info;
    return (React.createElement("div", { className: "px-4" },
        React.createElement("form", { className: "flex flex-col", onSubmit: function (e) { return e.preventDefault(); } },
            React.createElement("div", { className: "flex flex-col sm:flex-row w-full max-w-sm items-end gap-2" },
                React.createElement("div", { className: "w-full sm:w-4/5" },
                    React.createElement(label_1.Label, { htmlFor: "plate_number", required: true }, "Nomor Polisi"),
                    React.createElement(input_1.Input, { id: "plate_number", type: "text", value: data.plate_number, onChange: function (e) {
                            setData("plate_number", e.target.value.toUpperCase());
                            setLocalErrors(__assign(__assign({}, localErrors), { plate_number: undefined }));
                        }, placeholder: "Nomor Polisi..." })),
                React.createElement(button_1.Button, { disabled: isSearching || processing, className: "w-full sm:w-1/5", onClick: checkServiceRecord }, isSearching ? (React.createElement(lucide_react_1.LoaderCircle, { className: "h-4 w-4 animate-spin" })) : ("Check"))),
            (errors.plate_number || localErrors.plate_number) && (React.createElement("p", { className: "text-sm text-red-600" }, errors.plate_number || localErrors.plate_number))),
        React.createElement(heading_1["default"], { title: "Pencucian Terakhir", className: "mt-4" }),
        React.createElement("div", { className: "space-y-2 text-sm" }, serviceRecord ? (React.createElement("div", { className: "mt-1 space-y-2 rounded-lg border p-4" },
            React.createElement("div", { className: "flex justify-between" },
                React.createElement("span", { className: "text-muted-foreground" }, "Waktu Cuci:"),
                React.createElement("span", { className: "font-medium" }, new Intl.DateTimeFormat("id-ID", {
                    day: "numeric",
                    month: "numeric",
                    year: "numeric",
                    hour: "2-digit",
                    minute: "2-digit",
                    timeZone: "Asia/Jakarta"
                }).format(new Date(serviceRecord.service_date)))),
            React.createElement("div", { className: "flex justify-between" },
                React.createElement("span", { className: "text-muted-foreground" }, "Nomor Polisi:"),
                React.createElement("span", { className: "font-medium" }, serviceRecord.car.plate_number)),
            React.createElement("div", { className: "flex justify-between" },
                React.createElement("span", { className: "text-muted-foreground" }, "Nama Customer:"),
                React.createElement("span", { className: "font-medium" }, serviceRecord.car.customer.name)),
            React.createElement("hr", { className: "my-3" }),
            React.createElement("div", { className: "flex justify-between items-center" },
                React.createElement("span", { className: "text-muted-foreground" }, "Status Garansi:"),
                (returnInfo === null || returnInfo === void 0 ? void 0 : returnInfo.is_eligible) && (React.createElement("span", { className: "font-semibold text-green-600" }, "Bisa Diklaim")),
                (returnInfo === null || returnInfo === void 0 ? void 0 : returnInfo.has_been_claimed) && (React.createElement("span", { className: "font-medium text-red-500" }, "Sudah Diklaim")),
                !(returnInfo === null || returnInfo === void 0 ? void 0 : returnInfo.is_eligible) &&
                    !(returnInfo === null || returnInfo === void 0 ? void 0 : returnInfo.has_been_claimed) && (React.createElement("span", { className: "font-medium text-gray-500" }, "Kadaluwarsa"))))) : (React.createElement("p", { className: "text-sm text-muted-foreground" },
            "Masukkan Nomor Polisi untuk melihat detail.",
            searchError && (React.createElement("p", { className: "text-sm text-red-500 mt-2" }, searchError)))))));
});
exports["default"] = ReturnForm;
