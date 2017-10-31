import * as express from "express"

import {User} from "./User"
import {Home} from "./Home"
import {ExpeditieRoute} from "./ExpeditieRoute"
import {Debug} from "./Debug"

export namespace Routes {
    export const debug = Debug
    export const user = User
    export const home = Home
    export const expeditie = ExpeditieRoute

    export function init(app: express.Express) {
        user.init(app)
        home.init(app)
        expeditie.init(app)
        debug.init(app)
    }
}