var SocketHandler;
(function (SocketHandler) {
    function init() {
        SocketHandler.socket = io();
    }
    SocketHandler.init = init;
})(SocketHandler || (SocketHandler = {}));
