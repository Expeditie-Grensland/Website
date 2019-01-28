import * as express from 'express';

import { Expedities } from '../components/expedities';
import { MediaFiles } from '../components/mediaFiles';

export const router = express.Router();

router.get('/', (req, res) => {
    Expedities.getAll().then(expedities => {
        expedities.forEach(ex => console.log(ex));

        res.render('home', {
            expedities,
            getFileUrl: MediaFiles.getUrl,
            loggedIn: req.isAuthenticated()
        });
    });
});
