import * as path from 'path';
import * as mime2 from 'mime/lite';
import { config } from '../../helpers/configHelper';
import * as multer from 'multer';
import * as mongoose from 'mongoose';

export namespace MediaFilesHelper {
    export const getFilesFolder = (): string => {
        if (path.isAbsolute(config.filesFolder))
            return path.normalize(config.filesFolder);
        return path.join(__dirname, '../..', config.filesFolder);
    };

    const _allowedTypes: string[] = [
        'image/jpeg'
    ];

    const _checkAllowed = (req, file: Express.Multer.File, cb: ((error: Error | null, acceptFile: boolean) => void)) => {
        let mime = mime2.getType(file.originalname);
        if (_allowedTypes.includes(mime))
            return cb(null, true);
        return cb(null, false);
    };

    const _getFileName = (req, file: Express.Multer.File, cb: ((error: Error | null, filename: string) => void)) => {
        let id = mongoose.Types.ObjectId();
        let ext = mime2.getExtension(mime2.getType(file.originalname));
        cb(null, `${id}.${ext}`);
    };

    export const multerSettings = {
        storage: multer.diskStorage({
            destination: getFilesFolder(),
            filename: _getFileName
        }),
        fileFilter: _checkAllowed
    };
}
