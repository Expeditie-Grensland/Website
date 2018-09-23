import * as path from 'path';
import { config } from '../../helpers/configHelper';
import * as multer from 'multer';
import * as mongoose from 'mongoose';
import * as fs from 'fs';
import { MediaFile, MediaFileDocument } from '.';
const Mime = require('mime/Mime');

export namespace MediaFileHelper {
    export const getFilesFolder = (): string =>
        path.isAbsolute(config.filesFolder) ?
            path.normalize(config.filesFolder) : path.join(__dirname, '../..', config.filesFolder);

    export const getFileLocation = (file: MediaFile | MediaFileDocument) =>
        path.join(getFilesFolder(), `${file._id}.${file.ext}`);

    export const ensureFileNotInUse = (file: MediaFile): Promise<MediaFile> =>
        new Promise((resolve, reject) => {
            if (file.uses === undefined || file.uses === null || file.uses.length < 1)
                return resolve(file);
            return reject(new Error('File is still in use'));
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
        'audio/mpeg': ['mp3', 'mpga', 'm3a']
    };

    export const mime2 = new Mime(_mimeMap);

    export namespace Multer {
        const destination: string = getFilesFolder();

        const filename = (req, file: Express.Multer.File, cb: ((error: Error | null, filename: string) => void)) => {
            let id = mongoose.Types.ObjectId();
            let ext = mime2.getExtension(mime2.getType(file.originalname));
            cb(null, `${id}.${ext}`);
        };

        const fileFilter = (req, file: Express.Multer.File, cb: ((error: Error | null, acceptFile: boolean) => void)) =>
            cb(null, mime2.getType(file.originalname) != null);

        export const settings = { storage: multer.diskStorage({ destination, filename }), fileFilter };
    }
}
