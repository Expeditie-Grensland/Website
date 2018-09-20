import * as express from 'express';
import * as multer from 'multer';
import { MediaFilesHelper } from '../components/mediaFiles/helper';
import * as mongoose from 'mongoose';
import * as mime2 from 'mime/lite';
import { MediaFiles } from '../components/mediaFiles';
import { MediaFile } from '../components/mediaFiles/model';

const upload = multer(MediaFilesHelper.multerSettings);

export const router = express.Router();

router.route('/upload')
    .post(upload.single('file'), (req, res, next) => {
        if (!req.file)
            return next(new Error('File did not upload properly.'));

        let _id = mongoose.Types.ObjectId(req.file.filename.split('.')[0]);
        let ext = req.file.filename.split('.')[1];
        let mime = mime2.getType(ext);

        MediaFiles.create({ _id, ext, mime })
            .then(file => res.status(200).json(file))
            .catch(next);
    });

router.route('/upload-multiple')
    .post(upload.array('files'), (req, res, next) => {
        if (!req.files)
            return next(new Error('Files did not upload properly.'));

        let files: MediaFile[] = [];

        for (let file of Object.values(req.files)) {
            let _id = mongoose.Types.ObjectId(file.filename.split('.')[0]);
            let ext = file.filename.split('.')[1];
            let mime = mime2.getType(ext);

            files.push({ _id, ext, mime });
        }

        if (files.length === 0)
            return next(new Error('No files were uploaded.'));

        MediaFiles.createMany(files)
            .then(files => res.status(200).json(files))
            .catch(next);
    });
