"use strict";
exports.__esModule = true;
var heading_1 = require("@/components/heading");
var button_1 = require("@/components/ui/button");
var data_table_1 = require("@/components/ui/data-table");
var modal_1 = require("@/components/ui/modal");
var app_layout_1 = require("@/layouts/app-layout");
var react_1 = require("@inertiajs/react");
var lucide_react_1 = require("lucide-react");
var react_2 = require("react");
var work_position_form_1 = require("./forms/work-position-form");
var dropdown_menu_1 = require("@/components/ui/dropdown-menu");
var input_1 = require("@/components/ui/input");
var lucide_react_2 = require("lucide-react");
var use_debounce_1 = require("@/hooks/use-debounce");
var react_3 = require("@inertiajs/react");
var breadcrumbs = [
    { title: "Work Position", href: "/work-position" },
];
function Stalls() {
    var props = react_1.usePage().props;
    var workPositions = props.workPositions.data;
    var pagination = props.workPositions;
    var columns = [
        { accessorKey: "name", header: "Name" },
        { accessorKey: "description", header: "Description" },
        {
            accessorKey: "actions",
            header: "Actions",
            cell: function (row) { return (React.createElement(button_1.Button, { size: "icon", variant: "outline", onClick: function () {
                    setIsModalEditOpen(true);
                    setSelectedWorkPosition(row.row.original);
                } },
                React.createElement(lucide_react_1.Edit, null))); }
        },
    ];
    var _a = react_2.useState(false), isModalOpen = _a[0], setIsModalOpen = _a[1];
    var _b = react_2.useState(false), isModalEditOpen = _b[0], setIsModalEditOpen = _b[1];
    var _c = react_2.useState(null), selectedWorkPosition = _c[0], setSelectedWorkPosition = _c[1];
    var _d = react_2.useState(pagination.per_page || 10), perPage = _d[0], setPerPage = _d[1];
    var _e = react_2.useState(""), searchQuery = _e[0], setSearchQuery = _e[1];
    var debouncedSearchQuery = use_debounce_1.useDebounce(searchQuery, 500);
    var handlePageChange = function (page) {
        react_3.router.get(route("work-positions.index"), { page: page, per_page: perPage, search: debouncedSearchQuery }, { preserveState: true });
    };
    var handlePerPageChange = function (newPerPage) {
        setPerPage(newPerPage);
        react_3.router.get(route("work-positions.index"), { page: 1, per_page: newPerPage, search: debouncedSearchQuery }, { preserveState: true });
    };
    react_2.useEffect(function () {
        react_3.router.get(route("work-positions.index"), { page: 1, per_page: perPage, search: debouncedSearchQuery }, { preserveState: true });
    }, [debouncedSearchQuery]);
    var clearSearch = function () {
        setSearchQuery("");
    };
    return (React.createElement(app_layout_1["default"], { breadcrumbs: breadcrumbs },
        React.createElement(react_1.Head, { title: "Work Position" }),
        React.createElement("div", { className: "flex h-full flex-1 flex-col gap-4 rounded-xl p-4" },
            React.createElement("div", { className: "flex justify-between" },
                React.createElement(heading_1["default"], { title: "Posisi Kerja", description: "Lihat dan edit posisi kerja yang ada." }),
                React.createElement(button_1.Button, { variant: "default", size: "lg", onClick: function () { return setIsModalOpen(true); } },
                    "Tambah Posisi Kerja ",
                    React.createElement(lucide_react_1.Plus, null))),
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
                            React.createElement(input_1.Input, { placeholder: "Cari nama/desk...", value: searchQuery, onChange: function (e) { return setSearchQuery(e.target.value); }, className: "pl-10 pr-10" }),
                            searchQuery && (React.createElement(button_1.Button, { variant: "ghost", size: "sm", onClick: clearSearch, className: "absolute right-1 top-1/2 transform -translate-y-1/2 h-6 w-6 p-0" },
                                React.createElement(lucide_react_2.X, { className: "h-4 w-4" })))))),
                React.createElement(data_table_1.DataTable, { columns: columns, data: workPositions, getRowId: function (row) { var _a; return (_a = row.id) === null || _a === void 0 ? void 0 : _a.toString(); } }),
                React.createElement("div", { className: "text-sm text-muted-foreground mt-2" },
                    "Total: ",
                    pagination.total,
                    " data"))),
        React.createElement(modal_1.Modal, { open: isModalOpen, onClose: function () { return setIsModalOpen(false); } },
            React.createElement(modal_1.ModalHeader, { title: "Tambah Posisi Kerja" }),
            React.createElement(work_position_form_1["default"], { onCancel: function () { return setIsModalOpen(false); }, onSuccess: function () { return setIsModalOpen(false); } })),
        React.createElement(modal_1.Modal, { open: isModalEditOpen, onClose: function () { return setIsModalEditOpen(false); } },
            React.createElement(modal_1.ModalHeader, { title: "Edit Posisi Kerja" }),
            React.createElement(work_position_form_1["default"], { workPosition: selectedWorkPosition, onCancel: function () { return setIsModalEditOpen(false); }, onSuccess: function () { return setIsModalEditOpen(false); } }))));
}
exports["default"] = Stalls;
