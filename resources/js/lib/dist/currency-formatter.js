"use strict";
exports.__esModule = true;
exports.clearFormattersCache = exports.getPreformattedValue = exports.preformattedValues = exports.currencyFormatter = void 0;
// Memoized currency formatters for better performance
var formatters = new Map();
function getFormatter(locale, currency, minimumFractionDigits) {
    if (locale === void 0) { locale = "id-ID"; }
    if (currency === void 0) { currency = "IDR"; }
    if (minimumFractionDigits === void 0) { minimumFractionDigits = 0; }
    var key = locale + "-" + currency + "-" + minimumFractionDigits;
    if (!formatters.has(key)) {
        formatters.set(key, new Intl.NumberFormat(locale, {
            style: "currency",
            currency: currency,
            minimumFractionDigits: minimumFractionDigits
        }));
    }
    return formatters.get(key);
}
exports.currencyFormatter = {
    // Format without decimals (e.g., Rp 50.000)
    format: function (value) {
        return getFormatter("id-ID", "IDR", 0).format(value);
    },
    // Format with decimals (e.g., Rp 50.000,00)
    formatWithDecimals: function (value) {
        return getFormatter("id-ID", "IDR", 2).format(value);
    },
    // Custom formatter
    formatCustom: function (value, locale, currency, minimumFractionDigits) {
        if (locale === void 0) { locale = "id-ID"; }
        if (currency === void 0) { currency = "IDR"; }
        if (minimumFractionDigits === void 0) { minimumFractionDigits = 0; }
        return getFormatter(locale, currency, minimumFractionDigits).format(value);
    }
};
// Pre-format common values for better performance
exports.preformattedValues = new Map();
function getPreformattedValue(value) {
    if (!exports.preformattedValues.has(value)) {
        exports.preformattedValues.set(value, exports.currencyFormatter.format(value));
    }
    return exports.preformattedValues.get(value);
}
exports.getPreformattedValue = getPreformattedValue;
// Clear formatters cache (useful for testing or memory management)
function clearFormattersCache() {
    formatters.clear();
    exports.preformattedValues.clear();
}
exports.clearFormattersCache = clearFormattersCache;
