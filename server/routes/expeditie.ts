import * as express from 'express';

import { Expedities } from '../components/expedities';

export const router = express.Router({ mergeParams: true });

router.get('/', async (req, res, next) => {
    const expedities = await Expedities.getCached();
    const expeditie = expedities.find(e => e.showMap && e.nameShort === req.params.expeditie);

    if (expeditie !== undefined) {
        res.render('expeditie', {
            expeditie: expeditie,
        });
    } else {
        next();
    }
});
