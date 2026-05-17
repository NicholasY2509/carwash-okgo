"use strict";
exports.__esModule = true;
var button_1 = require("@/components/ui/button");
var input_1 = require("@/components/ui/input");
var label_1 = require("@/components/ui/label");
var textarea_1 = require("@/components/ui/textarea");
var react_1 = require("@inertiajs/react");
var lucide_react_1 = require("lucide-react");
var react_2 = require("react");
var sonner_1 = require("sonner");
function StallForm(_a) {
    var stall = _a.stall, onSuccess = _a.onSuccess, onCancel = _a.onCancel;
    var isEditMode = !!stall;
    var _b = react_1.useForm({
        name: (stall === null || stall === void 0 ? void 0 : stall.name) || "",
        description: (stall === null || stall === void 0 ? void 0 : stall.description) || ""
    }), data = _b.data, setData = _b.setData, post = _b.post, patch = _b.patch, processing = _b.processing, errors = _b.errors, reset = _b.reset;
    function handleSubmit(e) {
        e.preventDefault();
        if (isEditMode) {
            patch(route("stalls.update", stall.id), {
                onSuccess: function () {
                    sonner_1.toast.success("Stall telah berhasil diperbarui.");
                    onSuccess();
                },
                onError: function (errors) {
                    console.error("Update failed:", errors);
                }
            });
        }
        else {
            post(route("stalls.store"), {
                onSuccess: function () {
                    reset();
                    sonner_1.toast.success("Stall telah berhasil ditambahkan.");
                    onSuccess();
                },
                onError: function () { }
            });
        }
    }
    return (react_2["default"].createElement(react_2["default"].Fragment, null,
        " ",
        react_2["default"].createElement("form", { onSubmit: handleSubmit },
            react_2["default"].createElement("div", null,
                react_2["default"].createElement(label_1.Label, { htmlFor: "name", className: "mb-1 block" }, "Nama"),
                react_2["default"].createElement(input_1.Input, { id: "name", type: "text", value: data.name, onChange: function (e) { return setData("name", e.target.value); }, className: "mb-4 block", required: true }),
                errors.name && (react_2["default"].createElement("p", { className: "text-sm text-red-600" }, errors.name))),
            react_2["default"].createElement("div", null,
                react_2["default"].createElement(label_1.Label, { htmlFor: "description", className: "mb-1 block" }, "Deskripsi"),
                react_2["default"].createElement(textarea_1.Textarea, { id: "description", value: data.description, onChange: function (e) { return setData("description", e.target.value); }, className: "mb-4 block", required: true }),
                errors.description && (react_2["default"].createElement("p", { className: "text-sm text-red-600" }, errors.description))),
            react_2["default"].createElement("div", { className: "flex justify-end gap-2" },
                react_2["default"].createElement(button_1.Button, { type: "button", variant: "secondary", size: "lg", onClick: onCancel }, "Kembali"),
                react_2["default"].createElement(button_1.Button, { type: "submit", variant: "default", size: "lg", disabled: processing },
                    processing && (react_2["default"].createElement(lucide_react_1.LoaderCircle, { className: "h-4 w-4 animate-spin" })),
                    isEditMode ? "Simpan Perubahan" : "Tambahkan Stall")))));
}
exports["default"] = StallForm;
