type TransactionItem = {
    id: number;
    name: string;
    qty: number;
    price: number;
    total: number;
};

type Transaction = {
    id: string;
    date: string;
    items: TransactionItem[];
    total: number;
    paid: number;
};

import React from "react";

type Props = {
    transaction: Transaction;
};

const Receipt: React.FC<Props> = ({ transaction }) => {
    return (
        <div
            id="print-area"
            style={{ fontFamily: "monospace", width: "250px" }}
        >
            <h3 style={{ textAlign: "center" }}>TOKO KITA</h3>
            <p>No. Transaksi: {transaction.id}</p>
            <p>Tanggal: {transaction.date}</p>
            <hr />
            {transaction.items.map((item) => (
                <div key={item.id}>
                    <p>{item.name}</p>
                    <p>
                        x{item.qty} @ Rp{item.price.toLocaleString()} = Rp
                        {item.total.toLocaleString()}
                    </p>
                </div>
            ))}
            <hr />
            <p>Total: Rp {transaction.total.toLocaleString()}</p>
            <p>Bayar: Rp {transaction.paid.toLocaleString()}</p>
            <p>
                Kembali: Rp{" "}
                {(transaction.paid - transaction.total).toLocaleString()}
            </p>
            <hr />
            <p style={{ textAlign: "center" }}>Terima kasih!</p>
        </div>
    );
};

export default Receipt;
