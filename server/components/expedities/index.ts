import { Locations } from '../locations';
import { People } from '../people';
import { Routes } from '../routes';
import { Util } from '../documents/util';
import { Expeditie, ExpeditieDocument, ExpeditieModel, ExpeditieOrID } from './model';
import { PersonOrID } from '../people/model';
import { RouteDocument, RouteOrID } from '../routes/model';
import { Location, LocationDocument } from '../locations/model';
import * as i18next from 'i18next';

const sprintf = require('sprintf-js').sprintf;

export namespace Expedities {
    export const getByNameShort = (nameShort: string): Promise<ExpeditieDocument> =>
        ExpeditieModel.findOne({ nameShort }).exec();

    export const getAll = (): Promise<ExpeditieDocument[]> =>
        ExpeditieModel
            .find({})
            .sort({ sequenceNumber: -1 })
            .exec();

    export const getById = (id: string): Promise<ExpeditieDocument> =>
        ExpeditieModel.findById(id).exec();

    export const getDocument = (location: ExpeditieOrID): Promise<ExpeditieDocument> =>
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
            .then(() => getDocument(expeditie));

    export const create = (expeditie: Expeditie): Promise<ExpeditieDocument> =>
        Promise.resolve(expeditie)
            .then(_createNewRouteIfUndefined)
            .then(ExpeditieModel.create)
            .then(_addExpeditieToPersons(expeditie.participants));

    export const setFinished = (finished: boolean) => (expeditie: ExpeditieOrID): Promise<ExpeditieDocument> =>
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
            .then(expeditie => removeParticipants(expeditie.participants)(expeditie))
            .then(expeditie => expeditie.remove())
            .then(() => undefined);

    export const addParticipants = (participants: PersonOrID[]) => (expeditie: ExpeditieOrID): Promise<ExpeditieDocument> =>
        getDocument(expeditie)
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
            ).exec());

    const _removeExpeditieFromPersons = (persons: PersonOrID[]) => (expeditie: ExpeditieOrID): Promise<ExpeditieDocument> =>
        Promise.all(persons.map(People.removeExpeditie(expeditie)))
            .then(() => getDocument(expeditie));

    export const removeParticipants = (participants: PersonOrID[]) => (expeditie: ExpeditieOrID): Promise<ExpeditieDocument> =>
        getDocument(expeditie)
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
            ).exec());

    export const setRoute = (route: RouteOrID) => (expeditie: ExpeditieOrID): Promise<ExpeditieDocument> =>
        getDocument(expeditie)
            .then(_checkFinished)
            .then(expeditie => ExpeditieModel.findByIdAndUpdate(
                Util.getObjectID(expeditie),
                { route: Util.getObjectID(route) },
                { new: true }
            ).exec());

    export const getRoute = (expeditie: ExpeditieOrID): Promise<RouteDocument> =>
        getDocument(expeditie)
            .then(expeditie => Routes.getDocument(expeditie.route));

    export const setGroups = (groups: PersonOrID[][]) => (expeditie: ExpeditieOrID): Promise<ExpeditieDocument> =>
        getDocument(expeditie)
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
            .then(_checkFinished)
            .then(expeditie => Promise.all([expeditie, Locations.create(location, expeditie.route)]))
            .then(([expeditie]) => expeditie);

    export const addLocations = (locations: Location[]) => (expeditie: ExpeditieOrID): Promise<ExpeditieDocument> =>
        getDocument(expeditie)
            .then(_checkFinished)
            .then(expeditie => Promise.all([expeditie, Locations.createMany(locations, expeditie.route)]))
            .then(([expeditie]) => expeditie);

    export const getLocations = (expeditie: ExpeditieOrID): Promise<LocationDocument[]> =>
        getRoute(expeditie)
            .then(Locations.getInRoute);
}
