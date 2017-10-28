import * as express from 'express'

import {User} from "./User"
import {Home} from "./Home";

export namespace Routes {
    export const user = User
    export const home = Home

    export function init(app: express.Express) {
        user.init(app)
        home.init(app)
    }
}