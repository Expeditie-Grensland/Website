import * as express from 'express'
import {Tables} from "../database/Tables"

export namespace Expeditie {

    export function init(app: express.Express) {
        // const query = Tables.Expeditie.find({}).sort({sequence_number: 1})
        //
        // query.then((res) => {
        //     console.log(res)
        // })
        // query.catch((err) => {
        //     console.log(err)
        // })

        app.get('/expeditie', (req, res) => {
            console.log((<any>req).languages)
            res.render("expeditie", {})
        })
    }
}