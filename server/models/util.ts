import { ObjectId } from 'bson';
import * as mongoose from 'mongoose';

import { Tables } from './tables';

import DocumentOrID = Tables.DocumentOrID;

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

    export function getDocument<T extends mongoose.Document>(document: DocumentOrID<T>, findByID: (_id: string) => Promise<T>): Promise<T> {
        if (isDocument(document)) return Promise.resolve(document);

        return findByID(getObjectID(document));
    }

    export function getDocuments<T extends mongoose.Document>(
        documents: DocumentOrID<T>[],
        findByIDs: (id: string[]) => Promise<T[]>
    ): Promise<T[]> {
        if (documents.length < 1) {
            return Promise.resolve([]);
        }

        let ids: string[] = [];
        let docs: T[] = [];

        for (let document of documents) {
            if (isDocument(document)) {
                docs.push(document);
            } else if (isObjectID(document)) {
                ids.push(document);
            }
        }

        return findByIDs(ids).then(ds => {
            return ds.concat(docs);
        });
    }
}
