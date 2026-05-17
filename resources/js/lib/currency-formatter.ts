// Memoized currency formatters for better performance
const formatters = new Map<string, Intl.NumberFormat>();

function getFormatter(
    locale: string = "id-ID",
    currency: string = "IDR",
    minimumFractionDigits: number = 0,
): Intl.NumberFormat {
    const key = `${locale}-${currency}-${minimumFractionDigits}`;

    if (!formatters.has(key)) {
        formatters.set(
            key,
            new Intl.NumberFormat(locale, {
                style: "currency",
                currency,
                minimumFractionDigits,
            }),
        );
    }

    return formatters.get(key)!;
}

export const currencyFormatter = {
    // Format without decimals (e.g., Rp 50.000)
    format: (value: number): string => {
        return getFormatter("id-ID", "IDR", 0).format(value);
    },

    // Format with decimals (e.g., Rp 50.000,00)
    formatWithDecimals: (value: number): string => {
        return getFormatter("id-ID", "IDR", 2).format(value);
    },

    // Custom formatter
    formatCustom: (
        value: number,
        locale: string = "id-ID",
        currency: string = "IDR",
        minimumFractionDigits: number = 0,
    ): string => {
        return getFormatter(locale, currency, minimumFractionDigits).format(
            value,
        );
    },
};

// Pre-format common values for better performance
export const preformattedValues = new Map<number, string>();

export function getPreformattedValue(value: number): string {
    if (!preformattedValues.has(value)) {
        preformattedValues.set(value, currencyFormatter.format(value));
    }
    return preformattedValues.get(value)!;
}

// Clear formatters cache (useful for testing or memory management)
export function clearFormattersCache(): void {
    formatters.clear();
    preformattedValues.clear();
}
