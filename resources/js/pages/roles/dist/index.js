"use strict";
exports.__esModule = true;
var heading_1 = require("@/components/heading");
var data_table_1 = require("@/components/ui/data-table");
var modal_1 = require("@/components/ui/modal");
var app_layout_1 = require("@/layouts/app-layout");
var react_1 = require("@inertiajs/react");
var date_fns_1 = require("date-fns");
var locale_1 = require("date-fns/locale");
var react_2 = require("react");
var role_form_1 = require("./forms/role-form");
var button_1 = require("@/components/ui/button");
var lucide_react_1 = require("lucide-react");
var alert_dialog_1 = require("@/components/ui/alert-dialog");
var badge_1 = require("@/components/ui/badge");
var dropdown_menu_1 = require("@/components/ui/dropdown-menu");
function RoleIndex() {
    var _a = react_1.usePage().props, roles = _a.roles, permissions = _a.permissions;
    var pagination = roles;
    var _b = react_2.useState(pagination.per_page || 10), perPage = _b[0], setPerPage = _b[1];
    var _c = react_2.useState(false), isCreateModalOpen = _c[0], setIsCreateModalOpen = _c[1];
    var _d = react_2.useState(false), isEditModalOpen = _d[0], setIsEditModalOpen = _d[1];
    var _e = react_2.useState(false), isDeleteAlertOpen = _e[0], setIsDeleteAlertOpen = _e[1];
    var _f = react_2.useState(null), selectedRole = _f[0], setSelectedRole = _f[1];
    var breadcrumbs = [
        { title: "Roles", href: route("roles.index") },
    ];
    var columns = [
        {
            accessorKey: "index",
            header: "No",
            cell: function (row) { return row.row.index + 1; }
        },
        { accessorKey: "name", header: "Nama Role" },
        {
            accessorKey: "permissions",
            header: "Permissions",
            cell: function (_a) {
                var row = _a.row;
                var permissions = row.original.permissions;
                return (React.createElement("div", { className: "flex flex-wrap gap-1" }, permissions.length > 0 ? (permissions.map(function (permission) { return (React.createElement(badge_1.Badge, { key: permission.id, variant: "secondary" }, permission.name)); })) : (React.createElement("span", { className: "text-xs text-muted-foreground" }, "No Permissions"))));
            }
        },
        {
            accessorKey: "created_at",
            header: "Tanggal Dibuat",
            cell: function (_a) {
                var row = _a.row;
                var date = new Date(row.getValue("created_at"));
                var formattedDate = date_fns_1.format(date, "dd MMMM yyyy, HH:mm", {
                    locale: locale_1.id
                });
                return React.createElement("div", { className: "text-left text-sm" }, formattedDate);
            }
        },
        {
            accessorKey: "actions",
            header: "Actions",
            cell: function (_a) {
                var row = _a.row;
                return (React.createElement("div", { className: "flex flex-row gap-2" },
                    React.createElement(React.Fragment, null,
                        React.createElement(button_1.Button, { size: "icon", variant: "outline", onClick: function () {
                                setSelectedRole(row.original);
                                setIsEditModalOpen(true);
                            } },
                            React.createElement(lucide_react_1.Edit, null)),
                        row.original.name !== "super-admin" && (React.createElement(button_1.Button, { size: "icon", variant: "destructive", onClick: function () {
                                setSelectedRole(row.original);
                                setIsDeleteAlertOpen(true);
                            } },
                            React.createElement(lucide_react_1.Trash, null))))));
            }
        },
    ];
    function handleDelete(roleId) {
        react_1.router["delete"](route("roles.destroy", roleId), {
            onSuccess: function () { return setIsDeleteAlertOpen(false); },
            preserveScroll: true
        });
    }
    var handlePageChange = function (page) {
        react_1.router.get(route("roles.index"), { page: page, per_page: perPage }, { preserveState: true });
    };
    var handlePerPageChange = function (newPerPage) {
        setPerPage(newPerPage);
        react_1.router.get(route("roles.index"), { page: 1, per_page: newPerPage }, { preserveState: true });
    };
    return (React.createElement(app_layout_1["default"], { breadcrumbs: breadcrumbs },
        React.createElement(react_1.Head, { title: "Roles" }),
        React.createElement("div", { className: "flex h-full flex-1 flex-col gap-4 rounded-xl p-4 shadow-sme" },
            React.createElement("div", { className: "flex justify-between items-center" },
                React.createElement(heading_1["default"], { title: "Manajemen Roles", description: "Kelola semua role dan permission yang terhubung." }),
                React.createElement(button_1.Button, { onClick: function () { return setIsCreateModalOpen(true); } }, "Tambah Role")),
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
                React.createElement("div", null,
                    React.createElement(data_table_1.DataTable, { columns: columns, data: pagination.data })))),
        React.createElement(modal_1.Modal, { open: isCreateModalOpen, onClose: function () { return setIsCreateModalOpen(false); } },
            React.createElement(modal_1.ModalHeader, { title: "Tambah Role Baru" }),
            React.createElement(role_form_1["default"], { availablePermissions: permissions, onSuccess: function () { return setIsCreateModalOpen(false); }, onCancel: function () { return setIsCreateModalOpen(false); } })),
        React.createElement(modal_1.Modal, { open: isEditModalOpen, onClose: function () { return setIsEditModalOpen(false); } },
            React.createElement(modal_1.ModalHeader, { title: "Edit Role: " + (selectedRole === null || selectedRole === void 0 ? void 0 : selectedRole.name) }),
            React.createElement(role_form_1["default"], { role: selectedRole, availablePermissions: permissions, onSuccess: function () { return setIsEditModalOpen(false); }, onCancel: function () { return setIsEditModalOpen(false); } })),
        React.createElement(alert_dialog_1.AlertDialog, { open: isDeleteAlertOpen, onOpenChange: setIsDeleteAlertOpen },
            React.createElement(alert_dialog_1.AlertDialogContent, null,
                React.createElement(alert_dialog_1.AlertDialogHeader, null,
                    React.createElement(alert_dialog_1.AlertDialogTitle, null, "Apakah Anda Yakin?"),
                    React.createElement(alert_dialog_1.AlertDialogDescription, null,
                        "Anda akan menghapus role",
                        " ",
                        React.createElement("strong", null, selectedRole === null || selectedRole === void 0 ? void 0 : selectedRole.name),
                        ". Setelah dihapus, data tidak dapat dikembalikan dan semua user yang memiliki role ini akan kehilangan hak aksesnya.")),
                React.createElement(alert_dialog_1.AlertDialogFooter, null,
                    React.createElement(button_1.Button, { variant: "secondary", onClick: function () { return setIsDeleteAlertOpen(false); } }, "Batal"),
                    React.createElement(button_1.Button, { variant: "destructive", onClick: function () {
                            if (selectedRole === null || selectedRole === void 0 ? void 0 : selectedRole.id) {
                                handleDelete(selectedRole.id);
                            }
                        } }, "Ya, Hapus Role"))))));
}
exports["default"] = RoleIndex;
