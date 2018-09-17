import { ObjectId } from 'bson';
import * as mongoose from 'mongoose';
import { aPipe } from '../../helpers/functionalHelper';

export type DocumentOrID<T extends mongoose.Document> = T | string;

export function reference(to: string): {} {
    return { type: String, ref: to };
}

export namespace Util {
    export function isDocument<T extends mongoose.Document>(document: DocumentOrID<T>): document is T {
        return (<T>document).save !== undefined;
    }

    export function isObjectID<T extends mongoose.Document>(document: DocumentOrID<T>): document is string {
        return (<string>document).charAt !== undefined;
    }

    export function getObjectID<T extends mongoose.Document>(document: DocumentOrID<T>): string {
        if (isObjectID(document)) {
            return document;
        }
        return unwrapDocumentId(document._id);
    }

    function unwrapDocumentId(id: string | ObjectId): string {
        if ((<any>id).toHexString !== undefined) return (<ObjectId>id).toHexString();
        else return <string>id;
    }

    export function getObjectIDs<T extends mongoose.Document>(documents: DocumentOrID<T>[]): string[] {
        if (documents.length < 1) {
            return [];
        }

        return documents.map(doc => getObjectID(doc));
    }

    export const getDocument = <T extends mongoose.Document>(findById: (id: string) => Promise<T>) =>
        (doc: DocumentOrID<T>): Promise<T> => {
            if (isDocument(doc))
                return Promise.resolve(doc);

            return findById(getObjectID(doc));
        };

    export const getDocuments = <T extends mongoose.Document>(findByIds: (id: string[]) => Promise<T[]>) =>
        (docs: DocumentOrID<T>[]): Promise<T[]> => {
            if (docs.length < 1)
                return Promise.resolve([]);

            let docPart: T[] = [];
            // TODO: change string to ObjectID when changing
            let idPart: string[] = [];

            for (let doc of docs) {
                if (isDocument(doc))
                    docPart.push(doc);
                else if (isObjectID(doc))
                    idPart.push(doc)
            }

            return aPipe(
                findByIds,
                docPart.concat
            )(idPart);
        };
}
