import * as express from 'express';

import { Expedities } from '../components/expedities';

export const router = express.Router({ mergeParams: true });

router.get('/', async (req, res, next) => {
    const expeditie = await Expedities.getByNameShort(req.params.expeditie);

    if (expeditie !== undefined && expeditie.showMap) {
        res.render('expeditie', {
            expeditie: expeditie,
        });
    } else {
        next();
    }
});
