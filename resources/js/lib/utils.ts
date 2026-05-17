import { type ClassValue, clsx } from 'clsx';
import { twMerge } from 'tailwind-merge';
import { currencyFormatter } from './currency-formatter';

export function cn(...inputs: ClassValue[]) {
    return twMerge(clsx(inputs));
}

/**
 * Format date to Indonesian format (DD Bulan YYYY)
 * @param date - Date string (YYYY-MM-DD or ISO format) or Date object
 * @param format - 'long' for "01 Januari 2024", 'short' for "01/01/2024"
 */
export function formatDate(date: string | Date | null | undefined, format: 'long' | 'short' = 'long'): string {
    if (!date) return '-';

    try {
        const dateObj = typeof date === 'string' ? new Date(date + 'T00:00:00') : date;

        if (isNaN(dateObj.getTime())) {
            return '-';
        }

        if (format === 'short') {
            const day = String(dateObj.getDate()).padStart(2, '0');
            const month = String(dateObj.getMonth() + 1).padStart(2, '0');
            const year = dateObj.getFullYear();
            return `${day}/${month}/${year}`;
        }

        const months = [
            'Januari', 'Februari', 'Maret', 'April', 'Mei', 'Juni',
            'Juli', 'Agustus', 'September', 'Oktober', 'November', 'Desember'
        ];

        const day = dateObj.getDate();
        const month = months[dateObj.getMonth()];
        const year = dateObj.getFullYear();

        return `${day} ${month} ${year}`;
    } catch (error) {
        console.error('Error formatting date:', error);
        return '-';
    }
}

/**
 * Format number as currency (IDR)
 * @param value - Number to format
 */
export function formatCurrency(value: number | null | undefined): string {
    if (value === null || value === undefined) return '-';
    return currencyFormatter.format(value);
}
