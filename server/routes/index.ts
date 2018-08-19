import * as express from 'express';

import { router as debugRouter } from './debug';
import { router as expeditieRouter } from './expeditie';
import { router as homeRouter } from './home';
import { router as apiRouter } from './api';
import { router as dictionaryRouter } from './dictionary';

export namespace Routes {
    export function init(app: express.Express) {
        app.use('/api', apiRouter);
        app.use('/dictionary', dictionaryRouter);
        app.use('/woordenboek', dictionaryRouter);

        if (app.get('env') == 'development') app.use('/debug', debugRouter);

        app.use('/', homeRouter);
        app.use('/', expeditieRouter);
    }
}
