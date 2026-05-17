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
exports.__esModule = true;
require("../css/app.css");
var client_1 = require("react-dom/client");
var react_1 = require("@inertiajs/react");
var inertia_helpers_1 = require("laravel-vite-plugin/inertia-helpers");
var use_appearance_1 = require("./hooks/use-appearance");
require("nprogress/nprogress.css");
// Import reload prevention utility (auto-enabled in development)
// import "./lib/prevent-reload";
var appName = import.meta.env.VITE_APP_NAME || "Laravel";
react_1.createInertiaApp({
    title: function (title) { return title + " - " + appName; },
    resolve: function (name) {
        return inertia_helpers_1.resolvePageComponent("./pages/" + name + ".tsx", import.meta.glob("./pages/**/*.tsx"));
    },
    setup: function (_a) {
        var el = _a.el, App = _a.App, props = _a.props;
        var root = client_1.createRoot(el);
        root.render(React.createElement(App, __assign({}, props)));
    },
    progress: {
        color: "#4B5563"
    }
});
// This will set light / dark mode on load...
use_appearance_1.initializeTheme();
