import { Badge } from "@/components/ui/badge";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { VoucherProp } from "../index"; // Impor tipe data dari file induk
import { format } from "date-fns";
import { id } from "date-fns/locale";

interface VoucherCardProps {
    voucher: VoucherProp;
}

export default function VoucherCard({ voucher }: VoucherCardProps) {
    const getVariant = () => {
        const status = voucher.status.toLowerCase();
        if (status === "redeemed") return "destructive";
        if (status === "active" || status === "available") return "default";
        return "secondary";
    };

    return (
        <Card>
            <CardHeader className="pb-2">
                <div className="flex justify-between items-start">
                    <CardTitle className="text-lg font-bold">
                        {voucher.serial_number}
                    </CardTitle>
                    <Badge variant={getVariant()}>{voucher.status}</Badge>
                </div>
            </CardHeader>
            <CardContent className="text-sm">
                <div className="space-y-2 text-muted-foreground">
                    <div className="flex justify-between">
                        <span>Tipe:</span>
                        <span className="font-medium text-foreground">
                            {voucher.voucher_type.name}
                        </span>
                    </div>
                    <div className="flex justify-between">
                        <span>Ditebus:</span>
                        <span className="font-medium text-foreground">
                            {voucher.redeemed_at
                                ? format(
                                      new Date(voucher.redeemed_at),
                                      "dd MMM yyyy",
                                      { locale: id },
                                  )
                                : "-"}
                        </span>
                    </div>
                </div>
            </CardContent>
        </Card>
    );
}
