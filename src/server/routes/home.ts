import * as express from 'express';

import { Expedities } from '../components/expedities';
import { MediaFiles } from '../components/mediaFiles';

export const router = express.Router();

router.get('/', (req, res) => {
    Expedities.getAll().then(expedities => {
        expedities.forEach(ex => console.log(ex));

        res.render('home', {
            expedities,
            t: (<any>req).t,
            t_ucf: ucFirstWrapper((<any>req).t),
            ucf: ucFirst,
            getFileUrl: MediaFiles.getUrl,
            loggedIn: req.isAuthenticated()
        });
    });
});

function ucFirstWrapper(f: (s: string) => string): (s: string) => string {
    return (str: string) => ucFirst(f(str));
}

function ucFirst(s: string): string {
    return s.charAt(0).toUpperCase() + s.slice(1);
}
