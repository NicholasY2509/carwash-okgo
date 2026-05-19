import React from "react";
import { Link } from "@inertiajs/react";
import { Button } from "@/components/ui/button";
import { ChevronLeft, ChevronRight, ChevronsLeft, ChevronsRight } from "lucide-react";
import { cn } from "@/lib/utils";

export interface PaginationData {
    current_page: number;
    last_page: number;
    per_page: number;
    total: number;
    links?: {
        url: string | null;
        label: string;
        active: boolean;
    }[];
}

interface PaginationProps {
    pagination: PaginationData;
    onPageChange?: (page: number) => void;
    siblingCount?: number;
    className?: string;
    showInfo?: boolean;
    label?: string; // e.g. "data", "barang", "transaksi", etc.
}

const range = (start: number, end: number) => {
    let length = end - start + 1;
    return Array.from({ length }, (_, idx) => idx + start);
};

export function Pagination({
    pagination,
    onPageChange,
    siblingCount = 1,
    className,
    showInfo = true,
    label = "data",
}: PaginationProps) {
    const { current_page: currentPage, last_page: lastPage, per_page: perPage, total } = pagination;

    if (!lastPage || lastPage <= 1) return null;

    // Generate page numbers with ellipses
    const getPaginationRange = () => {
        const totalPageNumbers = siblingCount * 2 + 5; // first, last, current, siblings, dots

        if (totalPageNumbers >= lastPage) {
            return range(1, lastPage);
        }

        const leftSiblingIndex = Math.max(currentPage - siblingCount, 1);
        const rightSiblingIndex = Math.min(currentPage + siblingCount, lastPage);

        const shouldShowLeftDots = leftSiblingIndex > 3;
        const shouldShowRightDots = rightSiblingIndex < lastPage - 2;

        const firstPageIndex = 1;
        const lastPageIndex = lastPage;

        if (!shouldShowLeftDots && shouldShowRightDots) {
            let leftItemCount = 3 + 2 * siblingCount;
            let leftRange = range(1, leftItemCount);
            return [...leftRange, "DOTS", lastPageIndex];
        }

        if (shouldShowLeftDots && !shouldShowRightDots) {
            let rightItemCount = 3 + 2 * siblingCount;
            let rightRange = range(lastPage - rightItemCount + 1, lastPage);
            return [firstPageIndex, "DOTS", ...rightRange];
        }

        if (shouldShowLeftDots && shouldShowRightDots) {
            let middleRange = range(leftSiblingIndex, rightSiblingIndex);
            return [firstPageIndex, "DOTS", ...middleRange, "DOTS", lastPageIndex];
        }

        return range(1, lastPage);
    };

    const paginationRange = getPaginationRange();

    const handlePageClick = (page: number) => {
        if (page < 1 || page > lastPage || page === currentPage) return;
        if (onPageChange) {
            onPageChange(page);
        }
    };

    // Helper to get URL for page if links are present
    const getPageUrl = (page: number) => {
        if (!pagination.links) return "#";
        // Laravel paginator links usually have labels: "1", "2", "Next &raquo;", etc.
        // Try to find the link by exact page number first
        const matchedLink = pagination.links.find(
            (link) => link.label === page.toString()
        );
        if (matchedLink) return matchedLink.url || "#";

        // Fallback: construct it from first valid link url by replacing the page param
        const validLink = pagination.links.find((link) => link.url);
        if (validLink && validLink.url) {
            try {
                const url = new URL(validLink.url);
                url.searchParams.set("page", page.toString());
                return url.pathname + url.search;
            } catch (e) {
                // simple regex fallback
                return validLink.url.replace(/page=\d+/, `page=${page}`);
            }
        }
        return "#";
    };

    const renderButton = (page: number, content: React.ReactNode, disabled = false, variant: "outline" | "ghost" | "default" = "outline", title?: string) => {
        const isActive = page === currentPage;
        
        if (onPageChange) {
            return (
                <Button
                    key={`${page}-${variant}`}
                    variant={isActive ? "default" : variant}
                    size="sm"
                    onClick={() => handlePageClick(page)}
                    disabled={disabled}
                    title={title}
                    className={cn(
                        "h-8 w-8 p-0 font-medium transition-all duration-200",
                        isActive && "bg-blue-600 hover:bg-blue-700 text-white shadow-md border-transparent scale-105",
                        !isActive && !disabled && "hover:bg-accent hover:text-accent-foreground hover:scale-105 active:scale-95"
                    )}
                >
                    {content}
                </Button>
            );
        }

        const url = getPageUrl(page);
        const isDisabled = disabled || !url || url === "#";

        return (
            <Link
                key={`${page}-${variant}`}
                href={isDisabled ? "#" : url}
                as="button"
                disabled={isDisabled}
                title={title}
                className={cn(
                    "inline-flex items-center justify-center rounded-md text-sm font-medium transition-all duration-200 h-8 w-8 p-0 focus-visible:outline-hidden disabled:pointer-events-none disabled:opacity-50 border border-input bg-background shadow-xs",
                    isActive && "bg-blue-600 hover:bg-blue-700 text-white shadow-md border-transparent scale-105",
                    !isActive && !isDisabled && "hover:bg-accent hover:text-accent-foreground hover:scale-105 active:scale-95",
                    isDisabled && "opacity-50 cursor-not-allowed"
                )}
            >
                {content}
            </Link>
        );
    };

    // Calculate item display range
    const from = (currentPage - 1) * perPage + 1;
    const to = Math.min(currentPage * perPage, total);

    return (
        <div className={cn("flex flex-col sm:flex-row items-center justify-between gap-4 mt-4 pt-4 border-t w-full", className)}>
            {showInfo && (
                <div className="text-sm text-muted-foreground font-medium">
                    Menampilkan <span className="font-semibold text-foreground">{from}</span> sampai{" "}
                    <span className="font-semibold text-foreground">{to}</span> dari{" "}
                    <span className="font-semibold text-foreground">{total}</span> {label}
                </div>
            )}
            
            <div className="flex items-center gap-1.5">
                {/* First Page Button */}
                {renderButton(1, <ChevronsLeft className="h-4 w-4" />, currentPage === 1, "outline", "Halaman Pertama")}

                {/* Previous Page Button */}
                {renderButton(currentPage - 1, <ChevronLeft className="h-4 w-4" />, currentPage === 1, "outline", "Halaman Sebelumnya")}

                {/* Page Numbers */}
                {paginationRange.map((page, index) => {
                    if (page === "DOTS") {
                        return (
                            <span
                                key={`dots-${index}`}
                                className="h-8 w-8 flex items-center justify-center text-muted-foreground text-sm font-medium select-none"
                            >
                                &bull;&bull;&bull;
                            </span>
                        );
                    }

                    const pageNumber = page as number;
                    return renderButton(pageNumber, pageNumber.toString(), false, "outline");
                })}

                {/* Next Page Button */}
                {renderButton(currentPage + 1, <ChevronRight className="h-4 w-4" />, currentPage === lastPage, "outline", "Halaman Selanjutnya")}

                {/* Last Page Button */}
                {renderButton(lastPage, <ChevronsRight className="h-4 w-4" />, currentPage === lastPage, "outline", "Halaman Terakhir")}
            </div>
        </div>
    );
}
