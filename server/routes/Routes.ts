import * as express from 'express'

import {User} from "./User"
import {RouteHome} from "./home/RouteHome"

export namespace Routes {
    export const user = User
    export const main = RouteHome

    export function init(app: express.Express) {
        main.init(app)
    }
}