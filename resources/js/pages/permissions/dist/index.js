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
var permission_form_1 = require("./forms/permission-form");
var button_1 = require("@/components/ui/button");
var lucide_react_1 = require("lucide-react");
var alert_dialog_1 = require("@/components/ui/alert-dialog");
var dropdown_menu_1 = require("@/components/ui/dropdown-menu");
function PermissionIndex() {
    var props = react_1.usePage().props;
    var pagination = props.permissions;
    var _a = react_2.useState(pagination.per_page || 10), perPage = _a[0], setPerPage = _a[1];
    var _b = react_2.useState(false), isModalOpen = _b[0], setIsModalOpen = _b[1];
    var _c = react_2.useState(false), isEditModalOpen = _c[0], setIsEditModalOpen = _c[1];
    var _d = react_2.useState(false), isDeleteAlertOpen = _d[0], setIsDeleteAlertOpen = _d[1];
    var _e = react_2.useState(null), selectedPermission = _e[0], setSelectedPermission = _e[1];
    var breadcrumbs = [
        { title: "Permissions", href: "/permissions" },
    ];
    var columns = [
        {
            accessorKey: "index",
            header: "No",
            cell: function (row) { return row.row.index + 1; }
        },
        { accessorKey: "name", header: "Name" },
        {
            accessorKey: "created_at",
            header: "Tanggal Dibuat",
            cell: function (_a) {
                var row = _a.row;
                var date = new Date(row.getValue("created_at"));
                var formattedDate = date_fns_1.format(date, "dd MMMM yyyy, HH:mm", {
                    locale: locale_1.id
                });
                return React.createElement("div", { className: "text-left" }, formattedDate);
            }
        },
        {
            accessorKey: "actions",
            header: "Actions",
            cell: function (info) { return (React.createElement("div", { className: "flex flex-row gap-1" },
                React.createElement(button_1.Button, { size: "icon", variant: "outline", onClick: function () {
                        setIsEditModalOpen(true);
                        setSelectedPermission(info.row.original);
                    } },
                    React.createElement(lucide_react_1.Edit, null)),
                React.createElement(button_1.Button, { size: "icon", variant: "destructive", onClick: function () {
                        setSelectedPermission(info.row.original);
                        setIsDeleteAlertOpen(true);
                    } },
                    React.createElement(lucide_react_1.Trash, null)))); }
        },
    ];
    function handleDelete(id) {
        react_1.router["delete"](route("permissions.destroy", id), {
            onSuccess: function () { return setIsDeleteAlertOpen(false); }
        });
    }
    var handlePageChange = function (page) {
        react_1.router.get(route("permissions.index"), { page: page, per_page: perPage }, { preserveState: true });
    };
    var handlePerPageChange = function (newPerPage) {
        setPerPage(newPerPage);
        react_1.router.get(route("permissions.index"), { page: 1, per_page: newPerPage }, { preserveState: true });
    };
    return (React.createElement(app_layout_1["default"], { breadcrumbs: breadcrumbs },
        React.createElement(react_1.Head, { title: "Permissions" }),
        React.createElement("div", { className: "flex h-full flex-1 flex-col gap-4 rounded-xl p-4" },
            React.createElement("div", { className: "flex justify-between" },
                React.createElement(heading_1["default"], { title: "Permissions", description: "List dari semua permissions" }),
                React.createElement(button_1.Button, { onClick: function () { return setIsModalOpen(true); } }, "Tambah Permission")),
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
        React.createElement(modal_1.Modal, { open: isModalOpen, onClose: function () { return setIsModalOpen(false); } },
            React.createElement(modal_1.ModalHeader, { title: "Tambah Permission" }),
            React.createElement(permission_form_1["default"], { onSuccess: function () { return setIsModalOpen(false); }, onCancel: function () { return setIsModalOpen(false); } })),
        React.createElement(modal_1.Modal, { open: isEditModalOpen, onClose: function () { return setIsEditModalOpen(false); } },
            React.createElement(modal_1.ModalHeader, { title: "Edit Permission" }),
            React.createElement(permission_form_1["default"], { permission: selectedPermission, onSuccess: function () { return setIsEditModalOpen(false); }, onCancel: function () { return setIsEditModalOpen(false); } })),
        React.createElement(alert_dialog_1.AlertDialog, { open: isDeleteAlertOpen },
            React.createElement(alert_dialog_1.AlertDialogContent, null,
                React.createElement(alert_dialog_1.AlertDialogHeader, null,
                    React.createElement(alert_dialog_1.AlertDialogTitle, null,
                        "Hapus Permission",
                        " ",
                        React.createElement("strong", null, selectedPermission === null || selectedPermission === void 0 ? void 0 : selectedPermission.name),
                        " ?"),
                    React.createElement(alert_dialog_1.AlertDialogDescription, null,
                        "Anda akan menghapus permission",
                        " ",
                        React.createElement("strong", null, selectedPermission === null || selectedPermission === void 0 ? void 0 : selectedPermission.name))),
                React.createElement(alert_dialog_1.AlertDialogFooter, null,
                    React.createElement(button_1.Button, { variant: "secondary", onClick: function () { return setIsDeleteAlertOpen(false); } }, "Cancel"),
                    React.createElement(button_1.Button, { type: "submit", variant: "destructive", onClick: function () {
                            if (selectedPermission === null || selectedPermission === void 0 ? void 0 : selectedPermission.id) {
                                handleDelete(selectedPermission.id);
                            }
                        } }, "Hapus"))))));
}
exports["default"] = PermissionIndex;
