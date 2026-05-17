"use strict";
exports.__esModule = true;
var button_1 = require("@/components/ui/button");
var input_1 = require("@/components/ui/input");
var label_1 = require("@/components/ui/label");
var select_1 = require("@/components/ui/select");
var react_1 = require("@inertiajs/react");
var lucide_react_1 = require("lucide-react");
var sonner_1 = require("sonner");
function UserForm(_a) {
    var _b, _c;
    var user = _a.user, roles = _a.roles, onSuccess = _a.onSuccess, onCancel = _a.onCancel;
    var isEditMode = !!user;
    var _d = react_1.useForm({
        name: (user === null || user === void 0 ? void 0 : user.name) || "",
        email: (user === null || user === void 0 ? void 0 : user.email) || "",
        password: "",
        password_confirmation: "",
        role_id: ((_c = (_b = user === null || user === void 0 ? void 0 : user.roles) === null || _b === void 0 ? void 0 : _b[0]) === null || _c === void 0 ? void 0 : _c.id.toString()) || ""
    }), data = _d.data, setData = _d.setData, post = _d.post, patch = _d.patch, processing = _d.processing, errors = _d.errors, reset = _d.reset;
    function handleSubmit(e) {
        e.preventDefault();
        var handleSuccess = function () {
            reset();
            sonner_1.toast.success("User telah berhasil " + (isEditMode ? "diedit" : "ditambahkan") + ".");
            onSuccess();
        };
        if (isEditMode) {
            patch(route("users.update", user.id), {
                onSuccess: handleSuccess
            });
        }
        else {
            post(route("users.store"), {
                onSuccess: handleSuccess
            });
        }
    }
    return (React.createElement("form", { onSubmit: handleSubmit, className: "space-y-4" },
        React.createElement("div", null,
            React.createElement(label_1.Label, { htmlFor: "name" }, "Nama"),
            React.createElement(input_1.Input, { id: "name", value: data.name, onChange: function (e) { return setData("name", e.target.value); } }),
            errors.name && (React.createElement("p", { className: "text-sm text-red-600 mt-1" }, errors.name))),
        React.createElement("div", null,
            React.createElement(label_1.Label, { htmlFor: "email" }, "Email"),
            React.createElement(input_1.Input, { id: "email", type: "email", value: data.email, onChange: function (e) { return setData("email", e.target.value); } }),
            errors.email && (React.createElement("p", { className: "text-sm text-red-600 mt-1" }, errors.email))),
        React.createElement("div", null,
            React.createElement(label_1.Label, { htmlFor: "role_id" }, "Role (Opsional)"),
            React.createElement(select_1.Select, { value: data.role_id, onValueChange: function (value) {
                    setData("role_id", value === "none" ? "" : value);
                } },
                React.createElement(select_1.SelectTrigger, null,
                    React.createElement(select_1.SelectValue, { placeholder: "Pilih role..." })),
                React.createElement(select_1.SelectContent, null,
                    React.createElement(select_1.SelectItem, { value: "none" }, "Tidak ada role"),
                    roles.map(function (role) { return (React.createElement(select_1.SelectItem, { key: role.id, value: String(role.id) }, role.name)); }))),
            errors.role_id && (React.createElement("p", { className: "text-sm text-red-600 mt-1" }, errors.role_id))),
        React.createElement("div", { className: "grid grid-cols-1 gap-4 sm:grid-cols-2" },
            React.createElement("div", null,
                React.createElement(label_1.Label, { htmlFor: "password" }, "Password"),
                React.createElement(input_1.Input, { id: "password", type: "password", value: data.password, onChange: function (e) { return setData("password", e.target.value); } }),
                errors.password && (React.createElement("p", { className: "text-sm text-red-600 mt-1" }, errors.password))),
            React.createElement("div", null,
                React.createElement(label_1.Label, { htmlFor: "password_confirmation" }, "Konfirmasi Password"),
                React.createElement(input_1.Input, { id: "password_confirmation", type: "password", value: data.password_confirmation, onChange: function (e) {
                        return setData("password_confirmation", e.target.value);
                    } }))),
        isEditMode && (React.createElement("p", { className: "text-xs text-muted-foreground" }, "Kosongkan password jika tidak ingin mengubahnya.")),
        React.createElement("div", { className: "mt-6 flex justify-end gap-2" },
            React.createElement(button_1.Button, { type: "button", variant: "ghost", onClick: onCancel }, "Kembali"),
            React.createElement(button_1.Button, { type: "submit", disabled: processing },
                processing && (React.createElement(lucide_react_1.LoaderCircle, { className: "mr-2 h-4 w-4 animate-spin" })),
                isEditMode ? "Simpan Perubahan" : "Tambahkan User"))));
}
exports["default"] = UserForm;
