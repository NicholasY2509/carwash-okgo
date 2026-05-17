import { Input } from "@/components/ui/input";
import { LoaderCircle } from "lucide-react";
import React from "react";

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

interface CarPlateSearchProps {
    value: string;
    onValueChange: (value: string) => void;
    searchResults: { car: car; customer: Customer }[];
    isSearching: boolean;
    showDropdown: boolean;
    onFocus: () => void;
    onSelect: (result: { car: car; customer: Customer }) => void;
    onCloseDropdown: () => void;
}

const CarPlateSearch = ({
    value,
    onValueChange,
    searchResults,
    isSearching,
    showDropdown,
    onFocus,
    onSelect,
    onCloseDropdown,
}: CarPlateSearchProps) => {
    const searchWrapperRef = React.useRef<HTMLDivElement>(null);
    React.useEffect(() => {
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
            <Input
                id="car_plate_number"
                placeholder="Cari atau masukkan plat baru..."
                value={value}
                onChange={(e: React.ChangeEvent<HTMLInputElement>) =>
                    onValueChange(e.target.value)
                }
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
                    {searchResults.map((result) => (
                        <div
                            key={result.car.id}
                            className="cursor-pointer rounded-sm p-2 text-sm hover:bg-accent"
                            onClick={() => onSelect(result)}
                        >
                            {result.car.plate_number} - {result.car.model} (
                            {result.customer.name})
                        </div>
                    ))}
                </div>
            )}
        </div>
    );
};

export default CarPlateSearch;
