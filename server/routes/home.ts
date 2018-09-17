import * as express from 'express';

import { Expedities } from '../components/expedities';

export const router = express.Router();

router.get('/', (req, res) => {
    Expedities.getCached().then(expedities => {
        res.render('home', {
            expedities: expedities,
            t: (<any>req).t,
            t_ucf: ucFirstWrapper((<any>req).t),
            ucf: ucFirst
        });
    });
});

function ucFirstWrapper(f: (s: string) => string): (s: string) => string {
    return (str: string) => ucFirst(f(str));
}

function ucFirst(s: string): string {
    return s.charAt(0).toUpperCase() + s.slice(1);
}
