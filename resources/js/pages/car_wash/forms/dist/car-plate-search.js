"use strict";
exports.__esModule = true;
var input_1 = require("@/components/ui/input");
var lucide_react_1 = require("lucide-react");
var react_1 = require("react");
var CarPlateSearch = function (_a) {
    var value = _a.value, onValueChange = _a.onValueChange, searchResults = _a.searchResults, isSearching = _a.isSearching, showDropdown = _a.showDropdown, onFocus = _a.onFocus, onSelect = _a.onSelect, onCloseDropdown = _a.onCloseDropdown;
    var searchWrapperRef = react_1["default"].useRef(null);
    react_1["default"].useEffect(function () {
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
    var shouldShowDropdown = showDropdown && (isSearching || searchResults.length > 0);
    return (react_1["default"].createElement("div", { className: "relative", ref: searchWrapperRef },
        react_1["default"].createElement(input_1.Input, { id: "car_plate_number", placeholder: "Cari atau masukkan plat baru...", value: value, onChange: function (e) {
                return onValueChange(e.target.value);
            }, onFocus: onFocus, autoComplete: "off" }),
        shouldShowDropdown && (react_1["default"].createElement("div", { className: "absolute z-10 mt-1 w-full rounded-md border bg-popover p-1 text-popover-foreground shadow-md" },
            isSearching && (react_1["default"].createElement("div", { className: "flex items-center gap-2 p-2 text-sm text-muted-foreground" },
                react_1["default"].createElement(lucide_react_1.LoaderCircle, { className: "animate-spin w-4 h-4" }),
                "Mencari...")),
            searchResults.map(function (result) { return (react_1["default"].createElement("div", { key: result.car.id, className: "cursor-pointer rounded-sm p-2 text-sm hover:bg-accent", onClick: function () { return onSelect(result); } },
                result.car.plate_number,
                " - ",
                result.car.model,
                " (",
                result.customer.name,
                ")")); })))));
};
exports["default"] = CarPlateSearch;
