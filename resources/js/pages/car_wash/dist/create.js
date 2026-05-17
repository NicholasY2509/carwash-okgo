"use strict";
exports.__esModule = true;
var sheet_1 = require("@/components/ui/sheet");
var app_layout_1 = require("@/layouts/app-layout");
var react_1 = require("@inertiajs/react");
var react_2 = require("react");
var car_wash_button_1 = require("./component/car-wash-button");
var cash_form_1 = require("./forms/cash-form");
var voucher_form_1 = require("./forms/voucher-form");
var return_form_1 = require("./forms/return-form");
var transaction_footer_1 = require("./forms/transaction-footer");
var breadcrumbs = [
    {
        title: "Pencucian Mobil",
        href: "/car-wash/create"
    },
];
function CarWashCreate() {
    var _a, _b, _c, _d, _e, _f, _g, _h, _j;
    var props = react_1.usePage().props;
    var products = props.products || [];
    var stalls = props.stalls || [];
    var paymentOptions = [
        { label: "Cash", type: "Cash" },
        { label: "Voucher", type: "Voucher" },
        { label: "Return", type: "Return" },
    ];
    var formRef = react_2.useRef(null);
    var _k = react_2.useState(false), isSheetOpen = _k[0], setIsSheetOpen = _k[1];
    var _l = react_2.useState(null), activeForm = _l[0], setActiveForm = _l[1];
    var _m = react_2.useState(null), selectedProduct = _m[0], setSelectedProduct = _m[1];
    var _o = react_2.useState(""), selectedStallId = _o[0], setSelectedStallId = _o[1];
    var _p = react_2.useState(""), paymentMethod = _p[0], setPaymentMethod = _p[1];
    var _q = react_2.useState(""), nominalBayar = _q[0], setNominalBayar = _q[1];
    var _r = react_2.useState(null), footerError = _r[0], setFooterError = _r[1];
    var totalHarga = (selectedProduct === null || selectedProduct === void 0 ? void 0 : selectedProduct.price) || 0;
    var nilaiBayar = parseFloat(nominalBayar) || 0;
    var kembalian = nilaiBayar > totalHarga ? nilaiBayar - totalHarga : 0;
    var handleFinalSubmit = function () {
        var _a;
        if (!selectedStallId) {
            setFooterError("Pilih stall terlebih dahulu.");
            return;
        }
        if (activeForm === "Cash" && !paymentMethod) {
            setFooterError("Pilih metode pembayaran.");
            return;
        }
        if (paymentMethod === "Cash" && nilaiBayar < totalHarga) {
            setFooterError("Nominal yang dibayarkan kurang dari total harga.");
            return;
        }
        setFooterError(null);
        var footerData = {
            stall_id: parseInt(selectedStallId),
            product_id: String((selectedProduct === null || selectedProduct === void 0 ? void 0 : selectedProduct.id) || ""),
            payment_method: paymentMethod,
            nominal_bayar: nilaiBayar
        };
        (_a = formRef.current) === null || _a === void 0 ? void 0 : _a.submit(footerData);
    };
    var openSheet = function (formType) {
        setActiveForm(formType);
        setIsSheetOpen(true);
    };
    react_2.useEffect(function () {
        if (isSheetOpen) {
            var defaultProduct = products.find(function (p) { return p.id === 1; });
            if (activeForm)
                setSelectedProduct(defaultProduct || null);
        }
        else {
            setSelectedProduct(null);
            setSelectedStallId("");
            setNominalBayar("");
            setFooterError(null);
            setPaymentMethod("");
        }
    }, [isSheetOpen, products]);
    react_2.useEffect(function () {
        if (paymentMethod !== "Cash") {
            setNominalBayar("");
        }
    }, [paymentMethod]);
    var renderForm = function () {
        switch (activeForm) {
            case "Cash":
                return (React.createElement(cash_form_1["default"], { ref: formRef, onSuccess: function () { return setIsSheetOpen(false); } }));
            case "Voucher":
                return (React.createElement(voucher_form_1["default"], { ref: formRef, onSuccess: function () { return setIsSheetOpen(false); } }));
            case "Return":
                return (React.createElement(return_form_1["default"], { ref: formRef, onSuccess: function () { return setIsSheetOpen(false); }, onCancel: function () { return setIsSheetOpen(false); } }));
            default:
                return null;
        }
    };
    return (React.createElement(app_layout_1["default"], { breadcrumbs: breadcrumbs },
        React.createElement(react_1.Head, { title: "Pencucian Mobil" }),
        React.createElement("div", { className: "flex h-full flex-1 flex-col gap-4 rounded-xl p-4" },
            React.createElement("div", { className: "grid auto-rows-min md:grid-cols-1 lg:grid-cols-2 gap-4" }, paymentOptions.map(function (option) { return (React.createElement(car_wash_button_1.CarWashButton, { key: option.type, label: option.label, onClick: function () { return openSheet(option.type); } })); })),
            activeForm && (React.createElement(sheet_1.Sheet, { open: isSheetOpen, onOpenChange: setIsSheetOpen },
                React.createElement(sheet_1.SheetContent, { className: "flex flex-col sm:max-w-3xl" },
                    React.createElement(sheet_1.SheetHeader, null,
                        React.createElement(sheet_1.SheetTitle, null,
                            "Pembayaran ",
                            activeForm)),
                    React.createElement("div", { className: "flex-1 overflow-y-auto py-2 pr-4" }, renderForm()),
                    React.createElement(transaction_footer_1.TransactionFooter, { products: products, stalls: stalls, activeForm: activeForm, selectedProduct: selectedProduct, onProductChange: function (productId) {
                            var product = products.find(function (p) {
                                return String(p.id) === productId;
                            }) || null;
                            setSelectedProduct(product);
                        }, selectedStallId: selectedStallId, onStallChange: setSelectedStallId, paymentMethod: paymentMethod, onPaymentMethodChange: setPaymentMethod, nominalBayar: nominalBayar, onNominalBayarChange: setNominalBayar, totalHarga: totalHarga, kembalian: kembalian, onFinalSubmit: handleFinalSubmit, onClose: function () { return setIsSheetOpen(false); }, footerError: footerError, canSubmit: activeForm === "Voucher"
                            ? ((_c = (_b = (_a = formRef.current) === null || _a === void 0 ? void 0 : _a.canSubmit) === null || _b === void 0 ? void 0 : _b.call(_a)) !== null && _c !== void 0 ? _c : false)
                            : activeForm === "Return"
                                ? ((_f = (_e = (_d = formRef.current) === null || _d === void 0 ? void 0 : _d.canSubmit) === null || _e === void 0 ? void 0 : _e.call(_d)) !== null && _f !== void 0 ? _f : false)
                                : activeForm === "Cash"
                                    ? ((_j = (_h = (_g = formRef.current) === null || _g === void 0 ? void 0 : _g.canSubmit) === null || _h === void 0 ? void 0 : _h.call(_g)) !== null && _j !== void 0 ? _j : false)
                                    : true })))))));
}
exports["default"] = CarWashCreate;
