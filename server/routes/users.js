"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const passport = require("passport");
var User;
(function (User) {
    User.AUTH = "/auth/google";
    User.AUTH_CALLBACK = User.AUTH + "/callback";
    function init(app) {
        app.get(User.AUTH, passport.authenticate('google', {
            scope: [
                'https://www.googleapis.com/auth/userinfo.profile',
                'https://www.googleapis.com/auth/plus.profile.emails.read'
            ]
        }));
        app.get(User.AUTH_CALLBACK, passport.authenticate('google', {
            successRedirect: '/',
            failureRedirect: '/'
        }));
        app.get("/logout", (req, res) => {
            req.logout();
            res.redirect("/");
        });
    }
    User.init = init;
})(User = exports.User || (exports.User = {}));
