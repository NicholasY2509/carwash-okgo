"use strict";
exports.__esModule = true;
exports.ReloadPreventionIndicator = void 0;
var react_1 = require("react");
var lucide_react_1 = require("lucide-react");
exports.ReloadPreventionIndicator = function (_a) {
    var _b = _a.className, className = _b === void 0 ? "" : _b;
    var _c = react_1.useState(false), isEnabled = _c[0], setIsEnabled = _c[1];
    react_1.useEffect(function () {
        // Check initial state
        var checkState = function () {
            if (typeof window !== "undefined" &&
                window.preventReload) {
                setIsEnabled(window.preventReload.isEnabled());
            }
        };
        checkState();
        // Set up interval to check state changes
        var interval = setInterval(checkState, 1000);
        return function () { return clearInterval(interval); };
    }, []);
    if (!isEnabled)
        return null;
    return (react_1["default"].createElement("div", { className: "fixed bottom-4 right-4 z-50 flex items-center gap-2 bg-yellow-100 border border-yellow-300 text-yellow-800 px-3 py-2 rounded-lg shadow-lg text-sm " + className },
        react_1["default"].createElement(lucide_react_1.Shield, { className: "w-4 h-4" }),
        react_1["default"].createElement("span", null, "Reload Prevention Active"),
        react_1["default"].createElement("button", { onClick: function () {
                if (typeof window !== "undefined" &&
                    window.preventReload) {
                    window.preventReload.disable();
                    setIsEnabled(false);
                }
            }, className: "ml-2 text-yellow-600 hover:text-yellow-800", title: "Disable reload prevention" },
            react_1["default"].createElement(lucide_react_1.ShieldOff, { className: "w-4 h-4" }))));
};
