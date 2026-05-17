"use strict";
var __spreadArrays = (this && this.__spreadArrays) || function () {
    for (var s = 0, i = 0, il = arguments.length; i < il; i++) s += arguments[i].length;
    for (var r = Array(s), k = 0, i = 0; i < il; i++)
        for (var a = arguments[i], j = 0, jl = a.length; j < jl; j++, k++)
            r[k] = a[j];
    return r;
};
exports.__esModule = true;
var alert_1 = require("@/components/ui/alert");
var lucide_react_1 = require("lucide-react");
var button_1 = require("@/components/ui/button");
var react_1 = require("react");
function ReminderAlert(_a) {
    var reminders = _a.reminders;
    var _b = react_1.useState([]), dismissedReminders = _b[0], setDismissedReminders = _b[1];
    var visibleReminders = reminders.filter(function (reminder) { return !dismissedReminders.includes(reminder.type + "-" + reminder.title); });
    if (visibleReminders.length === 0) {
        return null;
    }
    var dismissReminder = function (reminder) {
        setDismissedReminders(function (prev) { return __spreadArrays(prev, [reminder.type + "-" + reminder.title]); });
    };
    var getPriorityIcon = function (priority) {
        switch (priority) {
            case 'high':
                return React.createElement(lucide_react_1.AlertTriangle, { className: "h-4 w-4" });
            case 'medium':
                return React.createElement(lucide_react_1.Clock, { className: "h-4 w-4" });
            default:
                return React.createElement(lucide_react_1.AlertTriangle, { className: "h-4 w-4" });
        }
    };
    var getPriorityVariant = function (priority) {
        switch (priority) {
            case 'high':
                return 'destructive';
            case 'medium':
            default:
                return 'default';
        }
    };
    return (React.createElement("div", { className: "space-y-3 w-full flex flex-col" }, visibleReminders.map(function (reminder, index) { return (React.createElement(alert_1.Alert, { key: index, variant: getPriorityVariant(reminder.priority), className: "w-full !block" },
        React.createElement("div", { className: "flex items-start justify-between w-full" },
            React.createElement("div", { className: "flex items-start gap-3 w-full" },
                getPriorityIcon(reminder.priority),
                React.createElement("div", { className: "flex-1" },
                    React.createElement(alert_1.AlertTitle, { className: "text-sm font-semibold w-full" }, reminder.title),
                    React.createElement(alert_1.AlertDescription, { className: "text-sm mt-1 whitespace-normal w-full" }, reminder.message))),
            React.createElement(button_1.Button, { variant: "ghost", size: "sm", onClick: function () { return dismissReminder(reminder); }, className: "h-6 w-6 p-0 hover:bg-background/50" },
                React.createElement(lucide_react_1.X, { className: "h-3 w-3" }))))); })));
}
exports["default"] = ReminderAlert;
