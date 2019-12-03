import * as express from 'express';

import { Expedities } from '../components/expedities';
import { MediaFiles } from '../components/mediaFiles';

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
