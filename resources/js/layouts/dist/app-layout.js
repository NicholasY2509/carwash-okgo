"use strict";
var __assign = (this && this.__assign) || function () {
    __assign = Object.assign || function(t) {
        for (var s, i = 1, n = arguments.length; i < n; i++) {
            s = arguments[i];
            for (var p in s) if (Object.prototype.hasOwnProperty.call(s, p))
                t[p] = s[p];
        }
        return t;
    };
    return __assign.apply(this, arguments);
};
var __rest = (this && this.__rest) || function (s, e) {
    var t = {};
    for (var p in s) if (Object.prototype.hasOwnProperty.call(s, p) && e.indexOf(p) < 0)
        t[p] = s[p];
    if (s != null && typeof Object.getOwnPropertySymbols === "function")
        for (var i = 0, p = Object.getOwnPropertySymbols(s); i < p.length; i++) {
            if (e.indexOf(p[i]) < 0 && Object.prototype.propertyIsEnumerable.call(s, p[i]))
                t[p[i]] = s[p[i]];
        }
    return t;
};
exports.__esModule = true;
var app_sidebar_layout_1 = require("@/layouts/app/app-sidebar-layout");
var sonner_1 = require("sonner");
exports["default"] = (function (_a) {
    var children = _a.children, breadcrumbs = _a.breadcrumbs, props = __rest(_a, ["children", "breadcrumbs"]);
    return (React.createElement(app_sidebar_layout_1["default"], __assign({ breadcrumbs: breadcrumbs }, props),
        children,
        React.createElement(sonner_1.Toaster, { position: "top-right", richColors: true, closeButton: true })));
});
