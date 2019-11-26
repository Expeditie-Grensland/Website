import { Metadatum, MetadatumDocument, MetadatumModel } from './model';

export namespace Metadata {
    export const create = (metadatum: Metadatum): Promise<MetadatumDocument> =>
        MetadatumModel.create(metadatum);

    export const createKeyValue = (key: string, value: any): Promise<MetadatumDocument> =>
        create({ _id: key, value });

    export const getByKey = (key: string): Promise<MetadatumDocument | null> =>
        MetadatumModel.findById(key).exec();

    export const getValueByKey = async (key: string): Promise<any | null> =>
        getByKey(key).then(doc => doc === null ? null : doc.value);

    export const setValue = (key: string, value: any): Promise<MetadatumDocument | null> =>
        MetadatumModel.findByIdAndUpdate(key, { $set: { value } }).exec();
}

