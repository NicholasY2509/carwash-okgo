"use strict";
exports.__esModule = true;
var heading_1 = require("@/components/heading");
var button_1 = require("@/components/ui/button");
var sheet_1 = require("@/components/ui/sheet");
var app_layout_1 = require("@/layouts/app-layout");
var react_1 = require("@inertiajs/react");
var lucide_react_1 = require("lucide-react");
var react_2 = require("react");
var data_table_1 = require("@/components/ui/data-table");
var staff_form_1 = require("./forms/staff-form");
var dropdown_menu_1 = require("@/components/ui/dropdown-menu");
var input_1 = require("@/components/ui/input");
var use_debounce_1 = require("@/hooks/use-debounce");
var breadcrumbs = [{ title: "Staff", href: "/staffs" }];
function StaffIndex() {
    var props = react_1.usePage().props;
    var staffs = props.staffs.data;
    var pagination = props.staffs;
    var staffFormRef = react_2.useRef(null);
    var _a = react_2.useState(false), isSheetOpen = _a[0], setIsSheetOpen = _a[1];
    var _b = react_2.useState(false), isSheetEditOpen = _b[0], setIsSheetEditOpen = _b[1];
    var _c = react_2.useState(null), selectedStaff = _c[0], setSelectedStaff = _c[1];
    var _d = react_2.useState(pagination.per_page || 10), perPage = _d[0], setPerPage = _d[1];
    var _e = react_2.useState(""), searchQuery = _e[0], setSearchQuery = _e[1];
    var debouncedSearchQuery = use_debounce_1.useDebounce(searchQuery, 500);
    var columns = [
        {
            accessorKey: "index",
            header: "No",
            cell: function (_a) {
                var row = _a.row;
                return (React.createElement("div", { className: "text-center" }, row.index + 1 + (pagination.current_page - 1) * pagination.per_page));
            }
        },
        { accessorKey: "nik", header: "NIK" },
        { accessorKey: "full_name", header: "Nama" },
        { accessorKey: "phone", header: "No Telepon" },
        { accessorKey: "work_position.name", header: "Posisi Kerja" },
        {
            accessorKey: "user.email",
            header: "Akun User",
            cell: function (_a) {
                var row = _a.row;
                var user = row.original.user;
                return user ? (user.email) : (React.createElement("span", { className: "text-gray-500" }, "Tidak ada"));
            }
        },
        {
            accessorKey: "actions",
            header: "Aksi",
            cell: function (_a) {
                var row = _a.row;
                return (React.createElement(button_1.Button, { size: "icon", variant: "outline", onClick: function () {
                        setIsSheetEditOpen(true);
                        setSelectedStaff(row.original);
                    } },
                    React.createElement(lucide_react_1.Edit, { className: "h-4 w-4" })));
            }
        },
    ];
    var handlePageChange = function (page) {
        react_1.router.get(route("staffs.index"), { page: page, per_page: perPage, search: debouncedSearchQuery }, { preserveState: true });
    };
    var handlePerPageChange = function (newPerPage) {
        setPerPage(newPerPage);
        react_1.router.get(route("staffs.index"), { page: 1, per_page: newPerPage, search: debouncedSearchQuery }, { preserveState: true });
    };
    react_2.useEffect(function () {
        react_1.router.get(route("staffs.index"), { page: 1, per_page: perPage, search: debouncedSearchQuery }, { preserveState: true });
    }, [debouncedSearchQuery]);
    var clearSearch = function () {
        setSearchQuery("");
    };
    return (React.createElement(app_layout_1["default"], { breadcrumbs: breadcrumbs },
        React.createElement(react_1.Head, { title: "Staffs" }),
        React.createElement("div", { className: "flex h-full flex-1 flex-col gap-4 rounded-xl p-4" },
            React.createElement("div", { className: "flex justify-between" },
                React.createElement(heading_1["default"], { title: "Staff", description: "Data dari karyawan." }),
                React.createElement(button_1.Button, { variant: "default", size: "lg", onClick: function () {
                        setSelectedStaff(null);
                        setIsSheetOpen(true);
                    } },
                    "Tambah Staff ",
                    React.createElement(lucide_react_1.Plus, { className: "ml-2 h-4 w-4" }))),
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
                            React.createElement(lucide_react_1.Search, { className: "absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-muted-foreground" }),
                            React.createElement(input_1.Input, { placeholder: "Cari nama/NIK/telepon/posisi...", value: searchQuery, onChange: function (e) { return setSearchQuery(e.target.value); }, className: "pl-10 pr-10" }),
                            searchQuery && (React.createElement(button_1.Button, { variant: "ghost", size: "sm", onClick: clearSearch, className: "absolute right-1 top-1/2 transform -translate-y-1/2 h-6 w-6 p-0" },
                                React.createElement(lucide_react_1.X, { className: "h-4 w-4" })))))),
                React.createElement(data_table_1.DataTable, { data: staffs, columns: columns, getRowId: function (row) { var _a; return (_a = row.id) === null || _a === void 0 ? void 0 : _a.toString(); } }),
                React.createElement("div", { className: "text-sm text-muted-foreground mt-2" },
                    "Total: ",
                    pagination.total,
                    " data"))),
        React.createElement(sheet_1.Sheet, { open: isSheetOpen, onOpenChange: setIsSheetOpen },
            React.createElement(sheet_1.SheetContent, null,
                React.createElement(sheet_1.SheetHeader, null,
                    React.createElement(sheet_1.SheetTitle, null, "Tambah Staff"),
                    React.createElement(sheet_1.SheetDescription, null, "Masukkan informasi dari staff yang akan ditambahkan.")),
                React.createElement(staff_form_1["default"], { ref: staffFormRef, onCancel: function () { return setIsSheetOpen(false); }, onSuccess: function () { return setIsSheetOpen(false); } }),
                React.createElement(sheet_1.SheetFooter, { className: "pt-4" },
                    React.createElement(button_1.Button, { variant: "secondary", onClick: function () { return setIsSheetOpen(false); } }, "Batal"),
                    React.createElement(button_1.Button, { variant: "default", onClick: function () { var _a; return (_a = staffFormRef.current) === null || _a === void 0 ? void 0 : _a.submit(); } }, "Simpan Data Karyawan")))),
        React.createElement(sheet_1.Sheet, { open: isSheetEditOpen, onOpenChange: setIsSheetEditOpen },
            React.createElement(sheet_1.SheetContent, null,
                React.createElement(sheet_1.SheetHeader, null,
                    React.createElement(sheet_1.SheetTitle, null, "Edit Staff"),
                    React.createElement(sheet_1.SheetDescription, null, "Ubah informasi dari staff.")),
                React.createElement(staff_form_1["default"], { ref: staffFormRef, staff: selectedStaff, onCancel: function () { return setIsSheetEditOpen(false); }, onSuccess: function () { return setIsSheetEditOpen(false); } }),
                React.createElement(sheet_1.SheetFooter, { className: "pt-4" },
                    React.createElement(button_1.Button, { variant: "secondary", onClick: function () { return setIsSheetEditOpen(false); } }, "Batal"),
                    React.createElement(button_1.Button, { variant: "default", onClick: function () { var _a; return (_a = staffFormRef.current) === null || _a === void 0 ? void 0 : _a.submit(); } }, "Update Data Karyawan"))))));
}
exports["default"] = StaffIndex;
