import { Card, CardHeader, CardContent, CardTitle } from "@/components/ui/card";
import formatRupiah from "@/lib/rupiah-formatter";

interface VoucherPacketSalesCardProps {
    voucherPacketSales: { name: string; count: number }[];
    voucherPurchaseRevenue: number;
    className?: string;
}

export default function VoucherPacketSalesCard({
    voucherPacketSales,
    voucherPurchaseRevenue,
    className,
}: VoucherPacketSalesCardProps) {
    return (
        <Card className={className}>
            <CardHeader>
                <CardTitle className="text-sm font-medium">
                    Pembelian Voucher Hari ini
                </CardTitle>
            </CardHeader>
            <CardContent>
                <div className="md:columns-2 md:gap-x-8">
                    {voucherPacketSales.map((pkt) => (
                        <div key={pkt.name} className="break-inside-avoid mb-2">
                            <div className="flex items-center justify-between">
                                <div className="flex items-center gap-3">
                                    <span className="text-sm font-medium">
                                        {pkt.name}
                                    </span>
                                </div>
                                <div className="text-lg font-bold text-primary">
                                    {pkt.count}
                                </div>
                            </div>
                        </div>
                    ))}
                    {voucherPacketSales.length === 0 && (
                        <div className="text-muted-foreground">
                            Belum ada pembelian voucher hari ini.
                        </div>
                    )}
                </div>
                <div className="flex items-center justify-end mt-4">
                    <span className="text-lg font-bold text-primary">
                        Total:{" "}
                        {voucherPacketSales.reduce(
                            (acc, pkt) => acc + pkt.count,
                            0,
                        )}
                    </span>
                </div>
            </CardContent>
        </Card>
    );
}
