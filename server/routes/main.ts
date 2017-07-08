import * as express from 'express'
import * as passport from 'passport'

export namespace Main {
    export function init(app: express.Express) {
        app.get("*", (req, res) => res.render("landing"))
    }
}