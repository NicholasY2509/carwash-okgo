import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import React from "react";

interface BatchVoucherTabProps {
    rangeStart: string;
    rangeEnd: string;
    onRangeStartChange: (value: string) => void;
    onRangeEndChange: (value: string) => void;
    batchCodesPreview: string[];
}

export default function BatchVoucherTab({
    rangeStart,
    rangeEnd,
    onRangeStartChange,
    onRangeEndChange,
    batchCodesPreview,
}: BatchVoucherTabProps) {
    return (
        <div className="space-y-2">
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
        </div>
    );
} 