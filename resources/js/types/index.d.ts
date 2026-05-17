import { LucideIcon } from "lucide-react";
import type { Config } from "ziggy-js";

export interface User {
    id: number;
    name: string;
    email: string;
}

export interface Auth {
    user: User | null;
    permissions: string[];
    roles: string[];
}

export interface Permission {
    id: number;
    name: string;
}

export interface Role {
    id: number;
    name: string;
    created_at: string;
    permissions: Permission[];
}

export interface BreadcrumbItem {
    title: string;
    href: string;
}

export interface NavGroup {
    title: string;
    items: NavItem[];
}

export interface NavItem {
    title: string;
    href?: string;
    icon?: LucideIcon | null;
    isActive?: boolean;
    children?: NavItem[];
    permission?: string;
}

export interface SharedData {
    name: string;
    quote: { message: string; author: string };
    auth: Auth;
    ziggy: Config & { location: string };
    sidebarOpen: boolean;
    [key: string]: unknown;
}

export interface User {
    id: number;
    name: string;
    email: string;
    avatar?: string;
    email_verified_at: string | null;
    created_at: string;
    updated_at: string;
    [key: string]: unknown; // This allows for additional properties...
}

export interface PageProps<T = {}> {
    auth: Auth;
    errors: Record<string, string>;
    flash: {
        success?: string;
        error?: string;
    };
    [key: string]: any;
    props: T;
}

export interface PaginatedLink {
    url: string | null;
    label: string;
    active: boolean;
}

export interface Paginated<T> {
    data: T[];
    links: PaginatedLink[];
    current_page: number;
    last_page: number;
    from: number;
    to: number;
    total: number;
    per_page: number;
    path: string;
    first_page_url: string;
    last_page_url: string;
    prev_page_url: string | null;
    next_page_url: string | null;
}
