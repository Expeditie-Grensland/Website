import * as express from 'express';
import * as mongoose from 'mongoose';
import * as multer from 'multer';

import { MediaFiles } from '../components/mediaFiles';
import { AuthHelper } from '../helpers/authHelper';
import { MediaFileHelper } from '../components/mediaFiles/helper';
import { MediaFile } from '../components/mediaFiles/model';
import { Quotes } from '../components/quotes';
import { Quote } from '../components/quotes/model';


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

        if (!file) throw new Error(`Bestand '${req.body.id}' bestaat niet.`);

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
        if (!b.quote || !b.context || !b.quotee || !b.time)
            throw new Error('Niet alle verplichte velden waren ingevuld.');

        if (isNaN(parseInt(b.time)))
            throw new Error('Tijdstempel is niet een nummer.');

        const q: Quote = {
            quote: b.quote,
            quotee: b.quotee,
            context: b.context,
            time: parseInt(b.time)
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

            q.mediaFile = await MediaFiles.getEmbed(file);
        }

        return Quotes.create(q);
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

        if (!quote) throw new Error(`Citaat '${req.body.id}' bestaat niet.`);

        if (b.action == 'delete')
            return quote.remove();

        if (!b.quote || !b.context || !b.quotee || !b.time)
            throw new Error('Niet alle verplichte velden waren ingevuld.');

        if (isNaN(parseInt(b.time)))
            throw new Error('Tijdstempel is niet een nummer.');

        quote.quote = b.quote;
        quote.context = b.context;
        quote.quotee = b.quotee;
        quote.time = b.time;

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
