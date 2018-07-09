import * as express from 'express'

import {Debug} from './Debug'
import {ExpeditieRoute} from './ExpeditieRoute'
import {Home} from './Home'

export namespace Routes {

    export function init(app: express.Express) {
        Home.init(app)

        if (app.get("env") == "development")
            Debug.init(app)

        // This should always be last.
        ExpeditieRoute.init(app)
    }
}
