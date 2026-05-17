"use strict";
exports.__esModule = true;
exports.VoucherSelectionModal = void 0;
var alert_dialog_1 = require("@/components/ui/alert-dialog");
var checkbox_1 = require("@/components/ui/checkbox");
var lucide_react_1 = require("lucide-react");
var react_1 = require("react");
function VoucherSelectionModal(_a) {
    var isOpen = _a.isOpen, onOpenChange = _a.onOpenChange, isLoading = _a.isLoading, availableVouchers = _a.availableVouchers, selectedVoucherIds = _a.selectedVoucherIds, onVoucherCheckboxChange = _a.onVoucherCheckboxChange, onSave = _a.onSave, selectedVoucherPacket = _a.selectedVoucherPacket, packetAmount = _a.packetAmount;
    var vouchersPerPacket = (selectedVoucherPacket === null || selectedVoucherPacket === void 0 ? void 0 : selectedVoucherPacket.quantity) || 1;
    var selectionLimit = (packetAmount || 1) * vouchersPerPacket;
    var voucherGroups = react_1.useMemo(function () {
        var groups = [];
        for (var i = 0; i < availableVouchers.length; i += vouchersPerPacket) {
            groups.push(availableVouchers.slice(i, i + vouchersPerPacket));
        }
        return groups;
    }, [availableVouchers, vouchersPerPacket]);
    var isGroupSelected = function (group) {
        return group.every(function (voucher) { return selectedVoucherIds.includes(voucher.id); });
    };
    var isGroupIndeterminate = function (group) {
        return group.some(function (voucher) { return selectedVoucherIds.includes(voucher.id); }) &&
            !isGroupSelected(group);
    };
    var getGroupCheckedState = function (group) {
        if (isGroupSelected(group))
            return true;
        if (isGroupIndeterminate(group))
            return "indeterminate";
        return false;
    };
    var canSelectMore = selectedVoucherIds.length < selectionLimit;
    var isVoucherDisabled = function (voucherId) {
        return !selectedVoucherIds.includes(voucherId) && !canSelectMore;
    };
    var isGroupDisabled = function (group) {
        if (group.every(function (voucher) { return selectedVoucherIds.includes(voucher.id); }))
            return false;
        if (selectedVoucherIds.length + group.length > selectionLimit)
            return true;
        return !canSelectMore;
    };
    var handleGroupCheckboxChange = function (group, checked) {
        if (checked) {
            var availableSlots = selectionLimit - selectedVoucherIds.length;
            var toAdd = group
                .filter(function (voucher) { return !selectedVoucherIds.includes(voucher.id); })
                .slice(0, availableSlots);
            toAdd.forEach(function (voucher) {
                onVoucherCheckboxChange(voucher.id, true);
            });
        }
        else {
            group.forEach(function (voucher) {
                onVoucherCheckboxChange(voucher.id, false);
            });
        }
    };
    var handleVoucherCheckboxChange = function (voucherId, checked) {
        if (checked && !canSelectMore)
            return;
        onVoucherCheckboxChange(voucherId, checked);
    };
    return (React.createElement(alert_dialog_1.AlertDialog, { open: isOpen, onOpenChange: onOpenChange },
        React.createElement(alert_dialog_1.AlertDialogContent, { className: "max-w-2xl" },
            React.createElement(alert_dialog_1.AlertDialogHeader, null,
                React.createElement(alert_dialog_1.AlertDialogTitle, null, "Pilih Nomor Voucher"),
                React.createElement(alert_dialog_1.AlertDialogDescription, null,
                    "Pilih ",
                    vouchersPerPacket,
                    " nomor voucher per paket.",
                    React.createElement("br", null),
                    "Terpilih: ",
                    selectedVoucherIds.length,
                    " / ",
                    selectionLimit)),
            isLoading ? (React.createElement("div", { className: "flex justify-center items-center h-40" },
                React.createElement(lucide_react_1.LoaderCircle, { className: "h-8 w-8 animate-spin text-primary" }))) : (React.createElement("div", { className: "max-h-80 overflow-y-auto p-2 border rounded-md" },
                React.createElement("div", { className: "space-y-4" }, voucherGroups.map(function (group, idx) {
                    var _a, _b;
                    return (React.createElement("div", { key: idx, className: "border rounded p-2" },
                        React.createElement("div", { className: "flex items-center mb-2" },
                            React.createElement(checkbox_1.Checkbox, { id: "group-" + idx, checked: getGroupCheckedState(group), onCheckedChange: function (checked) {
                                    return handleGroupCheckboxChange(group, checked === true);
                                }, disabled: isGroupDisabled(group) }),
                            React.createElement("label", { htmlFor: "group-" + idx, className: "ml-2 font-semibold cursor-pointer" },
                                "Group ",
                                idx + 1,
                                " (Vouchers",
                                " ", (_a = group[0]) === null || _a === void 0 ? void 0 :
                                _a.serial_number,
                                " -",
                                " ", (_b = group[group.length - 1]) === null || _b === void 0 ? void 0 :
                                _b.serial_number,
                                ")")),
                        React.createElement("div", { className: "grid grid-cols-2 md:grid-cols-3 gap-2" }, group.map(function (voucher) { return (React.createElement("div", { key: voucher.id, className: "flex items-center space-x-2" },
                            React.createElement(checkbox_1.Checkbox, { id: "voucher-" + voucher.id, checked: selectedVoucherIds.includes(voucher.id), onCheckedChange: function (checked) {
                                    return handleVoucherCheckboxChange(voucher.id, !!checked);
                                }, disabled: isVoucherDisabled(voucher.id) }),
                            React.createElement("label", { htmlFor: "voucher-" + voucher.id, className: "text-sm font-medium leading-none cursor-pointer" }, voucher.serial_number))); }))));
                })))),
            !canSelectMore && (React.createElement("div", { className: "text-xs text-red-500 mt-2" },
                "Maksimal ",
                selectionLimit,
                " voucher dapat dipilih sesuai jumlah paket yang dibeli.")),
            React.createElement(alert_dialog_1.AlertDialogFooter, null,
                React.createElement(alert_dialog_1.AlertDialogCancel, null, "Batal"),
                React.createElement(alert_dialog_1.AlertDialogAction, { onClick: onSave }, "Simpan Pilihan")))));
}
exports.VoucherSelectionModal = VoucherSelectionModal;
