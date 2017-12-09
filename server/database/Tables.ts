import * as mongoose from "mongoose"

export namespace Tables {
    export let Expeditie: mongoose.Model<TableData.Expeditie.ExpeditieDocument>
    export let Location: mongoose.Model<TableData.Location.LocationDocument>
    export let Person: mongoose.Model<TableData.Person.PersonDocument>
//    export let Place: mongoose.Model<TableData.Place.PlaceDocument>
    export let Route: mongoose.Model<TableData.Route.RouteDocument>
    export let RouteNode: mongoose.Model<TableData.RouteNode.RouteNodeDocument>

    export function initTables() {
        Expeditie = mongoose.model(TableIDs.Expeditie, TableData.Expeditie.expeditieSchema)
        Location = mongoose.model(TableIDs.Location, TableData.Location.locationSchema)
        Person = mongoose.model(TableIDs.Person, TableData.Person.personSchema)
//        Place = mongoose.model(TableIDs.Place, TableData.Place.placeSchema)
        Route = mongoose.model(TableIDs.Route, TableData.Route.routeSchema)
        RouteNode = mongoose.model(TableIDs.RouteNode, TableData.RouteNode.routeNodeSchema)
    }
}

export namespace TableIDs {
    //TODO Image, LogEntry, Place

    export const Expeditie = "Expeditie"
    export const Location = "Location"
    export const Person = "Person"
//    export const Place = "Place"
    export const Route = "Route"
    export const RouteNode = "RouteNode"
}

export namespace TableData {

    export type DocumentOrID<T extends mongoose.Document> = T | string
    export type ExpeditieOrID = DocumentOrID<Expeditie.ExpeditieDocument>
    export type LocationOrID = DocumentOrID<Location.LocationDocument>
    export type PersonOrID = DocumentOrID<Person.PersonDocument>
    export type RouteOrID = DocumentOrID<Route.RouteDocument>
    export type RouteNodeOrID = DocumentOrID<RouteNode.RouteNodeDocument>

    function reference(to: string): {} {
        return {type: String, ref: to}
    }

    /**
     * The expeditie is the wrapping object for all data related to one trip. This is represented on the home page by
     * one column.
     */
    export namespace Expeditie {
        export const expeditieSchema = new mongoose.Schema({
            sequenceNumber: Number,
            name: String,
            nameShort: String,
            subtitle: String,
            color: String,
            background: {
                imageUrl: String,
                position: {
                    x: Number,
                    y: Number
                }
            },
            showMap: Boolean,
            mapUrl: String,
            movieUrl: String,
            movieCoverUrl: String,
            finished: Boolean,
            participants: [reference(TableIDs.Person)],
            route: reference(TableIDs.Route),
            countries: [String],
        })

        export interface Expeditie {
            sequenceNumber: number
            name: string
            nameShort: string
            subtitle: string
            color: string
            background: {
                imageUrl: string
                position: {
                    x: number
                    y: number
                }
            },
            showMap: boolean
            mapUrl?: string
            movieUrl: string
            movieCoverUrl: string
            finished?: boolean
            participants: PersonOrID[]
            route?: RouteOrID
            countries: string[]
        }

        export interface ExpeditieDocument extends Expeditie, mongoose.Document {}
    }

    /**
     * A Location describes the output of a GPS receiver, using latitude, longitude
     * altitude, and speed and bearing of travel. For each variable, an accuracy is provided.
     * A lower `zoomLevel` indicates a higher importance of this particular location to the shape
     * of the route it is part of. Valid values [0, 19].
     * A Location belongs to one, and only one, RouteNode.
     */
    export namespace Location {
        export const locationSchema = new mongoose.Schema({
            zoomLevel: Number,
            person: reference(TableIDs.Person),
            node: reference(TableIDs.RouteNode),
            timestamp: Number,
            timezone: String,
            lat: Number,
            lon: Number,
            altitude: Number,
            horizontalAccuracy: Number,
            verticalAccuracy: Number,
            bearing: Number,
            bearingAccuracy: Number,
            speed: Number,
            speedAccuracy: Number
        })

        export interface Location {
            zoomLevel?: number
            person: PersonOrID
            node?: RouteNodeOrID
            timestamp: number
            timezone: string
            lat: number
            lon: number
            altitude: number
            horizontalAccuracy?: number
            verticalAccuracy?: number
            bearing?: number
            bearingAccuracy?: number
            speed?: number
            speedAccuracy?: number
        }

        export interface LocationDocument extends Location, mongoose.Document {}
    }

    /**
     * A Person describes a person who participates in an expeditie. They are guaranteed to have a name
     * and a list of expedities in which they participate (can be empty). Users can be invited by entering an email
     * address. This will send them an email with login instructions and a link to the app.
     * Users can log in using Google's OAuth v2 on the website and the app.
     * Users can also specify their preferred language.
     */
    export namespace Person {
        export const personSchema = new mongoose.Schema({
            email: String,
            name: String,
            expedities: [reference(TableIDs.Expeditie)],
            language: String
        })

        export interface Person {
            email?: string
            name: string
            expedities?: ExpeditieOrID[]
            language?: string
        }

        export interface PersonDocument extends Person, mongoose.Document {}
    }

    /**
     * A Place is a spot where there are too many points to clearly display on the map, depending on zoomlevel. It
     * has a radius and a location and is displayed on the map as a circle.
     *//*
    export namespace Place {
        export const placeSchema = new mongoose.Schema({
            zoomLevel: Number,
            latlon: reference(TableIDs.Location),
            radius: Number
        })

        export interface Place {
            zoomLevel: number,
            latlon: string | Location.Location, //Because location is not allowed for some reason
            radius: number
        }

        export interface PlaceDocument extends Place, mongoose.Document {
        }
    }*/

    /**
     * A Route is a directed acyclic graph representing the movement of people between different groups.
     * The startingNodes array contains all nodes which do not have any ancestors (there are no edges pointing to them)
     * The currentNodes array contains all nodes that do not have any children.
     */
    export namespace Route {
        export const routeSchema = new mongoose.Schema({
            startingNodes: [reference(TableIDs.RouteNode)],
            currentNodes: [reference(TableIDs.RouteNode)]
        })

        export interface Route {
            startingNodes?: RouteNodeOrID[]
            currentNodes?: RouteNodeOrID[]
        }

        export interface RouteDocument extends Route, mongoose.Document {}
    }

    /**
     * A RouteEdge represent a moving of people between different RouteNodes.
     */
    export namespace RouteEdge {
        export const routeEdgeSchema = new mongoose.Schema({
            to: reference(TableIDs.RouteNode),
            people: [reference(TableIDs.Person)]
        })

        export interface RouteEdge {
            to: RouteNodeOrID
            people: PersonOrID[]
        }
    }

    /**
     * A RouteNode is a representation of the locations of one group of people over a continuous time span. This means that
     * as soon as a Person moves from one node to another, one or more RouteEdge is added to the edges array and
     * this node is deactivated.
     */
    export namespace RouteNode {
        export const routeNodeSchema = new mongoose.Schema({
            route: reference(TableIDs.Route),
            color: String,
            persons: [reference(TableIDs.Person)],
            edges: [RouteEdge.routeEdgeSchema]
        })

        export interface RouteNode {
            route: RouteOrID
            color?: string
            persons: PersonOrID[]
            edges: RouteEdge.RouteEdge[]
        }

        export interface RouteNodeDocument extends RouteNode, mongoose.Document {}
    }
}

export namespace LegacyTableData {

    export namespace Kaukasus {
        export interface ExportJSON {
            diederik: PersonJSON,
            maurice: PersonJSON,
            ronald: PersonJSON
        }

        export interface PersonJSON {
            personName: string
            lastUpdateTime: number
            lastUpdateTimezoneOffset: number
            lastUpdateTimezoneName: string
            route: LocationJSON[]
        }

        export interface LocationJSON {
            lat: number
            lon: number
            alt: number
            acc: number
            person: string
            stamp: number
            timezone: string
        }
    }
}