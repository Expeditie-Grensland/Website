import * as mongoose from "mongoose"
import {ObjectID, ObjectId} from "bson"

export namespace Util {
    export type DocumentOrID<T extends mongoose.Document> = T | string | ObjectID

    export function getDocumentId<T extends mongoose.Document>(document: DocumentOrID<T>): string {
        if(isString(document)) {
            return document
        } else if(isObjectID(document)) {
            return document.toHexString()
        }
        return getDocumentId(document._id)
    }

    export function getObjectID<T extends mongoose.Document>(document: DocumentOrID<T>): ObjectID {
        if(isString(document)) {
            return new ObjectID(document)
        } else if(isObjectID(document)) {
            return document
        }
        return getObjectID(document._id)
    }

    export function getDocument<T extends mongoose.Document>(document: DocumentOrID<T>, findByID: (id: string) => Promise<T>): Promise<T> {
        if(isDocument(document))
            return Promise.resolve(document)

        return findByID(getDocumentId(document))
    }

    export function getDocumentIds<T extends mongoose.Document>(documents: DocumentOrID<T>[]): string[] {
        if(documents.length < 1) {
            return []
        }

        return documents.map((doc) => getDocumentId(doc))
    }

    export function getObjectIDs<T extends mongoose.Document>(documents: DocumentOrID<T>[]): ObjectID[] {
        return getDocumentIds(documents).map((id) => new ObjectID(id))
    }

    export function getDocuments<T extends mongoose.Document>(documents: DocumentOrID<T>[], findByIDs: (id: string[]) => Promise<T[]>): Promise<T[]> {
        if(documents.length < 1) {
            return Promise.resolve([])
        }

        let ids: string[] = []
        let docs: T[] = []

        for(let document of documents) {
            if(isDocument(document)) {
                docs.push(document)
            } else if(isObjectID(document)) {
                ids.push(document.toHexString())
            } else {
                ids.push(document)
            }
        }

        return findByIDs(ids).then((ds) => {
            return ds.concat(docs)
        })
    }

    export function isString<T extends mongoose.Document>(document: DocumentOrID<T>): document is string {
        return typeof(document) === "string"
    }

    export function isDocument<T extends mongoose.Document>(document: DocumentOrID<T>): document is T {
        return (<T>document)._id !== undefined
    }

    export function isObjectID<T extends mongoose.Document>(document: DocumentOrID<T>): document is ObjectID {
        return (<ObjectId>document).toHexString !== undefined
    }
}