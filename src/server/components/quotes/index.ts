import { MediaFileOrId, MediaFiles } from '../mediaFiles';
import { Util } from '../documents/util';
import { Quote, QuoteDocument, QuoteModel, QuoteOrID } from './model';

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

    export const setMediaFile = (quote: QuoteOrID, file: MediaFileOrId): Promise<QuoteDocument | null> =>
        MediaFiles.ensureMime(file, ['audio/mpeg', 'video/mp4'])
            .then(MediaFiles.getEmbed)
            .then(embed => QuoteModel.findByIdAndUpdate(
                Util.getObjectID(quote),
                { mediaFile: embed },
                { new: true })
                .exec());
}
