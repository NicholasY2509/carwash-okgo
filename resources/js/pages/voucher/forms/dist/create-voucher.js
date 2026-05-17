"use strict";
var __spreadArrays = (this && this.__spreadArrays) || function () {
    for (var s = 0, i = 0, il = arguments.length; i < il; i++) s += arguments[i].length;
    for (var r = Array(s), k = 0, i = 0; i < il; i++)
        for (var a = arguments[i], j = 0, jl = a.length; j < jl; j++, k++)
            r[k] = a[j];
    return r;
};
exports.__esModule = true;
var button_1 = require("@/components/ui/button");
var input_1 = require("@/components/ui/input");
var label_1 = require("@/components/ui/label");
var select_1 = require("@/components/ui/select");
var react_1 = require("@inertiajs/react");
var badge_1 = require("@/components/ui/badge");
var lucide_react_1 = require("lucide-react");
var react_2 = require("react");
var sonner_1 = require("sonner");
function CreateVoucher(_a) {
    var _b = _a.categories, categories = _b === void 0 ? [] : _b, onSuccess = _a.onSuccess;
    var _c = react_2.useState("single"), activeTab = _c[0], setActiveTab = _c[1];
    var _d = react_2.useState([]), codes = _d[0], setCodes = _d[1];
    var _e = react_2.useState(""), currentCode = _e[0], setCurrentCode = _e[1];
    var _f = react_2.useState(""), rangeStart = _f[0], setRangeStart = _f[1];
    var _g = react_2.useState(""), rangeEnd = _g[0], setRangeEnd = _g[1];
    var _h = react_2.useState([]), batchCodesPreview = _h[0], setBatchCodesPreview = _h[1];
    var _j = react_2.useState(""), categoryId = _j[0], setCategoryId = _j[1];
    var _k = react_2.useState(""), kdSales = _k[0], setKdSales = _k[1];
    var _l = react_2.useState(null), error = _l[0], setError = _l[1];
    var _m = react_2.useState(false), processing = _m[0], setProcessing = _m[1];
    var handleAddCode = function () {
        if (!currentCode.trim())
            return;
        if (codes.includes(currentCode.trim())) {
            setError("Code \"" + currentCode.trim() + "\" sudah ada.");
            return;
        }
        setError(null);
        setCodes(__spreadArrays(codes, [currentCode.trim()]));
        setCurrentCode("");
    };
    var handleRemoveCode = function (codeToRemove) {
        setCodes(codes.filter(function (code) { return code !== codeToRemove; }));
    };
    react_2.useEffect(function () {
        if (rangeStart && rangeEnd) {
            var matchStart = rangeStart.match(/^([a-zA-Z]*)(\d+)$/);
            var matchEnd = rangeEnd.match(/^([a-zA-Z]*)(\d+)$/);
            if (!matchStart || !matchEnd) {
                setError("Format range tidak valid. Contoh: T0001 - T0010.");
                setBatchCodesPreview([]);
                return;
            }
            var prefixStart = matchStart[1];
            var numberStartStr = matchStart[2];
            var prefixEnd = matchEnd[1];
            var numberEndStr = matchEnd[2];
            if (prefixStart !== prefixEnd) {
                setError("Prefix kode awal dan akhir harus sama.");
                setBatchCodesPreview([]);
                return;
            }
            var startNum = parseInt(numberStartStr, 10);
            var endNum = parseInt(numberEndStr, 10);
            var paddingLength = numberStartStr.length;
            if (isNaN(startNum) || isNaN(endNum) || startNum > endNum) {
                setError("Range angka tidak valid.");
                setBatchCodesPreview([]);
                return;
            }
            setError(null);
            var generatedCodes = [];
            for (var i = startNum; i <= endNum; i++) {
                var paddedNumber = String(i).padStart(paddingLength, "0");
                generatedCodes.push("" + prefixStart + paddedNumber);
            }
            setBatchCodesPreview(generatedCodes);
        }
        else {
            setBatchCodesPreview([]);
        }
    }, [rangeStart, rangeEnd]);
    var handleSubmit = function (e) {
        e.preventDefault();
        var finalCodes = [];
        if (activeTab === "single") {
            finalCodes = codes;
        }
        else {
            finalCodes = batchCodesPreview;
        }
        if (finalCodes.length === 0) {
            setError("Tidak ada kode voucher untuk ditambahkan.");
            return;
        }
        if (!categoryId) {
            setError("Silakan pilih kategori voucher.");
            return;
        }
        setError(null);
        var dataToSubmit = {
            serial_number: finalCodes,
            sales_code: kdSales,
            voucher_type_id: categoryId
        };
        setProcessing(true);
        react_1.router.post(route("vouchers.store"), dataToSubmit, {
            onSuccess: function () {
                sonner_1.toast.success(finalCodes.length + " kode voucher telah ditambahkan.");
                onSuccess();
            },
            onError: function (errors) {
                var firstError = Object.values(errors)[0];
                setError(firstError);
            },
            onFinish: function () {
                setProcessing(false);
            }
        });
    };
    return (react_2["default"].createElement("form", { onSubmit: handleSubmit, className: "space-y-6" },
        react_2["default"].createElement("div", { className: "flex w-full rounded-md bg-muted p-1" },
            react_2["default"].createElement(button_1.Button, { type: "button", variant: activeTab === "single" ? "default" : "ghost", className: "flex-1", onClick: function () { return setActiveTab("single"); } }, "Input Satuan"),
            react_2["default"].createElement(button_1.Button, { type: "button", variant: activeTab === "batch" ? "default" : "ghost", className: "flex-1", onClick: function () { return setActiveTab("batch"); } }, "Input Batch")),
        react_2["default"].createElement("div", null,
            activeTab === "single" && (react_2["default"].createElement("div", { className: "space-y-4" },
                react_2["default"].createElement(label_1.Label, { htmlFor: "single-code", required: true }, "Kode Voucher Satuan"),
                react_2["default"].createElement("div", { className: "flex items-center gap-2" },
                    react_2["default"].createElement(input_1.Input, { id: "single-code", placeholder: "e.g., PROMO123", value: currentCode, onChange: function (e) { return setCurrentCode(e.target.value); }, onKeyDown: function (e) {
                            return e.key === "Enter" &&
                                (e.preventDefault(), handleAddCode());
                        } }),
                    react_2["default"].createElement(button_1.Button, { type: "button", onClick: handleAddCode }, "Tambah")),
                react_2["default"].createElement("div", { className: "flex min-h-[60px] flex-wrap gap-2 rounded-md border p-2" }, codes.length === 0 ? (react_2["default"].createElement("span", { className: "p-2 text-sm text-muted-foreground" }, "Kode yang ditambahkan akan muncul di sini...")) : (codes.map(function (code) { return (react_2["default"].createElement(badge_1.Badge, { key: code, variant: "secondary" },
                    code,
                    react_2["default"].createElement("button", { type: "button", className: "ml-2 rounded-full p-0.5 hover:bg-destructive/80", onClick: function () {
                            return handleRemoveCode(code);
                        } },
                        react_2["default"].createElement(lucide_react_1.X, { size: 12 })))); }))))),
            activeTab === "batch" && (react_2["default"].createElement("div", { className: "space-y-2" },
                react_2["default"].createElement(label_1.Label, { required: true }, "Generate Kode dari Range"),
                react_2["default"].createElement("div", { className: "flex items-center gap-2" },
                    react_2["default"].createElement(input_1.Input, { type: "text", placeholder: "Dari...", value: rangeStart, onChange: function (e) {
                            return setRangeStart(e.target.value.toUpperCase());
                        } }),
                    react_2["default"].createElement("span", null, "-"),
                    react_2["default"].createElement(input_1.Input, { type: "text", placeholder: "Sampai...", value: rangeEnd, onChange: function (e) {
                            return setRangeEnd(e.target.value.toUpperCase());
                        } })),
                react_2["default"].createElement("p", { className: "text-sm text-muted-foreground" }, batchCodesPreview.length > 0
                    ? "Akan mendaftarkan " + batchCodesPreview.length + " kode (" + batchCodesPreview[0] + " ... " + batchCodesPreview[batchCodesPreview.length - 1] + ")"
                    : "Jumlah Voucher akan ditampilkan di sini...")))),
        react_2["default"].createElement("div", { className: "space-y-2 grid grid-cols-2 gap-2" },
            react_2["default"].createElement("div", null,
                react_2["default"].createElement(label_1.Label, { htmlFor: "category", required: true }, "Kategori Voucher"),
                react_2["default"].createElement(select_1.Select, { value: categoryId, onValueChange: setCategoryId },
                    react_2["default"].createElement(select_1.SelectTrigger, null,
                        react_2["default"].createElement(select_1.SelectValue, { placeholder: "Pilih kategori..." })),
                    react_2["default"].createElement(select_1.SelectContent, null, categories.map(function (cat) { return (react_2["default"].createElement(select_1.SelectItem, { key: cat.id, value: String(cat.id) }, cat.name)); })))),
            react_2["default"].createElement("div", null,
                react_2["default"].createElement(label_1.Label, { htmlFor: "category" }, "Kode Sales"),
                react_2["default"].createElement(input_1.Input, { id: "sales-code", value: kdSales, onChange: function (e) { return setKdSales(e.target.value); }, placeholder: "AA..." }))),
        error && react_2["default"].createElement("p", { className: "text-sm text-red-600" }, error),
        react_2["default"].createElement(button_1.Button, { type: "submit", className: "w-full", disabled: processing }, processing ? "Tambah..." : "Simpan Voucher")));
}
exports["default"] = CreateVoucher;
