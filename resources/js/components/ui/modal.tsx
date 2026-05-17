// File: components/ui/modal.tsx (atau di mana pun Anda menyimpannya)

import React from "react";

export function Modal({
    open,
    onClose,
    children,
    className, // <-- 1. Terima prop baru
}: {
    open: boolean;
    onClose: () => void;
    children: React.ReactNode;
    className?: string; // Jadikan opsional
}) {
    if (!open) return null;
    const modalClasses = `
        relative w-full bg-popover rounded-lg shadow-xl  sm:p-8
        ${className || "max-w-lg"}
    `; // Default ke max-w-lg jika className tidak ada

    return (
        <div
            className="fixed inset-0 z-50 flex items-center justify-center bg-black/70 animate-fadeIn"
            role="dialog"
            aria-modal="true"
        >
            <div className={modalClasses}>
                {" "}
                {/* Gunakan class yang sudah digabung */}
                <button
                    onClick={onClose}
                    aria-label="Close modal"
                    className="absolute top-4 right-4 text-gray-500 hover:text-gray-900 dark:hover:text-gray-300 transition-colors"
                >
                    <svg
                        xmlns="http://www.w3.org/2000/svg"
                        className="h-6 w-6"
                        fill="none"
                        viewBox="0 0 24 24"
                        stroke="currentColor"
                        strokeWidth={2}
                    >
                        <path
                            strokeLinecap="round"
                            strokeLinejoin="round"
                            d="M6 18L18 6M6 6l12 12"
                        />
                    </svg>
                </button>
                <div className="mt-2">{children}</div>
            </div>
        </div>
    );
}

export function ModalHeader({ title }: { title: string }) {
    return <h2 className="mb-4 text-xl font-semibold">{title}</h2>;
}
