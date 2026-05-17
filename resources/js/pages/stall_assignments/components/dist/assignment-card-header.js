"use strict";
exports.__esModule = true;
var button_1 = require("@/components/ui/button");
var command_1 = require("@/components/ui/command");
var utils_1 = require("@/lib/utils");
var react_popover_1 = require("@radix-ui/react-popover");
var lucide_react_1 = require("lucide-react");
var label_1 = require("@/components/ui/label");
var react_1 = require("react");
var react_2 = require("@inertiajs/react");
var sonner_1 = require("sonner");
function AssignmentCardHeader(_a) {
    var _b, _c, _d, _e;
    var staffs = _a.staffs, stall = _a.stall;
    var _f = react_2.useForm({
        stall_id: stall.id,
        driver_id: ((_b = stall.active_staffs.find(function (staff) { return staff.pivot.position === "DRIVER"; })) === null || _b === void 0 ? void 0 : _b.id) || "",
        qc_id: ((_c = stall.active_staffs.find(function (staff) { return staff.pivot.position === "QC"; })) === null || _c === void 0 ? void 0 : _c.id) || ""
    }), setData = _f.setData, data = _f.data, errors = _f.errors, post = _f.post, processing = _f.processing, reset = _f.reset;
    var _g = react_1.useState(false), openDriver = _g[0], setOpenDriver = _g[1];
    var _h = react_1.useState(false), openQC = _h[0], setOpenQC = _h[1];
    var handleSubmit = function (e) {
        e.preventDefault();
        post(route("stall-assignments.set-stall-head"), {
            preserveScroll: true,
            onSuccess: function () {
                sonner_1.toast.success("Driver dan QC disimpan");
            },
            onError: function () { }
        });
    };
    return (React.createElement("form", { onSubmit: handleSubmit },
        React.createElement("div", { className: "flex flex-col lg:flex-row gap-4 items-center" },
            React.createElement("div", { className: "flex w-full flex-row gap-2 items-center" },
                React.createElement(label_1.Label, null, "Driver"),
                React.createElement(react_popover_1.Popover, { open: openDriver, onOpenChange: setOpenDriver },
                    React.createElement(react_popover_1.PopoverTrigger, { asChild: true },
                        React.createElement(button_1.Button, { variant: "outline", role: "combobox", className: "w-full justify-between" },
                            data.driver_id
                                ? (_d = staffs.find(function (staff) {
                                    return staff.id === data.driver_id;
                                })) === null || _d === void 0 ? void 0 : _d.full_name : "Pilih driver...",
                            React.createElement(lucide_react_1.ChevronsUpDown, { className: "ml-2 h-4 w-4 shrink-0 opacity-50" }))),
                    React.createElement(react_popover_1.PopoverContent, { className: "w-[--radix-popover-trigger-width] p-0" },
                        React.createElement(command_1.Command, null,
                            React.createElement(command_1.CommandInput, { placeholder: "Cari staff..." }),
                            React.createElement(command_1.CommandList, null,
                                React.createElement(command_1.CommandEmpty, null, "No staff found."),
                                React.createElement(command_1.CommandGroup, null, staffs.map(function (staff) { return (React.createElement(command_1.CommandItem, { key: staff.id, value: staff.id, className: "cursor-pointer", onSelect: function () {
                                        var newValue = staff.id ===
                                            data.driver_id
                                            ? ""
                                            : staff.id;
                                        setData("driver_id", newValue);
                                        setOpenDriver(false);
                                    } },
                                    React.createElement(lucide_react_1.Check, { className: utils_1.cn("mr-2 h-4 w-4", data.driver_id ===
                                            staff.id
                                            ? "opacity-100"
                                            : "opacity-0") }),
                                    staff.full_name)); }))))))),
            React.createElement("div", { className: "flex w-full flex-row gap-2 items-center" },
                React.createElement(label_1.Label, null, "QC"),
                React.createElement(react_popover_1.Popover, { open: openQC, onOpenChange: setOpenQC },
                    React.createElement(react_popover_1.PopoverTrigger, { asChild: true },
                        React.createElement(button_1.Button, { variant: "outline", role: "combobox", className: "w-full justify-between" },
                            data.qc_id
                                ? (_e = staffs.find(function (staff) { return staff.id === data.qc_id; })) === null || _e === void 0 ? void 0 : _e.full_name : "Pilih QC",
                            React.createElement(lucide_react_1.ChevronsUpDown, { className: "ml-2 h-4 w-4 shrink-0 opacity-50" }))),
                    React.createElement(react_popover_1.PopoverContent, { className: "w-[--radix-popover-trigger-width] p-0" },
                        React.createElement(command_1.Command, null,
                            React.createElement(command_1.CommandInput, { placeholder: "Cari staff..." }),
                            React.createElement(command_1.CommandList, null,
                                React.createElement(command_1.CommandEmpty, null, "No staff found."),
                                React.createElement(command_1.CommandGroup, null, staffs.map(function (staff) { return (React.createElement(command_1.CommandItem, { key: staff.id, value: staff.id, className: "cursor-pointer", onSelect: function () {
                                        var newValue = staff.id === data.qc_id
                                            ? ""
                                            : staff.id;
                                        setData("qc_id", newValue);
                                        setOpenQC(false);
                                    } },
                                    React.createElement(lucide_react_1.Check, { className: utils_1.cn("mr-2 h-4 w-4", data.qc_id === staff.id
                                            ? "opacity-100"
                                            : "opacity-0") }),
                                    staff.full_name)); }))))))),
            React.createElement(button_1.Button, { type: "submit", variant: "default", size: "sm", disabled: processing, className: "w-full lg:w-auto" }, "Simpan"))));
}
exports["default"] = AssignmentCardHeader;
