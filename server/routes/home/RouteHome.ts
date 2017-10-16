import * as express from 'express'

export namespace RouteHome {
    export function init(app: express.Express) {
        app.get("/", (req, res) => res.render("home"))
    }
}