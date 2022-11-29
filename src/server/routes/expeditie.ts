import * as express from 'express';
import * as mongoose from 'mongoose';

import { Expedities } from '../components/expedities';
import { MediaFiles } from '../components/mediaFiles';
import { ExpeditieDocument } from '../components/expedities/model';
import { geoLocationModel } from '../components/geoLocations/model';
import { StoryElements } from '../components/storyElements';
import { LocationStoryElementDocument, BaseStoryElementModel, TextStoryElementDocument } from '../components/storyElements/model';
import { PersonDocument } from '../components/people/model';

export const router = express.Router({ mergeParams: true });

router.use(async (req, res, next) => {
    const expeditie = await Expedities.getByNameShortPopulated(req.params.expeditie);

    if (expeditie != null) {
        res.locals.expeditie = expeditie;
        next();
    } else {
        next('router');
    }
});

router.get('/', async (req, res, next) => {
    res.render('public/expeditie', { getFileUrl: MediaFiles.getUrl, movieUrls: Expedities.getMovieUrls(res.locals.expeditie) });
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

router.get('/kaart/binary', async (req, res) => {
    const expeditie: ExpeditieDocument = res.locals.expeditie;

    const locationCount = Expedities.getLocationCount(expeditie);

    const lastLocation =
        geoLocationModel.find({ expeditieId: expeditie._id }).sort({ '_id': -1 }).limit(1).exec()
            .then(x => x.length > 0 ? x[0]._id : new mongoose.Types.ObjectId('000000000000000000000000'));

    res.setHeader('Content-Type', 'application/octet-stream');

    if (req.header(H_LC) != undefined && req.header(H_LL) != undefined &&
        req.header(H_LC) == (await locationCount).toString(16) &&
        req.header(H_LL) == (await lastLocation).toHexString())

        return res.sendStatus(304);

    const nodes = Expedities.getNodes(expeditie);

    let buf = Buffer.allocUnsafe(4);

    buf.writeUInt32BE((await nodes).length, 0);

    res.setHeader(H_LC, (await locationCount).toString(16));
    res.setHeader(H_LL, (await lastLocation).toHexString());

    res.write(buf, 'binary');


    for (let node of await nodes) {
        const nodeLocs = await geoLocationModel.find(
            { expeditieId: node.expeditieId, personId: { $in: node.personIds }, 'dateTime.stamp': { $gte: node.timeFrom, $lt: node.timeTill } },
            { _id: false, longitude: true, latitude: true }
        ).sort({ 'dateTime.stamp': 1 }).exec();

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

// TODO: one X-Revision-Id header instead of separate
const H_SC = 'X-Story-Count';
const H_LS = 'X-Last-Story';

router.get('/kaart/story', async (req, res) => {
    const expeditie: ExpeditieDocument = res.locals.expeditie;

    const storyCount = StoryElements.getByExpeditieCount(expeditie);

    const lastStory =
        BaseStoryElementModel.find({ expeditieId: expeditie._id }).sort({ '_id': -1 }).limit(1).exec()
            .then(x => x.length > 0 ? x[0]._id : new mongoose.Types.ObjectId('000000000000000000000000'));

    res.setHeader('Content-Type', 'application/json');
    res.setHeader('Charset', 'utf-8');

    if (req.header(H_SC) != undefined && req.header(H_LS) != undefined &&
        req.header(H_SC) == (await storyCount).toString(16) &&
        req.header(H_LS) == (await lastStory).toHexString())

        return res.sendStatus(304);

    const stories = StoryElements.getByExpeditie(expeditie);
    const nodes = await Expedities.getNodesWithPeople(expeditie);

    res.setHeader(H_SC, (await storyCount).toString(16));
    res.setHeader(H_LS, (await lastStory).toHexString());

    const result = {
        nodes: nodes.map((node, index) => {
            return {
                id: node._id.toHexString(),
                nodeNum: index,
                timeFrom: node.timeFrom,
                timeTill: node.timeTill,
                personNames: node.personIds.map((p: PersonDocument) => `${p.firstName} ${p.lastName}`) // FIXME: see geonodes model
            };
        }),
        story: (await stories).map((story) => {
            return {
                id: story._id.toHexString(),
                type: story.type,
                nodeNum: nodes.findIndex((node) =>
                    story.dateTime.stamp >= node.timeFrom && story.dateTime.stamp < node.timeTill &&    // fixme: does this comparison take timezone into account for both sides?
                    node.personIds.some((p: PersonDocument) => p._id.equals(story.personId))), // FIXME: see geonodes model
                dateTime: {
                    stamp: story.dateTime.stamp,
                    zone: story.dateTime.zone
                },
                title: (story as TextStoryElementDocument).title,
                text: (story as TextStoryElementDocument).text,
                name: (story as LocationStoryElementDocument).name
            };
        })
    };

    res.end(JSON.stringify(result));
});
