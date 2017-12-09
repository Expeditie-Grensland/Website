import * as express from "express"
import {Expeditie} from "../database/Expeditie"
import * as i18next from "i18next"

export namespace Home {
    export function init(app: express.Express) {
        app.get("/", (req, res) => {
            Expeditie.getExpeditiesCached().then((expedities) => {
                console.log((<any>req).languages)
                res.render("home", {
                    expedities: expedities,
                    t:          i18next.t,
                    t_ucf:      ucFirstWrapper(i18next.t),
                    ucf:        ucFirst
                })
            })
        })

        app.get('/overviewMap', (req, res) => {
            res.render("world")
        })
    }

    export function ucFirstWrapper(f: (s: string) => string): (s: string) => string {
        return (str: string) => ucFirst(f(str))
    }

    export function ucFirst(s: string): string {
        return s.charAt(0).toUpperCase() + s.slice(1)
    }
}