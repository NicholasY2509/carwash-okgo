"use strict";
exports.__esModule = true;
exports.useTransactionHandler = void 0;
var sweetalert2_1 = require("sweetalert2");
var sonner_1 = require("sonner");
exports.useTransactionHandler = function (_a) {
    var onSuccess = _a.onSuccess, reset = _a.reset;
    var handleSuccess = function (page, printFunction) {
        var _a;
        var newTransaction = (_a = page.props.flash) === null || _a === void 0 ? void 0 : _a.transaction;
        if (newTransaction) {
            onSuccess();
            sweetalert2_1["default"].fire({
                icon: "success",
                title: "Proses Berhasil",
                html: "\n                    <div>\n                        <p>Transaksi untuk <strong>" + newTransaction.customer.name + "</strong> berhasil.</p>\n                        <p>No. Referensi: <strong>" + newTransaction.id + "</strong></p>\n                    </div>\n                ",
                showConfirmButton: true,
                confirmButtonText: "Tutup",
                showDenyButton: !!printFunction,
                denyButtonText: "Cetak Struk",
                customClass: {
                    popup: "swal-custom-popup",
                    denyButton: "swal-print-button"
                }
            }).then(function (result) {
                if (result.isDenied && printFunction) {
                    printFunction(newTransaction);
                }
                if (printFunction) {
                    sonner_1.toast.info("Butuh salinan struk lagi?", {
                        duration: Infinity,
                        action: {
                            label: "Cetak Ulang",
                            onClick: function () { return printFunction(newTransaction); }
                        }
                    });
                }
                reset();
            });
        }
        else {
            console.error("Data transaksi tidak ditemukan di dalam flash props!");
            sweetalert2_1["default"].fire({
                icon: "success",
                title: "Proses Berhasil",
                text: "Data berhasil disimpan.",
                showConfirmButton: true
            });
            onSuccess();
            reset();
        }
    };
    var handleError = function () {
        sweetalert2_1["default"].fire({
            icon: "error",
            title: "Gagal",
            text: "Terjadi kesalahan saat menyimpan data."
        });
    };
    return { handleSuccess: handleSuccess, handleError: handleError };
};
