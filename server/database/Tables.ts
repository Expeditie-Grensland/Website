import * as mongoose from "mongoose"

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
            sequence_number: Number,
            name: String,
            name_short: String,
            subtitle: String,
            color: String,
            background: {
                image_url: String,
                position: {
                    x: Number,
                    y: Number
                }
            },
            show_map: Boolean,
            map_url: String,
            movie_url: String,
            movie_cover_url: String,
            participants: [reference(TableIDs.Person)],
            route: reference(TableIDs.Route)
        })

        export interface Expeditie {
            sequence_number: number,
            name: string,
            name_short: string,
            subtitle: number,
            color: string,
            background: {
                image_url: string,
                position: {
                    x: number,
                    y: number
                }
            },
            show_map: boolean,
            map_url: string,
            movie_url?: string,
            movie_cover_url?: string,
            participants: string[] | Person.Person[],
            route: string | Route.Route
        }

        export interface ExpeditieDocument extends Expeditie, mongoose.Document {}

        export function expeditie(sequence_number, name, name_short, subtitle, color, participants, route): Expeditie {
            return {
                sequence_number: sequence_number,
                name: name,
                name_short: name_short,
                subtitle: subtitle,
                color: color,
                background: {
                    image_url: "",  //TODO default background image
                    position: {
                        x: 50,
                        y: 50
                    }
                },
                show_map: false,
                map_url: name_short,
                participants: participants,
                route: route
            }
        }
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
            horizontalAccuracy: number,
            verticalAccuracy: number,
            bearing?: number,
            bearingAccuracy?: number,
            speed?: number,
            speedAccuracy?: number
        }

        export interface LocationDocument extends Location, mongoose.Document {
        }

        export function location(time,
                                 timezone,
                                 lat,
                                 lon,
                                 altitude,
                                 horizontalAccuracy,
                                 verticalAccuracy): Location {
            return {
                time: time,
                timezone: timezone,
                lat: lat,
                lon: lon,
                altitude: altitude,
                horizontalAccuracy: horizontalAccuracy,
                verticalAccuracy: verticalAccuracy,
            }
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
            expedities?: string[] | Expeditie.Expeditie[]
            language: string
        }

        export interface PersonDocument extends Person, mongoose.Document {
        }

        export function person(name, language): Person {
            return {
                name: name,
                language: language
            }
        }
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

        export function place(zoomLevel, location, radius): Place {
            return {
                zoomLevel: zoomLevel,
                latlon: location,
                radius: radius
            }
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
            startingNodes: RouteNode.RouteNode[] | string[],
            currentNodes: RouteNode.RouteNode[] | string[],
        }

        export interface RouteDocument extends Route, mongoose.Document {}

        export function route(startingNodes, currentNodes): Route {
            return {
                startingNodes: startingNodes,
                currentNodes: currentNodes
            }
        }
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
            to: RouteNode.RouteNode | string,
            people: Person.Person[] | string[]
        }

        export interface RouteEdgeDocument extends RouteEdge, mongoose.Document {}

        export function routeEdge(from, to, people): RouteEdge {
            return {
                to: to,
                people: people
            }
        }
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
            color: string,
            persons: Person.Person[] | string[],
            locations: Location.Location[] | string[],
            edges: RouteEdge.RouteEdge[] | string[],
        }

        export interface RouteNodeDocument extends RouteNode, mongoose.Document {}

        export function routeNode(color, persons, locations, edges): RouteNode {
            return {
                color: color,
                persons: persons,
                locations: locations,
                edges: edges
            }
        }
    }
}