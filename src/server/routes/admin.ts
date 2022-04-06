import * as express from 'express';
import * as mongoose from 'mongoose';
import * as multer from 'multer';
import { DateTime, Info } from 'luxon';

import { MediaFiles } from '../components/mediaFiles';
import { AuthHelper } from '../helpers/authHelper';
import { MediaFileHelper } from '../components/mediaFiles/helper';
import { MediaFile } from '../components/mediaFiles/model';
import { Quotes } from '../components/quotes';
import { QuoteModel } from '../components/quotes/model';
import { Words } from '../components/words';
import { Word } from '../components/words/model';
import { EarnedPoints } from '../components/earnedPoints';
import { Expedities } from '../components/expedities';
import { People } from '../components/people';
import { EarnedPointModel } from '../components/earnedPoints/model';
import { GeoLocation } from '../components/geoLocations/model';
import { GpxHelper } from '../components/geoLocations/gpxHelper';
import { GeoLocations } from '../components/geoLocations';


export const router = express.Router();


router.use(AuthHelper.loginRedirect);
router.use(AuthHelper.noAdminRedirect);


const testAndGetFromId = async <T extends mongoose.Document>(stringId: string, getById: ((id: mongoose.Types.ObjectId) => Promise<T | null>), typeName: string): Promise<T> => {
    let id;

    try {
        id = new mongoose.Types.ObjectId(stringId);
    } catch {
        throw new Error(`${typeName} '${stringId}' heeft geen geldige Id.`);
    }

    const result = await getById(id);

    if (!result)
        throw new Error(`${typeName} '${stringId}' bestaat niet.`);

    return result;
};

const getDateTimeFromTimeAndZone = (time: string, zone: string): DateTime => {
    const dt = DateTime.fromISO(time, { zone, locale: 'nl-NL' });

    if (dt.invalidExplanation)
        throw new Error('Tijd/zone is incorrect: ' + dt.invalidExplanation);

    return dt;
};

const testValidAction = (action: string, ...validActions: string[]): void => {
    if (!validActions.reduce((acc: boolean, cur) => acc || cur == action, false))
        throw new Error('Er was geen geldige actie gespecificeerd.');
};

const testRequiredFields = (...fields: any[]): void => {
    if (fields.reduce((acc: boolean, cur) => acc || !cur, false))
        throw new Error('Niet alle verplichte velden waren ingevuld.');
};

const testAndGetNumber = (num: any, typeName: string): number => {
    const number = parseInt(num);

    if (isNaN(num))
        throw new Error(`${typeName} is niet een nummer.`);

    return number;
};

const testValidTimeZone = (zone: string) => {
    if (!Info.isValidIANAZone(zone))
        throw new Error(`Tijdzone ${zone} is niet geldig.`);
};

const tryCatchAndRedirect = async (req: any, res: any, destination: string, f: (() => Promise<string>)): Promise<void> => {
    try {
        req.flash('info', await f());
    } catch (e: any) {
        req.flash('error', e.message);
    } finally {
        res.redirect(destination);
    }
};


router.get('/bestanden', async (req, res) =>
    res.render('admin/mediafiles', {
        files: await MediaFiles.getAll(),
        infoMsgs: req.flash('info'),
        errMsgs: req.flash('error'),
        getFileUrl: MediaFiles.getUrl
    })
);

const multerUpload = multer(MediaFileHelper.Multer.settings);

router.post('/bestanden/upload', multerUpload.array('files'), (req, res) =>
    tryCatchAndRedirect(req, res, '/admin/bestanden', async () => {
        if (!req.files) throw new Error('Bestanden zijn niet juist geüpload.');

        let mediaFiles: MediaFile[] = [];

        for (let file of Object.values(req.files)) {
            mediaFiles.push({
                _id: new mongoose.Types.ObjectId(file.filename.split('.')[0]),
                ext: file.filename.split('.')[1],
                mime: file.mimetype,
                restricted: !!req.body.restricted
            });
        }

        if (!mediaFiles.length) throw new Error('Er zijn geen geldige bestanden geüpload.');

        const fs = await MediaFiles.createMany(mediaFiles);

        return `Bestanden ${fs.map(f => `'${f._id.toHexString()}'`).join(', ')} zijn succesvol geüpload.`;
    }));

router.post('/bestanden/add', (req, res) =>
    tryCatchAndRedirect(req, res, '/admin/bestanden', async () => {
        const b = req.body;

        if (!b.mime || MediaFileHelper.mime2.getExtension(b.mime) == null)
            throw new Error('Er was geen geldig mime type geselecteerd.');

        const f = await MediaFiles.create({
            ext: MediaFileHelper.mime2.getExtension(b.mime),
            mime: b.mime,
            restricted: !!b.restricted
        });

        return `Bestand '${f._id.toHexString()}' is succesvol toegevoegd.`;
    }));

router.post('/bestanden/edit', (req, res) =>
    tryCatchAndRedirect(req, res, '/admin/bestanden', async () => {
        const b = req.body;

        testValidAction(b.action, 'delete');

        const file = await testAndGetFromId(b.id, MediaFiles.getById, 'Bestand');

        return `Bestand '${(await MediaFiles.remove(file))._id.toHexString()}' is succesvol verwijderd.`;
    }));


router.get('/citaten', async (req, res) =>
    res.render('admin/quotes', {
        fluidContainer: true,
        quotes: await Quotes.getAll(),
        infoMsgs: req.flash('info'),
        errMsgs: req.flash('error')
    })
);

router.post('/citaten/add', async (req, res) =>
    tryCatchAndRedirect(req, res, '/admin/citaten', async () => {
        const b = req.body;

        testRequiredFields(b.quote, b.context, b.quotee, b.time, b.zone);

        const q = new QuoteModel({
            quote: b.quote,
            quotee: b.quotee,
            context: b.context
        });

        q.dateTime.object = getDateTimeFromTimeAndZone(b.time, b.zone);

        if (b.file)
            q.mediaFile = await MediaFiles.getEmbed(await testAndGetFromId(b.file, MediaFiles.getDocument, 'Bestand'));

        return `Citaat "${(await q.save()).quote}" is succesvol toegevoegd.`;
    }));

router.post('/citaten/edit', (req, res) =>
    tryCatchAndRedirect(req, res, '/admin/citaten', async () => {
        const b = req.body;

        testValidAction(b.action, 'delete', 'change');

        const quote = await testAndGetFromId(b.id, Quotes.getById, 'Citaat');

        if (b.action == 'delete')
            return `Citaat "${(await quote.remove()).quote}" is succesvol verwijderd.`;

        testRequiredFields(b.quote, b.context, b.quotee, b.time, b.zone);

        quote.quote = b.quote;
        quote.context = b.context;
        quote.quotee = b.quotee;
        quote.dateTime.object = getDateTimeFromTimeAndZone(b.time, b.zone);

        if (b.file)
            quote.mediaFile = await MediaFiles.getEmbed(await testAndGetFromId(b.file, MediaFiles.getDocument, 'Bestand'));
        else
            quote.mediaFile = undefined;

        return `Citaat "${(await quote.save()).quote}" is succesvol gewijzigd.`;
    }));

router.get('/woordenboek', async (req, res) =>
    res.render('admin/dictionary', {
        fluidContainer: true,
        words: await Words.getAll(),
        infoMsgs: req.flash('info'),
        errMsgs: req.flash('error')
    })
);

router.post('/woordenboek/add', async (req, res) =>
    tryCatchAndRedirect(req, res, '/admin/woordenboek', async () => {
        const b = req.body;

        testRequiredFields(b.word, b.definitions, b.definitions.filter((x: string) => x != '').length);

        const w: Word = {
            word: b.word,
            definitions: b.definitions.filter((x: string) => x != ''),
            phonetic: b.phonetic || undefined
        };

        if (b.file)
            w.mediaFile = await MediaFiles.getEmbed(await testAndGetFromId(b.file, MediaFiles.getById, 'Bestand'));

        return `Woord "${(await Words.create(w)).word}" is succesvol toegevoegd.`;
    }));

router.post('/woordenboek/edit', (req, res) =>
    tryCatchAndRedirect(req, res, '/admin/woordenboek', async () => {
        const b = req.body;

        testValidAction(b.action, 'delete', 'change');

        const word = await testAndGetFromId(b.id, Words.getById, 'Woord');

        if (b.action == 'delete')
            return `Woord "${(await word.remove()).word}" is succesvol verwijderd.`;

        testRequiredFields(b.word, b.definitions, b.definitions.filter((x: string) => x != '').length);

        word.word = b.word;
        word.definitions = b.definitions.filter((x: string) => x != '');
        word.phonetic = b.phonetic || undefined;

        if (b.file)
            word.mediaFile = await MediaFiles.getEmbed(await testAndGetFromId(b.file, MediaFiles.getById, 'Bestand'));
        else
            word.mediaFile = undefined;

        return `Woord "${(await word.save()).word}" is succesvol gewijzigd.`;
    }));


router.get('/punten', async (req, res) =>
    res.render('admin/earnedPoints', {
        fluidContainer: true,
        earnedPoints: await EarnedPoints.getAll(),
        expedities: await Expedities.getAll(),
        people: await People.getAll(),
        infoMsgs: req.flash('info'),
        errMsgs: req.flash('error')
    })
);

router.post('/punten/add', async (req, res) =>
    tryCatchAndRedirect(req, res, '/admin/punten', async () => {
        const b = req.body;

        testRequiredFields(b.person, b.expeditie, b.amount, b.time, b.zone);

        const ep = new EarnedPointModel({
            amount: testAndGetNumber(b.amount, 'Hoeveelheid'),
            personId: (await testAndGetFromId(b.person, People.getById, 'Persoon'))._id
        });

        ep.dateTime.object = getDateTimeFromTimeAndZone(b.time, b.zone);

        if (b.expeditie != 'none')
            ep.expeditieId = (await testAndGetFromId(b.expeditie, Expedities.getById, 'Expeditie'))._id;
        else
            ep.expeditieId = undefined;

        return `Punt "${(await ep.save())._id.toHexString()}" is succesvol toegevoegd.`;
    }));

router.post('/punten/edit', (req, res) =>
    tryCatchAndRedirect(req, res, '/admin/punten', async () => {
        const b = req.body;

        testValidAction(b.action, 'delete', 'change');

        const ep = await testAndGetFromId(b.id, EarnedPoints.getById, 'Punt');

        if (b.action == 'delete')
            return `Punt "${(await ep.remove())._id.toHexString()}" is succesvol verwijderd.`;

        testRequiredFields(b.person, b.expeditie, b.amount, b.time, b.zone);

        testAndGetNumber(b.amount, 'Hoeveelheid');

        ep.amount = parseInt(b.amount);

        ep.personId = (await testAndGetFromId(b.person, People.getById, 'Persoon'))._id;

        if (b.expeditie != 'none')
            ep.expeditieId = (await testAndGetFromId(b.expeditie, Expedities.getById, 'Expeditie'))._id;
        else
            ep.expeditieId = undefined;

        ep.dateTime.object = getDateTimeFromTimeAndZone(b.time, b.zone);

        return `Punt "${(await ep.save())._id.toHexString()}" is succesvol gewijzigd.`;
    }));

router.get('/gpx', async (req, res) =>
    res.render('admin/gpx', {
        expedities: await Expedities.getAll(),
        people: await People.getAll(),
        infoMsgs: req.flash('info'),
        errMsgs: req.flash('error')
    })
);

router.post('/gpx/upload', multer({ storage: multer.memoryStorage() }).single('file'), (req, res) =>
    tryCatchAndRedirect(req, res, '/admin/gpx', async () => {
        const b = req.body;

        testRequiredFields(b.person, b.expeditie, req.file, b.zone);

        const person = await testAndGetFromId(b.person, People.getById, 'Persoon');
        const expeditie = await testAndGetFromId(b.expeditie, Expedities.getById, 'Expeditie');

        if (expeditie.finished) throw new Error(`Expeditie '${expeditie.name}' is beëindigd.`);

        testValidTimeZone(b.zone);

        let locs: GeoLocation[];

        try {
            if (!req.file) throw new Error('Er is geen bestand');
            locs = await GpxHelper.generateLocations(req.file.buffer.toString(), expeditie, person, b.zone);
        } catch (e: any) {
            throw new Error(`Bestand kan niet worden gelezen: ${e.message}`);
        }

        await GeoLocations.createMany(locs);

        return 'Locaties zijn succesvol geüpload';
    }));
