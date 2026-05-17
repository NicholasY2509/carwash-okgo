import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { useDebounce } from "@/hooks/use-debounce";
import axios from "axios";
import { useEffect, useRef, useState } from "react";
import { LoaderCircle } from "lucide-react";

interface car {
    id: string;
    plate_number: string;
    model: string;
    color: string;
    photo: string;
}

interface Customer {
    id: string;
    name: string;
    phone: string;
    email: string;
    cars: car[];
}

interface CustomerSearchProps {
    value: string;
    onValueChange: (value: string) => void;
    searchResults: Customer[];
    isSearching: boolean;
    showDropdown: boolean;
    onFocus: () => void;
    onSelect: (customer: Customer) => void;
    onCloseDropdown: () => void;
    required?: boolean;
}

export const CustomerSearch = ({
    value,
    onValueChange,
    searchResults,
    isSearching,
    showDropdown,
    onFocus,
    onSelect,
    onCloseDropdown,
    required,
}: CustomerSearchProps) => {
    const searchWrapperRef = useRef<HTMLDivElement>(null);
    useEffect(() => {
        const handleClickOutside = (event: MouseEvent) => {
            if (
                searchWrapperRef.current &&
                !searchWrapperRef.current.contains(event.target as Node)
            ) {
                onCloseDropdown();
            }
        };
        document.addEventListener("mousedown", handleClickOutside);
        return () =>
            document.removeEventListener("mousedown", handleClickOutside);
    }, [onCloseDropdown]);

    // Only show dropdown if loading or there are results
    const shouldShowDropdown =
        showDropdown && (isSearching || searchResults.length > 0);

    return (
        <div className="relative" ref={searchWrapperRef}>
            <Label htmlFor="customer_name" required={required}>Nama Customer</Label>
            <Input
                id="customer_name"
                placeholder="Cari atau masukkan nama baru..."
                value={value}
                onChange={(e) => onValueChange(e.target.value)}
                onFocus={onFocus}
                autoComplete="off"
            />
            {shouldShowDropdown && (
                <div className="absolute z-10 mt-1 w-full rounded-md border bg-popover p-1 text-popover-foreground shadow-md">
                    {isSearching && (
                        <div className="flex items-center gap-2 p-2 text-sm text-muted-foreground">
                            <LoaderCircle className="animate-spin w-4 h-4" />
                            Mencari...
                        </div>
                    )}
                    {searchResults.map((customer) => (
                        <div
                            key={customer.id}
                            className="cursor-pointer rounded-sm p-2 text-sm hover:bg-accent"
                            onClick={() => onSelect(customer)}
                        >
                            {customer.name} - {customer.phone}
                        </div>
                    ))}
                </div>
            )}
        </div>
    );
};
