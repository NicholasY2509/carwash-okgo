"use strict";
exports.__esModule = true;
var react_1 = require("@inertiajs/react");
var lucide_react_1 = require("lucide-react");
var input_error_1 = require("@/components/input-error");
var text_link_1 = require("@/components/text-link");
var button_1 = require("@/components/ui/button");
var checkbox_1 = require("@/components/ui/checkbox");
var input_1 = require("@/components/ui/input");
var label_1 = require("@/components/ui/label");
var auth_layout_1 = require("@/layouts/auth-layout");
function Login(_a) {
    var status = _a.status, canResetPassword = _a.canResetPassword;
    var _b = react_1.useForm({
        email: "",
        password: "",
        remember: false
    }), data = _b.data, setData = _b.setData, post = _b.post, processing = _b.processing, errors = _b.errors, reset = _b.reset;
    var submit = function (e) {
        e.preventDefault();
        post(route("login"), {
            onFinish: function () { return reset("password"); }
        });
    };
    return (React.createElement(auth_layout_1["default"], { title: "Log In D+Robotics", description: "Masukkan Email dan Password Anda" },
        React.createElement(react_1.Head, { title: "Log in" }),
        React.createElement("form", { className: "flex flex-col gap-6", onSubmit: submit },
            React.createElement("div", { className: "grid gap-6" },
                React.createElement("div", { className: "grid gap-2" },
                    React.createElement(label_1.Label, { htmlFor: "email" }, "Email"),
                    React.createElement(input_1.Input, { id: "email", type: "email", required: true, autoFocus: true, tabIndex: 1, autoComplete: "email", value: data.email, onChange: function (e) { return setData("email", e.target.value); }, placeholder: "email@example.com" }),
                    React.createElement(input_error_1["default"], { message: errors.email })),
                React.createElement("div", { className: "grid gap-2" },
                    React.createElement("div", { className: "flex items-center" },
                        React.createElement(label_1.Label, { htmlFor: "password" }, "Password"),
                        canResetPassword && (React.createElement(text_link_1["default"], { href: route("password.request"), className: "ml-auto text-sm", tabIndex: 5 }, "Forgot password?"))),
                    React.createElement(input_1.Input, { id: "password", type: "password", required: true, tabIndex: 2, autoComplete: "current-password", value: data.password, onChange: function (e) {
                            return setData("password", e.target.value);
                        }, placeholder: "Password" }),
                    React.createElement(input_error_1["default"], { message: errors.password })),
                React.createElement("div", { className: "flex items-center space-x-3" },
                    React.createElement(checkbox_1.Checkbox, { id: "remember", name: "remember", checked: data.remember, onClick: function () { return setData("remember", !data.remember); }, tabIndex: 3 }),
                    React.createElement(label_1.Label, { htmlFor: "remember" }, "Remember me")),
                React.createElement(button_1.Button, { type: "submit", className: "mt-4 w-full", tabIndex: 4, disabled: processing },
                    processing && (React.createElement(lucide_react_1.LoaderCircle, { className: "h-4 w-4 animate-spin" })),
                    "Log in"))),
        status && (React.createElement("div", { className: "mb-4 text-center text-sm font-medium text-green-600" }, status))));
}
exports["default"] = Login;
