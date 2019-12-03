import * as express from 'express';

import { router as debugRouter } from './debug';
import { router as expeditieRouter } from './expeditie';
import { router as homeRouter } from './home';
import { router as membersRouter } from './members';
import { AuthHelper } from '../helpers/authHelper';

export function Router(dev: boolean): express.Router {
    const router = express.Router();

    router.use(AuthHelper.setAuthLocals);

    router.use('/leden', membersRouter);

    router.get('/login', (req, res) => res.redirect(301, '/leden/login'));
    router.get('/woordenboek', (req, res) => res.redirect(301, '/leden/woordenboek'));
    router.get('/citaten', (req, res) => res.redirect(301, '/leden/citaten'));

    if (dev) router.use('/debug', debugRouter);

    router.use('/', homeRouter);
    router.use('/:expeditie', expeditieRouter);

    return router;
}
