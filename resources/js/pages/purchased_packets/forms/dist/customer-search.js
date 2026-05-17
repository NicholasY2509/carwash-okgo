"use strict";
exports.__esModule = true;
exports.CustomerSearch = void 0;
var input_1 = require("@/components/ui/input");
var label_1 = require("@/components/ui/label");
var react_1 = require("react");
var lucide_react_1 = require("lucide-react");
exports.CustomerSearch = function (_a) {
    var value = _a.value, onValueChange = _a.onValueChange, searchResults = _a.searchResults, isSearching = _a.isSearching, showDropdown = _a.showDropdown, onFocus = _a.onFocus, onSelect = _a.onSelect, onCloseDropdown = _a.onCloseDropdown;
    var searchWrapperRef = react_1.useRef(null);
    react_1.useEffect(function () {
        var handleClickOutside = function (event) {
            if (searchWrapperRef.current &&
                !searchWrapperRef.current.contains(event.target)) {
                onCloseDropdown();
            }
        };
        document.addEventListener("mousedown", handleClickOutside);
        return function () {
            return document.removeEventListener("mousedown", handleClickOutside);
        };
    }, [onCloseDropdown]);
    // Only show dropdown if loading or there are results
    var shouldShowDropdown = showDropdown && (isSearching || searchResults.length > 0);
    return (React.createElement("div", { className: "relative", ref: searchWrapperRef },
        React.createElement(label_1.Label, { htmlFor: "customer_name" }, "Nama Customer"),
        React.createElement(input_1.Input, { id: "customer_name", placeholder: "Cari atau masukkan nama baru...", value: value, onChange: function (e) { return onValueChange(e.target.value); }, onFocus: onFocus, autoComplete: "off" }),
        shouldShowDropdown && (React.createElement("div", { className: "absolute z-10 mt-1 w-full rounded-md border bg-popover p-1 text-popover-foreground shadow-md" },
            isSearching && (React.createElement("div", { className: "flex items-center gap-2 p-2 text-sm text-muted-foreground" },
                React.createElement(lucide_react_1.LoaderCircle, { className: "animate-spin w-4 h-4" }),
                "Mencari...")),
            searchResults.map(function (customer) { return (React.createElement("div", { key: customer.id, className: "cursor-pointer rounded-sm p-2 text-sm hover:bg-accent", onClick: function () { return onSelect(customer); } }, customer.name)); })))));
};
