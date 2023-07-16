import * as mongoose from 'mongoose';

import { Expeditie, ExpeditieDocument, ExpeditieModel, ExpeditieOrId } from './model';
import { PersonDocument, PersonOrId } from '../people/model';
import { Documents } from '../documents';
import { GeoLocationDocument, geoLocationModel } from '../geoLocations/model';
import { GeoNodeDocument, geoNodeModel } from '../geoNodes/model';

export namespace Expedities {
    export const getByNameShort = (nameShort: string): Promise<ExpeditieDocument | null> =>
        ExpeditieModel.findOne({ nameShort }).exec();

    export const getByNameShortPopulated = (nameShort: string): Promise<ExpeditieDocument | null> =>
        ExpeditieModel.findOne({ nameShort }).populate('personIds').populate('movieEditorIds').exec();

    export const getAll = (): Promise<ExpeditieDocument[]> =>
        ExpeditieModel
            .find({})
            .sort({ sequenceNumber: -1 })
            .exec();

    export const getById = (id: mongoose.Types.ObjectId): Promise<ExpeditieDocument | null> =>
        ExpeditieModel.findById(id).exec();

    export const getDocument = (expeditie: ExpeditieOrId): Promise<ExpeditieDocument | null> =>
        Documents.getDocument(getById)(expeditie);

    export const create = (expeditie: Expeditie): Promise<ExpeditieDocument | void> =>
        ExpeditieModel.create(expeditie);

    export const setFinished = (expeditie: ExpeditieOrId, finished: boolean): Promise<ExpeditieDocument | null> =>
        ExpeditieModel.findByIdAndUpdate(
            Documents.getObjectId(expeditie),
            { finished: finished },
            { new: true }
        ).exec();

    const _checkFinished = (expeditie: ExpeditieDocument): Promise<ExpeditieDocument> => {
        if (expeditie.finished)
            throw `Sorry, de expeditie ${ expeditie.name } is gemarkeerd als beëindigd`;
        return Promise.resolve(expeditie);
    };

    export const remove = (expeditie: ExpeditieOrId): Promise<void> =>
        getDocument(expeditie)
            .then(Documents.ensureNotNull)
            .then(expeditie => expeditie.deleteOne())
            .then(() => undefined);

    export const addPeople = (expeditie: ExpeditieOrId, people: PersonOrId[]): Promise<ExpeditieDocument> =>
        getDocument(expeditie)
            .then(Documents.ensureNotNull)
            .then(_checkFinished)
            .then(expeditie => ExpeditieModel.findByIdAndUpdate(
                Documents.getObjectId(expeditie),
                {
                    $addToSet: {
                        personIds: { $each: Documents.getObjectIds(people) }
                    }
                },
                { new: true }
            ).exec())
            .then(Documents.ensureNotNull);


    export const removePeople = (expeditie: ExpeditieOrId, people: PersonOrId[]): Promise<ExpeditieDocument> =>
        getDocument(expeditie)
            .then(Documents.ensureNotNull)
            .then(_checkFinished)
            .then(expeditie => ExpeditieModel.findByIdAndUpdate(
                Documents.getObjectId(expeditie),
                {
                    $pullAll: {
                        personIds: Documents.getObjectIds(people)
                    }
                },
                { new: true }
            ).exec())
            .then(Documents.ensureNotNull);

    export const getLocations = (expeditie: ExpeditieOrId): Promise<GeoLocationDocument[]> =>
        geoLocationModel.find({ expeditieId: Documents.getObjectId(expeditie) }).exec();

    export const getLocationCount = (expeditie: ExpeditieOrId): Promise<number> =>
        geoLocationModel.count({ expeditieId: Documents.getObjectId(expeditie) }).exec();

    export const getNodes = (expeditie: ExpeditieOrId): Promise<GeoNodeDocument[]> =>
        geoNodeModel.find({ expeditieId: Documents.getObjectId(expeditie) }).sort({ _id: 1 }).exec();

    export const getNodesWithPeople = (expeditie: ExpeditieOrId) => // FIXME: see geonodes model
        geoNodeModel.find({ expeditieId: Documents.getObjectId(expeditie) }).sort({ _id: 1 }).populate('personIds').exec() as Promise<(GeoNodeDocument & { personIds: PersonDocument[] })[]>;

    export const getCurrentNodes = (expeditie: ExpeditieOrId): Promise<GeoNodeDocument[]> =>
        geoNodeModel.find({ expeditieId: Documents.getObjectId(expeditie), timeTill: Number.POSITIVE_INFINITY }).sort({ _id: 1 }).exec();

    export const getMovieUrls = (expeditie: Expeditie) => ({
        fallbackMP4: expeditie !== undefined ? `/media/${expeditie.nameShort}/progressive.mp4` : '',
        manifest: expeditie !== undefined ? `/media/${expeditie.nameShort}/index.m3u8` : '',
        poster: expeditie !== undefined ? `/media/${expeditie.nameShort}/poster.jpg` : '',
    })
}
