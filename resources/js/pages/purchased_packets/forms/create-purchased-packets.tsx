import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { useForm } from "@inertiajs/react";
import React, { forwardRef, useImperativeHandle, useState, useEffect } from "react";
import axios from "axios";
import Swal from "sweetalert2";
import { useDebounce } from "@/hooks/use-debounce";
import { CustomerSearch } from "@/pages/purchased_packets/forms/customer-search";
import { useTransactionHandler } from "@/hooks/use-transaction-handler";
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

// Interface untuk data yang dikirim dari footer
interface FooterData {
    payment_method: string;
    voucher_ids?: string[];
    quantity: number;
}

// Interface untuk handle ref
export interface CreatePurchasedPacketHandle {
    submit: (footerData: FooterData) => void;
    isSubmitting: boolean;
}

interface CreatePurchasedPacketProps {
    voucherPacketId: string;
    onSuccess: () => void;
}

const CreatePurchasedPacketForm = forwardRef<
    CreatePurchasedPacketHandle,
    CreatePurchasedPacketProps
>(({ voucherPacketId, onSuccess }, ref) => {
    const { data, setData, post, processing, errors, reset, transform } = useForm({
        customer_id: null as string | null,
        customer_name: "",
        customer_phone: "",
        voucher_packet_id: voucherPacketId,
    });

    const [searchQuery, setSearchQuery] = useState("");
    const [searchResults, setSearchResults] = useState<Customer[]>([]);
    const [isSearching, setIsSearching] = useState(false);
    const [showDropdown, setShowDropdown] = useState(false);
    const [selectedCustomer, setSelectedCustomer] = useState<Customer | null>(null);
    const debouncedSearchQuery = useDebounce(searchQuery, 300);
    const { handleSuccess, handleError } = useTransactionHandler({
        onSuccess,
        reset,
    });

    const [formLoading, setFormLoading] = useState(false);

    useEffect(() => {
        if (
            debouncedSearchQuery.length < 2 ||
            debouncedSearchQuery === selectedCustomer?.name
        ) {
            setSearchResults([]);
            return;
        }

        const controller = new AbortController();

        setIsSearching(true);
        axios
            .get(`/api/customers/search?query=${debouncedSearchQuery}`, {
                signal: controller.signal,
            })
            .then((response) => {
                setSearchResults(response.data);
                setShowDropdown(true);
            })
            .catch((error) => {
                if (error.name !== "AbortError") {
                    console.error("Customer search error:", error);
                }
            })
            .finally(() => setIsSearching(false));

        return () => controller.abort();
    }, [debouncedSearchQuery, selectedCustomer]);

    const handleSearchChange = (value: string) => {
        setSearchQuery(value);
        setData("customer_name", value);
        if (selectedCustomer) {
            setSelectedCustomer(null);
            setData({
                ...data,
                customer_id: null,
                customer_phone: "",
            });
        }
    };

    const handleCustomerSelect = (customer: Customer) => {
        setSelectedCustomer(customer);
        setSearchQuery(customer.name);
        setShowDropdown(false);
        setData({
            ...data,
            customer_id: customer.id,
            customer_name: customer.name,
            customer_phone: customer.phone,
        });
    };

    function handleSubmit(footerData: FooterData) {
        if (!selectedCustomer) {
            if (!data.customer_name || data.customer_name.trim() === "") {
                Swal.fire({
                    icon: "error",
                    title: "Validasi Gagal",
                    text: "Nama customer wajib diisi!",
                });
                return;
            }
            if (!data.customer_phone || data.customer_phone.trim() === "") {
                Swal.fire({
                    icon: "error",
                    title: "Validasi Gagal",
                    text: "Nomor telepon customer wajib diisi!",
                });
                return;
            }
        }

        setFormLoading(true);
        transform((data) => ({
            ...data,
            payment_method: footerData.payment_method,
            voucher_ids: footerData.voucher_ids || [],
            quantity: footerData.quantity,
        }));

        post(route("purchased-packets.store"), {
            onSuccess: (page) => handleSuccess(page),
            onError: handleError,
            onFinish: () => setFormLoading(false),
        });
    }

    useImperativeHandle(ref, () => ({
        submit: handleSubmit,
        isSubmitting: formLoading || processing,
    }));

    return (
        <form
            className="flex flex-col gap-6"
            onSubmit={(e) => e.preventDefault()}
        >
            <fieldset disabled={processing || formLoading}>
                <div className="flex flex-col gap-6">
                    <div className="border rounded-lg p-4">
                        <h2 className="font-semibold text-lg mb-4">
                            Informasi Customer
                        </h2>
                        <div className="grid gap-4">
                            <div>
                                <CustomerSearch
                                    value={searchQuery}
                                    onValueChange={handleSearchChange}
                                    onSelect={handleCustomerSelect}
                                    searchResults={searchResults}
                                    isSearching={isSearching}
                                    showDropdown={showDropdown}
                                    onFocus={() => {
                                        if (searchResults.length > 0)
                                            setShowDropdown(true);
                                    }}
                                    onCloseDropdown={() => setShowDropdown(false)}
                                    required={!selectedCustomer}
                                />
                            </div>
                            <div>
                                <Label htmlFor="customer_phone" required={!selectedCustomer}>
                                    Nomor Telepon
                                </Label>
                                <Input
                                    id="customer_phone"
                                    value={data.customer_phone}
                                    onChange={(e) =>
                                        setData("customer_phone", e.target.value)
                                    }
                                    disabled={!!selectedCustomer}
                                />
                                {errors.customer_phone && (
                                    <p className="text-sm text-red-600 mt-1">
                                        {errors.customer_phone}
                                    </p>
                                )}
                            </div>
                        </div>
                    </div>
                </div>
                {(selectedCustomer || (!data.customer_id && data.customer_name)) && (
                    <div className="border rounded-lg p-4 mt-4 bg-muted/50">
                        <h2 className="font-semibold text-lg mb-2">
                            Ringkasan Pilihan
                        </h2>
                        <div className="text-primary">
                            <b>Customer:</b>{" "}
                            {selectedCustomer
                                ? `${selectedCustomer.name} (${selectedCustomer.phone})`
                                : `${data.customer_name}${data.customer_phone ? ` (${data.customer_phone})` : ""}`}
                        </div>
                    </div>
                )}
            </fieldset>
        </form>
    );
});

export default CreatePurchasedPacketForm;
