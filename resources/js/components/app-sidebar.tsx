import { NavFooter } from "@/components/nav-footer";
import { NavMain } from "@/components/nav-main";
import { NavUser } from "@/components/nav-user";
import {
    Sidebar,
    SidebarContent,
    SidebarFooter,
    SidebarHeader,
    SidebarMenu,
    SidebarMenuButton,
    SidebarMenuItem,
} from "@/components/ui/sidebar";
import { type NavItem } from "@/types";
import { Link } from "@inertiajs/react";
import {
    Box,
    Package,
    Car,
    Home,
    IdCard,
    ReceiptText,
    Settings2,
    Ticket,
    User2,
    Wrench,
    FileBarChart2,
    Tv,
} from "lucide-react";
import AppLogo from "./app-logo";
import { url } from "inspector";
import { permission, title } from "process";
import { usePermission } from "@/hooks/use-permission";
import { useMemo } from "react";

const footerNavItems: NavItem[] = [];

const allNavItems = {
    navMain: [
        {
            title: "Dashboard",
            url: "/dashboard",
            icon: Home,
        },
        {
            title: "Pencucian Mobil",
            url: "/car-washes/create",
            icon: Car,
            permission: "car wash",
        },
        {
            title: "Pembelian Voucher",
            url: "/purchased-packets/create",
            icon: Ticket,
            permission: "purchase packet",
        },
        {
            title: "Antrian",
            url: "/queue",
            icon: Tv,
            permission: "queue",
        },
        {
            title: "Produk",
            icon: Box,
            permission: "master product",
            items: [
                {
                    title: "Daftar Produk",
                    url: "/products",
                    permission: "product",
                },
                {
                    title: "Pihak Bagi Hasil",
                    url: "/parties",
                    permission: "party",
                },
            ],
        },
        {
            title: "Stok & Barang",
            icon: Package,
            permission: "master stock",
            items: [
                {
                    title: "Daftar Barang",
                    url: "/items",
                    permission: "item",
                },
                {
                    title: "Daftar Supplier",
                    url: "/suppliers",
                    permission: "supplier",
                },
                {
                    title: "Pembelian Stok",
                    url: "/purchases",
                    permission: "purchase",
                },
                {
                    title: "Pergerakan Stok",
                    url: "/stock-adjustments",
                    permission: "stock adjustment",
                },
            ],
        },
        {
            title: "Transaksi",
            icon: ReceiptText,
            permission: "master transaction",
            items: [
                {
                    title: "Packet Voucher",
                    url: "/purchased-packets",
                    permission: "packet voucher",
                },
                {
                    title: "Pencucian Mobil",
                    url: "/car-washes",
                    permission: "car wash",
                },
                {
                    title: "Riwayat Penjualan",
                    url: "/sales-transactions",
                    permission: "sales transaction",
                },
            ],
        },
        {
            title: "Customer",
            icon: User2,
            permission: "master customer",
            items: [
                {
                    title: "Daftar Customer",
                    url: "/customers",
                    permission: "customer",
                },
                {
                    title: "Daftar Mobil Customer",
                    url: "/cars",
                    permission: "car",
                },
                {
                    title: "Tipe Mobil",
                    url: "/car-types",
                    permission: "car type",
                },
            ],
        },
        // {
        //     title: "Stall",
        //     icon: Wrench,
        //     permission: "master stall",
        //     items: [
        //         {
        //             title: "Jadwal Stall",
        //             url: "/stall-assignments",
        //             permission: "stall assignment",
        //         },
        //         {
        //             title: "Daftar Stall",
        //             url: "/stalls",
        //             permission: "stall",
        //         },
        //     ],
        // },
        {
            title: "Staff",
            icon: IdCard,
            permission: "master staff",
            items: [
                {
                    title: "Insentif SPV (Owner)",
                    url: "/staff-incentives/summary",
                    permission: "staff incentive summary",
                },
                {
                    title: "Insentif SPV",
                    url: "/staff-incentives",
                    permission: "staff incentive",
                },
                {
                    title: "Insentif Staff",
                    url: "/staff-level-incentives",
                    permission: "staff incentive",
                },
                {
                    title: "Insentif Kasir",
                    url: "/cashier-incentives",
                    permission: "staff incentive",
                },
                {
                    title: "Daftar Staff",
                    url: "/staffs",
                    permission: "staff",
                },
                {
                    title: "Posisi Kerja",
                    url: "/work-positions",
                    permission: "work position",
                },
            ],
        },
        {
            title: "Laporan",
            icon: FileBarChart2,
            permission: "report",
            items: [
                {
                    title: "Omset Cuci Mobil",
                    url: "/reports/car-wash-revenue",
                    permission: "report car wash",
                },
                {
                    title: "Penjualan Voucher",
                    url: "/reports/voucher-sales",
                    permission: "report voucher sales",
                },
                {
                    title: "Stok Barang",
                    url: "/reports/stock",
                    permission: "report stock",
                },
                {
                    title: "Bagi Hasil",
                    url: "/reports/split-profit",
                    permission: "report split profit",
                },
            ],
        },
        {
            title: "Voucher",
            icon: Ticket,
            permission: "master voucher",
            items: [
                {
                    title: "Daftar Voucher",
                    url: "/vouchers",
                    permission: "voucher",
                },
                {
                    title: "Paket Voucher",
                    url: "/voucher-packets",
                    permission: "voucher packet",
                },
                {
                    title: "Tipe Voucher",
                    url: "/voucher-types",
                    permission: "voucher type",
                },
            ],
        },
        {
            title: "Settings",
            icon: Settings2,
            items: [
                {
                    title: "Daftar User",
                    url: "/users",
                    permission: "user",
                },
                {
                    title: "Role List",
                    url: "/roles",
                    permission: "role",
                },
                {
                    title: "Permission List",
                    url: "/permissions",
                    permission: "permission",
                },
                {
                    title: "Master Insentif SPV",
                    url: "/settings/incentive-tiers",
                    permission: "incentive tier",
                },
                {
                    title: "Master Insentif Staff",
                    url: "/settings/staff-incentive-tiers",
                    permission: "incentive tier",
                },
                {
                    title: "Master Insentif Kasir",
                    url: "/settings/cashier-incentive-tiers",
                    permission: "incentive tier",
                },
                {
                    title: "Pengaturan Whatsapp",
                    url: "/settings/whatsapp",
                    permission: "setting whatsapp",
                },
                {
                    title: "Customer Protection",
                    url: "/settings/customer-protection",
                    permission: "setting customer protection",
                },
            ],
        },
    ],
};

export function AppSidebar() {
    const { hasPermission } = usePermission();

    const filteredNavItems = useMemo(() => {
        const checkPermission = (item: NavItem) => {
            if (!item.permission) return true;
            return hasPermission(item.permission);
        };

        return allNavItems.navMain
            .filter(checkPermission)
            .map((item) => {
                if (item.items) {
                    return {
                        ...item,
                        items: item.items.filter(checkPermission),
                    };
                }
                return item;
            })
            .filter((item) => !item.items || item.items.length > 0);
    }, [hasPermission]);

    return (
        <Sidebar collapsible="icon" variant="inset">
            <SidebarHeader>
                <SidebarMenu>
                    <SidebarMenuItem>
                        <SidebarMenuButton size="lg" asChild>
                            <Link href="/dashboard" prefetch>
                                <AppLogo />
                            </Link>
                        </SidebarMenuButton>
                    </SidebarMenuItem>
                </SidebarMenu>
            </SidebarHeader>

            <SidebarContent>
                <NavMain items={filteredNavItems} />
            </SidebarContent>

            <SidebarFooter>
                <NavFooter items={footerNavItems} className="mt-auto" />
                <NavUser />
            </SidebarFooter>
        </Sidebar>
    );
}
