import * as mongoose from 'mongoose';

import { MediaFiles } from '../mediaFiles';
import { MediaFileOrId } from '../mediaFiles/model';
import { Quote, QuoteDocument, QuoteModel, QuoteOrId } from './model';
import { Documents } from '../documents';

export namespace Quotes {
    export const create = (quote: Quote): Promise<QuoteDocument> =>
        QuoteModel.create(quote);

    export const getAll = (): Promise<QuoteDocument[]> =>
        QuoteModel
            .find({})
            .collation({ locale: 'nl', strength: 1 })
            .sort({ time: 1 })
            .exec();

    export const getById = (id: mongoose.Types.ObjectId): Promise<QuoteDocument | null> =>
        QuoteModel
            .findById(id)
            .exec();

    export const getByIds = (ids: mongoose.Types.ObjectId[]): Promise<QuoteDocument[]> =>
        QuoteModel
            .find({ _id: { $in: ids } })
            .exec();

    export const getDocument = (quote: QuoteOrId): Promise<QuoteDocument | null> =>
        Documents.getDocument(getById)(quote);

    export const setMediaFile = (quote: QuoteOrId, file: MediaFileOrId): Promise<QuoteDocument | null> =>
        MediaFiles.ensureMime(file, ['audio/mpeg', 'video/mp4'])
            .then(MediaFiles.getEmbed)
            .then(embed => QuoteModel.findByIdAndUpdate(
                Documents.getObjectId(quote),
                { mediaFile: embed },
                { new: true })
                .exec());
}
