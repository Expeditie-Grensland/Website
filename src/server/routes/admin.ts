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


router.get('/bestanden', async (req, res) =>
    res.render('admin/mediafiles', {
        files: await MediaFiles.getAll(),
        infoMsgs: req.flash('info'),
        errMsgs: req.flash('error'),
        getFileUrl: MediaFiles.getUrl
    })
);

const multerUpload = multer(MediaFileHelper.Multer.settings);

router.post('/bestanden/upload', multerUpload.array('files'), (req, res, next) =>
    Promise.resolve(req.files).then(fs => {
        if (!fs) throw new Error('Bestanden zijn niet juist geüpload.');

        let mediaFiles: MediaFile[] = [];

        for (let file of Object.values(req.files)) {
            mediaFiles.push({
                _id: mongoose.Types.ObjectId(file.filename.split('.')[0]),
                ext: file.filename.split('.')[1],
                mime: file.mimetype,
                restricted: !!req.body.restricted
            });
        }

        if (!mediaFiles.length) throw new Error('Er zijn geen geldige bestanden geüpload.');

        return MediaFiles.createMany(mediaFiles);
    }).then(fs =>
        req.flash('info', `Bestanden ${fs.map(f => `'${f._id.toHexString()}'`).join(', ')} zijn succesvol geüpload.`)
    ).catch(e =>
        req.flash('error', e.message)
    ).then(() =>
        res.redirect('/admin/bestanden')
    )
);

router.post('/bestanden/add', (req, res) =>
    Promise.resolve(req.body).then(b => {
        if (!b.mime || MediaFileHelper.mime2.getExtension(b.mime) == null)
            throw new Error('Er was geen geldig mime type geselecteerd.');

        return MediaFiles.create({
            ext: MediaFileHelper.mime2.getExtension(b.mime),
            mime: b.mime,
            restricted: !!b.restricted
        });
    }).then(f =>
        req.flash('info', `Bestand '${f._id.toHexString()}' is succesvol toegevoegd.`)
    ).catch(e =>
        req.flash('error', e.message)
    ).then(() =>
        res.redirect('/admin/bestanden')
    )
);

router.post('/bestanden/edit', (req, res) =>
    Promise.resolve(req.body).then(async (b) => {
        if (b.action != 'delete')
            throw new Error('Er was geen geldige actie gespecificeerd.');

        let id;

        try {
            id = mongoose.Types.ObjectId(b.id);
        } catch {
            throw new Error(`'${b.id}' is geen geldige Id.`);
        }

        const file = await MediaFiles.getById(id);

        if (!file) throw new Error(`Bestand '${b.id}' bestaat niet.`);

        return MediaFiles.remove(file);
    }).then(f =>
        req.flash('info', `Bestand '${f._id.toHexString()}' is succesvol verwijderd.`)
    ).catch(e =>
        req.flash('error', e.message)
    ).then(() =>
        res.redirect('/admin/bestanden')
    )
);


router.get('/citaten', async (req, res) =>
    res.render('admin/quotes', {
        fluidContainer: true,
        quotes: await Quotes.getAll(),
        infoMsgs: req.flash('info'),
        errMsgs: req.flash('error')
    })
);

router.post('/citaten/add', async (req, res) =>
    Promise.resolve(req.body).then(async (b) => {
        if (!b.quote || !b.context || !b.quotee || !b.time || !b.zone)
            throw new Error('Niet alle verplichte velden waren ingevuld.');

        const dt = DateTime.fromISO(b.time, { zone: b.zone, locale: 'nl-NL' });

        if (dt.invalidExplanation)
            throw new Error('Tijd/zone is incorrect: ' + dt.invalidExplanation);

        const q = new QuoteModel({
            quote: b.quote,
            quotee: b.quotee,
            context: b.context
        });

        q.dateTime.object = dt;

        if (b.file) {
            let id;

            try {
                id = mongoose.Types.ObjectId(b.file);
            } catch {
                throw new Error(`'${b.file}' is geen geldige Id.`);
            }

            const file = await MediaFiles.getDocument(id);

            if (!file)
                throw new Error(`Bestand '${b.file}' bestaat niet.`);

            q.mediaFile = await MediaFiles.getEmbed(file);
        }

        return q.save();
    }).then(q =>
        req.flash('info', `Citaat "${q.quote}" is succesvol toegevoegd.`)
    ).catch(e =>
        req.flash('error', e.message)
    ).then(() =>
        res.redirect('/admin/citaten')
    )
);

router.post('/citaten/edit', (req, res) =>
    Promise.resolve(req.body).then(async (b) => {
        if (b.action != 'delete' && b.action != 'change')
            throw new Error('Er was geen geldige actie gespecificeerd.');

        let id;

        try {
            id = mongoose.Types.ObjectId(b.id);
        } catch {
            throw new Error(`'${b.id}' is geen geldige Id.`);
        }

        const quote = await Quotes.getById(id);

        if (!quote) throw new Error(`Citaat '${b.id}' bestaat niet.`);

        if (b.action == 'delete')
            return quote.remove();

        if (!b.quote || !b.context || !b.quotee || !b.time || !b.zone)
            throw new Error('Niet alle verplichte velden waren ingevuld.');

        const dt = DateTime.fromISO(b.time, { zone: b.zone, locale: 'nl-NL' });

        if (dt.invalidExplanation)
            throw new Error('Tijd/zone is incorrect: ' + dt.invalidExplanation);


        quote.quote = b.quote;
        quote.context = b.context;
        quote.quotee = b.quotee;
        quote.dateTime.object = dt;

        if (b.file) {
            let id;

            try {
                id = mongoose.Types.ObjectId(b.file);
            } catch {
                throw new Error(`'${b.file}' is geen geldige Id.`);
            }

            const file = await MediaFiles.getDocument(id);

            if (!file)
                throw new Error(`Bestand '${b.file}' bestaat niet.`);

            quote.mediaFile = await MediaFiles.getEmbed(file);
        } else
            quote.mediaFile = undefined;

        return quote.save();
    }).then(q =>
        req.flash('info', `Citaat "${q.quote}" is succesvol ${req.body.action == 'delete' ? 'verwijderd' : 'gewijzigd'}.`)
    ).catch(e =>
        req.flash('error', e.message)
    ).then(() =>
        res.redirect('/admin/citaten')
    )
);

router.get('/woordenboek', async (req, res) =>
    res.render('admin/dictionary', {
        fluidContainer: true,
        words: await Words.getAll(),
        infoMsgs: req.flash('info'),
        errMsgs: req.flash('error')
    })
);

router.post('/woordenboek/add', async (req, res) =>
    Promise.resolve(req.body).then(async (b) => {
        if (!b.word || !b.definitions || b.definitions.filter((x: string) => x != '').length < 1)
            throw new Error('Niet alle verplichte velden waren ingevuld.');

        const w: Word = {
            word: b.word,
            definitions: b.definitions.filter((x: string) => x != ''),
            phonetic: b.phonetic || undefined
        };

        if (b.file) {
            let id;

            try {
                id = mongoose.Types.ObjectId(b.file);
            } catch {
                throw new Error(`'${b.file}' is geen geldige Id.`);
            }

            const file = await MediaFiles.getDocument(id);

            if (!file)
                throw new Error(`Bestand '${b.file}' bestaat niet.`);

            w.mediaFile = await MediaFiles.getEmbed(file!);
        }

        return Words.create(w);
    }).then(w =>
        req.flash('info', `Woord "${w.word}" is succesvol toegevoegd.`)
    ).catch(e =>
        req.flash('error', e.message)
    ).then(() =>
        res.redirect('/admin/woordenboek')
    )
);

router.post('/woordenboek/edit', (req, res) =>
    Promise.resolve(req.body).then(async (b) => {
        if (b.action != 'delete' && b.action != 'change')
            throw new Error('Er was geen geldige actie gespecificeerd.');

        let id;

        try {
            id = mongoose.Types.ObjectId(b.id);
        } catch {
            throw new Error(`'${b.id}' is geen geldige Id.`);
        }

        const word = await Words.getById(id);

        if (!word) throw new Error(`Woord '${b.id}' bestaat niet.`);

        if (b.action == 'delete')
            return word.remove();

        if (!b.word || !b.definitions || b.definitions.filter((x: string) => x != '').length < 1)
            throw new Error('Niet alle verplichte velden waren ingevuld.');

        word.word = b.word;
        word.definitions = b.definitions.filter((x: string) => x != '');
        word.phonetic = b.phonetic || undefined;

        if (b.file) {
            let id;

            try {
                id = mongoose.Types.ObjectId(b.file);
            } catch {
                throw new Error(`'${b.file}' is geen geldige Id.`);
            }

            const file = await MediaFiles.getDocument(id);

            if (!file)
                throw new Error(`Bestand '${b.file}' bestaat niet.`);

            word.mediaFile = await MediaFiles.getEmbed(file);
        } else
            word.mediaFile = undefined;

        return word.save();
    }).then(w =>
        req.flash('info', `Woord "${w.word}" is succesvol ${req.body.action == 'delete' ? 'verwijderd' : 'gewijzigd'}.`)
    ).catch(e =>
        req.flash('error', e.message)
    ).then(() =>
        res.redirect('/admin/woordenboek')
    )
);


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
    Promise.resolve(req.body).then(async (b) => {
        if (!b.person || !b.expeditie || !b.amount || !b.time || !b.zone)
            throw new Error('Niet alle verplichte velden waren ingevuld.');

        const dt = DateTime.fromISO(b.time, { zone: b.zone, locale: 'nl-NL' });

        if (dt.invalidExplanation)
            throw new Error('Tijd/zone is incorrect: ' + dt.invalidExplanation);

        if (isNaN(parseInt(b.amount)))
            throw new Error('Hoeveelheid is niet een nummer.');

        let personId;

        try {
            personId = mongoose.Types.ObjectId(b.person);
        } catch {
            throw new Error(`'${b.person}' is geen geldige Id.`);
        }

        const person = await People.getById(personId);

        if (!person) throw new Error(`Persoon '${b.person}' bestaat niet.`);

        const ep = new EarnedPointModel({
            amount: parseInt(b.amount),
            personId: person._id.toHexString()
        });

        ep.dateTime.object = dt;

        if (b.expeditie != 'none') {
            let expeditieId;

            try {
                expeditieId = mongoose.Types.ObjectId(b.expeditie);
            } catch {
                throw new Error(`'${b.expeditie}' is geen geldige Id.`);
            }

            const expeditie = await Expedities.getById(expeditieId);

            if (!expeditie) throw new Error(`Expeditie '${b.expeditie}' bestaat niet.`);

            ep.expeditieId = expeditie._id;
        } else {
            ep.expeditieId = undefined;
        }

        return ep.save();
    }).then(ep =>
        req.flash('info', `Punt "${ep._id.toHexString()}" is succesvol toegevoegd.`)
    ).catch(e =>
        req.flash('error', e.message)
    ).then(() =>
        res.redirect('/admin/punten')
    )
);

router.post('/punten/edit', (req, res) =>
    Promise.resolve(req.body).then(async (b) => {
        if (b.action != 'delete' && b.action != 'change')
            throw new Error('Er was geen geldige actie gespecificeerd.');

        let id;

        try {
            id = mongoose.Types.ObjectId(b.id);
        } catch {
            throw new Error(`'${b.id}' is geen geldige Id.`);
        }

        const ep = await EarnedPoints.getById(id);

        if (!ep) throw new Error(`Punt '${b.id}' bestaat niet.`);

        if (b.action == 'delete')
            return ep.remove();

        if (!b.person || !b.expeditie || !b.amount || !b.time || !b.zone)
            throw new Error('Niet alle verplichte velden waren ingevuld.');

        if (isNaN(parseInt(b.amount)))
            throw new Error('Hoeveelheid is niet een nummer.');

        ep.amount = parseInt(b.amount);

        let personId;

        try {
            personId = mongoose.Types.ObjectId(b.person);
        } catch {
            throw new Error(`'${b.person}' is geen geldige Id.`);
        }

        const person = await People.getById(personId);

        if (!person) throw new Error(`Persoon '${b.person}' bestaat niet.`);

        ep.personId = person._id;

        if (b.expeditie != 'none') {
            let expeditieId;

            try {
                expeditieId = mongoose.Types.ObjectId(b.expeditie);
            } catch {
                throw new Error(`'${b.expeditie}' is geen geldige Id.`);
            }

            const expeditie = await Expedities.getById(expeditieId);

            if (!expeditie) throw new Error(`Expeditie '${b.expeditie}' bestaat niet.`);

            ep.expeditieId = expeditie._id;
        } else {
            ep.expeditieId = undefined;
        }

        const dt = DateTime.fromISO(b.time, { zone: b.zone, locale: 'nl-NL' });

        if (dt.invalidExplanation)
            throw new Error('Tijd/zone is incorrect: ' + dt.invalidExplanation);

        ep.dateTime.object = dt;

        return ep.save();
    }).then(ep =>
        req.flash('info', `Punt "${ep._id.toHexString()}" is succesvol ${req.body.action == 'delete' ? 'verwijderd' : 'gewijzigd'}.`)
    ).catch(e =>
        req.flash('error', e.message)
    ).then(() =>
        res.redirect('/admin/punten')
    )
);

router.get('/gpx', async (req, res) =>
    res.render('admin/gpx', {
        expedities: await Expedities.getAll(),
        people: await People.getAll(),
        infoMsgs: req.flash('info'),
        errMsgs: req.flash('error')
    })
);

router.post('/gpx/upload', multer({ storage: multer.memoryStorage() }).single('file'), (req, res) => {
    Promise.resolve(req.body).then(async (b) => {
        if (!b.person || !b.expeditie || !req.file || ! b.zone)
            throw new Error('Niet alle verplichte velden waren ingevuld.');

        let personId, expeditieId;

        try {
            personId = mongoose.Types.ObjectId(b.person);
        } catch {
            throw new Error(`'${b.person}' is geen geldige Id.`);
        }

        try {
            expeditieId = mongoose.Types.ObjectId(b.expeditie);
        } catch {
            throw new Error(`'${b.expeditie}' is geen geldige Id.`);
        }

        const person = await People.getById(personId);
        const expeditie = await Expedities.getById(expeditieId);

        if (!person) throw new Error(`Persoon '${b.person}' bestaat niet.`);
        if (!expeditie) throw new Error(`Expeditie '${b.expeditie}' bestaat niet.`);
        if (expeditie.finished) throw new Error(`Expeditie '${expeditie.name}' is beëindigd.`)

        if (!Info.isValidIANAZone(b.zone))
            throw new Error(`Tijdzone ${b.zone} is niet geldig.`);

        let locs: GeoLocation[];

        try {
            locs = await GpxHelper.generateLocations(req.file.buffer.toString(), expeditie, person, b.zone);
        } catch (e) {
            throw new Error(`Bestand kan niet worden gelezen: ${e.message}`)
        }

        return GeoLocations.createMany(locs);
    }).then(() =>
        req.flash('info', 'Locaties zijn succesvol geüpload.')
    ).catch(e =>
        req.flash('error', e.message)
    ).then(() =>
        res.redirect('/admin/gpx')
    );
});
