import * as mongoose from "mongoose"
import {ObjectID} from "bson"

export namespace Tables {
    export let Expeditie: mongoose.Model<TableData.Expeditie.ExpeditieDocument>
    export let Location: mongoose.Model<TableData.Location.LocationDocument>
    export let Person: mongoose.Model<TableData.Person.PersonDocument>
//    export let Place: mongoose.Model<TableData.Place.PlaceDocument>
    export let Route: mongoose.Model<TableData.Route.RouteDocument>
    export let RouteEdge: mongoose.Model<TableData.RouteEdge.RouteEdgeDocument>
    export let RouteNode: mongoose.Model<TableData.RouteNode.RouteNodeDocument>

    export function initTables() {
        Expeditie = mongoose.model(TableIDs.Expeditie, TableData.Expeditie.expeditieSchema)
        Location = mongoose.model(TableIDs.Location, TableData.Location.locationSchema)
        Person = mongoose.model(TableIDs.Person, TableData.Person.personSchema)
//        Place = mongoose.model(TableIDs.Place, TableData.Place.placeSchema)
        Route = mongoose.model(TableIDs.Route, TableData.Route.routeSchema)
        RouteEdge = mongoose.model(TableIDs.RouteEdge, TableData.RouteEdge.routeEdgeSchema)
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
    export const RouteEdge = "RouteEdge"
    export const RouteNode = "RouteNode"
}

export namespace TableData {
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
            participants: (string | Person.PersonDocument | ObjectID)[]
            route?: string | Route.RouteDocument | ObjectID
            countries: string[]
        }

        export interface ExpeditieDocument extends Expeditie, mongoose.Document {}
    }

    /**
     * A Location describes the output of a GPS receiver, using latitude, longitude
     * altitude, and speed and bearing of travel. For each variable, an accuracy is provided.
     */
    export namespace Location {
        export const locationSchema = new mongoose.Schema({
            time: Date,
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
            time: Date,
            timezone: string,
            lat: number,
            lon: number,
            altitude: number,
            horizontalAccuracy?: number,
            verticalAccuracy?: number,
            bearing?: number,
            bearingAccuracy?: number,
            speed?: number,
            speedAccuracy?: number
        }

        export interface LocationDocument extends Location, mongoose.Document {
        }
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
            expedities?: (string | Expeditie.ExpeditieDocument | ObjectID)[]
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
            startingNodes?: (RouteNode.RouteNodeDocument | string | ObjectID)[]
            currentNodes?: (RouteNode.RouteNodeDocument | string | ObjectID)[]
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
            to: RouteNode.RouteNodeDocument | string | ObjectID
            people: (Person.PersonDocument | string | ObjectID)[]
        }

        export interface RouteEdgeDocument extends RouteEdge, mongoose.Document {}
    }

    /**
     * A RouteNode is a representation of the locations of one set of people over a continuous timespan. This means that
     * as soon as a Person moves from one node to another, one or more RouteEdge is added to the edges array and
     * this node is deactivated.
     */
    export namespace RouteNode {
        export const routeNodeSchema = new mongoose.Schema({
            color: String,
            persons: [reference(TableIDs.Person)],
            locations: [reference(TableIDs.Location)],
            edges: [reference(TableIDs.RouteEdge)]
        })

        export interface RouteNode {
            color?: string
            persons: (Person.PersonDocument | string | ObjectID)[]
            locations: (Location.LocationDocument | string | ObjectID)[]
            edges: (RouteEdge.RouteEdgeDocument | string | ObjectID)[]
        }

        export interface RouteNodeDocument extends RouteNode, mongoose.Document {}
    }
}