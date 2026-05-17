"use strict";
exports.__esModule = true;
var button_1 = require("@/components/ui/button");
var input_1 = require("@/components/ui/input");
var label_1 = require("@/components/ui/label");
var react_1 = require("@inertiajs/react");
var react_number_format_1 = require("react-number-format");
var sonner_1 = require("sonner");
function KasForm(_a) {
    var onCancel = _a.onCancel, onSubmit = _a.onSubmit;
    var _b = react_1.useForm({
        nominal: ""
    }), data = _b.data, setData = _b.setData, post = _b.post, patch = _b.patch, processing = _b.processing, errors = _b.errors, reset = _b.reset;
    function handleSubmit() {
        react_1.router.post(route("daily-cash-logs.store"), data, {
            onSuccess: function () {
                sonner_1.toast.success("Silahkan tunggu approval dari admin untuk melanjutkan.");
                reset();
            }
        });
    }
    return (React.createElement("form", { onSubmit: handleSubmit },
        React.createElement(label_1.Label, { htmlFor: "nominal" }, "Nominal"),
        React.createElement(react_number_format_1.NumericFormat, { id: "price", customInput: input_1.Input, prefix: "Rp ", thousandSeparator: ".", decimalSeparator: ",", value: data.nominal, onValueChange: function (values) {
                var _a;
                setData("nominal", ((_a = values.floatValue) === null || _a === void 0 ? void 0 : _a.toString()) || "");
            }, className: "mt-1" }),
        errors.nominal && (React.createElement("p", { className: "mt-1 text-sm text-red-600" }, errors.nominal)),
        React.createElement("div", { className: "mt-6 flex flex-row justify-end gap-2" },
            React.createElement(button_1.Button, { type: "button", variant: "secondary", onClick: function () { return onCancel(); } }, "Batal"),
            React.createElement(button_1.Button, { type: "submit", disabled: processing }, "Simpan"))));
}
exports["default"] = KasForm;
