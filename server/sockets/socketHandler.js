"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
var SocketHandler;
(function (SocketHandler) {
    function bindHandlers(app, io) {
        io.on("connection", connection(app));
    }
    SocketHandler.bindHandlers = bindHandlers;
    function connection(app) {
        return socket => {
        };
    }
    SocketHandler.connection = connection;
})(SocketHandler = exports.SocketHandler || (exports.SocketHandler = {}));
