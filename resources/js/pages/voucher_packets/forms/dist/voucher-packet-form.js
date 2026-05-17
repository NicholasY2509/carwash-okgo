"use strict";
exports.__esModule = true;
var input_1 = require("@/components/ui/input");
var label_1 = require("@/components/ui/label");
var select_1 = require("@/components/ui/select");
var checkbox_1 = require("@/components/ui/checkbox");
var react_1 = require("@inertiajs/react");
var react_2 = require("react");
var react_number_format_1 = require("react-number-format");
var textarea_1 = require("@/components/ui/textarea");
var sonner_1 = require("sonner");
var VoucherPacketForm = react_2.forwardRef(function (_a, ref) {
    var _b, _c, _d, _e, _f, _g, _h, _j, _k, _l, _m, _o;
    var voucherTypes = _a.voucherTypes, onSuccess = _a.onSuccess, voucherPacket = _a.voucherPacket;
    var formRef = react_2.useRef(null);
    var isEditMode = !!voucherPacket;
    var _p = react_1.useForm({
        name: (_b = voucherPacket === null || voucherPacket === void 0 ? void 0 : voucherPacket.name) !== null && _b !== void 0 ? _b : "",
        price: (_d = (_c = voucherPacket === null || voucherPacket === void 0 ? void 0 : voucherPacket.price) === null || _c === void 0 ? void 0 : _c.toString()) !== null && _d !== void 0 ? _d : "",
        quantity: (_f = (_e = voucherPacket === null || voucherPacket === void 0 ? void 0 : voucherPacket.quantity) === null || _e === void 0 ? void 0 : _e.toString()) !== null && _f !== void 0 ? _f : "",
        valid_period_months: (_h = (_g = voucherPacket === null || voucherPacket === void 0 ? void 0 : voucherPacket.valid_period_months) === null || _g === void 0 ? void 0 : _g.toString()) !== null && _h !== void 0 ? _h : "",
        until_year_end: (_j = voucherPacket === null || voucherPacket === void 0 ? void 0 : voucherPacket.until_year_end) !== null && _j !== void 0 ? _j : false,
        has_unlimited_issuance: (_k = voucherPacket === null || voucherPacket === void 0 ? void 0 : voucherPacket.has_unlimited_issuance) !== null && _k !== void 0 ? _k : false,
        assign_on_sale: (_l = voucherPacket === null || voucherPacket === void 0 ? void 0 : voucherPacket.assign_on_sale) !== null && _l !== void 0 ? _l : false,
        voucher_type_id: (_m = voucherPacket === null || voucherPacket === void 0 ? void 0 : voucherPacket.voucher_type_id.toString()) !== null && _m !== void 0 ? _m : "",
        description: (_o = voucherPacket === null || voucherPacket === void 0 ? void 0 : voucherPacket.description) !== null && _o !== void 0 ? _o : ""
    }), setData = _p.setData, data = _p.data, post = _p.post, patch = _p.patch, processing = _p.processing, errors = _p.errors, reset = _p.reset;
    react_2.useImperativeHandle(ref, function () { return ({
        submit: function () {
            var _a;
            (_a = formRef.current) === null || _a === void 0 ? void 0 : _a.dispatchEvent(new Event("submit", { cancelable: true, bubbles: true }));
        }
    }); });
    function handleSubmit(e) {
        e.preventDefault();
        var handleSuccess = function () {
            reset();
            sonner_1.toast.success("Packet voucher telah berhasil " + (isEditMode ? "diperbarui" : "ditambahkan") + ".");
            onSuccess();
        };
        if (isEditMode) {
            patch(route("voucher-packets.update", (voucherPacket === null || voucherPacket === void 0 ? void 0 : voucherPacket.id) || ""), {
                onSuccess: handleSuccess,
                onError: function () { }
            });
            return;
        }
        else {
            post(route("voucher-packets.store"), {
                onSuccess: handleSuccess,
                onError: function (errors) {
                    console.error("Form submission error:", errors);
                },
                preserveScroll: true
            });
        }
    }
    return (react_2["default"].createElement("form", { ref: formRef, onSubmit: handleSubmit, className: "h-full px-4" },
        react_2["default"].createElement("fieldset", { disabled: processing, className: "space-y-2" },
            react_2["default"].createElement("div", null,
                react_2["default"].createElement(label_1.Label, { htmlFor: "name" }, "Nama Packet"),
                react_2["default"].createElement(input_1.Input, { id: "name", value: data.name, onChange: function (e) { return setData("name", e.target.value); }, autoComplete: "off" }),
                errors.name && (react_2["default"].createElement("p", { className: "mt-1 text-sm text-red-600" }, errors.name))),
            react_2["default"].createElement("div", null,
                react_2["default"].createElement(label_1.Label, { htmlFor: "voucher_type_id" }, "Tipe Voucher"),
                react_2["default"].createElement(select_1.Select, { value: data.voucher_type_id, onValueChange: function (value) {
                        return setData("voucher_type_id", value);
                    } },
                    react_2["default"].createElement(select_1.SelectTrigger, null,
                        react_2["default"].createElement(select_1.SelectValue, { placeholder: "Pilih tipe voucher" })),
                    react_2["default"].createElement(select_1.SelectContent, null, voucherTypes.map(function (type) { return (react_2["default"].createElement(select_1.SelectItem, { key: type.id, value: String(type.id) }, type.name)); }))),
                errors.voucher_type_id && (react_2["default"].createElement("p", { className: "mt-1 text-sm text-red-600" }, errors.voucher_type_id))),
            react_2["default"].createElement("div", null,
                react_2["default"].createElement(label_1.Label, { htmlFor: "price" }, "Harga"),
                react_2["default"].createElement(react_number_format_1.NumericFormat, { id: "price", customInput: input_1.Input, prefix: "Rp ", thousandSeparator: ".", decimalSeparator: ",", value: data.price, onValueChange: function (values) {
                        var _a;
                        setData("price", ((_a = values.floatValue) === null || _a === void 0 ? void 0 : _a.toString()) || "");
                    }, className: "mt-1" }),
                errors.price && (react_2["default"].createElement("p", { className: "mt-1 text-sm text-red-600" }, errors.price))),
            react_2["default"].createElement("div", { className: "grid grid-cols-2 gap-4" },
                react_2["default"].createElement("div", null,
                    react_2["default"].createElement(label_1.Label, { htmlFor: "quantity" }, "Jumlah Voucher"),
                    react_2["default"].createElement(input_1.Input, { id: "quantity", type: "number", value: data.quantity, onChange: function (e) {
                            return setData("quantity", e.target.value);
                        }, min: "1" }),
                    errors.quantity && (react_2["default"].createElement("p", { className: "mt-1 text-sm text-red-600" }, errors.quantity))),
                react_2["default"].createElement("div", { className: "relative" },
                    react_2["default"].createElement(label_1.Label, { htmlFor: "valid_period_months" }, "Masa Aktif(Bulan)"),
                    react_2["default"].createElement(input_1.Input, { id: "valid_period_months", type: "number", value: data.valid_period_months, onChange: function (e) {
                            return setData("valid_period_months", e.target.value);
                        }, className: "", min: "1" }),
                    react_2["default"].createElement("div", { className: "flex flex-row items-center gap-1 mt-1" },
                        react_2["default"].createElement(checkbox_1.Checkbox, { id: "until_year_end", checked: data.until_year_end, onCheckedChange: function (checked) {
                                return setData("until_year_end", !!checked);
                            } }),
                        react_2["default"].createElement(label_1.Label, { htmlFor: "until_year_end", className: "text-xs text-muted-foreground" }, "Sampai Akhir Tahun")),
                    errors.valid_period_months && (react_2["default"].createElement("p", { className: "mt-1 text-sm text-red-600" }, errors.valid_period_months)))),
            react_2["default"].createElement("div", null,
                react_2["default"].createElement(label_1.Label, { htmlFor: "description" }, "Deskripsi"),
                react_2["default"].createElement(textarea_1.Textarea, { id: "description", value: data.description, onChange: function (e) { return setData("description", e.target.value); } }),
                errors.description && (react_2["default"].createElement("p", { className: "mt-1 text-sm text-red-600" }, errors.description))),
            react_2["default"].createElement("div", { className: "flex items-center space-x-2 pt-2" },
                react_2["default"].createElement(checkbox_1.Checkbox, { id: "has_unlimited_issuance", checked: data.has_unlimited_issuance, onCheckedChange: function (checked) {
                        return setData("has_unlimited_issuance", !!checked);
                    } }),
                react_2["default"].createElement(label_1.Label, { htmlFor: "has_unlimited_issuance", className: "leading-snug" },
                    "Dapat Diperbarui",
                    react_2["default"].createElement("p", { className: "text-xs text-muted-foreground" }, "Customer dapat mengambil voucher baru jika masa aktif masih berlaku"))),
            errors.has_unlimited_issuance && (react_2["default"].createElement("p", { className: "text-sm text-red-600" }, errors.has_unlimited_issuance)),
            react_2["default"].createElement("div", { className: "flex items-center space-x-2 pt-2" },
                react_2["default"].createElement(checkbox_1.Checkbox, { id: "assign_on_sale", checked: data.assign_on_sale, onCheckedChange: function (checked) {
                        return setData("assign_on_sale", !!checked);
                    } }),
                react_2["default"].createElement(label_1.Label, { htmlFor: "assign_on_sale", className: "leading-snug" },
                    "Assign on Sale",
                    react_2["default"].createElement("p", { className: "text-xs text-muted-foreground" }, "Ketika dijual, maka harus memilih nomor voucher"))),
            errors.has_unlimited_issuance && (react_2["default"].createElement("p", { className: "text-sm text-red-600" }, errors.has_unlimited_issuance)))));
});
exports["default"] = VoucherPacketForm;
