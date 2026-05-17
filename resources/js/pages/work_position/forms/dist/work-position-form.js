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
function WorkPositionForm(_a) {
    var workPosition = _a.workPosition, onSuccess = _a.onSuccess, onCancel = _a.onCancel;
    var isEditMode = !!workPosition;
    var _b = react_1.useForm({
        name: (workPosition === null || workPosition === void 0 ? void 0 : workPosition.name) || "",
        description: (workPosition === null || workPosition === void 0 ? void 0 : workPosition.description) || ""
    }), data = _b.data, setData = _b.setData, post = _b.post, patch = _b.patch, processing = _b.processing, errors = _b.errors, reset = _b.reset;
    function handleSubmit(e) {
        e.preventDefault();
        var handleSuccess = function () {
            reset();
            sonner_1.toast.success("Posisi kerja telah berhasil " + (isEditMode ? "diperbarui" : "ditambahkan") + ".");
            onSuccess();
        };
        if (isEditMode) {
            patch(route("work-positions.update", workPosition.id), {
                onSuccess: handleSuccess,
                onError: function () { }
            });
        }
        else {
            post(route("work-positions.store"), {
                onSuccess: handleSuccess,
                onError: function () { }
            });
        }
    }
    return (react_2["default"].createElement(react_2["default"].Fragment, null,
        react_2["default"].createElement("form", { onSubmit: handleSubmit },
            react_2["default"].createElement("div", null,
                react_2["default"].createElement(label_1.Label, { htmlFor: "name", className: "mb-1 block" }, "Nama"),
                react_2["default"].createElement(input_1.Input, { id: "name", type: "text", value: data.name, onChange: function (e) { return setData("name", e.target.value); }, className: "mb-4 block", required: true }),
                errors.name && (react_2["default"].createElement("p", { className: "-mt-3 mb-3 text-sm text-red-600" }, errors.name))),
            react_2["default"].createElement("div", null,
                react_2["default"].createElement(label_1.Label, { htmlFor: "description", className: "mb-1 block" }, "Deskripsi"),
                react_2["default"].createElement(textarea_1.Textarea, { id: "description", value: data.description, onChange: function (e) { return setData("description", e.target.value); }, className: "mb-4 block" }),
                errors.description && (react_2["default"].createElement("p", { className: "-mt-3 mb-3 text-sm text-red-600" }, errors.description))),
            react_2["default"].createElement("div", { className: "mt-4 flex justify-end gap-2" },
                react_2["default"].createElement(button_1.Button, { type: "button", variant: "ghost", size: "lg", onClick: onCancel, disabled: processing }, "Kembali"),
                react_2["default"].createElement(button_1.Button, { type: "submit", variant: "default", size: "lg", disabled: processing },
                    processing && (react_2["default"].createElement(lucide_react_1.LoaderCircle, { className: "mr-2 h-4 w-4 animate-spin" })),
                    isEditMode ? "Update" : "Tambahkan"))),
        errors &&
            Object.keys(errors).length > 0 &&
            !errors.name &&
            !errors.description && (react_2["default"].createElement("div", { className: "mt-4 flex justify-end" },
            react_2["default"].createElement("p", { className: "mb-4 text-sm text-red-600" }, "Terjadi kesalahan tidak terduga. Silakan coba lagi.")))));
}
exports["default"] = WorkPositionForm;
