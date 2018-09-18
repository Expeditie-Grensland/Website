import * as mongoose from 'mongoose';
import { aPipe } from '../../helpers/functionalHelper';

export type DocumentOrID<T extends mongoose.Document> = T | string;

export function reference(to: string): {} {
    return { type: String, ref: to };
}

export namespace Util {
    export const isDocument = <T extends mongoose.Document>(doc: DocumentOrID<T>): doc is T =>
        (<T>doc).save !== undefined;

    // TODO: Change when changing to ObjectIds
    export const isObjectID = <T extends mongoose.Document>(doc: DocumentOrID<T>): doc is string =>
        (<string>doc).charAt !== undefined;

    // TODO: Change when changing to ObjectIds
    const _unwrapDocumentId = (id: string | mongoose.Types.ObjectId): string =>
        new mongoose.Types.ObjectId(id).toHexString();

    export const getObjectID = <T extends mongoose.Document>(doc: DocumentOrID<T>): string =>
        isObjectID(doc) ? doc : _unwrapDocumentId(doc._id);

    export const getObjectIDs = <T extends mongoose.Document>(docs: DocumentOrID<T>[]): string[] =>
        docs.length < 1 ? [] : docs.map(getObjectID);

    export const getDocument = <T extends mongoose.Document>(findById: (id: string) => Promise<T>) =>
        (doc: DocumentOrID<T>): Promise<T> =>
            isDocument(doc) ? Promise.resolve(doc) : findById(getObjectID(doc));

    export const getDocuments = <T extends mongoose.Document>(findByIds: (id: string[]) => Promise<T[]>) =>
        (docs: DocumentOrID<T>[]): Promise<T[]> => {
            if (docs.length < 1)
                return Promise.resolve([]);

            let docPart: T[] = [];
            // TODO: change string to ObjectId when changing
            let idPart: string[] = [];

            for (let doc of docs)
                isObjectID(doc) ? idPart.push(doc) : docPart.push(doc);

            return aPipe(
                findByIds,
                docPart.concat
            )(idPart);
        };
}
