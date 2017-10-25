import * as express from 'express'

import {User} from "./User"
import {RouteMap} from "./map/RouteMap"
import {RouteHome} from "./home/RouteHome";

export namespace Routes {
    export const user = User
    export const map = RouteMap
    export const home = RouteHome

    export function init(app: express.Express) {
        user.init(app)
        home.init(app)
        map.init(app)
    }
}