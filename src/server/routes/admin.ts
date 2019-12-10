import * as express from 'express';
import * as mongoose from 'mongoose';
import * as multer from 'multer';

import { MediaFiles } from '../components/mediaFiles';
import { AuthHelper } from '../helpers/authHelper';
import { MediaFileHelper } from '../components/mediaFiles/helper';
import { MediaFile } from '../components/mediaFiles/model';

export const router = express.Router();

router.use(AuthHelper.loginRedirect);
router.use(AuthHelper.noAdminRedirect);

router.get('/bestanden', async (req, res) =>
    res.render('admin/mediafiles/list', {
        files: await MediaFiles.getAll(),
        infoMsgs: req.flash('info'),
        errMsgs: req.flash('error'),
        getFileUrl: MediaFiles.getUrl
    })
);

router.post('/bestanden/verwijderen', (req, res) =>
    Promise.resolve(req.body.id).then(id => {
        try {
            return mongoose.Types.ObjectId(id);
        } catch {
            throw new Error(`'${id}' is geen geldige Id.`);
        }
    }).then(id =>
        MediaFiles.getById(id)
    ).then(f => {
        if (!f) throw new Error(`Bestand '${req.body.id}' bestaat niet.`);
        return MediaFiles.remove(f);
    }).then(f =>
        req.flash('info', `Bestand '${f._id.toHexString()}' zijn succesvol verwijderd.`)
    ).catch(e =>
        req.flash('error', e.message)
    ).then(() =>
        res.redirect('/admin/bestanden')
    )
);

const multerUpload = multer(MediaFileHelper.Multer.settings);

router.post('/bestanden/opladen', multerUpload.array('files'), (req, res, next) =>
    Promise.resolve(req.files).then(fs => {
        if (!fs) throw new Error('Bestanden zijn niet juist opgeladen.');

        let mediaFiles: MediaFile[] = [];

        for (let file of Object.values(req.files)) {
            mediaFiles.push({
                _id: mongoose.Types.ObjectId(file.filename.split('.')[0]),
                ext: file.filename.split('.')[1],
                mime: file.mimetype,
                restricted: !!req.body.restricted
            });
        }

        if (!mediaFiles.length) throw new Error('Er zijn geen geldige bestanden opgeladen.');

        return MediaFiles.createMany(mediaFiles);
    }).then(fs =>
        req.flash('info', `Bestanden ${fs.map(f => `'${f._id.toHexString()}'`).join(', ')} zijn succesvol opgeladen.`)
    ).catch(e =>
        req.flash('error', e.message)
    ).then(() =>
        res.redirect('/admin/bestanden')
    )
);

router.post('/bestanden/creeren', (req, res) =>
    Promise.resolve(req.body.mime).then(mime => {
        if (!mime || MediaFileHelper.mime2.getExtension(mime) == null) throw new Error('Er was geen geldig mime type geselecteerd.');

        return MediaFiles.create({
            ext: MediaFileHelper.mime2.getExtension(mime),
            mime: mime,
            restricted: !!req.body.restricted
        });
    }).then(f =>
        req.flash('info', `Bestand '${f._id.toHexString()}' is succesvol gecreëerd.`)
    ).catch(e =>
        req.flash('error', e.message)
    ).then(() =>
        res.redirect('/admin/bestanden')
    )
);
