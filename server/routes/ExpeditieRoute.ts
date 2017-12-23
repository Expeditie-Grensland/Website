import * as express from "express"
import {Expeditie} from "../database/Expeditie"

export namespace ExpeditieRoute {

    import getExpeditiesCached = Expeditie.getExpeditiesCached

    export function init(app: express.Express) {

        app.get('/*/?', async (req, res) => {
            console.log(req.path)

            const expedities = await getExpeditiesCached()

            for(let expeditie of expedities) {
                if(expeditie.showMap && expeditie.mapUrl === removeTrailingSlash(req.path)) {
                    res.render('expeditie', {
                        expeditie: expeditie
                    })
                    break
                }
            }

            if(!res.headersSent)
                res.sendStatus(404)
        })


/**
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
 **/
    }

    function removeTrailingSlash(path: string): string {
        return path.replace(/\/$/, "");
    }
}