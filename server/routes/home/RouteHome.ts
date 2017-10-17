import * as express from 'express'

export namespace RouteHome {
    export function init(app: express.Express) {
        app.get("/", (req, res) => {
            console.log((<any>req).languages)
            res.render("home", {
                t: (<any>req).t,
                t_ucf: ucFirstWrapper((<any>req).t),
                ucf: ucFirst
            })
        })
    }

    export function ucFirstWrapper(f: (s: string) => string): (s: string) => string {
        return (str: string) => {
            const translated = f(str)
            return translated.charAt(0).toUpperCase() + translated.slice(1)
        }
    }

    export function ucFirst(s: string): string {
        return s.charAt(0).toUpperCase() + s.slice(1)
    }
}