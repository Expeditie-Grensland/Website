import * as mongoose from 'mongoose';

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

    function unwrapDocumentId(id: string | mongoose.Types.ObjectId): string {
        return new mongoose.Types.ObjectId(id).toHexString();
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
