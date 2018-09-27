import * as express from 'express';
import * as multer from 'multer';
import { MediaFile, MediaFileHelper, MediaFiles } from '../components/mediaFiles';
import * as mongoose from 'mongoose';

const upload = multer(MediaFileHelper.Multer.settings);

export const router = express.Router();

router.route('/')
    .get((req, res, next) => {
        MediaFiles.getAll()
            .then(files => {
                if (files !== undefined)
                    return res.status(200).json(files);
                next();
            })
            .catch(next);
    })
    .post(upload.array('files'), (req, res, next) => {
        if (!req.files)
            return next(new Error('Files did not upload properly.'));

        let files: MediaFile[] = [];

        for (let file of Object.values(req.files)) {
            let _id = mongoose.Types.ObjectId(file.filename.split('.')[0]);
            let ext = file.filename.split('.')[1];
            let mime = MediaFileHelper.mime2.getType(ext);

            files.push({ _id, ext, mime });
        }

        if (files.length === 0)
            return next(new Error('No valid files were uploaded.'));

        MediaFiles.createMany(files)
            .then(files => res.status(200).json(files))
            .catch(next);
    });

router.route('/:id([a-f\\d]{24})')
    .get((req, res, next) =>
        MediaFiles.getById(req.params.id)
            .then(file => {
                if (file)
                    return res.status(200).json(file);
                next();
            })
            .catch(next))
    .delete((req, res, next) =>
        // TODO: MA. - wrapId fn.
        MediaFiles.remove(mongoose.Types.ObjectId(req.params.id))
            .then(file => {
                if (file)
                    return res.status(200).json(file);
                next();
            })
            .catch(next));

router.route('/:id([a-f\\d]{24})/redirect')
    .get((req, res, next) => {
        MediaFiles.getById(req.params.id)
            .then(file => {
                if (file)
                    return res.redirect(`/media/${file._id}.${file.ext}`);
                next();
            })
            .catch(next);
    });
