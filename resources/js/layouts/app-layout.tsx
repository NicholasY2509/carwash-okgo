import AppLayoutTemplate from "@/layouts/app/app-sidebar-layout";
import { type BreadcrumbItem } from "@/types";
import { type ReactNode } from "react";
import { Toaster } from "sonner";
import { ReloadPreventionIndicator } from "@/components/reload-prevention-indicator";

interface AppLayoutProps {
    children: ReactNode;
    breadcrumbs?: BreadcrumbItem[];
}

export default ({ children, breadcrumbs, ...props }: AppLayoutProps) => (
    <AppLayoutTemplate breadcrumbs={breadcrumbs} {...props}>
        {children}
        <Toaster position="top-right" richColors closeButton />
        {/* <ReloadPreventionIndicator /> */}
    </AppLayoutTemplate>
);
