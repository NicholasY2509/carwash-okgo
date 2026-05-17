"use strict";
var __spreadArrays = (this && this.__spreadArrays) || function () {
    for (var s = 0, i = 0, il = arguments.length; i < il; i++) s += arguments[i].length;
    for (var r = Array(s), k = 0, i = 0; i < il; i++)
        for (var a = arguments[i], j = 0, jl = a.length; j < jl; j++, k++)
            r[k] = a[j];
    return r;
};
exports.__esModule = true;
var react_1 = require("react");
var modal_1 = require("@/components/ui/modal");
var button_1 = require("@/components/ui/button");
var input_1 = require("@/components/ui/input");
var label_1 = require("@/components/ui/label");
var select_1 = require("@/components/ui/select");
var react_2 = require("@inertiajs/react");
var sonner_1 = require("sonner");
var lucide_react_1 = require("lucide-react");
var statusOptions = [
    { value: "Active", label: "Active" },
    { value: "Sold", label: "Sold" },
    { value: "Redeemed", label: "Redeemed" },
    { value: "Expired", label: "Expired" },
];
function EditVoucherModal(_a) {
    var open = _a.open, onClose = _a.onClose, voucherTypes = _a.voucherTypes, onSuccess = _a.onSuccess;
    var _b = react_1.useState(""), currentSerial = _b[0], setCurrentSerial = _b[1];
    var _c = react_1.useState([]), serials = _c[0], setSerials = _c[1];
    var _d = react_1.useState([]), allSerials = _d[0], setAllSerials = _d[1];
    var _e = react_1.useState(undefined), voucherTypeId = _e[0], setVoucherTypeId = _e[1];
    var _f = react_1.useState(undefined), status = _f[0], setStatus = _f[1];
    var _g = react_1.useState(false), processing = _g[0], setProcessing = _g[1];
    var _h = react_1.useState(null), error = _h[0], setError = _h[1];
    react_1.useEffect(function () {
        fetch("/vouchers/serials")
            .then(function (res) { return res.json(); })
            .then(function (data) { return setAllSerials(data); });
    }, []);
    var handleAddSerial = function () {
        var code = currentSerial.trim();
        if (!code)
            return;
        if (serials.includes(code)) {
            setError("Nomor seri \"" + code + "\" sudah ada.");
            return;
        }
        if (!allSerials.includes(code)) {
            setError("Nomor seri \"" + code + "\" tidak ditemukan di database.");
            return;
        }
        setError(null);
        setSerials(__spreadArrays(serials, [code]));
        setCurrentSerial("");
    };
    var handleRemoveSerial = function (codeToRemove) {
        setSerials(serials.filter(function (code) { return code !== codeToRemove; }));
    };
    var handleInputKeyDown = function (e) {
        if (e.key === "Enter") {
            e.preventDefault();
            handleAddSerial();
        }
    };
    var handleSubmit = function (e) {
        e.preventDefault();
        if (serials.length === 0) {
            setError("Masukkan minimal satu nomor seri voucher.");
            return;
        }
        if (!voucherTypeId && !status) {
            setError("Pilih tipe voucher atau status untuk diubah.");
            return;
        }
        setError(null);
        setProcessing(true);
        react_2.router.post(route("vouchers.batch_update"), {
            serial_numbers: serials,
            voucher_type_id: voucherTypeId,
            status: status
        }, {
            onSuccess: function () {
                sonner_1.toast.success("Voucher berhasil diperbarui.");
                setSerials([]);
                setCurrentSerial("");
                setVoucherTypeId(undefined);
                setStatus(undefined);
                onSuccess();
            },
            onError: function (errors) {
                setError(errors.status ||
                    errors.serial_numbers ||
                    errors.message ||
                    Object.values(errors)[0]);
            },
            onFinish: function () { return setProcessing(false); }
        });
    };
    return (React.createElement(modal_1.Modal, { open: open, onClose: onClose },
        React.createElement(modal_1.ModalHeader, { title: "Edit Voucher (Batch)" }),
        React.createElement("form", { onSubmit: handleSubmit, className: "space-y-6 p-4" },
            React.createElement("div", null,
                React.createElement(label_1.Label, { required: true }, "Nomor Seri Voucher"),
                React.createElement("div", { className: "flex items-center gap-2" },
                    React.createElement(input_1.Input, { placeholder: "e.g., 2015", value: currentSerial, onChange: function (e) { return setCurrentSerial(e.target.value); }, onKeyDown: handleInputKeyDown }),
                    React.createElement(button_1.Button, { type: "button", onClick: handleAddSerial }, "Tambah")),
                React.createElement("div", { className: "flex min-h-[60px] flex-wrap gap-2 rounded-md border p-2 mt-2" }, serials.length === 0 ? (React.createElement("span", { className: "p-2 text-sm text-muted-foreground" }, "Nomor seri yang dipilih akan muncul di sini...")) : (serials.map(function (code) { return (React.createElement("span", { key: code, className: "inline-flex items-center bg-muted px-3 py-1 rounded-md text-sm" },
                    code,
                    React.createElement("button", { type: "button", className: "ml-2 rounded-full p-0.5 hover:bg-destructive/80", onClick: function () { return handleRemoveSerial(code); } },
                        React.createElement(lucide_react_1.X, { size: 12 })))); })))),
            React.createElement("div", null,
                React.createElement(label_1.Label, null, "Tipe Voucher"),
                React.createElement(select_1.Select, { value: voucherTypeId, onValueChange: function (v) { return setVoucherTypeId(v === undefined ? undefined : v); } },
                    React.createElement(select_1.SelectTrigger, { className: "w-full" },
                        React.createElement(select_1.SelectValue, { placeholder: "Pilih tipe voucher" })),
                    React.createElement(select_1.SelectContent, null, voucherTypes.map(function (type) { return (React.createElement(select_1.SelectItem, { key: type.id, value: type.id }, type.name)); })))),
            React.createElement("div", null,
                React.createElement(label_1.Label, null, "Status"),
                React.createElement(select_1.Select, { value: status, onValueChange: function (v) { return setStatus(v === undefined ? undefined : v); } },
                    React.createElement(select_1.SelectTrigger, { className: "w-full" },
                        React.createElement(select_1.SelectValue, { placeholder: "Pilih status" })),
                    React.createElement(select_1.SelectContent, null, statusOptions.map(function (opt) { return (React.createElement(select_1.SelectItem, { key: opt.value, value: opt.value }, opt.label)); })))),
            React.createElement("div", { className: "text-xs text-muted-foreground" },
                "Catatan: Status voucher hanya bisa diubah menjadi ",
                React.createElement("b", null, "Redeemed"),
                " jika status saat ini bukan Redeemed. Voucher yang sudah Redeemed tidak bisa diubah ke status lain."),
            error && React.createElement("div", { className: "text-red-500 text-sm" }, error),
            React.createElement("div", { className: "flex justify-end gap-2" },
                React.createElement(button_1.Button, { type: "button", variant: "ghost", onClick: onClose, disabled: processing }, "Batal"),
                React.createElement(button_1.Button, { type: "submit", disabled: processing }, "Simpan Perubahan")))));
}
exports["default"] = EditVoucherModal;
