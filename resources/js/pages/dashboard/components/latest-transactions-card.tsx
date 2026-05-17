import { useState } from "react";
import { Card, CardHeader, CardContent, CardTitle } from "@/components/ui/card";
import {
    Table,
    TableHeader,
    TableBody,
    TableRow,
    TableHead,
    TableCell,
} from "@/components/ui/table";
import { Modal, ModalHeader } from "@/components/ui/modal";

interface LatestTransactionsCardProps {
    latestTransactions: any[];
}

export default function LatestTransactionsCard({
    latestTransactions,
}: LatestTransactionsCardProps) {
    const [open, setOpen] = useState(false);
    const [selected, setSelected] = useState<any | null>(null);

    function handleRowClick(tx: any) {
        setSelected(tx);
        setOpen(true);
    }

    function formatRupiah(amount: number | undefined) {
        if (typeof amount !== "number") return "-";
        return amount.toLocaleString("id-ID", {
            style: "currency",
            currency: "IDR",
        });
    }

    return (
        <Card className="flex flex-col h-full">
            <CardHeader>
                <CardTitle className="text-sm font-medium">
                    5 Cuci Mobil Terakhir
                </CardTitle>
            </CardHeader>
            <CardContent className="flex-1 flex flex-col">
                <div className="flex-1 flex flex-col">
                    <Table>
                        <TableHeader>
                            <TableRow>
                                <TableHead>Customer</TableHead>
                                <TableHead>Plat</TableHead>
                                <TableHead>Jam</TableHead>
                                <TableHead>Stall</TableHead>
                            </TableRow>
                        </TableHeader>
                        <TableBody>
                            {latestTransactions.length === 0 ? (
                                <TableRow>
                                    <TableCell
                                        colSpan={4}
                                        className="text-center text-muted-foreground py-2"
                                    >
                                        Tidak ada transaksi terbaru.
                                    </TableCell>
                                </TableRow>
                            ) : (
                                latestTransactions.map((tx) => (
                                    <TableRow
                                        key={tx.id}
                                        className="cursor-pointer hover:bg-primary/10"
                                        onClick={() => handleRowClick(tx)}
                                    >
                                        <TableCell>
                                            {tx.customer?.name || "-"}
                                        </TableCell>
                                        <TableCell>
                                            {tx.car?.plate_number || "-"}
                                        </TableCell>
                                        <TableCell>
                                            {tx.transaction_date
                                                ? new Date(
                                                      tx.transaction_date,
                                                  ).toLocaleTimeString(
                                                      "id-ID",
                                                      {
                                                          hour: "2-digit",
                                                          minute: "2-digit",
                                                      },
                                                  )
                                                : "-"}
                                        </TableCell>
                                        <TableCell>
                                            {tx.service_records &&
                                            tx.service_records.length > 0 &&
                                            tx.service_records[0].stall
                                                ? tx.service_records[0].stall
                                                      .name
                                                : "-"}
                                        </TableCell>
                                    </TableRow>
                                ))
                            )}
                        </TableBody>
                    </Table>
                </div>
                <Modal open={open} onClose={() => setOpen(false)}>
                    <ModalHeader title="Detail Lengkap Transaksi" />
                    {selected && (
                        <div className="space-y-2 text-sm">
                            <div>
                                <b>ID:</b> {selected.id}
                            </div>
                            <div>
                                <b>Customer:</b>{" "}
                                {selected.customer?.name || "-"}
                            </div>
                            <div>
                                <b>Plat:</b> {selected.car?.plate_number || "-"}
                            </div>
                            <div>
                                <b>Jam:</b>{" "}
                                {selected.transaction_date
                                    ? new Date(
                                          selected.transaction_date,
                                      ).toLocaleTimeString("id-ID", {
                                          hour: "2-digit",
                                          minute: "2-digit",
                                      })
                                    : "-"}
                            </div>
                            <div>
                                <b>Tanggal:</b>{" "}
                                {selected.transaction_date
                                    ? new Date(
                                          selected.transaction_date,
                                      ).toLocaleDateString("id-ID")
                                    : "-"}
                            </div>
                            <div>
                                <b>Jenis Transaksi:</b>{" "}
                                {selected.transaction_type || "-"}
                            </div>
                            <div>
                                <b>Total:</b>{" "}
                                {formatRupiah(selected.total_amount)}
                            </div>
                            <div>
                                <b>Status:</b> {selected.status || "-"}
                            </div>
                            <div>
                                <b>Service Records:</b>
                                {selected.service_records &&
                                selected.service_records.length > 0 ? (
                                    <ul className="ml-4 list-disc">
                                        {selected.service_records.map(
                                            (sr: any, idx: number) => (
                                                <li
                                                    key={sr.id || idx}
                                                    className="mb-2"
                                                >
                                                    <div>
                                                        <b>Stall:</b>{" "}
                                                        {sr.stall?.name || "-"}
                                                    </div>
                                                    <div>
                                                        <b>Service:</b>{" "}
                                                        {sr.service_name || "-"}
                                                    </div>
                                                    <div>
                                                        <b>Waktu:</b>{" "}
                                                        {sr.created_at
                                                            ? new Date(
                                                                  sr.created_at,
                                                              ).toLocaleString(
                                                                  "id-ID",
                                                              )
                                                            : "-"}
                                                    </div>
                                                    {/* Add more fields as needed */}
                                                </li>
                                            ),
                                        )}
                                    </ul>
                                ) : (
                                    " -"
                                )}
                            </div>
                        </div>
                    )}
                </Modal>
            </CardContent>
        </Card>
    );
}
