import * as mongoose from 'mongoose'

export namespace Tables {
    export let Expeditie: mongoose.Model<TableData.Expeditie.ExpeditieDocument>
    export let Place: mongoose.Model<TableData.Place.PlaceDocument>
    export let Location: mongoose.Model<TableData.Location.LocationDocument>
    export let RoutePart: mongoose.Model<TableData.RoutePart.RoutePartDocument>
    export let Person: mongoose.Model<TableData.Person.PersonDocument>

    export function initTables() {
        Expeditie = mongoose.model(TableIDs.Expeditie, TableData.Expeditie.expeditieSchema)
        Place = mongoose.model(TableIDs.Place, TableData.Place.placeSchema)
        Location = mongoose.model(TableIDs.Location, TableData.Location.locationSchema)
        RoutePart = mongoose.model(TableIDs.RoutePart, TableData.RoutePart.routePartSchema)
        Person = mongoose.model(TableIDs.Person, TableData.Person.personSchema)
    }
}

export namespace TableIDs {
    export const Expeditie = "Expeditie"
    export const Place = "Place"
    export const Location = "Location"
    export const RoutePart = "RoutePart"
    export const Person = "Person"
}

export namespace TableData {
    function reference(to: string): {} {
        return { type: String, ref: to }
    }

    /**
     * The expeditie is the wrapping object for all data related to one trip. This is represented on the home page by
     * one column.
     */
    export namespace Expeditie {
        export const expeditieSchema = new mongoose.Schema({
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
            participants: [reference(TableIDs.Person)],
            routeParts: [reference(TableIDs.RoutePart)]
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
            participants: string[] | Person.Person[],
            routeParts: string[] | RoutePart.RoutePart[]
        }

        export interface ExpeditieDocument extends Expeditie, mongoose.Document {}

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

    /**
     * A Place is a spot where there are too many points to clearly display on the map, depending on zoomlevel. It
     * has a radius and a location and is displayed on the map as a circle.
     */
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

        export interface PlaceDocument extends Place, mongoose.Document {}

        export function place(zoomLevel, location, radius): Place {
            return {
                zoomLevel: zoomLevel,
                latlon: location,
                radius: radius
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

        export interface LocationDocument extends Location, mongoose.Document {}

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
     * A RoutePart is a line describing a set of people's locations. A RoutePart is can only describe the route of a
     * single set of people, so as soon as routes merge or people change
     */
    export namespace RoutePart {
        export const routePartSchema = new mongoose.Schema({

        })

        export interface RoutePart {

        }

        export interface RoutePartDocument extends RoutePart, mongoose.Document {}

        export function routePart(): RoutePart {
            return {

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
            email:      String,
            name:       String,
            expedities: [reference(TableIDs.Expeditie)],
            language:   String
        })

        export interface Person {
            email?: string
            name: string
            expedities?: string[] | Expeditie.Expeditie[]
            language: string
        }

        export interface PersonDocument extends Person, mongoose.Document {}

        export function person(name, language): Person {
            return {
                name: name,
                language: language
            }
        }
    }


}