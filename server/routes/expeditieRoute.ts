import * as express from 'express';

import { Expeditie } from '../components/expeditie';

export namespace ExpeditieRoute {
    import getExpeditiesCached = Expeditie.getExpeditiesCached;

    export function init(app: express.Express) {
        app.get('/*/?', async (req, res) => {
            console.log(req.path);

            const expedities = await getExpeditiesCached();

            for (let expeditie of expedities) {
                if (expeditie.showMap && expeditie.mapUrl === removeTrailingSlash(req.path)) {
                    res.render('expeditie', {
                        expeditie: expeditie
                    });
                    break;
                }
            }

            if (!res.headersSent) res.sendStatus(404);
        });
    }

    function removeTrailingSlash(path: string): string {
        return path.replace(/\/$/, '');
    }
}
