declare const io

namespace SocketIDs {
    
}

namespace SocketHandler {
    export let socket

    export function init() {
        socket = io()
    }
}