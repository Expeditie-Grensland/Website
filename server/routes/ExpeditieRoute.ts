import * as express from "express"
import {Expeditie} from "../database/Expeditie"

export namespace ExpeditieRoute {

    export function init(app: express.Express) {
        Expeditie.getExpeditiesCached().then((expeditiesCached) => {
            for (let expeditie of expeditiesCached) {
                if(expeditie.showMap) {
                    console.log("Registering " + expeditie.mapUrl + " as expeditie page.")

                    //TODO this doesn't work when an expeditie is added while the server is running

                    app.get(expeditie.mapUrl + '/?', (req, res) => {
                        res.render("expeditie", {
                            expeditie: expeditie
                        })
                    })
                }
            }
        })
    }
}