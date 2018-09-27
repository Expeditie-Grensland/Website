import * as mongoose from 'mongoose';

/**
 * The new DocumentOrId type, for use with ObjectIds instead of strings;
 */
export type DocumentOrId<T extends mongoose.Document> = T | mongoose.Types.ObjectId;

export namespace Documents {
    export const isDocument = <T extends mongoose.Document>(doc: DocumentOrId<T>): doc is T =>
        (<T>doc).save !== undefined;

    export const isObjectId = <T extends mongoose.Document>(doc: DocumentOrId<T>): doc is mongoose.Types.ObjectId =>
        (<mongoose.Types.ObjectId>doc).toHexString !== undefined;

    export const getObjectId = <T extends mongoose.Document>(doc: DocumentOrId<T>): mongoose.Types.ObjectId =>
        isObjectId(doc) ? doc : doc._id;

    export const getObjectIds = <T extends mongoose.Document>(docs: DocumentOrId<T>[]): mongoose.Types.ObjectId[] =>
        docs.length < 1 ? [] : docs.map(getObjectId);

    export const getDocument = <T extends mongoose.Document>(getById: ((id: mongoose.Types.ObjectId) => Promise<T | null>)) =>
        (doc: DocumentOrId<T>): Promise<T | null> =>
            isDocument(doc) ? Promise.resolve(doc) : getById(getObjectId(doc));

    export const ensureNotNull = <T extends mongoose.Document>(input: T | null | undefined): T => {
        if (input != null)
            return input;
        throw new Error('Document was unexpectedly not found, please try again.')
    };

    export const getDocuments = <T extends mongoose.Document>(getByIds: ((id: mongoose.Types.ObjectId[]) => Promise<T[]>)) =>
        (docs: DocumentOrId<T>[]): Promise<T[]> => {
            if (docs.length < 1)
                return Promise.resolve([]);

            let docPart: T[] = [];
            let idPart: mongoose.Types.ObjectId[] = [];

            for (let doc of docs)
                isObjectId(doc) ? idPart.push(doc) : docPart.push(doc);

            return getByIds(idPart)
                .then(docPart.concat);
        };
}
