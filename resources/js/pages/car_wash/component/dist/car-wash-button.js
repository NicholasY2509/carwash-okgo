"use strict";
exports.__esModule = true;
exports.CarWashButton = void 0;
var card_1 = require("@/components/ui/card");
function CarWashButton(_a) {
    var label = _a.label, onClick = _a.onClick;
    return (React.createElement(card_1.Card, { className: "flex h-full cursor-pointer text-primary-foreground flex-col transition-all hover:-translate-y-2 hover:shadow-lg bg-primary hover:bg-primary-foreground dark:hover:shadow-white hover:shadow-primary/40 hover:text-primary text-center font-bold py-18 lg:py-28 text-5xl lg:text-7xl", onClick: onClick }, label));
}
exports.CarWashButton = CarWashButton;
