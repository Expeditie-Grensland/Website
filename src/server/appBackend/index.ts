import * as express from 'express';
import * as passport from 'passport';
import * as mongoose from 'mongoose';

import { AuthHelper } from '../helpers/authHelper';
import { People } from '../components/people';
import { PersonDocument, PersonOrId } from '../components/people/model';
import { ExpeditieModel } from '../components/expedities/model';
import { MediaFiles } from '../components/mediaFiles';
import { Documents } from '../components/documents';

export const router = express.Router();

router.get('/', (req, res) => {
    res.status(200).json({});
});

router.post('/authenticate', (req, res, next) => {
    passport.authenticate('ldapauth', { session: false }, (err: Error | null, user: PersonDocument | null, info: Error | null) => {
        if (err)
            next(err);
        else if (!user)
            next(info);
        else
            AuthHelper.generateJwt(user, (err2, token) => {
                if (err2)
                    next(err2);
                else
                    res.status(200).json({ token, name: `${user.firstName} ${user.lastName}` });
            });
    })(req, res, next);
});

router.use((req, res, next) => {
    if (req.headers.authorization && req.headers.authorization.split(' ')[0] == 'Bearer')
        AuthHelper.parseJwt(req.headers.authorization.split(' ')[1], (err, decoded: any) => {
            if (err)
                next(err);
            else {
                if (typeof decoded === 'string' || decoded == undefined || decoded.id == undefined)
                    return next(new Error('Unexpected jwt format'));
                People.getById(new mongoose.Types.ObjectId(decoded.id))
                    .then(person => {
                        req.user = person as any;
                        next();
                    })
                    .catch(next);
            }
        });
    else
        next(new Error('Token header not present'));
});

router.use((err: any, req: express.Request, res: express.Response, next: express.NextFunction) => {
    if (res.headersSent) {
        return next(err);
    }

    res.status(401).json({ message: err.message });
});

router.get('/expedities', (req, res) =>
    ExpeditieModel
        .find({ personIds: Documents.getObjectId(req.user as PersonOrId), finished: false }, {
            name: 1,
            subtitle: 1,
            color: 1,
            backgroundFile: 1
        })
        .sort({ sequenceNumber: -1 })
        .exec()
        .then(x => x.map(ex => {
            return {
                id: Documents.getStringId(ex),
                name: ex.name,
                subtitle: ex.subtitle,
                image: MediaFiles.getUrl(ex.backgroundFile)
            };
        }))
        .then(x => res.status(200).json(x)));

// TODO: router.use other files

router.use((req, res) =>
    res.status(404).json({ message: 'Not found' }));

router.use((err: any, req: express.Request, res: express.Response, next: express.NextFunction) => {
    if (res.headersSent) {
        return next(err);
    }

    res.status(500).json({ message: err.message });
});

