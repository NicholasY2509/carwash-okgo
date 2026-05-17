"use strict";
exports.__esModule = true;
var heading_1 = require("@/components/heading");
var button_1 = require("@/components/ui/button");
var data_table_1 = require("@/components/ui/data-table");
var app_layout_1 = require("@/layouts/app-layout");
var react_1 = require("@inertiajs/react");
var lucide_react_1 = require("lucide-react");
var dropdown_menu_1 = require("@/components/ui/dropdown-menu");
var input_1 = require("@/components/ui/input");
var lucide_react_2 = require("lucide-react");
var use_debounce_1 = require("@/hooks/use-debounce");
var react_2 = require("react");
function CustomerIndex() {
    var props = react_1.usePage().props;
    var customers = props.customers.data;
    var pagination = props.customers;
    var _a = react_2.useState(pagination.per_page || 10), perPage = _a[0], setPerPage = _a[1];
    var _b = react_2.useState(""), searchQuery = _b[0], setSearchQuery = _b[1];
    var debouncedSearchQuery = use_debounce_1.useDebounce(searchQuery, 500);
    var handlePageChange = function (page) {
        react_1.router.get(route("customers.index"), { page: page, per_page: perPage, search: debouncedSearchQuery }, { preserveState: true });
    };
    var handlePerPageChange = function (newPerPage) {
        setPerPage(newPerPage);
        react_1.router.get(route("customers.index"), { page: 1, per_page: newPerPage, search: debouncedSearchQuery }, { preserveState: true });
    };
    react_2.useEffect(function () {
        react_1.router.get(route("customers.index"), { page: 1, per_page: perPage, search: debouncedSearchQuery }, { preserveState: true });
    }, [debouncedSearchQuery]);
    var clearSearch = function () {
        setSearchQuery("");
    };
    var columns = [
        { accessorKey: "name", header: "Name" },
        { accessorKey: "phone", header: "Phone" },
        { accessorKey: "email", header: "Email" },
        {
            accessorKey: "actions",
            header: "Actions",
            cell: function (info) { return (React.createElement(React.Fragment, null,
                React.createElement(button_1.Button, { size: "icon", variant: "outline", onClick: function () {
                        var customerId = info.row.original.id;
                        react_1.router.visit(route("customers.show", customerId));
                    } },
                    React.createElement(lucide_react_1.InfoIcon, null)))); }
        },
    ];
    var breadcrumbs = [
        { title: "Customers", href: "/customers" },
    ];
    return (React.createElement(app_layout_1["default"], { breadcrumbs: breadcrumbs },
        React.createElement(react_1.Head, { title: "Customers" }),
        React.createElement("div", { className: "flex h-full flex-1 flex-col gap-4 rounded-xl p-4" },
            React.createElement("div", { className: "flex justify-between" },
                React.createElement(heading_1["default"], { title: "Daftar Customers", description: "Lihat Data Customer." })),
            React.createElement("div", { className: "flex flex-col gap-2" },
                React.createElement("div", { className: "flex justify-between flex-row" },
                    React.createElement("div", { className: "flex items-center gap-2" },
                        React.createElement(button_1.Button, { variant: "outline", size: "sm", disabled: pagination.current_page === 1, onClick: function () { return handlePageChange(pagination.current_page - 1); } }, "Previous"),
                        React.createElement("span", { className: "mx-2 text-sm" },
                            "Halaman ",
                            pagination.current_page,
                            " dari ",
                            pagination.last_page),
                        React.createElement(button_1.Button, { variant: "outline", size: "sm", disabled: pagination.current_page === pagination.last_page, onClick: function () { return handlePageChange(pagination.current_page + 1); } }, "Next")),
                    React.createElement("div", { className: "flex flex-row items-center gap-2" },
                        React.createElement("div", { className: "flex items-center gap-2 justify-end" },
                            React.createElement("span", { className: "text-sm" }, "Baris per halaman:"),
                            React.createElement(dropdown_menu_1.DropdownMenu, null,
                                React.createElement(dropdown_menu_1.DropdownMenuTrigger, { asChild: true },
                                    React.createElement(button_1.Button, { variant: "outline", size: "sm", className: "min-w-[60px] justify-between" }, perPage)),
                                React.createElement(dropdown_menu_1.DropdownMenuContent, { align: "end" }, [5, 10, 20, 50, 100].map(function (size) { return (React.createElement(dropdown_menu_1.DropdownMenuItem, { key: size, onSelect: function () { return handlePerPageChange(size); } }, size)); })))),
                        React.createElement("div", { className: "relative flex-1 max-w-md" },
                            React.createElement(lucide_react_2.Search, { className: "absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-muted-foreground" }),
                            React.createElement(input_1.Input, { placeholder: "Cari nama/telepon/email...", value: searchQuery, onChange: function (e) { return setSearchQuery(e.target.value); }, className: "pl-10 pr-10" }),
                            searchQuery && (React.createElement(button_1.Button, { variant: "ghost", size: "sm", onClick: clearSearch, className: "absolute right-1 top-1/2 transform -translate-y-1/2 h-6 w-6 p-0" },
                                React.createElement(lucide_react_2.X, { className: "h-4 w-4" })))))),
                React.createElement(data_table_1.DataTable, { columns: columns, data: customers, getRowId: function (row) { var _a; return (_a = row.id) === null || _a === void 0 ? void 0 : _a.toString(); } }),
                React.createElement("div", { className: "text-sm text-muted-foreground mt-2" },
                    "Total: ",
                    pagination.total,
                    " data")))));
}
exports["default"] = CustomerIndex;
