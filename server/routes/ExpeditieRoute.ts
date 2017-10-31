import * as express from "express"
import {Expeditie} from "../database/Expeditie"

export namespace ExpeditieRoute {

    export function init(app: express.Express) {
        Expeditie.getExpedities().then((res) => {
            for (let expeditie of res) {
                app.get(expeditie.nameShort, (req, res) => {
                    res.render("expeditie", {
                        expeditie_name: expeditie.nameShort
                    })
                })
            }
        })
    }
}