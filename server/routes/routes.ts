import * as express from 'express'

import { User } from "./users"
import { Main } from "./main"

export namespace Routes {
    export const user = User
    export const main = Main

    export function init(app: express.Express) {
        main.init(app)
    }
}