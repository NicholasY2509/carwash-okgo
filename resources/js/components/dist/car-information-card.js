"use strict";
exports.__esModule = true;
exports.CarInformationCard = void 0;
var card_1 = require("@/components/ui/card");
var lucide_react_1 = require("lucide-react");
function CarInformationCard(_a) {
    var car = _a.car, customer = _a.customer, _b = _a.title, title = _b === void 0 ? "Informasi Mobil" : _b, _c = _a.className, className = _c === void 0 ? "" : _c;
    return (React.createElement(card_1.Card, { className: " " + className },
        React.createElement(card_1.CardContent, { className: "space-y-3" },
            React.createElement("div", { className: "grid grid-cols-2 gap-4" },
                React.createElement("div", null,
                    React.createElement("span", { className: "text-sm text-muted-foreground" }, "Nomor Plat:"),
                    React.createElement("div", { className: "font-medium" },
                        " ",
                        car.plate_number)),
                React.createElement("div", null,
                    React.createElement("span", { className: "text-sm text-muted-foreground" }, "Model:"),
                    React.createElement("div", { className: "font-medium" }, car.model)),
                React.createElement("div", null,
                    React.createElement("span", { className: "text-sm text-muted-foreground" }, "Warna:"),
                    React.createElement("div", { className: "font-medium" }, car.color || "Tidak diketahui"))),
            React.createElement("div", { className: "pt-2 border-t" },
                React.createElement("div", { className: "flex items-center gap-2 mb-2" },
                    React.createElement(lucide_react_1.User, { className: "h-4 w-4" }),
                    React.createElement("span", { className: "text-sm text-muted-foreground" }, "Pemilik:")),
                React.createElement("div", { className: "font-medium" }, customer.name),
                React.createElement("div", { className: "text-sm text-muted-foreground" }, customer.phone)))));
}
exports.CarInformationCard = CarInformationCard;
exports["default"] = CarInformationCard;
