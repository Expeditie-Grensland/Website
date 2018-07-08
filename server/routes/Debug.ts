import bodyParser = require('body-parser')
import * as express from 'express'

export namespace Debug {

    export async function init(app: express.Express) {

        process.on('unhandledRejection', (reason, p) => {
            console.log('Unhandled Rejection at: Promise', p, 'reason:', reason)
            // application specific logging, throwing an error, or other logic here
        })

        app.get('/uptime', (req, res) => {
            const sprintf = require('sprintf-js').sprintf

            res.send(sprintf("Uptime: %s.", process.uptime()))
        })
    }
}
