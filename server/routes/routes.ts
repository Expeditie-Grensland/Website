import * as express from 'express'

import {Debug} from './debug'
import {ExpeditieRoute} from './expeditieRoute'
import {Home} from './home'
import { router as apiRouter } from './api'

export namespace Routes {

    export function init(app: express.Express) {
        app.use('/api', apiRouter);

        Home.init(app)

        if (app.get("env") == "development")
            Debug.init(app)

        // This should always be last.
        ExpeditieRoute.init(app)
    }
}
