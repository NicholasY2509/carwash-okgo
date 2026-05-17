"use strict";
exports.__esModule = true;
var button_1 = require("@/components/ui/button");
var input_1 = require("@/components/ui/input");
var label_1 = require("@/components/ui/label");
var textarea_1 = require("@/components/ui/textarea");
var react_1 = require("@inertiajs/react");
var lucide_react_1 = require("lucide-react");
var react_number_format_1 = require("react-number-format");
var sonner_1 = require("sonner");
function ProductForm(_a) {
    var _b;
    var product = _a.product, onSuccess = _a.onSuccess, onCancel = _a.onCancel;
    var isEditMode = !!product;
    var _c = react_1.useForm({
        name: (product === null || product === void 0 ? void 0 : product.name) || "",
        description: (product === null || product === void 0 ? void 0 : product.description) || "",
        price: ((_b = product === null || product === void 0 ? void 0 : product.price) === null || _b === void 0 ? void 0 : _b.toString()) || ""
    }), data = _c.data, setData = _c.setData, post = _c.post, patch = _c.patch, processing = _c.processing, errors = _c.errors, reset = _c.reset;
    function handleSubmit(e) {
        e.preventDefault();
        if (isEditMode) {
            patch(route("products.update", product.id), {
                onSuccess: function () {
                    sonner_1.toast.success("Perubahan pada produk telah berhasil disimpan.");
                    onSuccess();
                },
                onError: function (errors) {
                    console.error("Update failed:", errors);
                }
            });
        }
        else {
            post(route("products.store"), {
                onSuccess: function () {
                    reset();
                    sonner_1.toast.success("Produk baru telah berhasil ditambahkan.");
                    onSuccess();
                },
                onError: function (errors) {
                    console.error("Creation failed:", errors);
                }
            });
        }
    }
    return (React.createElement("form", { onSubmit: handleSubmit },
        React.createElement("fieldset", { disabled: processing, className: "space-y-4" },
            React.createElement("div", null,
                React.createElement(label_1.Label, { htmlFor: "name", required: true }, "Nama Produk"),
                React.createElement(input_1.Input, { id: "name", type: "text", value: data.name, onChange: function (e) { return setData("name", e.target.value); } }),
                errors.name && (React.createElement("p", { className: "text-sm text-red-600" }, errors.name))),
            React.createElement("div", null,
                React.createElement(label_1.Label, { htmlFor: "price", required: true }, "Harga Produk"),
                React.createElement(react_number_format_1.NumericFormat, { id: "price", customInput: input_1.Input, prefix: "Rp ", thousandSeparator: ".", decimalSeparator: ",", value: data.price, onValueChange: function (values) {
                        var _a;
                        setData("price", ((_a = values.floatValue) === null || _a === void 0 ? void 0 : _a.toString()) || "");
                    } }),
                errors.price && (React.createElement("p", { className: "text-sm text-red-600" }, errors.price))),
            React.createElement("div", null,
                React.createElement(label_1.Label, { htmlFor: "description" }, "Deskripsi Produk"),
                React.createElement(textarea_1.Textarea, { id: "description", value: data.description, onChange: function (e) { return setData("description", e.target.value); } }),
                errors.description && (React.createElement("p", { className: "text-sm text-red-600" }, errors.description)))),
        React.createElement("div", { className: "flex justify-end gap-2 mt-6" },
            React.createElement(button_1.Button, { type: "button", variant: "secondary", size: "lg", onClick: onCancel }, "Batal"),
            React.createElement(button_1.Button, { type: "submit", variant: "default", size: "lg", disabled: processing },
                processing && (React.createElement(lucide_react_1.LoaderCircle, { className: "mr-2 h-4 w-4 animate-spin" })),
                isEditMode ? "Simpan Perubahan" : "Tambahkan Produk"))));
}
exports["default"] = ProductForm;
