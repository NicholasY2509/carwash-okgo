"use strict";
exports.__esModule = true;
var formatRupiah = function (amount) {
    return new Intl.NumberFormat("id-ID", {
        style: "currency",
        currency: "IDR",
        minimumFractionDigits: 0
    }).format(amount);
};
exports["default"] = formatRupiah;
