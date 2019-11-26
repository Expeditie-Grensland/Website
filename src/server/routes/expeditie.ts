import * as express from 'express';

import { Expedities } from '../components/expedities';
import { MediaFiles } from '../components/mediaFiles';

export const router = express.Router({ mergeParams: true });

router.get('/', async (req, res, next) => {
    const expeditie = await Expedities.getByNameShortWithPeople(req.params.expeditie);

    console.log(expeditie);

    if (expeditie != null) {
        res.render('expeditie', {
            expeditie,
            getFileUrl: MediaFiles.getUrl,
            loggedIn: req.isAuthenticated()
        });
    } else {
        next();
    }
});

router.get('/kaart', async (req, res, next) => {
    const expeditie = await Expedities.getByNameShort(req.params.expeditie);

    if (expeditie != null && expeditie.showMap) {
        res.render('expeditieMap', {
            expeditie
        });
    } else {
        next();
    }
});
