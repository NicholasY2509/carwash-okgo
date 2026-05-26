import os
with open('/Users/ny/Documents/Code/carwash/resources/js/pages/car_wash/forms/voucher-form.tsx', 'w') as f:
    f.write('''import Heading from "@/components/heading";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Checkbox } from "@/components/ui/checkbox";
import { Badge } from "@/components/ui/badge";
import {
    Select,
    SelectContent,
    SelectItem,
    SelectTrigger,
    SelectValue,
} from "@/components/ui/select";
import { useTransactionHandler } from "@/hooks/use-transaction-handler";
import { router, useForm } from "@inertiajs/react";
import axios from "axios";
import { LoaderCircle, ShoppingCart, UserSearch, FileSearch } from "lucide-react";
import { Modal, ModalHeader } from "@/components/ui/modal";
import { currencyFormatter } from "@/lib/currency-formatter";
import CarPlateSearch from "./car-plate-search";
import { CustomerSearch } from "@/pages/purchased_packets/forms/customer-search";
import React, {
    forwardRef,
    useImperativeHandle,
    useState,
    useEffect,
    useCallback,
    useMemo,
} from "react";
import { useDebounce } from "@/hooks/use-debounce";
import CarInformationCard from "@/components/car-information-card";

export interface FooterData {
    product_id: string;
    stall_id: number;
    staff_id?: number;
}
export interface CreateVoucherPurchaseHandle {
    submit: (footerData: FooterData) => void;
    canSubmit: () => boolean;
}

interface Car {
    id: string;
    plate_number: string;
    car_type_id?: string | number | null;
    model: string;
    color: string;
    photo: string;
}

interface Customer {
    id: string;
    name: string;
    phone: string;
    email: string;
    cars?: Car[];
}

interface Voucher {
    id: string;
    serial_number: string;
    status: string;
    is_expired: boolean;
    voucher_type: {
        name: string;
    };
    expired_at: string | null;
    purchased_packet: {
        id: string;
        name: string;
        purchased_at: string;
        expired_at: string;
        car: {
            id: string;
            plate_number: string;
        };
        customer: {
            id: string;
            name: string;
        };
    } | null;
}

interface ItemProp {
    id: number;
    name: string;
    stock: number;
    price: number;
}

interface CreateVoucherPurchaseProps {
    onSuccess: () => void;
    carTypes: { id: number; name: string }[];
    items: ItemProp[];
    selectedProduct: { id: number; name: string; items?: ItemProp[] } | null;
    selectedItems: number[];
    setSelectedItems: (ids: number[]) => void;
}

// Search state types
interface SearchState {
    query: string;
    results: any[];
    isSearching: boolean;
    showDropdown: boolean;
}

// Reusable search hook
const useSearch = (
    endpoint: string,
    queryKey: string,
    minLength: number = 2,
) => {
    const [state, setState] = useState<SearchState>({
        query: "",
        results: [],
        isSearching: false,
        showDropdown: false,
    });

    const debouncedQuery = useDebounce(state.query, 300);

    useEffect(() => {
        if (debouncedQuery.length < minLength) {
            setState((prev) => ({ ...prev, results: [], showDropdown: false }));
            return;
        }

        setState((prev) => ({ ...prev, isSearching: true }));
        axios
            .get(`${endpoint}?${queryKey}=${debouncedQuery}`)
            .then((response) => {
                setState((prev) => ({
                    ...prev,
                    results: response.data,
                    showDropdown: true,
                    isSearching: false,
                }));
            })
            .catch(() => {
                setState((prev) => ({ ...prev, isSearching: false }));
            });
    }, [debouncedQuery, endpoint, queryKey, minLength]);

    const updateQuery = useCallback((query: string) => {
        setState((prev) => ({ ...prev, query }));
    }, []);

    const closeDropdown = useCallback(() => {
        setState((prev) => ({ ...prev, showDropdown: false }));
    }, []);

    const openDropdown = useCallback(() => {
        if (state.results.length > 0) {
            setState((prev) => ({ ...prev, showDropdown: true }));
        }
    }, [state.results.length]);

    return {
        ...state,
        updateQuery,
        closeDropdown,
        openDropdown,
    };
};

const CreateVoucherPurchase = forwardRef<
    CreateVoucherPurchaseHandle,
    CreateVoucherPurchaseProps
>(
    (
        {
            onSuccess,
            carTypes,
            items,
            selectedProduct,
            selectedItems,
            setSelectedItems,
        },
        ref,
    ) => {
        const { data, setData, processing, errors, reset } = useForm({
            serial_number: "",
            plate_number: "",
            voucher_id: "",
            customer_id: "",
            customer_name: "",
            customer_phone: "",
            car_id: "",
            car_type_id: "" as string | null,
            purchased_packet_id: "",
            selected_items: [] as number[],
        });

        // Sync whenever selectedItems changes
        useEffect(() => {
            setData("selected_items", selectedItems);
        }, [selectedItems]);

        const [activeTab, setActiveTab] = useState<'customer' | 'manual'>('customer');
        const [foundVoucher, setFoundVoucher] = useState<Voucher | null>(null);
        const [searchError, setSearchError] = useState<string | null>(null);
        const [isSearching, setIsSearching] = useState(false);
        const { handleSuccess, handleError } = useTransactionHandler({
            onSuccess,
            reset,
        });
        const [isItemModalOpen, setIsItemModalOpen] = useState(false);
        const [localErrors, setLocalErrors] = useState<Record<string, string>>({});

        const [selectedCar, setSelectedCar] = useState<{
            car: Car;
            customer: Customer;
        } | null>(null);

        const carPlateSearch = useSearch("/api/cars/search", "plate");
        const customerSearch = useSearch("/api/customers/search", "query");

        const [customerVouchers, setCustomerVouchers] = useState<any[]>([]);
        const [isFetchingVouchers, setIsFetchingVouchers] = useState(false);
        const [selectedCustomer, setSelectedCustomer] = useState<Customer | null>(null);
        const [hasSearchedCustomer, setHasSearchedCustomer] = useState(false);
        const [selectedCustomerCarId, setSelectedCustomerCarId] = useState<string>("");

        // Reset state when switching tabs to avoid stale data
        const switchTab = (tab: 'customer' | 'manual') => {
            setActiveTab(tab);
            reset();
            setFoundVoucher(null);
            setSelectedCar(null);
            setSelectedCustomer(null);
            setCustomerVouchers([]);
            setHasSearchedCustomer(false);
            carPlateSearch.updateQuery("");
            customerSearch.updateQuery("");
            setSearchError(null);
            setLocalErrors({});
            setSelectedCustomerCarId("");
        };

        const handleCustomerSelect = useCallback(
            (customer: Customer) => {
                setSelectedCustomer(customer);
                customerSearch.updateQuery(customer.name);
                customerSearch.closeDropdown();
                setIsFetchingVouchers(true);
                setCustomerVouchers([]);
                setHasSearchedCustomer(true);
                
                // Clear any previously selected car in tab 1
                setSelectedCustomerCarId("");

                updateFormData({
                    customer_id: customer.id,
                    customer_name: customer.name,
                    customer_phone: customer.phone,
                });

                axios
                    .get(`/api/vouchers/customer/${customer.id}`)
                    .then((response) => {
                        setCustomerVouchers(response.data);
                    })
                    .catch((error) => {
                        console.error(error);
                    })
                    .finally(() => {
                        setIsFetchingVouchers(false);
                    });
            },
            [customerSearch]
        );

        const canSubmit = useMemo(() => {
            const hasValidVoucher = !!foundVoucher && !foundVoucher.is_expired && (foundVoucher.status === "Active" || foundVoucher.status === "Sold");
            
            if (activeTab === 'customer') {
                return hasValidVoucher && (data.car_id || (data.plate_number && data.car_type_id));
            } else {
                return hasValidVoucher && (data.car_id || data.plate_number) && data.customer_name;
            }
        }, [foundVoucher, data.car_id, data.plate_number, data.car_type_id, data.customer_name, activeTab]);

        const updateFormData = useCallback(
            (updates: Partial<typeof data>) => {
                setData((prev) => ({ ...prev, ...updates }));
            },
            [setData],
        );

        const handleCarPlateChange = useCallback(
            (value: string) => {
                const upperValue = value.toUpperCase();
                carPlateSearch.updateQuery(upperValue);
                setData("plate_number", upperValue);
                setData("car_id", "");
                setData("car_type_id", "");
                // Only clear customer if we are in manual tab and it was auto-filled by car
                if (activeTab === 'manual') {
                    if (selectedCar) {
                        setData("customer_name", "");
                        setData("customer_phone", "");
                    }
                }
                setSelectedCar(null);
            },
            [carPlateSearch, setData, activeTab, selectedCar],
        );

        const handleCarPlateSelect = useCallback(
            (result: { car: Car; customer: Customer }) => {
                carPlateSearch.closeDropdown();
                carPlateSearch.updateQuery(result.car.plate_number);
                setSelectedCar(result);

                // For manual tab, auto mapping customer when car selected
                updateFormData({
                    car_id: result.car.id,
                    plate_number: result.car.plate_number,
                    car_type_id: result.car.car_type_id ? String(result.car.car_type_id) : "",
                    customer_name: result.customer?.name || data.customer_name,
                    customer_phone: result.customer?.phone || data.customer_phone,
                    customer_id: result.customer?.id || data.customer_id,
                });
            },
            [carPlateSearch, updateFormData, data],
        );

        const handleClearCar = useCallback(() => {
            setSelectedCar(null);
            carPlateSearch.updateQuery("");
            updateFormData({
                car_id: "",
                plate_number: "",
                car_type_id: "",
                customer_name: activeTab === 'manual' ? "" : data.customer_name,
                customer_phone: activeTab === 'manual' ? "" : data.customer_phone,
            });
        }, [carPlateSearch, updateFormData, activeTab, data]);

        const validateForm = useCallback(() => {
            const newErrors: Record<string, string> = {};

            if (activeTab === 'customer') {
                if (!data.serial_number) {
                    newErrors.serial_number = "Pilih voucher terlebih dahulu.";
                }
                if (!data.car_id && !data.plate_number) {
                    newErrors.plate_number = "Nomor polisi wajib diisi atau pilih mobil terdaftar.";
                }
                if (!data.car_id && !data.car_type_id) {
                    newErrors.car_type_id = "Tipe mobil wajib dipilih untuk mobil baru.";
                }
            } else {
                if (!data.serial_number) {
                    newErrors.serial_number = "Nomor seri harus diisi.";
                }
                if (!data.car_id && !data.plate_number) {
                    newErrors.plate_number = "Nomor polisi harus diisi atau pilih mobil terdaftar.";
                }
                if (!data.car_id && !data.car_type_id) {
                    newErrors.car_type_id = "Tipe mobil wajib dipilih.";
                }
                if (!data.customer_name) {
                    newErrors.customer_name = "Nama pelanggan wajib diisi.";
                }
            }

            setLocalErrors(newErrors);
            return Object.keys(newErrors).length === 0;
        }, [data, activeTab]);

        function checkValidity(serialNumberOverride?: string) {
            const serialToCheck = serialNumberOverride || data.serial_number;
            
            if (!serialToCheck) {
                setLocalErrors({ serial_number: "Nomor seri harus diisi." });
                return;
            }

            setIsSearching(true);
            setSearchError(null);
            setFoundVoucher(null);
            setLocalErrors({});

            axios
                .get(`/api/vouchers/check-validity?serial_number=${serialToCheck}`)
                .then((response) => {
                    const voucherData = response.data.foundVoucher;
                    setFoundVoucher(voucherData);
                    
                    updateFormData({
                        serial_number: serialToCheck,
                        voucher_id: voucherData.id,
                        purchased_packet_id: voucherData.purchased_packet?.id || "",
                    });
                })
                .catch((error) => {
                    setSearchError(error.response?.data?.message || "Terjadi kesalahan.");
                })
                .finally(() => {
                    setIsSearching(false);
                });
        }

        const handleSubmit = useCallback(
            (footerData: FooterData) => {
                if (!validateForm()) {
                    return;
                }

                const finalData = {
                    ...data,
                    voucher_id: data.voucher_id || foundVoucher?.id || "",
                    customer_id: data.customer_id || foundVoucher?.purchased_packet?.customer?.id || "",
                    purchased_packet_id: data.purchased_packet_id || foundVoucher?.purchased_packet?.id || "",
                    product_id: footerData.product_id,
                    stall_id: footerData.stall_id,
                    staff_id: footerData.staff_id || null,
                };

                router.post(route("car-washes.voucher"), finalData, {
                    onSuccess: (page) => handleSuccess(page),
                    onError: handleError,
                });
            },
            [data, validateForm, foundVoucher, handleSuccess, handleError],
        );

        useImperativeHandle(
            ref,
            () => ({
                submit: handleSubmit,
                canSubmit: () => !!canSubmit,
            }),
            [handleSubmit, canSubmit],
        );

        return (
            <div className="space-y-6">
                {/* Pills Navigation */}
                <div className="flex p-1 bg-muted rounded-xl gap-1 overflow-x-auto w-full md:w-max">
                    <button
                        onClick={() => switchTab('customer')}
                        className={`flex items-center justify-center gap-2 px-6 py-2.5 rounded-lg text-sm font-medium transition-all duration-200 ${
                            activeTab === 'customer' 
                                ? 'bg-background text-foreground shadow-sm' 
                                : 'text-muted-foreground hover:bg-muted-foreground/10'
                        }`}
                    >
                        <UserSearch className="w-4 h-4" />
                        Cari Pelanggan
                    </button>
                    <button
                        onClick={() => switchTab('manual')}
                        className={`flex items-center justify-center gap-2 px-6 py-2.5 rounded-lg text-sm font-medium transition-all duration-200 ${
                            activeTab === 'manual' 
                                ? 'bg-background text-foreground shadow-sm' 
                                : 'text-muted-foreground hover:bg-muted-foreground/10'
                        }`}
                    >
                        <FileSearch className="w-4 h-4" />
                        Cek Manual
                    </button>
                </div>

                {activeTab === 'customer' && (
                    <div className="space-y-6 animate-in fade-in slide-in-from-bottom-2 duration-300">
                        <div className="space-y-2">
                            <Label>Pilih Pelanggan</Label>
                            <div className="flex gap-2 relative">
                                <div className="flex-1">
                                    <CustomerSearch
                                        value={customerSearch.query}
                                        onValueChange={(val) => customerSearch.updateQuery(val)}
                                        searchResults={customerSearch.results}
                                        isSearching={customerSearch.isSearching}
                                        showDropdown={customerSearch.showDropdown}
                                        onFocus={customerSearch.openDropdown}
                                        onSelect={handleCustomerSelect}
                                        onCloseDropdown={customerSearch.closeDropdown}
                                    />
                                </div>
                                {isFetchingVouchers && (
                                    <Button disabled variant="outline" className="shrink-0">
                                        <LoaderCircle className="w-4 h-4 animate-spin md:mr-2" />
                                        <span className="hidden md:inline">Mencari...</span>
                                    </Button>
                                )}
                            </div>
                        </div>

                        {hasSearchedCustomer && !isFetchingVouchers && (
                            <div className="space-y-4">
                                <Label>Voucher Pelanggan</Label>
                                {customerVouchers.length > 0 ? (
                                    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-3">
                                        {customerVouchers.map((v) => (
                                            <div
                                                key={v.id}
                                                className={`border rounded-xl p-4 shadow-sm cursor-pointer transition-all ${
                                                    data.serial_number === v.serial_number 
                                                    ? 'border-blue-500 bg-blue-50/50 ring-2 ring-blue-500/20' 
                                                    : 'bg-card hover:border-blue-400 hover:bg-slate-50'
                                                }`}
                                                onClick={() => checkValidity(v.serial_number)}
                                            >
                                                <div className="flex justify-between items-start mb-3">
                                                    <Badge variant={v.status === "Active" ? "default" : "secondary"}>
                                                        {v.status}
                                                    </Badge>
                                                    <span className="text-sm font-bold text-slate-700">{v.serial_number}</span>
                                                </div>
                                                <div className="text-xs space-y-1.5 text-slate-600">
                                                    <div><span className="text-muted-foreground">Tipe:</span> <span className="font-medium">{v.voucher_type?.name}</span></div>
                                                    {v.purchased_packet && (
                                                        <>
                                                            <div><span className="text-muted-foreground">Paket:</span> <span className="font-medium">{v.purchased_packet?.voucher_packet?.name}</span></div>
                                                            <div><span className="text-muted-foreground">Mobil:</span> <span className="font-medium">{v.purchased_packet?.car?.plate_number}</span></div>
                                                        </>
                                                    )}
                                                </div>
                                            </div>
                                        ))}
                                    </div>
                                ) : (
                                    <div className="p-8 text-center border rounded-xl bg-muted/20 border-dashed">
                                        <span className="text-muted-foreground text-sm font-medium">Tidak ada Voucher yang ditemukan</span>
                                    </div>
                                )}
                            </div>
                        )}

                        {foundVoucher && (
                            <div className="p-4 border rounded-xl bg-slate-50/50 space-y-4 animate-in fade-in duration-300">
                                <Heading title="Pilih Kendaraan" className="text-lg" />
                                
                                <div className="space-y-4">
                                    <div className="space-y-2">
                                        <Label>Mobil Pelanggan</Label>
                                        <Select
                                            value={selectedCustomerCarId}
                                            onValueChange={(val) => {
                                                setSelectedCustomerCarId(val);
                                                if (val === "NEW") {
                                                    updateFormData({ car_id: "", plate_number: "", car_type_id: "" });
                                                } else {
                                                    const selected = selectedCustomer?.cars?.find(c => c.id === val);
                                                    if (selected) {
                                                        updateFormData({
                                                            car_id: selected.id,
                                                            plate_number: selected.plate_number,
                                                            car_type_id: selected.car_type_id ? String(selected.car_type_id) : "",
                                                        });
                                                    }
                                                }
                                            }}
                                        >
                                            <SelectTrigger>
                                                <SelectValue placeholder="Pilih mobil atau tambah baru..." />
                                            </SelectTrigger>
                                            <SelectContent>
                                                {selectedCustomer?.cars?.map(car => (
                                                    <SelectItem key={car.id} value={car.id}>
                                                        {car.plate_number} - {car.model}
                                                    </SelectItem>
                                                ))}
                                                <SelectItem value="NEW" className="font-semibold text-blue-600">
                                                    + Tambah Kendaraan Baru
                                                </SelectItem>
                                            </SelectContent>
                                        </Select>
                                    </div>

                                    {selectedCustomerCarId === "NEW" && (
                                        <div className="grid grid-cols-1 md:grid-cols-2 gap-4 pt-2">
                                            <div className="space-y-2">
                                                <Label htmlFor="new_plate_number" required>Nomor Polisi</Label>
                                                <Input 
                                                    id="new_plate_number"
                                                    value={data.plate_number}
                                                    onChange={e => setData("plate_number", e.target.value.toUpperCase())}
                                                    placeholder="Contoh: B1234XYZ"
                                                />
                                                {(errors.plate_number || localErrors.plate_number) && (
                                                    <p className="text-sm text-red-600">{errors.plate_number || localErrors.plate_number}</p>
                                                )}
                                            </div>
                                            <div className="space-y-2">
                                                <Label htmlFor="new_car_type_id" required>Tipe Mobil</Label>
                                                <Select
                                                    value={data.car_type_id || ""}
                                                    onValueChange={val => setData("car_type_id", val)}
                                                >
                                                    <SelectTrigger id="new_car_type_id">
                                                        <SelectValue placeholder="Pilih tipe mobil..." />
                                                    </SelectTrigger>
                                                    <SelectContent>
                                                        {carTypes.map((type) => (
                                                            <SelectItem key={type.id} value={String(type.id)}>
                                                                {type.name}
                                                            </SelectItem>
                                                        ))}
                                                    </SelectContent>
                                                </Select>
                                                {(errors.car_type_id || localErrors.car_type_id) && (
                                                    <p className="text-sm text-red-600">{errors.car_type_id || localErrors.car_type_id}</p>
                                                )}
                                            </div>
                                        </div>
                                    )}
                                </div>
                            </div>
                        )}
                    </div>
                )}

                {activeTab === 'manual' && (
                    <div className="space-y-6 animate-in fade-in slide-in-from-bottom-2 duration-300">
                        <form onSubmit={(e) => { e.preventDefault(); checkValidity(); }}>
                            <div className="space-y-2">
                                <Label htmlFor="serial_number">Nomor Seri Voucher</Label>
                                <div className="flex flex-col sm:flex-row items-stretch gap-2">
                                    <div className="flex-1">
                                        <Input
                                            id="serial_number"
                                            type="text"
                                            value={data.serial_number}
                                            onChange={(e) => setData("serial_number", e.target.value)}
                                            placeholder="Masukkan Nomor Seri..."
                                            className="h-11"
                                        />
                                    </div>
                                    <Button
                                        type="submit"
                                        id="check-voucher-btn"
                                        disabled={isSearching || processing}
                                        className="h-11 px-8"
                                    >
                                        {isSearching ? <LoaderCircle className="h-4 w-4 animate-spin" /> : "Check Voucher"}
                                    </Button>
                                </div>
                                {(errors.serial_number || localErrors.serial_number || searchError) && (
                                    <p className="text-sm text-red-600">
                                        {errors.serial_number || localErrors.serial_number || searchError}
                                    </p>
                                )}
                            </div>
                        </form>

                        {foundVoucher && (
                            <div className="space-y-6 pt-2 animate-in fade-in duration-300">
                                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                                    {/* Customer Section */}
                                    <div className="p-4 border rounded-xl bg-slate-50/50 space-y-4">
                                        <Heading title="Data Pelanggan" className="text-lg" />
                                        <div className="space-y-2">
                                            <Label>Cari Pelanggan (Opsional)</Label>
                                            <CustomerSearch
                                                value={customerSearch.query}
                                                onValueChange={(val) => customerSearch.updateQuery(val)}
                                                searchResults={customerSearch.results}
                                                isSearching={customerSearch.isSearching}
                                                showDropdown={customerSearch.showDropdown}
                                                onFocus={customerSearch.openDropdown}
                                                onSelect={(customer) => {
                                                    customerSearch.updateQuery(customer.name);
                                                    customerSearch.closeDropdown();
                                                    updateFormData({
                                                        customer_id: customer.id,
                                                        customer_name: customer.name,
                                                        customer_phone: customer.phone,
                                                    });
                                                }}
                                                onCloseDropdown={customerSearch.closeDropdown}
                                            />
                                        </div>
                                        <div className="space-y-4">
                                            <div className="space-y-2">
                                                <Label htmlFor="manual_customer_name" required>Nama Pelanggan</Label>
                                                <Input
                                                    id="manual_customer_name"
                                                    value={data.customer_name}
                                                    onChange={(e) => setData("customer_name", e.target.value)}
                                                    disabled={!!selectedCar}
                                                />
                                                {errors.customer_name && (
                                                    <p className="text-sm text-red-600">{errors.customer_name}</p>
                                                )}
                                            </div>
                                            <div className="space-y-2">
                                                <Label htmlFor="manual_customer_phone">Nomor Telepon</Label>
                                                <Input
                                                    id="manual_customer_phone"
                                                    value={data.customer_phone}
                                                    onChange={(e) => setData("customer_phone", e.target.value)}
                                                    disabled={!!selectedCar}
                                                />
                                            </div>
                                        </div>
                                    </div>

                                    {/* Car Section */}
                                    <div className="p-4 border rounded-xl bg-slate-50/50 space-y-4">
                                        <Heading title="Data Kendaraan" className="text-lg" />
                                        <div className="space-y-2">
                                            <Label htmlFor="plate_number" required>Cari / Input Nomor Polisi</Label>
                                            <CarPlateSearch
                                                value={carPlateSearch.query}
                                                onValueChange={handleCarPlateChange}
                                                searchResults={carPlateSearch.results}
                                                isSearching={carPlateSearch.isSearching}
                                                showDropdown={carPlateSearch.showDropdown}
                                                onFocus={carPlateSearch.openDropdown}
                                                onSelect={handleCarPlateSelect}
                                                onCloseDropdown={carPlateSearch.closeDropdown}
                                            />
                                            {(errors.plate_number || localErrors.plate_number) && (
                                                <p className="text-sm text-red-600">
                                                    {errors.plate_number || localErrors.plate_number}
                                                </p>
                                            )}
                                        </div>

                                        {selectedCar && carPlateSearch.query ? (
                                            <div className="p-3 border border-blue-200 bg-blue-50/50 rounded-lg text-blue-700 text-sm flex items-center justify-between">
                                                <span>
                                                    Mobil ditemukan: <b>{selectedCar.car.plate_number}</b>
                                                </span>
                                                <button className="ml-2 text-xs font-semibold underline hover:text-blue-800" onClick={handleClearCar} type="button">
                                                    Kosongkan
                                                </button>
                                            </div>
                                        ) : data.plate_number ? (
                                            <div className="space-y-2">
                                                <Label htmlFor="car_type_id" required>Tipe Mobil</Label>
                                                <Select
                                                    value={data.car_type_id || ""}
                                                    onValueChange={(value) => {
                                                        if (data.car_id) setData("car_id", "");
                                                        setData("car_type_id", value);
                                                    }}
                                                    disabled={!!selectedCar}
                                                >
                                                    <SelectTrigger id="car_type_id">
                                                        <SelectValue placeholder="Pilih tipe mobil..." />
                                                    </SelectTrigger>
                                                    <SelectContent>
                                                        {carTypes.map((type) => (
                                                            <SelectItem key={type.id} value={String(type.id)}>
                                                                {type.name}
                                                            </SelectItem>
                                                        ))}
                                                    </SelectContent>
                                                </Select>
                                                {(errors.car_type_id || localErrors.car_type_id) && (
                                                    <p className="text-sm text-red-600 mt-1">
                                                        {errors.car_type_id || localErrors.car_type_id}
                                                    </p>
                                                )}
                                            </div>
                                        ) : null}
                                    </div>
                                </div>
                            </div>
                        )}
                    </div>
                )}

                {/* Shared Sections (Items & Details) */}
                {foundVoucher && (
                    <div className="space-y-6 animate-in fade-in duration-300">
                        {/* Inventory Items Selection Checklist */}
                        {items && items.length > 0 && (
                            <div className="border p-5 rounded-xl bg-muted/10">
                                <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
                                    <div>
                                        <Label className="text-sm font-semibold text-foreground">
                                            Barang / Item Pelengkap
                                        </Label>
                                        <p className="text-xs text-muted-foreground mt-1">
                                            Pilih barang yang diberikan ke customer.
                                        </p>
                                    </div>
                                    <Button
                                        type="button"
                                        variant="outline"
                                        onClick={() => setIsItemModalOpen(true)}
                                        className="flex items-center gap-2 border-blue-200 text-blue-700 hover:text-blue-800 hover:bg-blue-50"
                                    >
                                        <ShoppingCart className="w-4 h-4" />
                                        Kelola Barang ({selectedItems.length} Terpilih)
                                    </Button>
                                </div>

                                {selectedItems.length > 0 && (
                                    <div className="flex flex-wrap gap-2 mt-4 pt-4 border-t border-dashed">
                                        {items.filter(item => selectedItems.includes(item.id)).map(item => {
                                            const isBound = selectedProduct?.items?.some(i => i.id === item.id) || false;
                                            return (
                                                <Badge key={item.id} variant="secondary" className="flex items-center gap-1.5 py-1.5 px-3">
                                                    {item.name}
                                                    {isBound ? (
                                                        <span className="text-[10px] text-blue-500 font-bold uppercase">(Bawaan)</span>
                                                    ) : (
                                                        <span className="text-[10px] text-emerald-600 font-bold">(+{currencyFormatter.format(item.price || 0)})</span>
                                                    )}
                                                </Badge>
                                            );
                                        })}
                                    </div>
                                )}
                            </div>
                        )}

                        <div className="border rounded-xl shadow-sm p-5 bg-card space-y-4">
                            <Heading title="Informasi Voucher" className="text-lg mb-2" />
                            <div className="flex items-center justify-between p-3 bg-muted/30 rounded-lg">
                                <span className="text-muted-foreground font-medium text-sm">Status:</span>
                                <span className={`text-xl font-bold ${
                                    (foundVoucher.status === "Active" || foundVoucher.status === "Sold")
                                        ? "text-primary"
                                        : "text-muted-foreground"
                                }`}>
                                    {foundVoucher.status}
                                </span>
                            </div>
                            
                            <div className="grid grid-cols-1 sm:grid-cols-2 gap-y-4 gap-x-6 text-sm">
                                <div>
                                    <span className="text-muted-foreground block mb-1">Nomor Seri:</span>
                                    <div className="font-semibold text-slate-800">{foundVoucher.serial_number}</div>
                                </div>
                                <div>
                                    <span className="text-muted-foreground block mb-1">Tipe:</span>
                                    <div className="font-semibold text-slate-800">{foundVoucher.voucher_type.name}</div>
                                </div>
                                <div>
                                    <span className="text-muted-foreground block mb-1">Tanggal Expired:</span>
                                    <div className="font-semibold text-emerald-600">
                                        {foundVoucher.purchased_packet?.expired_at || foundVoucher.expired_at || "-"}
                                    </div>
                                </div>
                                {foundVoucher.purchased_packet && (
                                    <>
                                        <div>
                                            <span className="text-muted-foreground block mb-1">Nama Paket:</span>
                                            <div className="font-semibold text-slate-800">{foundVoucher.purchased_packet.name}</div>
                                        </div>
                                        <div>
                                            <span className="text-muted-foreground block mb-1">Customer dari Paket:</span>
                                            <div className="font-semibold text-slate-800">{foundVoucher.purchased_packet.customer.name}</div>
                                        </div>
                                    </>
                                )}
                            </div>
                            
                            {foundVoucher.is_expired ? (
                                <div className="mt-4 p-3 bg-red-50 border border-red-200 text-sm text-red-600 font-semibold rounded-lg">
                                    Voucher ini sudah kadaluarsa.
                                </div>
                            ) : !(foundVoucher.status === "Active" || foundVoucher.status === "Sold") ? (
                                <div className="mt-4 p-3 bg-red-50 border border-red-200 text-sm text-red-600 font-semibold rounded-lg">
                                    Voucher tidak dapat digunakan. Status harus "Active" atau "Sold".
                                </div>
                            ) : null}
                        </div>
                    </div>
                )}

                {/* Shared Modal for Items */}
                <Modal open={isItemModalOpen} onClose={() => setIsItemModalOpen(false)} className="max-w-2xl p-6">
                    <ModalHeader title="Pilih Barang / Item Pelengkap" />
                    <div className="space-y-4 max-h-[60vh] overflow-y-auto pr-2 mt-4">
                        <p className="text-xs text-muted-foreground">
                            Centang barang-barang tambahan di bawah. Barang bawaan (included) tercentang secara default.
                        </p>
                        <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                            {items.map((item) => {
                                const isChecked = selectedItems.includes(item.id);
                                const isBound = selectedProduct?.items?.some(i => i.id === item.id) || false;
                                return (
                                    <div
                                        key={item.id}
                                        className={`flex items-center justify-between p-3 rounded-lg border transition-all duration-200 ${
                                            isChecked ? "border-blue-200 bg-blue-50/30 ring-1 ring-blue-500/20" : "border-muted bg-card hover:bg-muted/30"
                                        }`}
                                    >
                                        <div className="flex items-center gap-3">
                                            <Checkbox
                                                id={`item-modal-${item.id}`}
                                                checked={isChecked}
                                                onCheckedChange={(checked) => {
                                                    if (checked) {
                                                        setSelectedItems([...selectedItems, item.id]);
                                                    } else {
                                                        setSelectedItems(selectedItems.filter(id => id !== item.id));
                                                    }
                                                }}
                                            />
                                            <Label htmlFor={`item-modal-${item.id}`} className="cursor-pointer font-medium text-sm flex flex-col gap-0.5">
                                                <span className="text-slate-800">{item.name}</span>
                                                {isBound ? (
                                                    <span className="text-[10px] text-blue-600 font-semibold uppercase tracking-wider">Bawaan Layanan (Rp 0)</span>
                                                ) : (
                                                    <span className="text-[11px] text-emerald-600 font-semibold">{currencyFormatter.format(item.price || 0)}</span>
                                                )}
                                            </Label>
                                        </div>
                                        <Badge variant={item.stock === 0 ? "destructive" : "outline"} className="text-xs shrink-0 bg-background">
                                            Stok: {item.stock}
                                        </Badge>
                                    </div>
                                );
                            })}
                        </div>
                    </div>
                    <div className="mt-6 flex justify-end">
                        <Button type="button" onClick={() => setIsItemModalOpen(false)}>Selesai</Button>
                    </div>
                </Modal>
            </div>
        );
    },
);

export default CreateVoucherPurchase;
''')
