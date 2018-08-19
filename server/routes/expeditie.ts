import * as express from 'express';

import { Expeditie } from '../components/expeditie';
import getExpeditiesCached = Expeditie.getExpeditiesCached;

export const router = express.Router();

router.get('/:expeditieID', async (req, res) => {
    const expedities = await getExpeditiesCached();

    for (let expeditie of expedities) {
        if (expeditie.showMap && expeditie.nameShort === req.params.expeditieID) {
            res.render('expeditie', {
                expeditie: expeditie
            });
            break;
        }
    }

    if (!res.headersSent) res.sendStatus(404);
});
