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
import { router } from "@inertiajs/react";
import { Badge } from "@/components/ui/badge";
import { Plus, X } from "lucide-react";
import React, { useState, useEffect, useCallback, useRef } from "react";
import Swal from "sweetalert2";
import { toast } from "sonner";
import { useDebounce } from "@/hooks/use-debounce";
import axios from "axios";
import { LoaderCircle } from "lucide-react";
import SingleVoucherTab from "./single-voucher-tab";
import BatchVoucherTab from "./batch-voucher-tab";
import SpecialVoucherTab from "./special-voucher-tab";
import SpecialBatchVoucherTab from "./special-batch-voucher-tab";

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

interface AddVoucherCodesFormProps {
    categories: VoucherType[];
    onSuccess: () => void;
}

interface SearchState {
    query: string;
    results: Customer[];
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



export default function CreateVoucher({
    categories = [],
    onSuccess,
}: AddVoucherCodesFormProps) {
    const [activeTab, setActiveTab] = useState<"single" | "batch" | "special" | "specialBatch">("single");
    const [codes, setCodes] = useState<string[]>([]);
    const [currentCode, setCurrentCode] = useState("");
    const [rangeStart, setRangeStart] = useState("");
    const [rangeEnd, setRangeEnd] = useState("");
    const [batchCodesPreview, setBatchCodesPreview] = useState<string[]>([]);
    const [categoryId, setCategoryId] = useState("");
    const [kdSales, setKdSales] = useState("");
    const [error, setError] = useState<string | null>(null);
    const [processing, setProcessing] = useState(false);
    const [regularExpiryDate, setRegularExpiryDate] = useState("");

    const [specialCodes, setSpecialCodes] = useState<string[]>([]);
    const [currentSpecialCode, setCurrentSpecialCode] = useState("");
    const [specialCategoryId, setSpecialCategoryId] = useState("");
    const [expirationDate, setExpirationDate] = useState("");
    const [selectedCustomer, setSelectedCustomer] = useState<Customer | null>(null);
    const [customerName, setCustomerName] = useState("");
    const [customerPhone, setCustomerPhone] = useState("");
    const [customerEmail, setCustomerEmail] = useState("");

    const [specialInputMode, setSpecialInputMode] = useState<'single' | 'batch'>('single');
    const [specialRangeStart, setSpecialRangeStart] = useState("");
    const [specialRangeEnd, setSpecialRangeEnd] = useState("");
    const [specialBatchCodesPreview, setSpecialBatchCodesPreview] = useState<string[]>([]);

    const customerSearch = useSearch("/api/customers/search", "query");

    const handleAddCode = () => {
        if (!currentCode.trim()) return;
        if (codes.includes(currentCode.trim())) {
            setError(`Code "${currentCode.trim()}" sudah ada.`);
            return;
        }
        setError(null);
        setCodes([...codes, currentCode.trim()]);
        setCurrentCode("");
    };

    const handleRemoveCode = (codeToRemove: string) => {
        setCodes(codes.filter((code) => code !== codeToRemove));
    };

    const handleAddSpecialCode = () => {
        if (!currentSpecialCode.trim()) return;
        if (specialCodes.includes(currentSpecialCode.trim())) {
            setError(`Code "${currentSpecialCode.trim()}" sudah ada.`);
            return;
        }
        setError(null);
        setSpecialCodes([...specialCodes, currentSpecialCode.trim()]);
        setCurrentSpecialCode("");
    };

    const handleRemoveSpecialCode = (codeToRemove: string) => {
        setSpecialCodes(specialCodes.filter((code) => code !== codeToRemove));
    };

    // Customer search handlers
    const handleCustomerSearchChange = useCallback((value: string) => {
        customerSearch.updateQuery(value);
        setCustomerName(value);

        if (selectedCustomer) {
            setSelectedCustomer(null);
            setCustomerPhone("");
            setCustomerEmail("");
        }
    }, [selectedCustomer, customerSearch]);

    const handleCustomerSelect = useCallback((customer: Customer) => {
        setSelectedCustomer(customer);
        customerSearch.updateQuery(customer.name);
        customerSearch.closeDropdown();

        setCustomerName(customer.name);
        setCustomerPhone(customer.phone);
        setCustomerEmail(customer.email);
    }, [customerSearch]);

    const handleClearCustomer = useCallback(() => {
        setSelectedCustomer(null);
        customerSearch.updateQuery("");
        setCustomerName("");
        setCustomerPhone("");
        setCustomerEmail("");
    }, [customerSearch]);

    useEffect(() => {
        if (rangeStart && rangeEnd) {
            const matchStart = rangeStart.match(/^([a-zA-Z]*)(\d+)$/);
            const matchEnd = rangeEnd.match(/^([a-zA-Z]*)(\d+)$/);

            if (!matchStart || !matchEnd) {
                setError("Format range tidak valid. Contoh: T0001 - T0010.");
                setBatchCodesPreview([]);
                return;
            }

            const prefixStart = matchStart[1];
            const numberStartStr = matchStart[2];
            const prefixEnd = matchEnd[1];
            const numberEndStr = matchEnd[2];

            if (prefixStart !== prefixEnd) {
                setError("Prefix kode awal dan akhir harus sama.");
                setBatchCodesPreview([]);
                return;
            }

            const startNum = parseInt(numberStartStr, 10);
            const endNum = parseInt(numberEndStr, 10);
            const paddingLength = numberStartStr.length;

            if (isNaN(startNum) || isNaN(endNum) || startNum > endNum) {
                setError("Range angka tidak valid.");
                setBatchCodesPreview([]);
                return;
            }

            setError(null);
            const generatedCodes: string[] = [];
            for (let i = startNum; i <= endNum; i++) {
                const paddedNumber = String(i).padStart(paddingLength, "0");
                generatedCodes.push(`${prefixStart}${paddedNumber}`);
            }
            setBatchCodesPreview(generatedCodes);
        } else {
            setBatchCodesPreview([]);
        }
    }, [rangeStart, rangeEnd]);

    useEffect(() => {
        if (activeTab === "specialBatch" && specialRangeStart && specialRangeEnd) {
            const matchStart = specialRangeStart.match(/^([a-zA-Z]*)(\d+)$/);
            const matchEnd = specialRangeEnd.match(/^([a-zA-Z]*)(\d+)$/);
            if (!matchStart || !matchEnd) {
                setError("Format range tidak valid. Contoh: T0001 - T0010.");
                setSpecialBatchCodesPreview([]);
                return;
            }
            const prefixStart = matchStart[1];
            const numberStartStr = matchStart[2];
            const prefixEnd = matchEnd[1];
            const numberEndStr = matchEnd[2];
            if (prefixStart !== prefixEnd) {
                setError("Prefix kode awal dan akhir harus sama.");
                setSpecialBatchCodesPreview([]);
                return;
            }
            const startNum = parseInt(numberStartStr, 10);
            const endNum = parseInt(numberEndStr, 10);
            const paddingLength = numberStartStr.length;
            if (isNaN(startNum) || isNaN(endNum) || startNum > endNum) {
                setError("Range angka tidak valid.");
                setSpecialBatchCodesPreview([]);
                return;
            }
            setError(null);
            const generatedCodes: string[] = [];
            for (let i = startNum; i <= endNum; i++) {
                const paddedNumber = String(i).padStart(paddingLength, "0");
                generatedCodes.push(`${prefixStart}${paddedNumber}`);
            }
            setSpecialBatchCodesPreview(generatedCodes);
        } else if (activeTab === "specialBatch") {
            setSpecialBatchCodesPreview([]);
        }
    }, [activeTab, specialRangeStart, specialRangeEnd]);

    const handleSubmit = (e: React.FormEvent) => {
        e.preventDefault();
        let finalCodes: string[] = [];
        let submitData: any = {};

        if (activeTab === "single") {
            finalCodes = codes;
            submitData = {
                serial_number: finalCodes,
                sales_code: kdSales,
                voucher_type_id: categoryId,
                voucher_type: "regular",
                expired_at: regularExpiryDate || null,
            };
        } else if (activeTab === "batch") {
            finalCodes = batchCodesPreview;
            submitData = {
                serial_number: finalCodes,
                sales_code: kdSales,
                voucher_type_id: categoryId,
                voucher_type: "regular",
                expired_at: regularExpiryDate || null,
            };
        } else if (activeTab === "special") {
            // Validate special case fields
            if (specialCodes.length === 0) {
                setError("Tidak ada kode voucher untuk ditambahkan.");
                return;
            }
            if (!specialCategoryId) {
                setError("Silakan pilih kategori voucher.");
                return;
            }
            if (!customerName.trim()) {
                setError("Nama customer harus diisi.");
                return;
            }
            if (!expirationDate) {
                setError("Tanggal kadaluarsa harus diisi.");
                return;
            }

            submitData = {
                serial_number: specialCodes,
                voucher_type_id: specialCategoryId,
                expiration_date: expirationDate,
                customer_name: customerName,
                customer_phone: customerPhone,
                customer_email: customerEmail,
                customer_id: selectedCustomer?.id || null,
                voucher_type: "special",
            };
        } else if (activeTab === "specialBatch") {
            if (specialBatchCodesPreview.length === 0) {
                setError("Tidak ada kode voucher untuk ditambahkan.");
                return;
            }
            if (!specialCategoryId) {
                setError("Silakan pilih kategori voucher.");
                return;
            }
            if (!customerName.trim()) {
                setError("Nama customer harus diisi.");
                return;
            }
            if (!expirationDate) {
                setError("Tanggal kadaluarsa harus diisi.");
                return;
            }
            submitData = {
                serial_number: specialBatchCodesPreview,
                voucher_type_id: specialCategoryId,
                expiration_date: expirationDate,
                customer_name: customerName,
                customer_phone: customerPhone,
                customer_email: customerEmail,
                customer_id: selectedCustomer?.id || null,
                voucher_type: "special",
            };
        }

        if ((activeTab === "single" || activeTab === "batch") && finalCodes.length === 0) {
            setError("Tidak ada kode voucher untuk ditambahkan.");
            return;
        }
        if ((activeTab === "single" || activeTab === "batch") && !categoryId) {
            setError("Silakan pilih kategori voucher.");
            return;
        }
        setError(null);

        setProcessing(true);
        router.post(route("vouchers.store"), submitData, {
            onSuccess: () => {
                const successMessage = (activeTab === "special" || activeTab === "specialBatch")
                    ? `${(activeTab === "special" ? specialCodes.length : specialBatchCodesPreview.length)} voucher khusus telah ditambahkan.`
                    : `${finalCodes.length} kode voucher telah ditambahkan.`;
                toast.success(successMessage);
                onSuccess();
            },
            onError: (errors) => {
                const firstError = Object.values(errors)[0];
                setError(firstError);
            },
            onFinish: () => {
                setProcessing(false);
            },
        });
    };

    return (
        <form onSubmit={handleSubmit} className="space-y-6">
            <div className="flex w-full rounded-md bg-muted p-1">
                <Button
                    type="button"
                    variant={activeTab === "single" ? "default" : "ghost"}
                    className="flex-1"
                    onClick={() => setActiveTab("single")}
                >
                    Input Satuan
                </Button>
                <Button
                    type="button"
                    variant={activeTab === "batch" ? "default" : "ghost"}
                    className="flex-1"
                    onClick={() => setActiveTab("batch")}
                >
                    Input Batch
                </Button>
                <Button
                    type="button"
                    variant={activeTab === "special" ? "default" : "ghost"}
                    className="flex-1"
                    onClick={() => setActiveTab("special")}
                >
                    Voucher Khusus
                </Button>
                <Button
                    type="button"
                    variant={activeTab === "specialBatch" ? "default" : "ghost"}
                    className="flex-1"
                    onClick={() => setActiveTab("specialBatch")}
                >
                    Batch Input Khusus
                </Button>
            </div>

            <div>
                {activeTab === "single" && (
                    <SingleVoucherTab
                        codes={codes}
                        currentCode={currentCode}
                        onCurrentCodeChange={setCurrentCode}
                        onAddCode={handleAddCode}
                        onRemoveCode={handleRemoveCode}
                    />
                )}

                {activeTab === "batch" && (
                    <BatchVoucherTab
                        rangeStart={rangeStart}
                        rangeEnd={rangeEnd}
                        onRangeStartChange={setRangeStart}
                        onRangeEndChange={setRangeEnd}
                        batchCodesPreview={batchCodesPreview}
                    />
                )}

                {activeTab === "special" && (
                    <SpecialVoucherTab
                        specialCodes={specialCodes}
                        currentSpecialCode={currentSpecialCode}
                        onCurrentSpecialCodeChange={setCurrentSpecialCode}
                        onAddSpecialCode={handleAddSpecialCode}
                        onRemoveSpecialCode={handleRemoveSpecialCode}
                        specialCategoryId={specialCategoryId}
                        onSpecialCategoryChange={setSpecialCategoryId}
                        expirationDate={expirationDate}
                        onExpirationDateChange={setExpirationDate}
                        selectedCustomer={selectedCustomer}
                        customerName={customerName}
                        customerPhone={customerPhone}
                        customerEmail={customerEmail}
                        onCustomerNameChange={handleCustomerSearchChange}
                        onCustomerPhoneChange={setCustomerPhone}
                        onCustomerEmailChange={setCustomerEmail}
                        onCustomerSelect={handleCustomerSelect}
                        onClearCustomer={handleClearCustomer}
                        customerSearchResults={customerSearch.results}
                        customerSearchIsSearching={customerSearch.isSearching}
                        customerSearchShowDropdown={customerSearch.showDropdown}
                        onCustomerSearchFocus={customerSearch.openDropdown}
                        onCustomerSearchCloseDropdown={customerSearch.closeDropdown}
                        categories={categories}
                    />
                )}
                {activeTab === "specialBatch" && (
                    <SpecialBatchVoucherTab
                        rangeStart={specialRangeStart}
                        rangeEnd={specialRangeEnd}
                        onRangeStartChange={setSpecialRangeStart}
                        onRangeEndChange={setSpecialRangeEnd}
                        batchCodesPreview={specialBatchCodesPreview}
                        specialCategoryId={specialCategoryId}
                        onSpecialCategoryChange={setSpecialCategoryId}
                        expirationDate={expirationDate}
                        onExpirationDateChange={setExpirationDate}
                        selectedCustomer={selectedCustomer}
                        customerName={customerName}
                        customerPhone={customerPhone}
                        customerEmail={customerEmail}
                        onCustomerNameChange={handleCustomerSearchChange}
                        onCustomerPhoneChange={setCustomerPhone}
                        onCustomerEmailChange={setCustomerEmail}
                        onCustomerSelect={handleCustomerSelect}
                        onClearCustomer={handleClearCustomer}
                        customerSearchResults={customerSearch.results}
                        customerSearchIsSearching={customerSearch.isSearching}
                        customerSearchShowDropdown={customerSearch.showDropdown}
                        onCustomerSearchFocus={customerSearch.openDropdown}
                        onCustomerSearchCloseDropdown={customerSearch.closeDropdown}
                        categories={categories}
                    />
                )}
            </div>

            {activeTab !== "special" && activeTab !== "specialBatch" && (
                <div className="space-y-2 grid grid-cols-2 gap-2">
                    <div>
                        <Label htmlFor="category" required>
                            Kategori Voucher
                        </Label>
                        <Select value={categoryId} onValueChange={setCategoryId}>
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
                    <div>
                        <Label htmlFor="category">Kode Sales</Label>
                        <Input
                            id="sales-code"
                            value={kdSales}
                            onChange={(e) => setKdSales(e.target.value)}
                            placeholder="AA..."
                        />
                    </div>
                    <div className="col-span-2">
                        <Label htmlFor="regular-expiry">Tanggal Kadaluarsa <span className="text-muted-foreground text-xs">(opsional)</span></Label>
                        <Input
                            id="regular-expiry"
                            type="date"
                            value={regularExpiryDate}
                            onChange={(e) => setRegularExpiryDate(e.target.value)}
                        />
                    </div>
                </div>
            )}

            {error && <p className="text-sm text-red-600">{error}</p>}

            <Button type="submit" className="w-full" disabled={processing}>
                {processing ? "Tambah..." : `Simpan Voucher`}
            </Button>
        </form>
    );
}
