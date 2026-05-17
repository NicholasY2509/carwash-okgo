"use strict";
var __assign =
    (this && this.__assign) ||
    function () {
        __assign =
            Object.assign ||
            function (t) {
                for (var s, i = 1, n = arguments.length; i < n; i++) {
                    s = arguments[i];
                    for (var p in s)
                        if (Object.prototype.hasOwnProperty.call(s, p))
                            t[p] = s[p];
                }
                return t;
            };
        return __assign.apply(this, arguments);
    };
exports.__esModule = true;
exports.AppSidebar = void 0;
var nav_footer_1 = require("@/components/nav-footer");
var nav_main_1 = require("@/components/nav-main");
var nav_user_1 = require("@/components/nav-user");
var sidebar_1 = require("@/components/ui/sidebar");
var react_1 = require("@inertiajs/react");
var lucide_react_1 = require("lucide-react");
var app_logo_1 = require("./app-logo");
var use_permission_1 = require("@/hooks/use-permission");
var react_2 = require("react");
var footerNavItems = [];
var allNavItems = {
    navMain: [
        {
            title: "Dashboard",
            url: "/dashboard",
            icon: lucide_react_1.Home,
        },
        {
            title: "Pencucian Mobil",
            url: "/car-washes/create",
            icon: lucide_react_1.Car,
            permission: "master car wash",
        },
        {
            title: "Pembelian Voucher",
            url: "/purchased-packets/create",
            icon: lucide_react_1.Ticket,
            permission: "master buy voucher",
        },
        {
            title: "Kas Harian",
            url: "/daily-cash-logs",
            icon: lucide_react_1.Banknote,
            permission: "master daily cash",
        },
        {
            title: "Produk",
            url: "/products",
            icon: lucide_react_1.Box,
            permission: "master product",
        },
        {
            title: "Transaksi",
            icon: lucide_react_1.ReceiptText,
            permission: "master transaction",
            items: [
                {
                    title: "Packet Voucher",
                    url: "/purchased-packets",
                },
                {
                    title: "Pencucian Mobil",
                    url: "/car-washes",
                },
            ],
        },
        {
            title: "Customer",
            icon: lucide_react_1.User2,
            permission: "master customer",
            items: [
                {
                    title: "Daftar Customer",
                    url: "/customers",
                },
                {
                    title: "Daftar Mobil Customer",
                    url: "/cars",
                },
            ],
        },
        {
            title: "Stall",
            icon: lucide_react_1.Wrench,
            permission: "master stall",
            items: [
                {
                    title: "Jadwal Stall",
                    url: "/stall-assignments",
                },
                {
                    title: "Daftar Stall",
                    url: "/stalls",
                    permission: "manage stall",
                },
            ],
        },
        {
            title: "Staff",
            icon: lucide_react_1.IdCard,
            permission: "master staff",
            items: [
                {
                    title: "Performa Staff",
                    url: "/staff-performances",
                },
                {
                    title: "Daftar Staff",
                    url: "/staffs",
                },
                {
                    title: "Posisi Kerja",
                    url: "/work-positions",
                },
                {
                    title: "Insentif",
                    url: "/incentives",
                },
            ],
        },
        {
            title: "Voucher",
            icon: lucide_react_1.Ticket,
            permission: "master voucher",
            items: [
                {
                    title: "Daftar Voucher",
                    url: "/vouchers",
                },
                {
                    title: "Paket Voucher",
                    url: "/voucher-packets",
                },
                {
                    title: "Tipe Voucher",
                    url: "/voucher-types",
                },
            ],
        },
        {
            title: "Settings",
            icon: lucide_react_1.Settings2,
            permission: "master settings",
            items: [
                {
                    title: "Daftar User",
                    url: "/users",
                },
                {
                    title: "Role List",
                    url: "/roles",
                    permission: "manage role",
                },
                {
                    title: "Permission List",
                    url: "/permissions",
                    permission: "manage permission",
                },
            ],
        },
    ],
};
function AppSidebar() {
    var hasPermission = use_permission_1.usePermission().hasPermission;
    var filteredNavItems = react_2.useMemo(
        function () {
            var checkPermission = function (item) {
                if (!item.permission) return true;
                return hasPermission(item.permission);
            };
            return allNavItems.navMain
                .filter(checkPermission)
                .map(function (item) {
                    if (item.items) {
                        return __assign(__assign({}, item), {
                            items: item.items.filter(checkPermission),
                        });
                    }
                    return item;
                })
                .filter(function (item) {
                    return !item.items || item.items.length > 0;
                });
        },
        [hasPermission],
    );
    return React.createElement(
        sidebar_1.Sidebar,
        { collapsible: "icon", variant: "inset" },
        React.createElement(
            sidebar_1.SidebarHeader,
            null,
            React.createElement(
                sidebar_1.SidebarMenu,
                null,
                React.createElement(
                    sidebar_1.SidebarMenuItem,
                    null,
                    React.createElement(
                        sidebar_1.SidebarMenuButton,
                        { size: "lg", asChild: true },
                        React.createElement(
                            react_1.Link,
                            { href: "/dashboard", prefetch: true },
                            React.createElement(app_logo_1["default"], null),
                        ),
                    ),
                ),
            ),
        ),
        React.createElement(
            sidebar_1.SidebarContent,
            null,
            React.createElement(nav_main_1.NavMain, {
                items: filteredNavItems,
            }),
        ),
        React.createElement(
            sidebar_1.SidebarFooter,
            null,
            React.createElement(nav_footer_1.NavFooter, {
                items: footerNavItems,
                className: "mt-auto",
            }),
            React.createElement(nav_user_1.NavUser, null),
        ),
    );
}
exports.AppSidebar = AppSidebar;
