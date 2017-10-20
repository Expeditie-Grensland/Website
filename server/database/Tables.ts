import {Schema} from 'mongoose'
import {None, Option} from "tsoption";

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

        })

        export interface Place {

        }

        export interface PlaceDocument extends Place, Document {}

        export function place(): Place {
            return {

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
        export const ID = "Person"

        export const personSchema = new Schema({

        })

        export interface Person {

        }

        export interface PersonDocument extends Person, Document {}

        export function person(): Person {
            return {

            }
        }
    }

    /**
     * The expeditie is the wrapping object for all data related to one trip. This is represented on the home page by
     * one column.
     */
    export namespace Expeditie {
        import RoutePart = TableData.RoutePart.RoutePart
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
            routeParts: [reference(TableData.RoutePart.ID)]
        })

        export interface Expeditie {
            name: string,
            year: number,
            color: string,
            background?: {
                image_url: Option<string>,
                position: Option<{
                    x: number
                    y: number
                }>
            },
            map: {
                url: Option<string>,
                thumbnail_url: Option<string>
            },
            movie: {
                url: Option<string>,
                thumbnail_url: Option<string>
            },
            routeParts: string[] | RoutePart[]
        }

        export interface ExpeditieDocument extends Expeditie, Document {}

        export function expeditie(name: string, year: number, color: string, routeParts: RoutePart[]):Expeditie {
            return {
                name: name,
                year: year,
                color: color,
                background: {
                    image_url: None(),
                    position: None()
                },
                map: {
                    url: None(),
                    thumbnail_url: None()
                },
                movie: {
                    url: None(),
                    thumbnail_url: None()
                },
                routeParts: routeParts
            }
        }
    }
}