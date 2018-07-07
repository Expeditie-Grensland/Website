import * as express from "express"

import {Home} from "./Home"
import {ExpeditieRoute} from "./ExpeditieRoute"
import {Debug} from "./Debug"

export namespace Routes {

    export function init(app: express.Express) {
        Home.init(app)

        if (app.get("env") == "development")
            Debug.init(app)

        // This should always be last.
        ExpeditieRoute.init(app)
    }
}
