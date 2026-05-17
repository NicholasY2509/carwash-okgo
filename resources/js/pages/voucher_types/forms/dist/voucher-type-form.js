"use strict";
exports.__esModule = true;
var button_1 = require("@/components/ui/button");
var checkbox_1 = require("@/components/ui/checkbox");
var input_1 = require("@/components/ui/input");
var label_1 = require("@/components/ui/label");
var textarea_1 = require("@/components/ui/textarea");
var react_1 = require("@inertiajs/react");
var lucide_react_1 = require("lucide-react");
var sonner_1 = require("sonner");
var react_2 = require("react");
function VoucherTypeForm(_a) {
    var voucherType = _a.voucherType, onSuccess = _a.onSuccess, onCancel = _a.onCancel;
    var isEditMode = !!voucherType;
    var _b = react_1.useForm({
        name: (voucherType === null || voucherType === void 0 ? void 0 : voucherType.name) || "",
        description: (voucherType === null || voucherType === void 0 ? void 0 : voucherType.description) || "",
        is_free: (voucherType === null || voucherType === void 0 ? void 0 : voucherType.is_free) || false,
        only_one_car: (voucherType === null || voucherType === void 0 ? void 0 : voucherType.only_one_car) || false
    }), data = _b.data, setData = _b.setData, post = _b.post, patch = _b.patch, processing = _b.processing, errors = _b.errors, reset = _b.reset;
    function handleSubmit(e) {
        e.preventDefault();
        var handleSuccess = function () {
            reset();
            sonner_1.toast.success("Tipe Voucher telah berhasil " + (isEditMode ? "diperbarui" : "ditambahkan") + ".");
            onSuccess();
        };
        if (isEditMode) {
            patch(route("voucher-types.update", voucherType.id), {
                onSuccess: handleSuccess,
                onError: function () { }
            });
        }
        else {
            post(route("voucher-types.store"), {
                onSuccess: handleSuccess,
                onError: function () { }
            });
        }
    }
    return (react_2["default"].createElement(react_2["default"].Fragment, null,
        react_2["default"].createElement("form", { onSubmit: handleSubmit },
            react_2["default"].createElement(label_1.Label, { htmlFor: "name" }, "Nama Tipe"),
            react_2["default"].createElement(input_1.Input, { id: "name", type: "text", value: data.name, onChange: function (e) { return setData("name", e.target.value); }, className: "mb-2" }),
            errors.name && (react_2["default"].createElement("p", { className: "text-sm text-red-600" }, errors.name)),
            react_2["default"].createElement(label_1.Label, { htmlFor: "description" }, "Deskripsi"),
            react_2["default"].createElement(textarea_1.Textarea, { id: "description", value: data.description, onChange: function (e) { return setData("description", e.target.value); }, className: "mb-2" }),
            errors.description && (react_2["default"].createElement("p", { className: "text-sm text-red-600" }, errors.description)),
            react_2["default"].createElement("div", { className: "flex items-center space-x-4 my-4" },
                react_2["default"].createElement("div", { className: "flex items-center space-x-2" },
                    react_2["default"].createElement(checkbox_1.Checkbox, { id: "is_free", checked: data.is_free, onCheckedChange: function (checked) {
                            setData("is_free", !!checked);
                        } }),
                    react_2["default"].createElement(label_1.Label, { htmlFor: "is_free", className: "text-sm font-medium leading-none peer-disabled:cursor-not-allowed peer-disabled:opacity-70" }, "Gratis")),
                react_2["default"].createElement("div", { className: "flex items-center space-x-2" },
                    react_2["default"].createElement(checkbox_1.Checkbox, { id: "only_one_car", checked: !data.only_one_car, onCheckedChange: function (checked) {
                            setData("only_one_car", !checked);
                        } }),
                    react_2["default"].createElement(label_1.Label, { htmlFor: "only_one_car", className: "text-sm font-medium leading-none peer-disabled:cursor-not-allowed peer-disabled:opacity-70" }, "Bebas Nopol"))),
            errors.is_free && (react_2["default"].createElement("p", { className: "text-sm text-red-600" }, errors.is_free)),
            errors.only_one_car && (react_2["default"].createElement("p", { className: "text-sm text-red-600" }, errors.only_one_car)),
            react_2["default"].createElement("div", { className: "mt-4 flex justify-end gap-2" },
                react_2["default"].createElement(button_1.Button, { type: "button", variant: "ghost", size: "lg", onClick: onCancel }, "Kembali"),
                react_2["default"].createElement(button_1.Button, { type: "submit", variant: "default", size: "lg", disabled: processing },
                    processing && (react_2["default"].createElement(lucide_react_1.LoaderCircle, { className: "h-4 w-4 animate-spin mr-2" })),
                    isEditMode ? "Update" : "Tambahkan")))));
}
exports["default"] = VoucherTypeForm;
