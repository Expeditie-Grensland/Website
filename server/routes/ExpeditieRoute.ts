import * as express from "express"
import {Expeditie} from "../database/Expeditie"

export namespace ExpeditieRoute {

    export function init(app: express.Express) {
        Expeditie.getExpedities().then((expedities) => {
            for (let expeditie of expedities) {
                if(expeditie.showMap) {
                    console.log("Registering " + expeditie.mapUrl + " as expeditie page.")

                    app.get(expeditie.mapUrl, (req, res) => {
                        res.render("expeditie", {
                            expeditie: expeditie
                        })
                    })
                }
            }
        })
    }
}