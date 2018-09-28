import { Locations } from '../locations';
import { People } from '../people';
import { Routes } from '../routes';
import { Util } from '../documents/util';
import { Expeditie, ExpeditieDocument, ExpeditieID, ExpeditieModel, ExpeditieOrID } from './model';
import { PersonOrID } from '../people/model';
import { RouteDocument, RouteOrID } from '../routes/model';
import { Location, LocationDocument } from '../locations/model';
import * as i18next from 'i18next';
import { MediaFileOrId, MediaFiles } from '../mediaFiles';
import { MediaFileUse } from '../mediaFiles/model';
import * as mongoose from 'mongoose';
import { Documents } from '../documents/new';

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

    const _createNewRouteIfUndefined = (expeditie: Expeditie): Promise<Expeditie> => {
        if (expeditie.route !== undefined)
            return Promise.resolve(expeditie);

        return Routes.create({})
            .then(route => expeditie.route = Util.getObjectID(route))
            .catch(err => console.error('Creating route failed!', err))
            .then(() => expeditie);
    };

    const _addExpeditieToPersons = (persons: PersonOrID[]) => (expeditie: ExpeditieOrID): Promise<ExpeditieDocument> =>
        Promise.all(persons.map(People.addExpeditie(expeditie)))
            .then(() => getDocument(expeditie).then(Documents.ensureNotNull));

    export const create = (expeditie: Expeditie): Promise<ExpeditieDocument> =>
        Promise.resolve(expeditie)
            .then(_createNewRouteIfUndefined)
            .then(ExpeditieModel.create)
            .then(_addExpeditieToPersons(expeditie.participants));

    export const setFinished = (finished: boolean) => (expeditie: ExpeditieOrID): Promise<ExpeditieDocument | null> =>
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
            .then(expeditie => removeParticipants(expeditie.participants)(expeditie))
            .then(expeditie => expeditie.remove())
            .then(() => undefined);

    export const addParticipants = (participants: PersonOrID[]) => (expeditie: ExpeditieOrID): Promise<ExpeditieDocument> =>
        getDocument(expeditie)
            .then(Documents.ensureNotNull)
            .then(_checkFinished)
            .then(_addExpeditieToPersons(participants))
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

    const _removeExpeditieFromPersons = (persons: PersonOrID[]) => (expeditie: ExpeditieOrID): Promise<ExpeditieDocument> =>
        Promise.all(persons.map(People.removeExpeditie(expeditie)))
            .then(() => getDocument(expeditie))
            .then(Documents.ensureNotNull);

    export const removeParticipants = (participants: PersonOrID[]) => (expeditie: ExpeditieOrID): Promise<ExpeditieDocument> =>
        getDocument(expeditie)
            .then(Documents.ensureNotNull)
            .then(_checkFinished)
            .then(_removeExpeditieFromPersons(participants))
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

    export const setRoute = (route: RouteOrID) => (expeditie: ExpeditieOrID): Promise<ExpeditieDocument> =>
        getDocument(expeditie)
            .then(Documents.ensureNotNull)
            .then(_checkFinished)
            .then(expeditie => ExpeditieModel.findByIdAndUpdate(
                Util.getObjectID(expeditie),
                { route: Util.getObjectID(route) },
                { new: true }
            ).exec())
            .then(Documents.ensureNotNull);

    export const getRoute = (expeditie: ExpeditieOrID): Promise<RouteDocument> =>
        getDocument(expeditie)
            .then(Documents.ensureNotNull)
            .then(expeditie => {
                if (!expeditie.route)
                    throw new Error('Expeditie route is unexpectedly empty');

                return Routes.getDocument(expeditie.route)
                    .then(Documents.ensureNotNull);
            });

    export const setGroups = (groups: PersonOrID[][]) => (expeditie: ExpeditieOrID): Promise<ExpeditieDocument> =>
        getDocument(expeditie)
            .then(Documents.ensureNotNull)
            .then(_checkFinished)
            .then(expeditie => {
                if (expeditie.route === undefined) {
                    return Routes.create({})
                        .then(route => Promise.all([setRoute(route)(expeditie), route]));
                }

                return Promise.all([expeditie, Routes.getDocument(expeditie.route)]);
            })
            .then(([expeditie]) => expeditie);

    export const addLocation = (location: Location) => (expeditie: ExpeditieOrID): Promise<ExpeditieDocument> =>
        getDocument(expeditie)
            .then(Documents.ensureNotNull)
            .then(_checkFinished)
            .then(expeditie => {
                if (!expeditie.route)
                    throw new Error('Expeditie route is unexpectedly empty');

                return Locations.create(location, expeditie.route)
                    .then(() => expeditie);
            });

    export const addLocations = (locations: Location[]) => (expeditie: ExpeditieOrID): Promise<ExpeditieDocument> =>
        getDocument(expeditie)
            .then(Documents.ensureNotNull)
            .then(_checkFinished)
            .then(expeditie => {
                if (!expeditie.route)
                    throw new Error('Expeditie route is unexpectedly empty');

                return Locations.createMany(locations, expeditie.route)
                    .then(() => expeditie);
            });

    export const getLocations = (expeditie: ExpeditieOrID): Promise<LocationDocument[]> =>
        getRoute(expeditie)
            .then(Locations.getInRoute);

    export const setBackgroundFile = (expeditie: ExpeditieOrID, file: MediaFileOrId): Promise<ExpeditieDocument> => {
        const usage: MediaFileUse = {
            model: ExpeditieID,
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
            model: ExpeditieID,
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
