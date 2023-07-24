import * as express from 'express';

import * as Expedities from '../components/expedities/index.js';
import * as MediaFiles from '../components/mediaFiles/index.js';

export const router = express.Router();

router.get('/', (req, res) => {
    Expedities.getAll().then(expedities => {
        res.render('public/home', {
            isHome: true,
            expedities,
            getFileUrl: MediaFiles.getUrl
        });
    });
});
