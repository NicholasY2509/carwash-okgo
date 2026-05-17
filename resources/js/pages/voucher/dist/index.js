"use strict";
exports.__esModule = true;
var heading_1 = require("@/components/heading");
var button_1 = require("@/components/ui/button");
var modal_1 = require("@/components/ui/modal");
var select_1 = require("@/components/ui/select");
var label_1 = require("@/components/ui/label");
var input_1 = require("@/components/ui/input");
var app_layout_1 = require("@/layouts/app-layout");
var react_1 = require("@inertiajs/react");
var date_fns_1 = require("date-fns");
var locale_1 = require("date-fns/locale");
var lucide_react_1 = require("lucide-react");
var react_2 = require("react");
var use_debounce_1 = require("@/hooks/use-debounce");
var create_voucher_1 = require("./forms/create-voucher");
var data_table_1 = require("@/components/ui/data-table");
var badge_1 = require("@/components/ui/badge");
var dropdown_menu_1 = require("@/components/ui/dropdown-menu");
var edit_voucher_modal_1 = require("./forms/edit-voucher-modal");
var sonner_1 = require("sonner");
function VoucherIndex() {
    var props = react_1.usePage().props;
    var voucher_types = props.voucherTypes;
    var vouchers = props.vouchers.data;
    var pagination = props.vouchers;
    var _a = react_2.useState(false), isModalOpen = _a[0], setIsModalOpen = _a[1];
    var _b = react_2.useState(false), isEditModalOpen = _b[0], setIsEditModalOpen = _b[1];
    var _c = react_2.useState(pagination.per_page || 10), perPage = _c[0], setPerPage = _c[1];
    var _d = react_2.useState("all"), selectedVoucherType = _d[0], setSelectedVoucherType = _d[1];
    var _e = react_2.useState("all"), selectedStatus = _e[0], setSelectedStatus = _e[1];
    var _f = react_2.useState(""), searchQuery = _f[0], setSearchQuery = _f[1];
    var debouncedSearchQuery = use_debounce_1.useDebounce(searchQuery, 500);
    var breadcrumbs = [
        {
            title: "Voucher",
            href: "/vouchers"
        },
    ];
    // Status options - use "all" instead of empty string
    var statusOptions = [
        { value: "all", label: "Semua Status" },
        { value: "Active", label: "Active" },
        { value: "Sold", label: "Sold" },
        { value: "Redeemed", label: "Redeemed" },
        { value: "Expired", label: "Expired" },
    ];
    var columns = [
        {
            id: "index",
            header: "No",
            cell: function (_a) {
                var row = _a.row;
                return (React.createElement("span", null, row.index +
                    1 +
                    (pagination.current_page - 1) * pagination.per_page));
            }
        },
        {
            accessorKey: "serial_number",
            header: "Nomor Seri"
        },
        {
            accessorKey: "sales_code",
            header: "Kode Sales",
            cell: function (_a) {
                var row = _a.row;
                var salesCode = row.getValue("sales_code");
                return salesCode || "-";
            }
        },
        {
            accessorKey: "voucher_type.name",
            header: "Tipe Voucher"
        },
        {
            accessorKey: "status",
            header: "Status",
            cell: function (_a) {
                var row = _a.row;
                var status = row.getValue("status");
                var getVariant = function () {
                    var lowerStatus = status.toLowerCase();
                    if (lowerStatus === "redeemed")
                        return "destructive";
                    if (lowerStatus === "active" || lowerStatus === "available")
                        return "default";
                    return "secondary";
                };
                return React.createElement(badge_1.Badge, { variant: getVariant() }, status);
            }
        },
        {
            accessorKey: "redeemed_at",
            header: "Tanggal Redeem",
            cell: function (_a) {
                var row = _a.row;
                var redeemedAt = row.getValue("redeemed_at");
                if (!redeemedAt) {
                    return React.createElement("span", { className: "text-muted-foreground" }, "-");
                }
                var date = new Date(redeemedAt);
                var formattedDate = date_fns_1.format(date, "dd MMM yyyy", {
                    locale: locale_1.id
                });
                return React.createElement("div", { className: "text-left" }, formattedDate);
            }
        },
    ];
    // Handle search changes
    react_2.useEffect(function () {
        var params = {
            page: 1,
            per_page: perPage
        };
        if (selectedVoucherType !== "all") {
            params.voucher_type = selectedVoucherType;
        }
        if (selectedStatus !== "all") {
            params.status = selectedStatus;
        }
        if (debouncedSearchQuery) {
            params.search = debouncedSearchQuery;
        }
        react_1.router.get(route("vouchers.index"), params, { preserveState: true });
    }, [debouncedSearchQuery]);
    react_2.useEffect(function () {
        if (props.flash && props.flash.success) {
            sonner_1.toast.success(props.flash.success);
        }
    }, [props.flash && props.flash.success]);
    var handlePageChange = function (page) {
        var params = {
            page: page,
            per_page: perPage
        };
        if (selectedVoucherType !== "all") {
            params.voucher_type = selectedVoucherType;
        }
        if (selectedStatus !== "all") {
            params.status = selectedStatus;
        }
        if (debouncedSearchQuery) {
            params.search = debouncedSearchQuery;
        }
        react_1.router.get(route("vouchers.index"), params, { preserveState: true });
    };
    var handlePerPageChange = function (newPerPage) {
        setPerPage(newPerPage);
        var params = {
            page: 1,
            per_page: newPerPage
        };
        if (selectedVoucherType !== "all") {
            params.voucher_type = selectedVoucherType;
        }
        if (selectedStatus !== "all") {
            params.status = selectedStatus;
        }
        if (debouncedSearchQuery) {
            params.search = debouncedSearchQuery;
        }
        react_1.router.get(route("vouchers.index"), params, { preserveState: true });
    };
    var handleVoucherTypeChange = function (value) {
        setSelectedVoucherType(value);
        var params = {
            page: 1,
            per_page: perPage
        };
        if (value !== "all") {
            params.voucher_type = value;
        }
        if (selectedStatus !== "all") {
            params.status = selectedStatus;
        }
        if (debouncedSearchQuery) {
            params.search = debouncedSearchQuery;
        }
        react_1.router.get(route("vouchers.index"), params, { preserveState: true });
    };
    var handleStatusChange = function (value) {
        setSelectedStatus(value);
        var params = {
            page: 1,
            per_page: perPage
        };
        if (selectedVoucherType !== "all") {
            params.voucher_type = selectedVoucherType;
        }
        if (value !== "all") {
            params.status = value;
        }
        if (debouncedSearchQuery) {
            params.search = debouncedSearchQuery;
        }
        react_1.router.get(route("vouchers.index"), params, { preserveState: true });
    };
    var clearFilters = function () {
        setSelectedVoucherType("all");
        setSelectedStatus("all");
        setSearchQuery("");
        react_1.router.get(route("vouchers.index"), { page: 1, per_page: perPage }, { preserveState: true });
    };
    var hasActiveFilters = selectedVoucherType !== "all" ||
        selectedStatus !== "all" ||
        searchQuery;
    return (React.createElement(app_layout_1["default"], { breadcrumbs: breadcrumbs },
        React.createElement(react_1.Head, { title: "Voucher" }),
        React.createElement("div", { className: "flex h-full flex-1 flex-col gap-4 rounded-xl p-4" },
            React.createElement("div", { className: "flex justify-between" },
                React.createElement(heading_1["default"], { title: "Voucher", description: "Tambahkan dan kelola daftar voucher yang tersedia." }),
                React.createElement("div", { className: "flex gap-2" },
                    React.createElement(button_1.Button, { variant: "default", onClick: function () { return setIsModalOpen(true); } },
                        "Tambah Voucher ",
                        React.createElement(lucide_react_1.Plus, { className: "ml-2 h-4 w-4" })),
                    React.createElement(button_1.Button, { variant: "secondary", onClick: function () { return setIsEditModalOpen(true); } }, "Edit"))),
            React.createElement("div", { className: "flex items-center gap-4 p-4 border rounded-lgc" },
                React.createElement("div", { className: "flex items-center gap-2" },
                    React.createElement(lucide_react_1.Filter, { className: "h-4 w-4 text-muted-foreground" }),
                    React.createElement(label_1.Label, { className: "text-sm font-medium" }, "Filter:")),
                React.createElement("div", { className: "flex items-center gap-2" },
                    React.createElement(label_1.Label, { htmlFor: "voucher-type", className: "text-sm" }, "Tipe Voucher:"),
                    React.createElement(select_1.Select, { value: selectedVoucherType, onValueChange: handleVoucherTypeChange },
                        React.createElement(select_1.SelectTrigger, { className: "w-[200px]" },
                            React.createElement(select_1.SelectValue, { placeholder: "Pilih tipe voucher" })),
                        React.createElement(select_1.SelectContent, null,
                            React.createElement(select_1.SelectItem, { value: "all" }, "Semua Tipe"),
                            voucher_types.map(function (type) { return (React.createElement(select_1.SelectItem, { key: type.id, value: type.id }, type.name)); })))),
                React.createElement("div", { className: "flex items-center gap-2" },
                    React.createElement(label_1.Label, { htmlFor: "status", className: "text-sm" }, "Status:"),
                    React.createElement(select_1.Select, { value: selectedStatus, onValueChange: handleStatusChange },
                        React.createElement(select_1.SelectTrigger, { className: "w-[150px]" },
                            React.createElement(select_1.SelectValue, { placeholder: "Pilih status" })),
                        React.createElement(select_1.SelectContent, null, statusOptions.map(function (option) { return (React.createElement(select_1.SelectItem, { key: option.value, value: option.value }, option.label)); })))),
                React.createElement("div", { className: "flex items-center gap-2" },
                    React.createElement("div", { className: "relative flex-1 max-w-md" },
                        React.createElement(lucide_react_1.Search, { className: "absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-muted-foreground" }),
                        React.createElement(input_1.Input, { placeholder: "Nomor seri/Kode Sales...", value: searchQuery, onChange: function (e) { return setSearchQuery(e.target.value); }, className: "pl-10 pr-10" }),
                        searchQuery && (React.createElement(button_1.Button, { variant: "ghost", size: "sm", onClick: function () { return setSearchQuery(""); }, className: "absolute right-1 top-1/2 transform -translate-y-1/2 h-6 w-6 p-0" },
                            React.createElement(lucide_react_1.X, { className: "h-4 w-4" }))))),
                hasActiveFilters && (React.createElement(button_1.Button, { variant: "outline", size: "sm", onClick: clearFilters, className: "ml-auto" },
                    React.createElement(lucide_react_1.X, { className: "h-4 w-4 mr-1" }),
                    "Bersihkan Filter"))),
            React.createElement("div", { className: "flex flex-col gap-2" },
                React.createElement("div", { className: "flex justify-between flex-row" },
                    React.createElement("div", { className: "flex items-center gap-2" },
                        React.createElement(button_1.Button, { variant: "outline", size: "sm", disabled: pagination.current_page === 1, onClick: function () {
                                return handlePageChange(pagination.current_page - 1);
                            } }, "Previous"),
                        React.createElement("span", { className: "mx-2 text-sm" },
                            "Halaman ",
                            pagination.current_page,
                            " dari",
                            " ",
                            pagination.last_page),
                        React.createElement(button_1.Button, { variant: "outline", size: "sm", disabled: pagination.current_page ===
                                pagination.last_page, onClick: function () {
                                return handlePageChange(pagination.current_page + 1);
                            } }, "Next")),
                    React.createElement("div", { className: "flex items-center gap-2 justify-end" },
                        React.createElement("span", { className: "text-sm" }, "Baris per halaman:"),
                        React.createElement(dropdown_menu_1.DropdownMenu, null,
                            React.createElement(dropdown_menu_1.DropdownMenuTrigger, { asChild: true },
                                React.createElement(button_1.Button, { variant: "outline", size: "sm", className: "min-w-[60px] justify-between" }, perPage)),
                            React.createElement(dropdown_menu_1.DropdownMenuContent, { align: "end" }, [5, 10, 20, 50, 100].map(function (size) { return (React.createElement(dropdown_menu_1.DropdownMenuItem, { key: size, onSelect: function () {
                                    return handlePerPageChange(size);
                                } }, size)); }))))),
                React.createElement(data_table_1.DataTable, { columns: columns, data: vouchers, getRowId: function (row) { var _a; return (_a = row.id) === null || _a === void 0 ? void 0 : _a.toString(); } }),
                React.createElement("div", { className: "text-sm text-muted-foreground mt-2" },
                    "Total: ",
                    pagination.total,
                    " data"))),
        React.createElement(modal_1.Modal, { open: isModalOpen, onClose: function () { return setIsModalOpen(false); } },
            React.createElement(modal_1.ModalHeader, { title: "Tambah Voucher" }),
            React.createElement(create_voucher_1["default"], { categories: voucher_types, onSuccess: function () { return setIsModalOpen(false); } })),
        React.createElement(edit_voucher_modal_1["default"], { open: isEditModalOpen, onClose: function () { return setIsEditModalOpen(false); }, voucherTypes: voucher_types, onSuccess: function () { return setIsEditModalOpen(false); } })));
}
exports["default"] = VoucherIndex;
