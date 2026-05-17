import { usePage } from "@inertiajs/react";
import { PageProps } from "@/types";

export const usePermission = () => {
    const { auth } = usePage<PageProps>().props;

    const permissions = auth?.permissions ?? [];
    const roles = auth?.roles ?? [];

    const hasPermission = (name: string): boolean => permissions.includes(name);

    const hasRole = (name: string): boolean => roles.includes(name);

    const hasAnyPermission = (names: string[]): boolean =>
        names.some((name) => permissions.includes(name));

    const hasAnyRole = (names: string[]): boolean =>
        names.some((name) => roles.includes(name));

    return {
        hasPermission,
        hasRole,
        hasAnyPermission,
        hasAnyRole,
        roles,
        permissions,
    };
};
