import * as express from "express"

import {User} from "./User"
import {Home} from "./Home"
import {ExpeditieRoute} from "./ExpeditieRoute"
import {Debug} from "./Debug"
import {Woordenboek} from "./Woordenboek"

export namespace Routes {

    export function init(app: express.Express) {
        User.init(app)
        Home.init(app)

        Woordenboek.init(app)

        //if(Config.debug)
        Debug.init(app)

        //This should always be last.
        ExpeditieRoute.init(app)
    }
}
