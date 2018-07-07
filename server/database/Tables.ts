import * as mongoose from "mongoose"

export namespace Tables {
    export let Expeditie: mongoose.Model<TableData.Expeditie.ExpeditieDocument>
    export let Location: mongoose.Model<TableData.Location.LocationDocument>
    export let Person: mongoose.Model<TableData.Person.PersonDocument>
    export let Place: mongoose.Model<TableData.Place.PlaceDocument>
    export let Route: mongoose.Model<TableData.Route.RouteDocument>
    export let RouteNode: mongoose.Model<TableData.RouteNode.RouteNodeDocument>

    export function initTables() {
        //Ensure fast retrieval of find query by visual area and place. This query is performed every site visit,
        // so it should be performant
        TableData.Location.locationSchema.index({visualArea: -1, place: 1})
        TableData.Location.locationSchema.index({timestamp: -1})

        Expeditie = mongoose.model(TableIDs.Expeditie, TableData.Expeditie.expeditieSchema)
        Location = mongoose.model(TableIDs.Location, TableData.Location.locationSchema)
        Person = mongoose.model(TableIDs.Person, TableData.Person.personSchema)
        Place = mongoose.model(TableIDs.Place, TableData.Place.placeSchema)
        Route = mongoose.model(TableIDs.Route, TableData.Route.routeSchema)
        RouteNode = mongoose.model(TableIDs.RouteNode, TableData.RouteNode.routeNodeSchema)
    }
}

export namespace TableIDs {
    //TODO Image, LogEntry

    export const Devices = "Devices"
    export const Expeditie = "Expeditie"
    export const Location = "Location"
    export const Person = "Person"
    export const Place = "Place"
    export const Route = "Route"
    export const RouteNode = "RouteNode"
}

export namespace TableData {

    export type DocumentOrID<T extends mongoose.Document> = T | string
    export type ExpeditieOrID = DocumentOrID<Expeditie.ExpeditieDocument>
    export type PlaceOrID = DocumentOrID<Place.PlaceDocument>
    export type LocationOrID = DocumentOrID<Location.LocationDocument>
    export type PersonOrID = DocumentOrID<Person.PersonDocument>
    export type RouteOrID = DocumentOrID<Route.RouteDocument>
    export type RouteNodeOrID = DocumentOrID<RouteNode.RouteNodeDocument>

    function reference(to: string): {} {
        return {type: String, ref: to}
    }

    /**
     * TODO: description
     */
    export namespace Device {
        export const deviceSchema = new mongoose.Schema({
            token: String,
            person: reference(TableIDs.Person),
            timestamp: Number,
            expire: Number,
            agent: String
        })

        export interface Device {
            token: string
            person: PersonOrID
            timestamp: number
            expire: number
            agent: string
        }

        export interface DeviceDocument extends Device, mongoose.Document {}
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
     * The `visualArea` indicates the area of the triangle formed by this location and it's two adjacent points in
     * square meter. A bigger area indicates a bigger contribution to the visual 'shape' of a route line. This value is
     * used to determine the order of points sent to a client. Locations with higher visual areas get sent before those
     * with low visual area.
     * A Location belongs to one, and only one, RouteNode.
     */
    export namespace Location {
        export const locationSchema = new mongoose.Schema({
            visualArea: Number,
            person: reference(TableIDs.Person),
            node: reference(TableIDs.RouteNode),
            place: reference(TableIDs.Place),
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
            visualArea?: number
            person: PersonOrID
            node?: RouteNodeOrID
            place?: PlaceOrID
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
     * A Place is a spot where a group of people stayed in one place for too long, creating a jumble of GPS points
     * very close to each other which creates a mess on the map. It has a radius, latitude, longitude
     * and is displayed on the map as a circle.
     * Radius is in meters.
     *
     * Each Place can be part of multiple routes, if multiple groups stay at the same place for example.
     */
    export namespace Place {
        export const placeSchema = new mongoose.Schema({
            lat: Number,
            lon: Number,
            radius: Number,
            nodes: [reference(TableIDs.RouteNode)]
        })

        export interface Place {
            lat: number
            lon: number
            radius: number
            nodes: RouteNodeOrID[]
        }

        export interface PlaceDocument extends Place, mongoose.Document {}
    }

    /**
     * The bounding 'box' (more like a rectangle on a sphere) for a Route. All points in a Route lie on or within the
     * defining coordinates of this rectangle.
     */
    export namespace RouteBoundingBox {
        export const routeBoundingBoxSchema = new mongoose.Schema({
            minLat: Number,
            maxLat: Number,
            minLon: Number,
            maxLon: Number
        })

        export interface RouteBoundingBox {
            minLat: number
            maxLat: number
            minLon: number
            maxLon: number
        }
    }

    /**
     * A Route is a directed acyclic graph representing the movement of people between different groups.
     * The startingNodes array contains all nodes which do not have any ancestors (there are no edges pointing to them)
     * The currentNodes array contains all nodes that do not have any children.
     * The boundingBox tuple contains the outer two locations of
     */
    export namespace Route {
        export const routeSchema = new mongoose.Schema({
            startingNodes: [reference(TableIDs.RouteNode)],
            currentNodes: [reference(TableIDs.RouteNode)],
            boundingBox: RouteBoundingBox.routeBoundingBoxSchema
        })

        export interface Route {
            startingNodes?: RouteNodeOrID[]
            currentNodes?: RouteNodeOrID[]
            boundingBox?: RouteBoundingBox.RouteBoundingBox
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

    export namespace Balkan {
        //Google Maps timeline export format.
        export interface ExportJSON {
            locations: LocationJSON[] //Locations are sorted backwards in time.
        }

        export interface LocationJSON {
            timestampMs: string
            latitudeE7: number
            longitudeE7: number
            accuracy: number
            altitude: number
            velocity?: number
            verticalAccuracy?: number
            activity?: ActivityJSON[]
            timezone: string
        }

        export interface ActivityJSON {
            timestampMs?: string
            activity: Activity2JSON[]
        }

        export interface Activity2JSON {
            type: string
            confidence: number
        }
    }
}
