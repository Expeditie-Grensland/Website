import * as express from 'express';

import { router as expeditieRouter } from './expeditie';
import { router as homeRouter } from './home';
import { router as membersRouter } from './members';
import { router as adminRouter } from './admin';
import { AuthHelper } from '../helpers/authHelper';

export function Router(): express.Router {
    const router = express.Router();

    router.use(AuthHelper.setAuthLocals);

    router.use('/leden', membersRouter);
    router.use('/admin', adminRouter);

    router.get('/login', (req, res) => res.redirect(301, '/leden/login'));
    router.get('/woordenboek', (req, res) => res.redirect(301, '/leden/woordenboek'));
    router.get('/citaten', (req, res) => res.redirect(301, '/leden/citaten'));

    router.use('/', homeRouter);
    router.use('/:expeditie', expeditieRouter);

    return router;
}
