import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Badge } from "@/components/ui/badge";
import { X } from "lucide-react";
import React from "react";

interface SingleVoucherTabProps {
    codes: string[];
    currentCode: string;
    onCurrentCodeChange: (value: string) => void;
    onAddCode: () => void;
    onRemoveCode: (code: string) => void;
}

export default function SingleVoucherTab({
    codes,
    currentCode,
    onCurrentCodeChange,
    onAddCode,
    onRemoveCode,
}: SingleVoucherTabProps) {
    return (
        <div className="space-y-4">
            <Label htmlFor="single-code" required>
                Kode Voucher Satuan
            </Label>
            <div className="flex items-center gap-2">
                <Input
                    id="single-code"
                    placeholder="e.g., PROMO123"
                    value={currentCode}
                    onChange={(e) => onCurrentCodeChange(e.target.value)}
                    onKeyDown={(e) =>
                        e.key === "Enter" &&
                        (e.preventDefault(), onAddCode())
                    }
                />
                <Button type="button" onClick={onAddCode}>
                    Tambah
                </Button>
            </div>
            <div className="flex min-h-[60px] flex-wrap gap-2 rounded-md border p-2">
                {codes.length === 0 ? (
                    <span className="p-2 text-sm text-muted-foreground">
                        Kode yang ditambahkan akan muncul di sini...
                    </span>
                ) : (
                    codes.map((code) => (
                        <Badge key={code} variant="secondary">
                            {code}
                            <button
                                type="button"
                                className="ml-2 rounded-full p-0.5 hover:bg-destructive/80"
                                onClick={() => onRemoveCode(code)}
                            >
                                <X size={12} />
                            </button>
                        </Badge>
                    ))
                )}
            </div>
        </div>
    );
} 