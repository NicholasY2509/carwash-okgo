"use strict";
exports.__esModule = true;
var heading_1 = require("@/components/heading");
var button_1 = require("@/components/ui/button");
var modal_1 = require("@/components/ui/modal");
var app_layout_1 = require("@/layouts/app-layout");
var react_1 = require("@inertiajs/react");
var lucide_react_1 = require("lucide-react");
var react_2 = require("react");
var data_table_1 = require("@/components/ui/data-table");
var product_form_1 = require("./forms/product-form");
var breadcrumbs = [
    {
        title: "Products",
        href: "/products"
    },
];
function ProductIndex() {
    var props = react_1.usePage().props;
    var products = props.products;
    var pagination = props.pagination;
    var _a = react_2.useState(false), isModalOpen = _a[0], setIsModalOpen = _a[1];
    var _b = react_2.useState(false), isEditModalOpen = _b[0], setIsEditModalOpen = _b[1];
    var _c = react_2.useState(null), selectedProduct = _c[0], setSelectedProduct = _c[1];
    var columns = [
        { accessorKey: "name", header: "Name" },
        { accessorKey: "description", header: "Description" },
        {
            accessorKey: "price",
            header: "Price",
            cell: function (info) {
                return new Intl.NumberFormat("id-ID", {
                    style: "currency",
                    currency: "IDR",
                    minimumFractionDigits: 0
                }).format(info.getValue());
            }
        },
        {
            accessorKey: "actions",
            header: "Actions",
            cell: function (row) { return (React.createElement("div", { className: "flex flex-row gap-2" },
                React.createElement(button_1.Button, { size: "icon", variant: "outline", onClick: function () {
                        setIsEditModalOpen(true);
                        setSelectedProduct(row.row.original);
                    } },
                    React.createElement(lucide_react_1.Edit, null)),
                React.createElement(button_1.Button, { size: "icon", variant: "destructive", onClick: function () {
                        var productId = row.row.original.id;
                    } },
                    React.createElement(lucide_react_1.Trash, null)))); }
        },
    ];
    return (React.createElement(app_layout_1["default"], null,
        React.createElement(react_1.Head, { title: "Products" }),
        React.createElement("div", { className: "flex h-full flex-1 flex-col gap-4 rounded-xl p-4" },
            React.createElement("div", { className: "flex justify-between" },
                React.createElement(heading_1["default"], { title: "Daftar Produk", description: "Lihat dan edit produk." }),
                React.createElement(button_1.Button, { variant: "default", onClick: function () { return setIsModalOpen(true); } },
                    "Tambah Produk ",
                    React.createElement(lucide_react_1.Plus, null))),
            React.createElement(data_table_1.DataTable, { columns: columns, data: products }),
            pagination && (React.createElement("div", { className: "flex justify-between items-center text-sm text-muted-foreground" },
                React.createElement("div", null,
                    "Showing",
                    " ",
                    (pagination.current_page - 1) *
                        pagination.per_page +
                        1,
                    " ",
                    "to",
                    " ",
                    Math.min(pagination.current_page * pagination.per_page, pagination.total),
                    " ",
                    "of ",
                    pagination.total,
                    " products"),
                React.createElement("div", null,
                    "Page ",
                    pagination.current_page,
                    " of",
                    " ",
                    pagination.last_page)))),
        React.createElement(modal_1.Modal, { open: isModalOpen, onClose: function () { return setIsModalOpen(false); } },
            React.createElement(modal_1.ModalHeader, { title: "Tambah Produk" }),
            React.createElement(product_form_1["default"], { onSuccess: function () { return setIsModalOpen(false); }, onCancel: function () { return setIsModalOpen(false); } })),
        React.createElement(modal_1.Modal, { open: isEditModalOpen, onClose: function () { return setIsEditModalOpen(false); } },
            React.createElement(modal_1.ModalHeader, { title: "Edit Produk" }),
            selectedProduct && (React.createElement(product_form_1["default"], { product: selectedProduct, onSuccess: function () { return setIsEditModalOpen(false); }, onCancel: function () { return setIsEditModalOpen(false); } })))));
}
exports["default"] = ProductIndex;
