import { MediaFileOrId, MediaFiles } from '../mediaFiles';
import { MediaFileUse } from '../mediaFiles/model';
import * as mongoose from 'mongoose';
import { Util } from '../documents/util';
import { Documents } from '../documents/new';
import { QuoteId } from './id';
import {Quote, QuoteDocument, QuoteModel, QuoteOrID} from "./model"

export namespace Quotes {
    export const create = (quote: Quote): Promise<QuoteDocument> =>
        QuoteModel.create(quote);

    export const getAll = (): Promise<QuoteDocument[]> =>
        QuoteModel
            .find({})
            .collation({ locale: 'nl', strength: 1 })
            .sort({ time: 1 })
            .exec();

    export const getById = (id: string): Promise<QuoteDocument | null> =>
        QuoteModel
            .findById(id)
            .exec();

    export const getByIds = (ids: string[]): Promise<QuoteDocument[]> =>
        QuoteModel
            .find({ _id: { $in: ids } })
            .exec();

    export const getDocument = (quote: QuoteOrID): Promise<QuoteDocument | null> =>
        Util.getDocument(getById)(quote);

    export const setMediaFile = (quote: QuoteOrID, file: MediaFileOrId): Promise<QuoteDocument | null> => {
        const usage: MediaFileUse = {
            model: QuoteId,
            id: mongoose.Types.ObjectId(Util.getObjectID(quote)),
            field: 'mediaFile'
        };

        return MediaFiles.ensureMime(file, ['audio/mpeg', 'video/mp4'])
            .then(file => MediaFiles.addUse(file, usage))
            // TODO: MA. - Find solution for all those ensureNotNulls everywhere.
            .then(Documents.ensureNotNull)
            .then(MediaFiles.getEmbed)
            .then(embed => getDocument(quote)
                .then(Documents.ensureNotNull)
                .then(quote => quote.mediaFile ? MediaFiles.removeUse(quote.mediaFile, usage) : undefined)
                .then(() => embed))
            .then(embed => QuoteModel.findByIdAndUpdate(
                Util.getObjectID(quote),
                { mediaFile: embed },
                { new: true })
                .exec());
    };
}
