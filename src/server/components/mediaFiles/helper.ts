import * as path from 'path';
import { config } from '../../helpers/configHelper';
import * as express from 'express';
import * as multer from 'multer';
import * as mongoose from 'mongoose';
import * as fs from 'fs';
import { MediaFile, MediaFileDocument, MediaFileOrId, MediaFiles } from '.';
import { Documents } from '../documents/new';

const Mime = require('mime/Mime');

export namespace MediaFileHelper {
    export const getFilesFolder = (): string =>
        path.isAbsolute(config.filesFolder) ?
            path.normalize(config.filesFolder) : path.join(__dirname, '../..', config.filesFolder);

    export const getFileLocation = (file: MediaFile | MediaFileDocument) =>
        path.join(getFilesFolder(), `${file._id}.${file.ext}`);

    export const ensureFileNotInUse = (file: MediaFileOrId): Promise<MediaFileDocument> =>
        MediaFiles.getDocument(file)
            .then(Documents.ensureNotNull)
            .then(file => {
                if (file.uses == null || file.uses.length < 1)
                    return file;
                throw new Error('File is still in use');
            });

    export const deleteFile = (file: MediaFileDocument): Promise<MediaFileDocument> =>
        new Promise((resolve, reject) => {
            fs.unlink(getFileLocation(file), (err) => {
                if (err)
                    reject(err);
                else
                    resolve(file);
            });
        });


    const _mimeMap = {
        'image/jpeg': ['jpg', 'jpeg'],
        'audio/mpeg': ['mp3', 'mpga', 'm3a'],
        'video/mp4': ['mp4', 'mp4v', 'mpg4', 'm4v']
    };

    export const mime2 = new Mime(_mimeMap);

    export namespace Multer {
        const destination: string = getFilesFolder();

        const filename = (req: express.Request, file: Express.Multer.File, cb: ((error: Error | null, filename: string) => void)) => {
            let id = mongoose.Types.ObjectId();
            let ext = mime2.getExtension(mime2.getType(file.originalname));
            cb(null, `${id}.${ext}`);
        };

        const fileFilter = (req: express.Request, file: Express.Multer.File, cb: ((error: Error | null, acceptFile: boolean) => void)) =>
            cb(null, mime2.getType(file.originalname) != null);

        export const settings = { storage: multer.diskStorage({ destination, filename }), fileFilter };
    }
}
