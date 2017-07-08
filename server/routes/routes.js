"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const users_1 = require("./users");
const main_1 = require("./main");
var Routes;
(function (Routes) {
    Routes.user = users_1.User;
    Routes.main = main_1.Main;
    function init(app) {
        Routes.main.init(app);
    }
    Routes.init = init;
})(Routes = exports.Routes || (exports.Routes = {}));
