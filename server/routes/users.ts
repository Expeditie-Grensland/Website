import * as express from 'express'
import * as passport from 'passport'

export namespace User {
    export const AUTH = "/auth/google"
    export const AUTH_CALLBACK = AUTH + "/callback"

    export function init(app: express.Express) {
        app.get(AUTH, passport.authenticate('google', {
            scope: [
                'https://www.googleapis.com/auth/userinfo.profile', 
                'https://www.googleapis.com/auth/plus.profile.emails.read'
            ]
        }))

        app.get(AUTH_CALLBACK, passport.authenticate('google', {
            successRedirect: '/',
            failureRedirect: '/'
        }))

        app.get("/logout", (req, res) => {
            req.logout()
            res.redirect("/")
        })
    }
}