import * as i18next from 'i18next';

import { Location } from '../location';
import { Person } from '../person';
import { Route } from '../route';
import { Util } from '../document/util';
import { ExpeditieDocument, ExpeditieOrID, ExpeditieModel, IExpeditie } from './model';
import { PersonDocument, PersonOrID } from '../person/model';
import { RouteDocument, RouteOrID } from '../route/model';
import { ILocation, LocationDocument } from '../location/model';

const sprintf = require('sprintf-js').sprintf;

export namespace Expeditie {
    let expeditiesCached = null;

    export function getCached(): Promise<ExpeditieDocument[]> {
        if (expeditiesCached === null) {
            expeditiesCached = getAll();
        }

        return expeditiesCached;
    }

    export function getByNameShort(nameShort: string): Promise<ExpeditieDocument> {
        return ExpeditieModel.findOne({ nameShort: nameShort }).exec();
    }

    function onChanged<T>(arg: T): Promise<T> {
        expeditiesCached = getAll();

        console.info('Invalidating Expeditie cache.');

        return Promise.resolve(arg);
    }

    export function getAll(): Promise<ExpeditieDocument[]> {
        return ExpeditieModel.find({})
            .sort({ sequenceNumber: -1 })
            .exec();
    }

    export function getById(_id: string): Promise<ExpeditieDocument> {
        return ExpeditieModel.findById(_id).exec();
    }

    export function getDocument(expeditie: ExpeditieOrID): Promise<ExpeditieDocument> {
        return Util.getDocument(expeditie, getById);
    }

    export function create(expeditie: IExpeditie): Promise<ExpeditieDocument> {
        return Promise.resolve()
            .then(() => {
                if (expeditie.finished === undefined) {
                    expeditie.finished = false;
                }

                if (expeditie.route == undefined) {
                    return Route.create({})
                        .then(route => {
                            expeditie.route = Util.getObjectID(route);

                            return expeditie;
                        })
                        .catch(err => {
                            console.warn('Creating route failed!', err);
                            return expeditie;
                        });
                }

                return expeditie;
            })
            .then(expeditie => {
                return ExpeditieModel.create(expeditie);
            })
            .then(expeditie => {
                let promises: Promise<PersonDocument>[] = [];

                for (let person of expeditie.participants) {
                    promises.push(Person.addExpeditie(expeditie)(person));
                }

                return Promise.all(promises).then(() => {
                    return expeditie;
                });
            })
            .then(onChanged);
    }

    export function setFinished(finished: boolean): (expeditie: ExpeditieOrID) => Promise<ExpeditieDocument> {
        return expeditie =>
            getDocument(expeditie).then(expeditie =>
                ExpeditieModel.findByIdAndUpdate(Util.getObjectID(expeditie), { finished: finished }, { new: true }).exec()
            );
    }

    export function checkFinished(actionVerb: string): (expeditie: ExpeditieOrID) => Promise<ExpeditieDocument> {
        return expeditie =>
            new Promise((resolve, reject) => {
                return getDocument(expeditie).then(expeditie => {
                    if (expeditie.finished) {
                        reject(sprintf(i18next.t('expeditie_finished_generic_error'), actionVerb, expeditie.name));
                    }
                    resolve(expeditie);
                });
            });
    }

    export function remove(expeditie: ExpeditieOrID): Promise<void> {
        return getDocument(expeditie)
            .then(expeditie => removeParticipants(expeditie.participants)(expeditie))
            .then(expeditie => expeditie.remove())
            .then(onChanged)
            .then(() => undefined);
    }

    export function addParticipants(participants: PersonOrID[]): (expeditie: ExpeditieOrID) => Promise<ExpeditieDocument> {
        return expeditie =>
            checkFinished('expeditie_action_add_participants')(expeditie)
                .then(expeditie => Promise.all(participants.map(Person.addExpeditie(expeditie))))
                .then(() =>
                    ExpeditieModel.findByIdAndUpdate(
                        Util.getObjectID(expeditie),
                        {
                            $pushAll: {
                                participants: Util.getObjectIDs(participants)
                            }
                        },
                        { new: true }
                    )
                );
    }

    export function removeParticipants(participants: PersonOrID[]): (expeditie: ExpeditieOrID) => Promise<ExpeditieDocument> {
        return expeditie =>
            checkFinished('expeditie_action_remove_participants')(expeditie)
                .then(expeditie => Promise.all(participants.map(Person.removeExpeditie(expeditie))))
                .then(() =>
                    ExpeditieModel.findByIdAndUpdate(
                        Util.getObjectID(expeditie),
                        { $pullAll: { participants: Util.getObjectIDs(participants) } },
                        { new: true }
                    ).exec()
                );
    }

    export function setRoute(route: RouteOrID): (expeditie: ExpeditieOrID) => Promise<ExpeditieDocument> {
        return expeditie =>
            checkFinished('expeditie_action_set_route')(expeditie).then(expeditie =>
                ExpeditieModel.findByIdAndUpdate(Util.getObjectID(expeditie), { route: Util.getObjectID(route) }, { new: true }).exec()
            );
    }

    export function getRoute(expeditie: ExpeditieOrID): Promise<RouteDocument> {
        return Util.getDocument(expeditie, getById).then(expeditie => Util.getDocument(expeditie.route, Route.getById));
    }

    export function setGroups(groups: PersonOrID[][]): (expeditie: ExpeditieOrID) => Promise<ExpeditieDocument> {
        return (expeditie: ExpeditieOrID) =>
            checkFinished('expeditie_action_set_groups')(expeditie).then(expeditie => {
                const pExpeditie = Util.getDocument(expeditie, getById);
                const pRoute = pExpeditie
                    .then(expeditie => {
                        if (expeditie.route === undefined) {
                            return Route.create({}).then(route => {
                                setRoute(route)(expeditie);
                                return route;
                            });
                        }

                        return Route.getDocument(expeditie.route);
                    })
                    .then(route => Route.setGroups(expeditie, groups));

                return Promise.all([pExpeditie, pRoute]).then(([expeditie, route]) => {
                    return expeditie;
                });
            });
    }

    export function addLocation(location: ILocation): (expeditie: ExpeditieOrID) => Promise<ExpeditieDocument> {
        return expeditie =>
            checkFinished('expeditie_action_add_location')(expeditie).then(expeditie => {
                return Location.create(location, expeditie.route).then(location => expeditie);
            });
    }

    export function addLocations(locations: ILocation[]): (expeditie: ExpeditieOrID) => Promise<ExpeditieDocument> {
        return expeditie =>
            checkFinished('expeditie_action_add_locations')(expeditie).then(expeditie => {
                return Location.createMany(locations, expeditie.route).then(() => expeditie);
            });
    }

    export function getLocations(expeditie: ExpeditieOrID): Promise<LocationDocument[]> {
        return getRoute(expeditie).then(Location.getInRoute);
    }

    export function getLocationsSortedByVisualArea(expeditie: ExpeditieOrID, skip, limit): Promise<LocationDocument[]> {
        return getRoute(expeditie).then(Location.getInRouteSortedByArea(skip, limit));
    }
}
