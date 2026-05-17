"use strict";
var __assign = (this && this.__assign) || function () {
    __assign = Object.assign || function(t) {
        for (var s, i = 1, n = arguments.length; i < n; i++) {
            s = arguments[i];
            for (var p in s) if (Object.prototype.hasOwnProperty.call(s, p))
                t[p] = s[p];
        }
        return t;
    };
    return __assign.apply(this, arguments);
};
exports.__esModule = true;
var input_1 = require("@/components/ui/input");
var label_1 = require("@/components/ui/label");
var select_1 = require("@/components/ui/select");
var react_1 = require("@inertiajs/react");
var react_2 = require("react");
var axios_1 = require("axios");
var use_debounce_1 = require("@/hooks/use-debounce");
var customer_search_1 = require("@/pages/purchased_packets/forms/customer-search");
var use_transaction_handler_1 = require("@/hooks/use-transaction-handler");
var receipt_formatter_1 = require("@/lib/receipt-formatter");
var car_plate_search_1 = require("@/pages/car_wash/forms/car-plate-search");
var lucide_react_1 = require("lucide-react");
var CreatePurchasedPacketForm = react_2.forwardRef(function (_a, ref) {
    var voucherPacketId = _a.voucherPacketId, onlyOneCar = _a.onlyOneCar, onSuccess = _a.onSuccess;
    var _b = react_1.useForm({
        customer_id: null,
        car_id: null,
        customer_name: "",
        customer_phone: "",
        customer_email: "",
        customer_ktp_photo: null,
        car_plate_number: "",
        car_model: "",
        car_color: "",
        car_photo: null,
        voucher_packet_id: voucherPacketId
    }), data = _b.data, setData = _b.setData, post = _b.post, processing = _b.processing, errors = _b.errors, reset = _b.reset;
    var _c = react_2.useState(""), searchQuery = _c[0], setSearchQuery = _c[1];
    var _d = react_2.useState([]), searchResults = _d[0], setSearchResults = _d[1];
    var _e = react_2.useState(false), isSearching = _e[0], setIsSearching = _e[1];
    var _f = react_2.useState(false), showDropdown = _f[0], setShowDropdown = _f[1];
    var _g = react_2.useState(null), selectedCustomer = _g[0], setSelectedCustomer = _g[1];
    var debouncedSearchQuery = use_debounce_1.useDebounce(searchQuery, 300);
    var _h = use_transaction_handler_1.useTransactionHandler({
        onSuccess: onSuccess,
        reset: reset
    }), handleSuccess = _h.handleSuccess, handleError = _h.handleError;
    // Car plate search states
    var _j = react_2.useState(""), carPlateSearch = _j[0], setCarPlateSearch = _j[1];
    var _k = react_2.useState([]), carPlateResults = _k[0], setCarPlateResults = _k[1];
    var _l = react_2.useState(false), isCarPlateSearching = _l[0], setIsCarPlateSearching = _l[1];
    var _m = react_2.useState(false), showCarPlateDropdown = _m[0], setShowCarPlateDropdown = _m[1];
    var debouncedCarPlateSearch = use_debounce_1.useDebounce(carPlateSearch, 300);
    // Add a loading overlay for form submission
    var _o = react_2.useState(false), formLoading = _o[0], setFormLoading = _o[1];
    react_2.useEffect(function () {
        if (debouncedSearchQuery.length < 2 ||
            debouncedSearchQuery === (selectedCustomer === null || selectedCustomer === void 0 ? void 0 : selectedCustomer.name)) {
            setSearchResults([]);
            return;
        }
        var controller = new AbortController();
        setIsSearching(true);
        axios_1["default"]
            .get("/api/customers/search?query=" + debouncedSearchQuery, {
            signal: controller.signal
        })
            .then(function (response) {
            setSearchResults(response.data);
            setShowDropdown(true);
        })["catch"](function (error) {
            if (error.name !== "AbortError") {
                console.error("Customer search error:", error);
            }
        })["finally"](function () { return setIsSearching(false); });
        return function () { return controller.abort(); };
    }, [debouncedSearchQuery, selectedCustomer]);
    react_2.useEffect(function () {
        if (debouncedCarPlateSearch.length < 2) {
            setCarPlateResults([]);
            return;
        }
        // Prevent duplicate API calls
        var controller = new AbortController();
        setIsCarPlateSearching(true);
        axios_1["default"]
            .get("/api/cars/search?plate=" + debouncedCarPlateSearch, {
            signal: controller.signal
        })
            .then(function (response) {
            setCarPlateResults(response.data);
            setShowCarPlateDropdown(true);
        })["catch"](function (error) {
            if (error.name !== "AbortError") {
                console.error("Car plate search error:", error);
            }
        })["finally"](function () { return setIsCarPlateSearching(false); });
        return function () { return controller.abort(); };
    }, [debouncedCarPlateSearch]);
    var handleSearchChange = function (value) {
        setSearchQuery(value);
        setData("customer_name", value);
        if (selectedCustomer) {
            setSelectedCustomer(null);
            setData(__assign(__assign({}, data), { customer_id: null, customer_phone: "", customer_email: "", car_id: null }));
        }
    };
    var handleCustomerSelect = function (customer) {
        setSelectedCustomer(customer);
        setSearchQuery(customer.name);
        setShowDropdown(false);
        setData(__assign(__assign({}, data), { customer_id: customer.id, customer_name: customer.name, customer_phone: customer.phone, customer_email: customer.email, customer_ktp_photo: null, car_id: null, car_plate_number: "", car_model: "", car_color: "", car_photo: null }));
    };
    var handleCarSelect = function (carId) {
        if (carId === "new") {
            setData(__assign(__assign({}, data), { car_id: null, car_plate_number: "", car_model: "", car_color: "", car_photo: null }));
            return;
        }
        var selectedCar = selectedCustomer === null || selectedCustomer === void 0 ? void 0 : selectedCustomer.cars.find(function (c) { return c.id === carId; });
        if (selectedCar) {
            setData(__assign(__assign({}, data), { car_id: selectedCar.id, car_plate_number: selectedCar.plate_number, car_model: selectedCar.model, car_color: selectedCar.color, car_photo: null }));
        }
    };
    var handleCarPlateChange = function (value) {
        var upperValue = value.toUpperCase();
        setCarPlateSearch(upperValue);
        setData("car_plate_number", upperValue);
        setData("car_id", null);
        setData("car_model", "");
        setData("car_color", "");
        setData("car_photo", null);
        setSelectedCustomer(null);
    };
    var handleCarPlateSelect = function (result) {
        setShowCarPlateDropdown(false);
        setCarPlateSearch(result.car.plate_number);
        setSearchQuery(result.customer.name);
        setData(__assign(__assign({}, data), { car_id: result.car.id, car_plate_number: result.car.plate_number, car_model: result.car.model, car_color: result.car.color, car_photo: null, customer_id: result.customer.id, customer_name: result.customer.name, customer_phone: result.customer.phone, customer_email: result.customer.email, customer_ktp_photo: null }));
        setSelectedCustomer(result.customer);
    };
    function handleSubmit(footerData) {
        setFormLoading(true);
        var finalData = __assign(__assign({}, data), { payment_method: footerData.payment_method, nominal_pembayaran: footerData.nominal_pembayaran, voucher_ids: footerData.voucher_ids, quantity: footerData.quantity });
        react_1.router.post(route("purchased-packets.store"), finalData, {
            onSuccess: function (page) {
                return handleSuccess(page, receipt_formatter_1.printPacketPurchaseReceipt);
            },
            onError: handleError,
            forceFormData: true,
            onFinish: function () { return setFormLoading(false); }
        });
    }
    react_2.useImperativeHandle(ref, function () { return ({
        submit: function (footerData) {
            handleSubmit(footerData);
        }
    }); });
    return (react_2["default"].createElement("form", { onSubmit: function (e) { return e.preventDefault(); }, className: "relative px-4" },
        formLoading && (react_2["default"].createElement("div", { className: "absolute inset-0 z-20 flex items-center justify-center bg-white/70" },
            react_2["default"].createElement(lucide_react_1.LoaderCircle, { className: "animate-spin w-8 h-8 text-blue-500" }))),
        react_2["default"].createElement("fieldset", { disabled: processing || formLoading, className: "space-y-2" },
            react_2["default"].createElement("div", { className: "flex flex-col lg:flex-row gap-2" },
                react_2["default"].createElement("div", { className: "border rounded-lg p-4" },
                    react_2["default"].createElement("h2", { className: "font-semibold text-lg mb-2" }, "Informasi Customer"),
                    selectedCustomer && carPlateSearch && (react_2["default"].createElement("div", { className: "mb-2 p-2 border rounded text-blue-700 text-sm flex items-center justify-between" },
                        react_2["default"].createElement("span", null,
                            "Customer terdaftar berdasarkan plat nomor:",
                            " ",
                            react_2["default"].createElement("b", null, selectedCustomer.name)),
                        react_2["default"].createElement("button", { className: "ml-2 text-xs underline", onClick: function () {
                                setSelectedCustomer(null);
                                setSearchQuery("");
                                setData(__assign(__assign({}, data), { customer_id: null, customer_name: "", customer_phone: "", customer_email: "" }));
                            }, type: "button" }, "Kosongkan"))),
                    react_2["default"].createElement(customer_search_1.CustomerSearch, { value: searchQuery, onValueChange: handleSearchChange, onSelect: handleCustomerSelect, searchResults: searchResults, isSearching: isSearching, showDropdown: showDropdown, onFocus: function () {
                            if (searchResults.length > 0)
                                setShowDropdown(true);
                        }, onCloseDropdown: function () { return setShowDropdown(false); } }),
                    react_2["default"].createElement("div", { className: "mt-2" },
                        react_2["default"].createElement(label_1.Label, { htmlFor: "customer_phone" }, "Nomor Telepon"),
                        react_2["default"].createElement(input_1.Input, { id: "customer_phone", value: data.customer_phone, onChange: function (e) {
                                return setData("customer_phone", e.target.value);
                            }, disabled: !!selectedCustomer && !!carPlateSearch }),
                        errors.customer_phone && (react_2["default"].createElement("p", { className: "text-sm text-red-600" }, errors.customer_phone))),
                    react_2["default"].createElement("div", null,
                        react_2["default"].createElement(label_1.Label, { htmlFor: "customer_email" }, "Email"),
                        react_2["default"].createElement(input_1.Input, { id: "customer_email", type: "email", value: data.customer_email, onChange: function (e) {
                                return setData("customer_email", e.target.value);
                            }, disabled: !!selectedCustomer && !!carPlateSearch }),
                        errors.customer_email && (react_2["default"].createElement("p", { className: "text-sm text-red-600" }, errors.customer_email))),
                    !selectedCustomer && (react_2["default"].createElement("div", null,
                        react_2["default"].createElement(label_1.Label, { htmlFor: "customer_ktp_photo" }, "Foto KTP"),
                        react_2["default"].createElement(input_1.Input, { id: "customer_ktp_photo", type: "file", accept: "image/*", capture: "environment", onChange: function (e) {
                                var _a;
                                return setData("customer_ktp_photo", ((_a = e.target.files) === null || _a === void 0 ? void 0 : _a[0]) || null);
                            } }),
                        errors.customer_ktp_photo && (react_2["default"].createElement("p", { className: "text-sm text-red-600" }, errors.customer_ktp_photo))))),
                react_2["default"].createElement("div", { className: "border rounded-lg p-4" },
                    react_2["default"].createElement("h2", { className: "font-semibold text-lg mb-2" }, "Informasi Kendaraan"),
                    selectedCustomer &&
                        selectedCustomer.cars.length > 0 && (react_2["default"].createElement("div", { className: "mb-2" },
                        react_2["default"].createElement(label_1.Label, null, "Pilih Kendaraan Terdaftar"),
                        react_2["default"].createElement(select_1.Select, { onValueChange: handleCarSelect, value: data.car_id || "", disabled: !onlyOneCar || !!carPlateSearch },
                            react_2["default"].createElement(select_1.SelectTrigger, null,
                                react_2["default"].createElement(select_1.SelectValue, { placeholder: "Pilih mobil..." })),
                            react_2["default"].createElement(select_1.SelectContent, null,
                                selectedCustomer.cars.map(function (car) { return (react_2["default"].createElement(select_1.SelectItem, { key: car.id, value: car.id },
                                    car.plate_number,
                                    " -",
                                    " ",
                                    car.model)); }),
                                react_2["default"].createElement(select_1.SelectItem, { value: "new" }, "Tambah Kendaraan Baru"))))),
                    react_2["default"].createElement("div", { className: "flex flex-col gap-2 lg:flex-row" },
                        react_2["default"].createElement("div", { className: "w-full lg:w-2/5" },
                            react_2["default"].createElement(label_1.Label, { htmlFor: "car_plate_number", required: true }, "Nomor Polisi"),
                            react_2["default"].createElement("div", { className: !onlyOneCar
                                    ? "pointer-events-none opacity-50"
                                    : "" },
                                react_2["default"].createElement(car_plate_search_1["default"], { value: carPlateSearch, onValueChange: handleCarPlateChange, searchResults: carPlateResults, isSearching: isCarPlateSearching, showDropdown: showCarPlateDropdown, onFocus: function () {
                                        if (carPlateResults.length > 0)
                                            setShowCarPlateDropdown(true);
                                    }, onSelect: handleCarPlateSelect, onCloseDropdown: function () {
                                        return setShowCarPlateDropdown(false);
                                    } })),
                            react_2["default"].createElement("p", { className: "text-xs text-muted-foreground mt-1" }),
                            errors.car_plate_number && (react_2["default"].createElement("p", { className: "text-sm text-red-600" }, errors.car_plate_number))),
                        react_2["default"].createElement("div", { className: "w-full lg:w-3/5" },
                            react_2["default"].createElement(label_1.Label, { htmlFor: "car_color" }, "Warna Kendaraan"),
                            react_2["default"].createElement(input_1.Input, { id: "car_color", value: data.car_color, onChange: function (e) {
                                    if (data.car_id)
                                        setData("car_id", null);
                                    setData("car_color", e.target.value);
                                }, disabled: !onlyOneCar ||
                                    (!!carPlateSearch && !!selectedCustomer) }),
                            errors.car_color && (react_2["default"].createElement("p", { className: "text-sm text-red-600" }, errors.car_color)))),
                    react_2["default"].createElement("div", null,
                        react_2["default"].createElement(label_1.Label, { htmlFor: "car_model" }, "Merk Kendaraan"),
                        react_2["default"].createElement(input_1.Input, { id: "car_model", value: data.car_model, onChange: function (e) {
                                if (data.car_id)
                                    setData("car_id", null);
                                setData("car_model", e.target.value);
                            }, disabled: !onlyOneCar ||
                                (!!carPlateSearch && !!selectedCustomer) }),
                        errors.car_model && (react_2["default"].createElement("p", { className: "text-sm text-red-600" }, errors.car_model))),
                    !data.car_id && (react_2["default"].createElement("div", null,
                        react_2["default"].createElement(label_1.Label, { htmlFor: "car_photo" }, "Foto Kendaraan"),
                        react_2["default"].createElement(input_1.Input, { id: "car_photo", type: "file", accept: "image/*", capture: "environment", onChange: function (e) {
                                var _a;
                                return setData("car_photo", ((_a = e.target.files) === null || _a === void 0 ? void 0 : _a[0]) || null);
                            }, disabled: !onlyOneCar ||
                                (!!carPlateSearch && !!selectedCustomer) }),
                        errors.car_photo && (react_2["default"].createElement("p", { className: "text-sm text-red-600" }, errors.car_photo)))))),
            (selectedCustomer ||
                (!data.customer_id && data.customer_name)) && (react_2["default"].createElement("div", { className: "border rounded-lg p-4 mb-4" },
                react_2["default"].createElement("h2", { className: "font-semibold text-lg mb-2" }, "Ringkasan Pilihan"),
                react_2["default"].createElement("div", { className: "mb-1 text-primary" },
                    react_2["default"].createElement("b", null, "Customer:"),
                    " ",
                    selectedCustomer
                        ? selectedCustomer.name + " (" + selectedCustomer.phone + ")"
                        : "" + data.customer_name + (data.customer_phone ? " (" + data.customer_phone + ")" : "")),
                data.car_plate_number && (react_2["default"].createElement("div", { className: "mb-1 text-primary" },
                    react_2["default"].createElement("b", null, "Mobil:"),
                    " ",
                    data.car_plate_number,
                    " ",
                    data.car_model && "- " + data.car_model)))))));
});
exports["default"] = CreatePurchasedPacketForm;
