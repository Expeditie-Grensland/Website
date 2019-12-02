import * as express from 'express';
import * as mongoose from 'mongoose';

import { Expedities } from '../components/expedities';
import { MediaFiles } from '../components/mediaFiles';
import { ExpeditieDocument } from '../components/expedities/model';
import { geoLocationModel } from '../components/geoLocations/model';

export const router = express.Router({ mergeParams: true });

router.use(async (req, res, next) => {
    const expeditie = await Expedities.getByNameShortWithPeople(req.params.expeditie);

    if (expeditie != null) {
        res.locals.expeditie = expeditie;
        next();
    } else {
        next('router');
    }
});

router.get('/', async (req, res, next) => {
    res.render('expeditie', { getFileUrl: MediaFiles.getUrl });
});

router.use(async (req, res, next) => {
    if (res.locals.expeditie.showMap)
        next();
    else
        next('router');
});

router.get('/kaart', async (req, res, next) => {
    res.render('expeditieMap');
});


const H_LC = 'X-Location-Count';
const H_LL = 'X-Last-Location';

router.get('/kaart/binary', async (req, res, next) => {
    const expeditie: ExpeditieDocument = res.locals.expeditie;

    const locationCount = Expedities.getLocationCount(expeditie);

    const lastLocation =
        geoLocationModel.find({ expeditieId: expeditie._id }).sort({ '_id': -1 }).limit(1).exec()
            .then(x => x.length > 0 ? x[0]._id : new mongoose.Types.ObjectId('000000000000000000000000'));

    res.setHeader('Content-Type', 'application/octet-stream');

    if (req.header(H_LC) != undefined && req.header(H_LL) != undefined &&
        req.header(H_LC) == (await locationCount).toString(16) &&
        req.header(H_LL) == (await lastLocation).toHexString()) {

        console.log(304);
        return res.sendStatus(304);
    }

    const nodes = Expedities.getNodes(expeditie);

    let buf = Buffer.allocUnsafe(4);

    buf.writeUInt32BE((await nodes).length, 0);

    res.setHeader(H_LC, (await locationCount).toString(16));
    res.setHeader(H_LL, (await lastLocation).toHexString());

    console.log(200);
    res.write(buf, 'binary');


    for (let node of await nodes) {
        const nodeLocs = await geoLocationModel.find(
            { expeditieId: node.expeditieId, personId: { $in: node.personIds }, time: { $gte: node.timeFrom, $lt: node.timeTill } },
            { _id: false, longitude: true, latitude: true }
        ).sort({ time: 1 }).exec();

        buf = Buffer.allocUnsafe(4 + 16 * nodeLocs.length);

        buf.writeUInt32BE(nodeLocs.length, 0);

        nodeLocs.forEach((loc, i) => {
            buf.writeDoubleBE(loc.longitude, i * 16 + 4);
            buf.writeDoubleBE(loc.latitude, i * 16 + 12);
        });

        res.write(buf, 'binary');
    }

    res.end(null, 'binary');
});
