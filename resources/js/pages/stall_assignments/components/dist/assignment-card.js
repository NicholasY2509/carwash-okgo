"use strict";
exports.__esModule = true;
var button_1 = require("@/components/ui/button");
var card_1 = require("@/components/ui/card");
var react_1 = require("@inertiajs/react");
var react_2 = require("react");
var label_1 = require("@/components/ui/label");
var separator_1 = require("@/components/ui/separator");
var modal_1 = require("@/components/ui/modal");
var assign_staff_form_1 = require("../forms/assign-staff-form");
var active_staff_list_1 = require("./active-staff-list");
var sonner_1 = require("sonner");
var assignment_card_header_1 = require("./assignment-card-header");
var alert_dialog_1 = require("@/components/ui/alert-dialog");
function AssignmentCard(_a) {
    var stall = _a.stall, staffs = _a.staffs;
    var _b = react_2.useState(false), isModalOpen = _b[0], setIsModalOpen = _b[1];
    var _c = react_2.useState(false), isAlertOpen = _c[0], setIsAlertOpen = _c[1];
    var _d = react_2.useState(null), assignmentToDelete = _d[0], setAssignmentToDelete = _d[1];
    var initiateDelete = function (assignmentId) {
        setAssignmentToDelete(assignmentId);
        setIsAlertOpen(true);
    };
    var executeDelete = function () {
        if (assignmentToDelete === null)
            return;
        react_1.router["delete"]("/stall-assignments/" + assignmentToDelete, {
            preserveScroll: true,
            onSuccess: function () {
                sonner_1.toast("Tugas staff berhasil dihapus.");
            },
            onError: function (errors) {
                sonner_1.toast("Gagal menghapus tugas. Silakan coba lagi.");
                console.error("Error deleting assignment:", errors);
            },
            onFinish: function () {
                setAssignmentToDelete(null);
            }
        });
    };
    return (React.createElement(React.Fragment, null,
        React.createElement(card_1.Card, null,
            React.createElement(card_1.CardHeader, null,
                React.createElement(card_1.CardTitle, null, stall.name)),
            React.createElement(card_1.CardContent, null,
                React.createElement(assignment_card_header_1["default"], { staffs: staffs, stall: stall }),
                React.createElement(separator_1.Separator, { className: "my-4" }),
                React.createElement("div", { className: "flex flex-row justify-between items-center" },
                    React.createElement(label_1.Label, { className: "font-semibold" }, "Staff Bertugas"),
                    React.createElement(button_1.Button, { onClick: function () { return setIsModalOpen(true); }, variant: "default", size: "sm" }, "Tambah")),
                React.createElement(active_staff_list_1["default"], { activeStaffs: stall.active_teams, onDelete: initiateDelete }))),
        React.createElement(modal_1.Modal, { open: isModalOpen, onClose: function () { return setIsModalOpen(false); } },
            React.createElement(modal_1.ModalHeader, { title: "Tambah Staff untuk " + stall.name }),
            React.createElement(assign_staff_form_1["default"], { onCancel: function () { return setIsModalOpen(false); }, onSuccess: function () { return setIsModalOpen(false); }, staffs: staffs, stall: stall })),
        React.createElement(alert_dialog_1.AlertDialog, { open: isAlertOpen, onOpenChange: setIsAlertOpen },
            React.createElement(alert_dialog_1.AlertDialogContent, null,
                React.createElement(alert_dialog_1.AlertDialogHeader, null,
                    React.createElement(alert_dialog_1.AlertDialogTitle, null, "Anda Yakin?"),
                    React.createElement(alert_dialog_1.AlertDialogDescription, null, "Hapus penugasan ini?")),
                React.createElement(alert_dialog_1.AlertDialogFooter, null,
                    React.createElement(alert_dialog_1.AlertDialogCancel, { onClick: function () { return setAssignmentToDelete(null); } }, "Batal"),
                    React.createElement(alert_dialog_1.AlertDialogAction, { onClick: executeDelete, className: "bg-destructive  hover:bg-destructive/90" }, "Ya, Hapus"))))));
}
exports["default"] = AssignmentCard;
