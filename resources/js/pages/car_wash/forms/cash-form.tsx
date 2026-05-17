import Heading from "@/components/heading";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import {
    Select,
    SelectItem,
    SelectContent,
    SelectTrigger,
    SelectValue,
} from "@/components/ui/select";
import { Separator } from "@/components/ui/separator";
import { router, useForm, usePage } from "@inertiajs/react";
import React, {
    forwardRef,
    useImperativeHandle,
    useState,
    useEffect,
    useCallback,
    useMemo,
} from "react";
import axios from "axios";
import Swal from "sweetalert2";
import { useDebounce } from "@/hooks/use-debounce";
import { CustomerSearch } from "@/pages/purchased_packets/forms/customer-search";
import { useTransactionHandler } from "@/hooks/use-transaction-handler";
import { LoaderCircle } from "lucide-react";
import CarPlateSearch from "./car-plate-search";

interface car {
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
    cars: car[];
}
interface FooterData {
    product_id: string;
    stall_id: number;
    payment_method?: string;
    nominal_bayar?: number;
    staff_id?: number;
}
export interface CreateCashPurchaseHandle {
    submit: (footerData: FooterData) => void;
    canSubmit: () => boolean;
}
interface CreateCashPurchaseProps {
    onSuccess: () => void;
    carTypes: { id: number; name: string }[];
}

interface SearchState {
    query: string;
    results: any[];
    isSearching: boolean;
    showDropdown: boolean;
}

const useSearch = (endpoint: string, queryKey: string, minLength: number = 2) => {
    const [state, setState] = useState<SearchState>({
        query: "",
        results: [],
        isSearching: false,
        showDropdown: false,
    });

    const debouncedQuery = useDebounce(state.query, 300);

    useEffect(() => {
        if (debouncedQuery.length < minLength) {
            setState(prev => ({ ...prev, results: [], showDropdown: false }));
            return;
        }

        setState(prev => ({ ...prev, isSearching: true }));
        axios.get(`${endpoint}?${queryKey}=${debouncedQuery}`)
            .then((response) => {
                setState(prev => ({
                    ...prev,
                    results: response.data,
                    showDropdown: true,
                    isSearching: false,
                }));
            })
            .catch(() => {
                setState(prev => ({ ...prev, isSearching: false }));
            });
    }, [debouncedQuery, endpoint, queryKey, minLength]);

    const updateQuery = useCallback((query: string) => {
        setState(prev => ({ ...prev, query }));
    }, []);

    const closeDropdown = useCallback(() => {
        setState(prev => ({ ...prev, showDropdown: false }));
    }, []);

    const openDropdown = useCallback(() => {
        if (state.results.length > 0) {
            setState(prev => ({ ...prev, showDropdown: true }));
        }
    }, [state.results.length]);

    return {
        ...state,
        updateQuery,
        closeDropdown,
        openDropdown,
    };
};

const CreateCashPurchase = forwardRef<
    CreateCashPurchaseHandle,
    CreateCashPurchaseProps
>(({ onSuccess, carTypes }, ref) => {
    type FormData = {
        customer_id: string | null;
        car_id: string | null;
        customer_name: string;
        customer_phone: string;
        customer_email: string;
        customer_ktp_photo: File | null;
        car_plate_number: string;
        car_type_id: string | null;
        car_model: string;
        car_color: string;
        car_photo: File | null;
        stall_id: number | null;
        product_id: string | null;
    };

    const { data, setData, post, processing, errors, reset } =
        useForm<FormData>({
            customer_id: null,
            car_id: null,
            customer_name: "",
            customer_phone: "",
            customer_email: "",
            customer_ktp_photo: null,
            car_plate_number: "",
            car_type_id: null,
            car_model: "",
            car_color: "",
            car_photo: null,
            stall_id: null,
            product_id: null,
        });

    // Optimized state management
    const [selectedCustomer, setSelectedCustomer] = useState<Customer | null>(null);
    const [isNewCar, setIsNewCar] = useState(false);
    const [formLoading, setFormLoading] = useState(false);
    const [localErrors, setLocalErrors] = useState<Record<string, string>>({});

    // Reusable search hooks
    const customerSearch = useSearch("/api/customers/search", "query");
    const carPlateSearch = useSearch("/api/cars/search", "plate");

    const { handleSuccess, handleError } = useTransactionHandler({
        onSuccess,
        reset,
    });

    // Memoized form validation
    const canSubmit = useMemo(() => {
        return !!(data.car_id || data.car_plate_number);
    }, [data.car_id, data.car_plate_number]);

    // Memoized summary data
    const summaryData = useMemo(() => {
        if (!selectedCustomer && !data.customer_name) return null;

        const selectedCarTypeName = carTypes.find(t => String(t.id) === data.car_type_id)?.name;

        return {
            customer: selectedCustomer
                ? `${selectedCustomer.name} (${selectedCustomer.phone})`
                : `${data.customer_name}${data.customer_phone ? ` (${data.customer_phone})` : ""}`,
            car: data.car_plate_number
                ? `${data.car_plate_number}${selectedCarTypeName ? ` - ${selectedCarTypeName}` : ""}`
                : null,
        };
    }, [selectedCustomer, data.customer_name, data.customer_phone, data.car_plate_number, data.car_type_id, carTypes]);

    // Optimized form update function
    const updateFormData = useCallback((updates: Partial<FormData>) => {
        setData(prev => ({ ...prev, ...updates }));
    }, [setData]);

    // Optimized customer search handler
    const handleSearchChange = useCallback((value: string) => {
        customerSearch.updateQuery(value);
        setData("customer_name", value);

        if (selectedCustomer) {
            setSelectedCustomer(null);
            updateFormData({
                customer_id: null,
                customer_phone: "",
                customer_email: "",
                car_id: null,
            });
        }
    }, [selectedCustomer, setData, updateFormData, customerSearch]);

    // Optimized customer selection handler
    const handleCustomerSelect = useCallback((customer: Customer) => {
        setSelectedCustomer(customer);
        customerSearch.updateQuery(customer.name);
        customerSearch.closeDropdown();
        setIsNewCar(false);

        updateFormData({
            customer_id: customer.id,
            customer_name: customer.name,
            customer_phone: customer.phone,
            customer_email: customer.email,
            customer_ktp_photo: null,
            car_id: null,
            car_plate_number: "",
            car_type_id: null,
            car_model: "",
            car_color: "",
            car_photo: null,
        });
    }, [updateFormData, customerSearch]);

    // Optimized car selection handler
    const handleCarSelect = useCallback((carId: string) => {
        if (carId === "new") {
            setIsNewCar(true);
            updateFormData({
                car_id: null,
                car_plate_number: "",
                car_type_id: null,
                car_model: "",
                car_color: "",
                car_photo: null,
            });
            return;
        }

        setIsNewCar(false);
        const selectedCar = selectedCustomer?.cars.find((c) => c.id === carId);
        if (selectedCar) {
            updateFormData({
                car_id: selectedCar.id,
                car_plate_number: selectedCar.plate_number,
                car_type_id: selectedCar.car_type_id ? String(selectedCar.car_type_id) : null,
                car_model: selectedCar.model,
                car_color: selectedCar.color,
                car_photo: null,
            });
        }
    }, [selectedCustomer, updateFormData]);

    // Optimized car plate change handler
    const handleCarPlateChange = useCallback((value: string) => {
        const upperValue = value.toUpperCase();
        carPlateSearch.updateQuery(upperValue);
        setData("car_plate_number", upperValue);
        setData("car_id", null);
        setData("car_type_id", null);
        setData("car_model", "");
        setData("car_color", "");
        setData("car_photo", null);
        setSelectedCustomer(null);
    }, [carPlateSearch, setData]);

    // Optimized car plate selection handler
    const handleCarPlateSelect = useCallback((result: { car: car; customer: Customer }) => {
        carPlateSearch.closeDropdown();
        carPlateSearch.updateQuery(result.car.plate_number);
        customerSearch.updateQuery(result.customer.name);
        setIsNewCar(false);

        updateFormData({
            car_id: result.car.id,
            car_plate_number: result.car.plate_number,
            car_type_id: result.car.car_type_id ? String(result.car.car_type_id) : null,
            car_model: result.car.model,
            car_color: result.car.color,
            car_photo: null,
            customer_id: result.customer.id,
            customer_name: result.customer.name,
            customer_phone: result.customer.phone,
            customer_email: result.customer.email,
            customer_ktp_photo: null,
        });
        setSelectedCustomer(result.customer);
    }, [carPlateSearch, customerSearch, updateFormData]);

    const validateForm = useCallback(() => {
        const newErrors: Record<string, string> = {};

        if (!data.car_id && !data.car_plate_number) {
            newErrors.car_plate_number = "Nomor polisi harus diisi atau pilih mobil terdaftar.";
        }
        if (!data.car_id && !data.car_type_id) {
            newErrors.car_type_id = "Tipe mobil wajib dipilih.";
        }

        setLocalErrors(newErrors);
        return Object.keys(newErrors).length === 0;
    }, [data.car_id, data.car_plate_number, data.car_type_id]);

    const handleSubmit = useCallback((footerData: FooterData) => {
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

        if (!validateForm()) {
            return;
        }

        setFormLoading(true);
        const finalData = {
            ...data,
            stall_id: footerData.stall_id,
            product_id: footerData.product_id,
            payment_method: footerData.payment_method || null,
            nominal_bayar: footerData.nominal_bayar || null,
            staff_id: footerData.staff_id || null,
        };

        router.post(route("car-washes.store"), finalData, {
            onSuccess: (page) => handleSuccess(page),
            onError: handleError,
            onFinish: () => setFormLoading(false),
        });
    }, [data, validateForm, handleSuccess, handleError, selectedCustomer]);

    // Optimized clear customer handler
    const handleClearCustomer = useCallback(() => {
        setSelectedCustomer(null);
        customerSearch.updateQuery("");
        setIsNewCar(false);
        updateFormData({
            customer_id: null,
            customer_name: "",
            customer_phone: "",
            customer_email: "",
        });
    }, [customerSearch, updateFormData]);

    useImperativeHandle(ref, () => ({
        submit: handleSubmit,
        canSubmit: () => canSubmit,
    }), [handleSubmit, canSubmit]);

    return (
        <form onSubmit={(e) => e.preventDefault()} className="relative">
            {formLoading && (
                <div className="absolute inset-0 z-20 flex items-center justify-center bg-background/50">
                    <LoaderCircle className="animate-spin w-8 h-8 text-blue-500" />
                </div>
            )}
            <fieldset
                disabled={processing || formLoading}
                className="space-y-2"
            >
                <div className="space-y-6">
                    {selectedCustomer && carPlateSearch.query && (
                        <div className="p-3 border border-blue-200 bg-blue-50 rounded-lg text-blue-700 text-sm flex items-center justify-between shadow-sm">
                            <span>
                                Customer terdaftar berdasarkan plat nomor:{" "}
                                <b>{selectedCustomer.name}</b>
                            </span>
                            <button
                                className="ml-2 text-xs underline font-semibold hover:text-blue-800"
                                onClick={handleClearCustomer}
                                type="button"
                            >
                                Kosongkan
                            </button>
                        </div>
                    )}

                    <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                        <div className="space-y-2">
                            <CustomerSearch
                                value={customerSearch.query}
                                onValueChange={handleSearchChange}
                                onSelect={handleCustomerSelect}
                                searchResults={customerSearch.results}
                                isSearching={customerSearch.isSearching}
                                showDropdown={customerSearch.showDropdown}
                                onFocus={customerSearch.openDropdown}
                                onCloseDropdown={customerSearch.closeDropdown}
                                required={!selectedCustomer}
                            />
                        </div>

                        <div className="space-y-2">
                            <Label htmlFor="customer_phone" required={!selectedCustomer}>
                                Nomor Telepon
                            </Label>
                            <Input
                                id="customer_phone"
                                value={data.customer_phone}
                                onChange={(e) =>
                                    setData("customer_phone", e.target.value)
                                }
                                disabled={
                                    !!selectedCustomer && !!carPlateSearch.query
                                }
                            />
                            {errors.customer_phone && (
                                <p className="text-sm text-red-600 mt-1">
                                    {errors.customer_phone}
                                </p>
                            )}
                        </div>
                    </div>

                    <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                        {selectedCustomer &&
                            selectedCustomer.cars.length > 0 && (
                                <div className="space-y-2">
                                    <Label>Pilih Kendaraan Terdaftar</Label>
                                    <Select
                                        onValueChange={handleCarSelect}
                                        value={isNewCar ? "new" : (data.car_id || "")}
                                        disabled={!!carPlateSearch.query}
                                    >
                                        <SelectTrigger>
                                            <SelectValue placeholder="Pilih mobil..." />
                                        </SelectTrigger>
                                        <SelectContent>
                                            {selectedCustomer.cars.map(
                                                (car) => (
                                                    <SelectItem
                                                        key={car.id}
                                                        value={car.id}
                                                    >
                                                        {car.plate_number}
                                                    </SelectItem>
                                                ),
                                            )}
                                            <SelectItem value="new">
                                                Tambah Kendaraan Baru
                                            </SelectItem>
                                        </SelectContent>
                                    </Select>
                                </div>
                            )}

                        {(!selectedCustomer || selectedCustomer.cars.length === 0 || isNewCar) && (
                            <>
                                <div className="space-y-2">
                                    <Label htmlFor="car_plate_number" required>
                                        Nomor Polisi
                                    </Label>
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
                                    {(errors.car_plate_number ||
                                        localErrors.car_plate_number) && (
                                            <p className="text-sm text-red-600 mt-1">
                                                {errors.car_plate_number ||
                                                    localErrors.car_plate_number}
                                            </p>
                                        )}
                                </div>

                                <div className="space-y-2">
                                    <Label htmlFor="car_type_id" required>
                                        Tipe Mobil
                                    </Label>
                                    <Select
                                        onValueChange={(value) => {
                                            if (data.car_id) setData("car_id", null);
                                            setData("car_type_id", value);
                                        }}
                                        value={data.car_type_id || ""}
                                        disabled={
                                            !!carPlateSearch.query && !!selectedCustomer && !isNewCar
                                        }
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
                            </>
                        )}
                    </div>
                </div>

                {/* {summaryData && (
                    <div className="border rounded-lg p-4 mt-4 bg-muted/50">
                        <h2 className="font-semibold text-lg mb-2">
                            Ringkasan Pilihan
                        </h2>
                        <div className="mb-1 text-primary">
                            <b>Customer:</b> {summaryData.customer}
                        </div>
                        {summaryData.car && (
                            <div className="mb-1 text-primary">
                                <b>Mobil:</b> {summaryData.car}
                            </div>
                        )}
                    </div>
                )} */}
            </fieldset>
        </form>
    );
});

export default CreateCashPurchase;
