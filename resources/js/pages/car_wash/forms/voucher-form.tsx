import Heading from "@/components/heading";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { useTransactionHandler } from "@/hooks/use-transaction-handler";
import { router, useForm } from "@inertiajs/react";
import { Separator } from "@radix-ui/react-separator";
import axios from "axios";
import { LoaderCircle } from "lucide-react";
import {
    forwardRef,
    useImperativeHandle,
    useState,
    useEffect,
    useCallback,
    useMemo,
} from "react";
import Swal from "sweetalert2";
import { useDebounce } from "@/hooks/use-debounce";
import CarInformationCard from "@/components/car-information-card";
import CarPlateSearch from "./car-plate-search";

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
    model: string;
    color: string;
    photo: string;
}

interface Customer {
    id: string;
    name: string;
    phone: string;
    email: string;
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

interface CreateVoucherPurchaseProps {
    onSuccess: () => void;
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
>(({ onSuccess }, ref) => {
    const { data, setData, post, processing, errors, reset } = useForm({
        serial_number: "",
        plate_number: "",
        voucher_id: "",
        customer_id: "",
        customer_name: "",
        customer_phone: "",
        car_id: "",
        purchased_packet_id: "",
        car_model: "",
    });

    const [foundVoucher, setFoundVoucher] = useState<Voucher | null>(null);
    const [searchError, setSearchError] = useState<string | null>(null);
    const [isSearching, setIsSearching] = useState(false);
    const { handleSuccess, handleError } = useTransactionHandler({
        onSuccess,
        reset,
    });

    const [localErrors, setLocalErrors] = useState<Record<string, string>>({});

    const [selectedCar, setSelectedCar] = useState<{
        car: Car;
        customer: Customer;
    } | null>(null);

    const carPlateSearch = useSearch("/api/cars/search", "plate");

    const canSubmit = useMemo(() => {
        return (
            !!foundVoucher &&
            !foundVoucher.is_expired &&
            (foundVoucher.status === "Active" ||
                foundVoucher.status === "Sold") &&
            (data.car_id || data.plate_number)
        );
    }, [foundVoucher, data.car_id, data.plate_number]);

    // Memoized summary data
    const summaryData = useMemo(() => {
        if (!selectedCar && !data.plate_number) return null;

        return {
            car: selectedCar
                ? `${selectedCar.car.plate_number} - ${selectedCar.car.model}`
                : `${data.plate_number}${data.car_model ? ` - ${data.car_model}` : ""}`,
            customer: selectedCar?.customer.name || data.customer_name || foundVoucher?.purchased_packet?.customer.name || "Customer dari voucher",
        };
    }, [selectedCar, data.plate_number, data.car_model, data.customer_name, foundVoucher]);

    // Optimized form update function
    const updateFormData = useCallback(
        (updates: Partial<typeof data>) => {
            setData((prev) => ({ ...prev, ...updates }));
        },
        [setData],
    );

    // Optimized car plate change handler
    const handleCarPlateChange = useCallback(
        (value: string) => {
            const upperValue = value.toUpperCase();
            carPlateSearch.updateQuery(upperValue);
            setData("plate_number", upperValue);
            setData("car_id", "");
            setData("car_model", "");
            setData("customer_name", "");
            setData("customer_phone", "");
            setSelectedCar(null);
        },
        [carPlateSearch, setData],
    );

    // Optimized car plate selection handler
    const handleCarPlateSelect = useCallback(
        (result: { car: Car; customer: Customer }) => {
            carPlateSearch.closeDropdown();
            carPlateSearch.updateQuery(result.car.plate_number);
            setSelectedCar(result);

            updateFormData({
                car_id: result.car.id,
                plate_number: result.car.plate_number,
                car_model: result.car.model,
                customer_name: result.customer?.name || "",
                customer_phone: result.customer?.phone || "",
            });
        },
        [carPlateSearch, updateFormData],
    );

    // Optimized clear car handler
    const handleClearCar = useCallback(() => {
        setSelectedCar(null);
        carPlateSearch.updateQuery("");
        updateFormData({
            car_id: "",
            plate_number: "",
            car_model: "",
            customer_name: "",
            customer_phone: "",
        });
    }, [carPlateSearch, updateFormData]);

    // Optimized form validation
    const validateForm = useCallback(() => {
        const newErrors: Record<string, string> = {};

        if (!data.car_id && !data.plate_number) {
            newErrors.plate_number =
                "Nomor polisi harus diisi atau pilih mobil terdaftar.";
        }

        if (!data.serial_number) {
            newErrors.serial_number = "Nomor seri harus diisi.";
        }

        setLocalErrors(newErrors);
        return Object.keys(newErrors).length === 0;
    }, [data.car_id, data.plate_number, data.serial_number]);

    function checkValidity() {
        if (!validateForm()) {
            return;
        }

        setIsSearching(true);
        setSearchError(null);
        setFoundVoucher(null);

        axios
            .get(
                `/api/vouchers/check-validity?serial_number=${data.serial_number}`,
            )
            .then((response) => {
                const voucherData = response.data.foundVoucher;
                setFoundVoucher(voucherData);
                updateFormData({
                    voucher_id: voucherData.id,
                    customer_id:
                        voucherData.purchased_packet?.customer.id || "",
                    car_id: voucherData.purchased_packet?.car.id || "",
                    purchased_packet_id: voucherData.purchased_packet?.id || "",
                });
            })
            .catch((error) => {
                setSearchError(
                    error.response?.data?.message || "Terjadi kesalahan.",
                );
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
                customer_id:
                    data.customer_id ||
                    foundVoucher?.purchased_packet?.customer?.id ||
                    "",
                purchased_packet_id:
                    data.purchased_packet_id ||
                    foundVoucher?.purchased_packet?.id ||
                    "",
                product_id: footerData.product_id,
                stall_id: footerData.stall_id,
                staff_id: footerData.staff_id || null,
            };

            router.post(route("car-washes.voucher"), finalData, {
                onSuccess: (page) =>
                    handleSuccess(page),
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
        <div className="">
            <form onSubmit={(e) => e.preventDefault()}>
                <div className="w-full">
                    <div className="flex flex-row w-full items-end gap-2 mb-2">
                        <div className="w-4/5">
                            <Label htmlFor="serial_number">Nomor Seri</Label>
                            <Input
                                id="serial_number"
                                type="text"
                                value={data.serial_number}
                                onChange={(e) =>
                                    setData("serial_number", e.target.value)
                                }
                                placeholder="Nomor Seri..."
                            />
                            {(errors.serial_number ||
                                localErrors.serial_number) && (
                                    <p className="text-sm text-red-600">
                                        {errors.serial_number ||
                                            localErrors.serial_number}
                                    </p>
                                )}
                        </div>

                        <Button
                            disabled={isSearching || processing}
                            className="w-1/5"
                            onClick={checkValidity}
                        >
                            {isSearching ? (
                                <LoaderCircle className="h-4 w-4 animate-spin" />
                            ) : (
                                "Check"
                            )}
                        </Button>
                    </div>
                </div>
            </form>

            <div className="mb-4">
                <div className="mb-4">
                    <Label htmlFor="plate_number" required>
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
                    {(errors.plate_number ||
                        localErrors.plate_number) && (
                            <p className="text-sm text-red-600">
                                {errors.plate_number ||
                                    localErrors.plate_number}
                            </p>
                        )}
                </div>

                {selectedCar && carPlateSearch.query && (
                    <div className="mb-2 p-2 border rounded text-blue-700 text-sm flex items-center justify-between">
                        <span>
                            Mobil terdaftar berdasarkan plat nomor:{" "}
                            <b>{selectedCar.car.plate_number}</b>
                        </span>
                        <button
                            className="ml-2 text-xs underline"
                            onClick={handleClearCar}
                            type="button"
                        >
                            Kosongkan
                        </button>
                    </div>
                )}

                {selectedCar ? (
                    <CarInformationCard
                        car={selectedCar.car}
                        customer={selectedCar.customer}
                    />
                ) : data.plate_number ? (
                    <div className="border rounded-lg p-4">
                        <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-4">
                            <div>
                                <Label htmlFor="customer_name">
                                    Nama Pelanggan
                                </Label>
                                <Input
                                    id="customer_name"
                                    value={data.customer_name}
                                    onChange={(e) => {
                                        setData("customer_name", e.target.value);
                                    }}
                                    disabled={!!selectedCar}
                                />
                                {errors.customer_name && (
                                    <p className="text-sm text-red-600">
                                        {errors.customer_name}
                                    </p>
                                )}
                            </div>
                            <div>
                                <Label htmlFor="customer_phone">
                                    Nomor Telepon
                                </Label>
                                <Input
                                    id="customer_phone"
                                    value={data.customer_phone}
                                    onChange={(e) => {
                                        setData("customer_phone", e.target.value);
                                    }}
                                    disabled={!!selectedCar}
                                />
                                {errors.customer_phone && (
                                    <p className="text-sm text-red-600">
                                        {errors.customer_phone}
                                    </p>
                                )}
                            </div>
                        </div>
                        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                            <div>
                                <Label htmlFor="car_model">
                                    Merk Kendaraan
                                </Label>
                                <Input
                                    id="car_model"
                                    value={data.car_model}
                                    onChange={(e) => {
                                        if (data.car_id)
                                            setData("car_id", "");
                                        setData(
                                            "car_model",
                                            e.target.value,
                                        );
                                    }}
                                    disabled={!!selectedCar}
                                />
                                {errors.car_model && (
                                    <p className="text-sm text-red-600">
                                        {errors.car_model}
                                    </p>
                                )}
                            </div>
                        </div>
                    </div>
                ) : null}
            </div>

            {/* Summary Section */}
            {summaryData && (
                <div className="border rounded-lg p-4 mb-4">
                    <h2 className="font-semibold text-lg mb-2">
                        Ringkasan Pilihan
                    </h2>
                    <div className="mb-1 text-primary">
                        <b>Mobil:</b> {summaryData.car}
                    </div>
                </div>
            )}

            <div>
                <Heading title="Informasi Voucher" className="mt-4" />
                {foundVoucher ? (
                    <div className=" rounded-lg shadow p-4 mt-2 border space-y-4">
                        <div className="flex items-center justify-between mb-2">
                            <span className="text-muted-foreground font-medium">
                                Status:
                            </span>
                            <span
                                className={`text-2xl font-bold ${foundVoucher.status === "Active" ||
                                    foundVoucher.status === "Sold"
                                    ? "text-primary"
                                    : "text-muted-foreground"
                                    }`}
                            >
                                {foundVoucher.status}
                            </span>
                        </div>
                        <div className="grid grid-cols-2 gap-2">
                            <div>
                                <span className="text-muted-foreground">
                                    Nomor Seri:
                                </span>
                                <div className="font-medium">
                                    {foundVoucher.serial_number}
                                </div>
                            </div>
                            <div>
                                <span className="text-muted-foreground">
                                    Tipe:
                                </span>
                                <div className="font-medium">
                                    {foundVoucher.voucher_type.name}
                                </div>
                            </div>
                            <div>
                                <span className="text-muted-foreground">
                                    Tanggal Expired:
                                </span>
                                <div className="font-medium text-emerald-600 dark:text-emerald-400">
                                    {
                                        foundVoucher.purchased_packet
                                            ?.expired_at || foundVoucher.expired_at || "-"
                                    }
                                </div>
                            </div>
                            {foundVoucher.purchased_packet && (
                                <>
                                    <div>
                                        <span className="text-muted-foreground">
                                            Nama Paket:
                                        </span>
                                        <div className="font-medium">
                                            {foundVoucher.purchased_packet.name}
                                        </div>
                                    </div>
                                    <div>
                                        <span className="text-muted-foreground">
                                            Tanggal Pembelian:
                                        </span>
                                        <div className="font-medium">
                                            {
                                                foundVoucher.purchased_packet
                                                    .purchased_at
                                            }
                                        </div>
                                    </div>
                                    <div>
                                        <span className="text-muted-foreground">
                                            Nama Customer:
                                        </span>
                                        <div className="font-medium">
                                            {
                                                foundVoucher.purchased_packet
                                                    .customer.name
                                            }
                                        </div>
                                    </div>
                                    <div>
                                        <span className="text-muted-foreground">
                                            Nomor Polisi:
                                        </span>
                                        <div className="font-medium">
                                            {foundVoucher.purchased_packet.car
                                                ?.plate_number || "-"}
                                        </div>
                                    </div>
                                </>
                            )}
                        </div>
                        {foundVoucher.is_expired ? (
                            <div className="mt-2 text-sm text-red-600 font-semibold">
                                Voucher ini sudah kadaluarsa.
                            </div>
                        ) : !(
                            foundVoucher.status === "Active" ||
                            foundVoucher.status === "Sold"
                        ) ? (
                            <div className="mt-2 text-sm text-red-600 font-semibold">
                                Voucher tidak dapat digunakan. Status harus
                                "Active" atau "Sold".
                            </div>
                        ) : null}
                    </div>
                ) : (
                    <p className="text-sm text-muted-foreground">
                        Masukkan nomor seri dan klik "Check" untuk melihat
                        detail.
                        {searchError && (
                            <p className="text-sm text-red-500">
                                {searchError}
                            </p>
                        )}
                    </p>
                )}
            </div>
        </div>
    );
});

export default CreateVoucherPurchase;
