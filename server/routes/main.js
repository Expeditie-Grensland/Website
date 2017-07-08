"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
var Main;
(function (Main) {
    function init(app) {
        app.get("*", (req, res) => res.render("landing"));
    }
    Main.init = init;
})(Main = exports.Main || (exports.Main = {}));
