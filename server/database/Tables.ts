import {Schema} from 'mongoose'

export namespace Tables {
    export function initTables() {
       
    }
}

export namespace TableData {
    function reference(to: string): {} {
        return { type: String, ref: to }
    }

    /**
     * A RoutePart is a line describing a set of people's locations. A RoutePart is can only describe the route of a
     * single set of people, so as soon as routes merge or people change
     */
    export namespace RoutePart {
        export const ID = "RoutePart"

        export const routePartSchema = new Schema({

        })

        export interface RoutePart {

        }

        export interface RoutePartDocument extends RoutePart, Document {}

        export function routePart(): RoutePart {
            return {

            }
        }
    }

    export namespace Place {
        export const ID = "Place"

        export const placeSchema = new Schema({
            zoomLevel: Number,
            latlon: reference(Location.ID),
            radius: Number
        })

        export interface Place {
            zoomLevel: number,
            latlon: string | Location.Location, //Because location is not allowed for some reason
            radius: number
        }

        export interface PlaceDocument extends Place, Document {}

        export function place(zoomLevel, location, radius): Place {
            return {
                zoomLevel: zoomLevel,
                latlon: location,
                radius: radius
            }
        }
    }

    export namespace Location {
        export const ID = "Location"

        export const locationSchema = new Schema({
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

        export interface LocationDocument extends Location, Document {}

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


    export namespace Person {
        import Expeditie = TableData.Expeditie.Expeditie;
        export const ID = "Person"

        export const personSchema = new Schema({
            email: String,
            name: String,
            expedities: [reference(Expeditie.ID)],
            language: String
        })

        export interface Person {
            email: string
            name: string
            expedities?: string[] | Expeditie[]
            language: string
        }

        export interface PersonDocument extends Person, Document {}

        export function person(email, name, language): Person {
            return {
                email: email,
                name: name,
                language: language
            }
        }
    }

    /**
     * The expeditie is the wrapping object for all data related to one trip. This is represented on the home page by
     * one column.
     */
    export namespace Expeditie {
        import RoutePart = TableData.RoutePart.RoutePart;
        import Person = TableData.Person.Person;
        export const ID = "Expeditie"

        export const expeditieSchema = new Schema({
            name: String,
            year: Number,
            color: String,
            background: {
                image_url: String,
                position: {
                    x: Number,
                    y: Number
                }
            },
            map: {
                url: String,
                thumbnail_url: String
            },
            movie: {
                url: String,
                thumbnail_url: String
            },
            participants: [reference(TableData.Person.ID)],
            routeParts: [reference(TableData.RoutePart.ID)]
        })

        export interface Expeditie {
            name: string,
            year: number,
            color: string,
            background: {
                image_url: string,
                position: {
                    x: number
                    y: number
                }
            },
            map: {
                url: string,
                thumbnail_url: string
            },
            movie?: {
                url: string,
                thumbnail_url: string
            },
            participants: string[] | Person[],
            routeParts: string[] | RoutePart[]
        }

        export interface ExpeditieDocument extends Expeditie, Document {}

        export function expeditie(name, year, color, participants, routeParts):Expeditie {
            return {
                name: name,
                year: year,
                color: color,
                background: {
                    image_url: "",  //TODO default background image
                    position: {
                        x: 50,
                        y: 50
                    }
                },
                map: {
                    url: "",
                    thumbnail_url: ""   //TODO map thumbnail?
                },
                participants: participants,
                routeParts: routeParts
            }
        }
    }
}