import * as path from 'path';
import * as express from 'express';
import * as multer from 'multer';
import * as mongoose from 'mongoose';
import * as fs from 'fs';

import { config } from '../../helpers/configHelper';
import {MediaFileDocument, MediaFileEmbedded} from './model';

const Mime = require('mime/Mime');

export namespace MediaFileHelper {
    export const getFilesFolder = (): string =>
        path.isAbsolute(config.files.directory) ?
            path.normalize(config.files.directory) : path.join(__dirname, '../..', config.files.directory);

    export const getFileLocation = (id: string, ext: string) =>
        path.join(getFilesFolder(), `${id}.${ext}`);

    export const deleteFile = (file: MediaFileDocument): Promise<MediaFileDocument> =>
        new Promise((resolve, reject) => {
            fs.unlink(getFileLocation(file._id, file.ext), (err) => {
                if (err)
                    reject(err);
                else
                    resolve(file);
            });
        });

    export const deleteEmbeddedFile = (file: MediaFileEmbedded): Promise<MediaFileEmbedded> =>
        new Promise((resolve, reject) => {
            fs.unlink(getFileLocation(file.id.toHexString(), file.ext), (err) => {
                if (err)
                    reject(err);
                else
                    resolve(file);
            });
        });

    export const getIdFromPath = (path: string): mongoose.Types.ObjectId => {
        const pathParts = path.split('/');
        const fileName = pathParts[pathParts.length - 1];
        return new mongoose.Types.ObjectId(fileName.split('.')[0]);
    };

    const _mimeMap = {
        'image/jpeg': ['jpg', 'jpeg'],
        'audio/mpeg': ['mp3', 'mpga', 'm3a'],
        'video/mp4': ['mp4', 'mp4v', 'mpg4', 'm4v']
    };

    export const mime2 = new Mime(_mimeMap);

    export namespace Multer {
        const destination: string = getFilesFolder();

        const filename = (req: express.Request, file: Express.Multer.File, cb: ((error: Error | null, filename: string) => void)) => {
            const id = new mongoose.Types.ObjectId();
            const ext = mime2.getExtension(file.mimetype);
            cb(null, `${id}.${ext}`);
        };

        const fileFilter = (req: express.Request, file: Express.Multer.File, cb: ((error: Error | null, acceptFile: boolean) => void)) =>
            cb(null, mime2.getExtension(file.mimetype) != null);

        export const settings = { storage: multer.diskStorage({ destination, filename }), fileFilter } as multer.Options;
    }
}
