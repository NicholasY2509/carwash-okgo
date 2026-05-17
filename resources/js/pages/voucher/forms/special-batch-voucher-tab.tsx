import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import {
    Select,
    SelectContent,
    SelectItem,
    SelectTrigger,
    SelectValue,
} from "@/components/ui/select";
import { Badge } from "@/components/ui/badge";
import { LoaderCircle } from "lucide-react";
import React, { useRef, useEffect } from "react";

interface VoucherType {
    id: number;
    name: string;
}

interface Customer {
    id: string;
    name: string;
    phone: string;
    email: string;
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
}

const CustomerSearch = ({
    value,
    onValueChange,
    searchResults,
    isSearching,
    showDropdown,
    onFocus,
    onSelect,
    onCloseDropdown,
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
    const shouldShowDropdown =
        showDropdown && (isSearching || searchResults.length > 0);
    return (
        <div className="relative" ref={searchWrapperRef}>
            <Label htmlFor="customer_name" required>Nama Customer</Label>
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
                            {customer.name}
                        </div>
                    ))}
                </div>
            )}
        </div>
    );
};

interface SpecialBatchVoucherTabProps {
    rangeStart: string;
    rangeEnd: string;
    onRangeStartChange: (value: string) => void;
    onRangeEndChange: (value: string) => void;
    batchCodesPreview: string[];
    specialCategoryId: string;
    onSpecialCategoryChange: (value: string) => void;
    expirationDate: string;
    onExpirationDateChange: (value: string) => void;
    selectedCustomer: Customer | null;
    customerName: string;
    customerPhone: string;
    customerEmail: string;
    onCustomerNameChange: (value: string) => void;
    onCustomerPhoneChange: (value: string) => void;
    onCustomerEmailChange: (value: string) => void;
    onCustomerSelect: (customer: Customer) => void;
    onClearCustomer: () => void;
    customerSearchResults: Customer[];
    customerSearchIsSearching: boolean;
    customerSearchShowDropdown: boolean;
    onCustomerSearchFocus: () => void;
    onCustomerSearchCloseDropdown: () => void;
    categories: VoucherType[];
}

export default function SpecialBatchVoucherTab({
    rangeStart,
    rangeEnd,
    onRangeStartChange,
    onRangeEndChange,
    batchCodesPreview,
    specialCategoryId,
    onSpecialCategoryChange,
    expirationDate,
    onExpirationDateChange,
    selectedCustomer,
    customerName,
    customerPhone,
    customerEmail,
    onCustomerNameChange,
    onCustomerPhoneChange,
    onCustomerEmailChange,
    onCustomerSelect,
    onClearCustomer,
    customerSearchResults,
    customerSearchIsSearching,
    customerSearchShowDropdown,
    onCustomerSearchFocus,
    onCustomerSearchCloseDropdown,
    categories,
}: SpecialBatchVoucherTabProps) {
    return (
        <div className="space-y-4">
            <div className="space-y-4">
                <Label required>Generate Kode dari Range</Label>
                <div className="flex items-center gap-2">
                    <Input
                        type="text"
                        placeholder="Dari..."
                        value={rangeStart}
                        onChange={(e) => onRangeStartChange(e.target.value.toUpperCase())}
                    />
                    <span>-</span>
                    <Input
                        type="text"
                        placeholder="Sampai..."
                        value={rangeEnd}
                        onChange={(e) => onRangeEndChange(e.target.value.toUpperCase())}
                    />
                </div>
                <p className="text-sm text-muted-foreground">
                    {batchCodesPreview.length > 0
                        ? `Akan mendaftarkan ${batchCodesPreview.length} kode (${batchCodesPreview[0]} ... ${batchCodesPreview[batchCodesPreview.length - 1]})`
                        : "Jumlah Voucher akan ditampilkan di sini..."}
                </p>
                <div className="flex flex-row gap-2 ">
                    <div className="w-1/2">
                        <Label htmlFor="special-category" required>
                            Kategori Voucher
                        </Label>
                        <Select value={specialCategoryId} onValueChange={onSpecialCategoryChange}>
                            <SelectTrigger>
                                <SelectValue placeholder="Pilih kategori..." />
                            </SelectTrigger>
                            <SelectContent>
                                {categories.map((cat) => (
                                    <SelectItem key={cat.id} value={String(cat.id)}>
                                        {cat.name}
                                    </SelectItem>
                                ))}
                            </SelectContent>
                        </Select>
                    </div>
                    <div className="w-1/2">
                        <Label htmlFor="expiration-date" required>
                            Tanggal Kadaluarsa
                        </Label>
                        <Input
                            id="expiration-date"
                            type="date"
                            value={expirationDate}
                            onChange={(e) => onExpirationDateChange(e.target.value)}
                        />
                    </div>
                </div>
            </div>
            {selectedCustomer && (
                <div className="mb-4 p-2 border rounded text-blue-700 text-sm flex items-center justify-between">
                    <span>
                        Customer terdaftar: <b>{selectedCustomer.name}</b>
                    </span>
                    <button
                        className="ml-2 text-xs underline"
                        onClick={onClearCustomer}
                        type="button"
                    >
                        Kosongkan
                    </button>
                </div>
            )}
            <div className="space-y-4">
                <CustomerSearch
                    value={customerName}
                    onValueChange={onCustomerNameChange}
                    onSelect={onCustomerSelect}
                    searchResults={customerSearchResults}
                    isSearching={customerSearchIsSearching}
                    showDropdown={customerSearchShowDropdown}
                    onFocus={onCustomerSearchFocus}
                    onCloseDropdown={onCustomerSearchCloseDropdown}
                />
                <div className="flex flex-row gap-2">
                    <div className="w-1/2">
                        <div>
                            <Label htmlFor="customer_phone">
                                Nomor Telepon
                            </Label>
                            <Input
                                id="customer_phone"
                                value={customerPhone}
                                onChange={(e) => onCustomerPhoneChange(e.target.value)}
                                disabled={!!selectedCustomer}
                            />
                        </div>
                    </div>
                    <div className="w-1/2">
                        <div>
                            <Label htmlFor="customer_email">
                                Email
                            </Label>
                            <Input
                                id="customer_email"
                                type="email"
                                value={customerEmail}
                                onChange={(e) => onCustomerEmailChange(e.target.value)}
                                disabled={!!selectedCustomer}
                            />
                        </div>
                    </div>
                </div>
            </div>
        </div>
    );
} 