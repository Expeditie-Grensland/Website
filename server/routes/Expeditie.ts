import * as express from 'express'

export namespace Expeditie {

    export function init(app: express.Express) {
        app.get('/expeditie', (req, res) => {
            console.log((<any>req).languages)
            res.render("expeditie", {})
        })
    }
}