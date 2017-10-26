import * as express from 'express'

import {User} from "./User"
import {RouteHome} from "./home/RouteHome";

export namespace Routes {
    export const user = User
    export const home = RouteHome

    export function init(app: express.Express) {
        user.init(app)
        home.init(app)
    }
}