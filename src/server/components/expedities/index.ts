import { People } from '../people';
import { Util } from '../documents/util';
import { Expeditie, ExpeditieDocument, ExpeditieModel, ExpeditieOrID } from './model';
import { PersonOrID } from '../people/model';
import * as i18next from 'i18next';
import { MediaFileOrId, MediaFiles } from '../mediaFiles';
import { MediaFileUse } from '../mediaFiles/model';
import * as mongoose from 'mongoose';
import { Documents } from '../documents/new';
import { ExpeditieId } from './id';
import * as R from 'ramda';
import { GeoLocationDocument, geoLocationModel } from '../geoLocations/model';

const sprintf = require('sprintf-js').sprintf;

export namespace Expedities {
    export const getByNameShort = (nameShort: string): Promise<ExpeditieDocument | null> =>
        ExpeditieModel.findOne({ nameShort }).exec();

    export const getAll = (): Promise<ExpeditieDocument[]> =>
        ExpeditieModel
            .find({})
            .sort({ sequenceNumber: -1 })
            .exec();

    export const getById = (id: string): Promise<ExpeditieDocument | null> =>
        ExpeditieModel.findById(id).exec();

    export const getDocument = (location: ExpeditieOrID): Promise<ExpeditieDocument | null> =>
        Util.getDocument(getById)(location);

    const _addExpeditieToPersons = (persons: PersonOrID[], expeditie: ExpeditieOrID): Promise<ExpeditieDocument> =>
        Promise.all(persons.map(People.addExpeditieR(R.__, expeditie)))
            .then(() => getDocument(expeditie).then(Documents.ensureNotNull));

    const _addExpeditieToPersonsR = R.curry(_addExpeditieToPersons);

    export const create = (expeditie: Expeditie): Promise<ExpeditieDocument> =>
        Promise.resolve(expeditie)
            .then(ExpeditieModel.create)
            .then(_addExpeditieToPersonsR(expeditie.participants));

    export const setFinished = (expeditie: ExpeditieOrID, finished: boolean): Promise<ExpeditieDocument | null> =>
        ExpeditieModel.findByIdAndUpdate(
            Util.getObjectID(expeditie),
            { finished: finished },
            { new: true }
        ).exec();

    const _checkFinished = (expeditie: ExpeditieDocument): Promise<ExpeditieDocument> => {
        if (expeditie.finished)
            throw sprintf(i18next.t('expeditie_finished_generic_error'), expeditie.name);
        return Promise.resolve(expeditie);
    };

    export const remove = (expeditie: ExpeditieOrID): Promise<void> =>
        getDocument(expeditie)
            .then(Documents.ensureNotNull)
            .then(expeditie => removeParticipants(expeditie, expeditie.participants))
            .then(expeditie => expeditie.remove())
            .then(() => undefined);

    export const addParticipants = (expeditie: ExpeditieOrID, participants: PersonOrID[]): Promise<ExpeditieDocument> =>
        getDocument(expeditie)
            .then(Documents.ensureNotNull)
            .then(_checkFinished)
            .then(_addExpeditieToPersonsR(participants))
            .then(expeditie => ExpeditieModel.findByIdAndUpdate(
                Util.getObjectID(expeditie),
                {
                    $addToSet: {
                        participants: { $each: Util.getObjectIDs(participants) }
                    }
                },
                { new: true }
            ).exec())
            .then(Documents.ensureNotNull);

    export const addParticipantsR = R.curry(addParticipants);

    const _removeExpeditieFromPersons = (expeditie: ExpeditieOrID, persons: PersonOrID[]): Promise<ExpeditieDocument> =>
        Promise.all(persons.map(People.removeExpeditieR(R.__, expeditie)))
            .then(() => getDocument(expeditie))
            .then(Documents.ensureNotNull);

    const _removeExpeditieFromPersonsR = R.curry(_removeExpeditieFromPersons);

    export const removeParticipants = (expeditie: ExpeditieOrID, participants: PersonOrID[]): Promise<ExpeditieDocument> =>
        getDocument(expeditie)
            .then(Documents.ensureNotNull)
            .then(_checkFinished)
            .then(_removeExpeditieFromPersonsR(R.__, participants))
            .then(expeditie => ExpeditieModel.findByIdAndUpdate(
                Util.getObjectID(expeditie),
                {
                    $pullAll: {
                        participants: Util.getObjectIDs(participants)
                    }
                },
                { new: true }
            ).exec())
            .then(Documents.ensureNotNull);

    export const getLocations = (expeditie: ExpeditieOrID): Promise<GeoLocationDocument[]> =>
        geoLocationModel.find({ expeditieId: Util.getObjectID(expeditie) }).exec();

    export const getLocationCount = (expeditie: ExpeditieOrID): Promise<number> =>
        geoLocationModel.count({ expeditieId: Util.getObjectID(expeditie) }).exec();

    export const setBackgroundFile = (expeditie: ExpeditieOrID, file: MediaFileOrId): Promise<ExpeditieDocument> => {
        const usage: MediaFileUse = {
            model: ExpeditieId,
            id: mongoose.Types.ObjectId(Util.getObjectID(expeditie)),
            field: 'backgroundFile'
        };

        return MediaFiles.ensureMime(file, ['image/jpeg'])
            .then(file => MediaFiles.addUse(file, usage))
            .then(Documents.ensureNotNull)
            .then(MediaFiles.getEmbed)
            .then(embed => getDocument(expeditie)
                .then(Documents.ensureNotNull)
                .then(expeditie => MediaFiles.removeUse(expeditie.backgroundFile, usage))
                .then(() => embed))
            .then(embed => ExpeditieModel.findByIdAndUpdate(
                Util.getObjectID(expeditie),
                { backgroundFile: embed },
                { new: true })
                .exec())
            .then(Documents.ensureNotNull);
    };

    export const setMovieCoverFile = (expeditie: ExpeditieOrID, file: MediaFileOrId): Promise<ExpeditieDocument> => {
        const usage: MediaFileUse = {
            model: ExpeditieId,
            id: mongoose.Types.ObjectId(Util.getObjectID(expeditie)),
            field: 'movieCoverFile'
        };

        return MediaFiles.ensureMime(file, ['image/jpeg'])
            .then(file => MediaFiles.addUse(file, usage))
            .then(Documents.ensureNotNull)
            .then(MediaFiles.getEmbed)
            .then(embed => getDocument(expeditie)
                .then(Documents.ensureNotNull)
                .then(expeditie => MediaFiles.removeUse(expeditie.movieCoverFile, usage))
                .then(() => embed))
            .then(embed => ExpeditieModel.findByIdAndUpdate(
                Util.getObjectID(expeditie),
                { movieCoverFile: embed },
                { new: true })
                .exec())
            .then(Documents.ensureNotNull);
    };
}
