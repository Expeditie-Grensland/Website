import {TableData, Tables} from "./Tables"
import {Countries} from "./Countries"
import {Person} from "./Person"
import {Location} from "./Location"
import {Route} from "./Route"
import {Util} from "./Util"
import * as i18next from "i18next"
import {LocationHelper} from "../helper/LocationHelper"
import ExpeditieDocument = TableData.Expeditie.ExpeditieDocument
import PersonDocument = TableData.Person.PersonDocument
import Country = Countries.Country
import Expeditie = TableData.Expeditie.Expeditie
import RouteDocument = TableData.Route.RouteDocument
import ExpeditieOrID = TableData.ExpeditieOrID
import RouteOrID = TableData.RouteOrID
import PersonOrID = TableData.PersonOrID
import {QueryCursor} from "mongoose"

const sprintf = require('sprintf-js').sprintf


export namespace Expeditie {
    import LocationDocument = TableData.Location.LocationDocument

    let expeditiesCached = null

    export function getExpeditiesCached(): Promise<ExpeditieDocument[]> {
        if(expeditiesCached === null) {
            expeditiesCached = getExpedities()
        }

        return expeditiesCached
    }

    export function getExpeditieByName(name: string): Promise<ExpeditieDocument> {
        return Tables.Expeditie.findOne({name: name}).exec()
    }

    export function getExpeditieByNameShort(nameShort: string): Promise<ExpeditieDocument> {
        return Tables.Expeditie.findOne({nameShort: nameShort}).exec()
    }

    function expeditiesChanged<T>(arg: T): Promise<T> {
        expeditiesCached = getExpedities()

        console.log("Invalidating Expeditie cache.")

        return Promise.resolve(arg)
    }

    export function getExpedities(): Promise<ExpeditieDocument[]> {
        return Tables.Expeditie.find({}).sort({sequenceNumber: -1}).exec()
    }

    export function getExpeditieById(_id: string): Promise<ExpeditieDocument> {
        return Tables.Expeditie.findById(_id).exec()
    }

    export function getExpeditie(expeditie: ExpeditieOrID): Promise<ExpeditieDocument> {
        return Util.getDocument(expeditie, getExpeditieById)
    }

    export function createExpeditie(expeditie: Expeditie): Promise<ExpeditieDocument> {
        return Promise.resolve().then(() => {

            if(expeditie.mapUrl == undefined) {
                expeditie.mapUrl = '/' + expeditie.nameShort
            }

            if(expeditie.route == undefined) {
                return Route.createRoute({}).then((route) => {
                    expeditie.route = Util.getObjectID(route)

                    return expeditie
                }).catch((err) => {
                    console.log("Creating route failed! " + err)
                    return expeditie
                })
            }

            if(expeditie.finished === undefined) {
                expeditie.finished = false
            }

            return expeditie
        }).then((expeditie) => {
            return Tables.Expeditie.create(expeditie)
        }).then((expeditie) => {
            let promises: Promise<PersonDocument>[] = []

            for(let person of expeditie.participants) {
                promises.push(Person.addExpeditie(expeditie)(person))
            }

            return Promise.all(promises).then(() => {
                return expeditie
            })
        }).then(expeditiesChanged)
    }

    export function setFinished(finished: boolean): (expeditie: ExpeditieOrID) => Promise<ExpeditieDocument> {
        return expeditie => getExpeditie(expeditie)
            .then(expeditie => Tables.Expeditie.findByIdAndUpdate(Util.getObjectID(expeditie), {finished: finished}, {new: true}).exec())
    }

    export function checkFinished(actionVerb: string): (expeditie: ExpeditieOrID) => Promise<ExpeditieDocument> {
        return expeditie => new Promise((resolve, reject) => {
            return getExpeditie(expeditie).then(expeditie => {
                if(expeditie.finished) {
                    reject(sprintf(i18next.t("expeditie_finished_generic_error"), actionVerb, expeditie.name))
                }
                resolve(expeditie)
            })
        })
    }

    export function removeExpeditie(expeditie: ExpeditieOrID): Promise<void> {
        return getExpeditie(expeditie)
            .then(expeditie => removeParticipants(expeditie.participants)(expeditie))
            .then((expeditie) => expeditie.remove()).then(expeditiesChanged)
            .then(() => undefined)
    }

    export function addParticipants(participants: PersonOrID[]): (expeditie: ExpeditieOrID) => Promise<ExpeditieDocument> {
        return expeditie => checkFinished("expeditie_action_add_participants")(expeditie)
            .then(expeditie => Promise.all(participants.map(Person.addExpeditie(expeditie))))
            .then(() =>
                Tables.Expeditie.findByIdAndUpdate(Util.getObjectID(expeditie), {
                    $pushAll: {
                        participants: Util.getObjectIDs(participants)
                    }
                }, {new: true}))
    }

    export function removeParticipants(participants: PersonOrID[]): (expeditie: ExpeditieOrID) => Promise<ExpeditieDocument> {
        return (expeditie) => checkFinished("expeditie_action_remove_participants")(expeditie)
            .then(expeditie => Promise.all(participants.map(Person.removeExpeditie(expeditie))))
            .then(() => Tables.Expeditie.findByIdAndUpdate(Util.getObjectID(expeditie), {$pullAll: {participants: Util.getObjectIDs(participants)}}, {new: true}).exec())
    }

    export function addCountries(...countries: Country[]): (expeditie: ExpeditieOrID) => Promise<ExpeditieDocument> {
        return expeditie => Tables.Expeditie.findByIdAndUpdate(Util.getObjectID(expeditie), {$pushAll: {countries: countries.map(c => c.id)}}, {new: true}).exec().then(expeditiesChanged)
    }

    export function removeCountries(...countries: Country[]): (expeditie: ExpeditieOrID) => Promise<ExpeditieDocument> {
        return (expeditie) => Tables.Expeditie.findByIdAndUpdate(Util.getObjectID(expeditie), {$pullAll: {countries: countries.map(c => c.id)}}, {new: true}).exec().then(expeditiesChanged)
    }

    export function setRoute(route: RouteOrID): (expeditie: ExpeditieOrID) => Promise<ExpeditieDocument> {
        return expeditie => checkFinished("expeditie_action_set_route")(expeditie)
            .then(expeditie => Tables.Expeditie.findByIdAndUpdate(Util.getObjectID(expeditie), {route: Util.getObjectID(route)}, {new: true}).exec())
    }

    export function getRoute(expeditie: ExpeditieOrID): Promise<RouteDocument> {
        return Util.getDocument(expeditie, getExpeditieById).then(expeditie =>  Util.getDocument(expeditie.route, Route.getRouteById))
    }

    export function setGroups(groups: PersonOrID[][]): (expeditie: ExpeditieOrID) => Promise<ExpeditieDocument> {
        return (expeditie: ExpeditieOrID) => checkFinished("expeditie_action_set_groups")(expeditie).then((expeditie) => {
            const pExpeditie = Util.getDocument(expeditie, getExpeditieById)
            const pRoute = pExpeditie.then((expeditie) => {
                if(expeditie.route === undefined) {
                    return Route.createRoute({}).then(route => {
                        setRoute(route)(expeditie)
                        return route
                    })
                }

                return Route.getRoute(expeditie.route)
            }).then(route => Route.setGroups(expeditie, groups))

            return Promise.all([pExpeditie, pRoute]).then(([expeditie, route]) => {
                return expeditie
            })
        })
    }

    export function addLocation(location: TableData.Location.Location): (expeditie: ExpeditieOrID) => Promise<ExpeditieDocument> {
        return expeditie => checkFinished("expeditie_action_add_location")(expeditie).then(expeditie => {
            return Location.createLocation(location, expeditie.route).then(location => expeditie)
        })
    }

    export function addLocations(locations: TableData.Location.Location[]): (expeditie: ExpeditieOrID) => Promise<ExpeditieDocument> {
        return expeditie => checkFinished("expeditie_action_add_locations")(expeditie).then(expeditie => {
            return Location.createLocations(locations, expeditie.route).then(() => expeditie)
        })
    }

    export function getLocations(expeditie: ExpeditieOrID): Promise<LocationDocument[]> {
        return getRoute(expeditie).then(Location.getLocationsInRoute)
    }

    export function getLocationsSortedByVisualArea(expeditie: ExpeditieOrID, skip, limit): Promise<LocationDocument[]> {
        return getRoute(expeditie).then(Location.getLocationsInRouteSortedByArea(skip, limit))
    }
}
