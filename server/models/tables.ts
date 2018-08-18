import * as mongoose from 'mongoose';

export namespace Tables {
    export const ExpeditieID = 'Expeditie';
    export const LocationID = 'Location';
    export const PersonID = 'Person';
    export const RouteID = 'Route';
    export const RouteNodeID = 'RouteNode';
    export const WordID = 'Word';

    export type DocumentOrID<T extends mongoose.Document> = T | string;
    export type ExpeditieOrID = DocumentOrID<Expeditie.ExpeditieDocument>;
    export type LocationOrID = DocumentOrID<Location.LocationDocument>;
    export type PersonOrID = DocumentOrID<Person.PersonDocument>;
    export type RouteOrID = DocumentOrID<Route.RouteDocument>;
    export type RouteNodeOrID = DocumentOrID<RouteNode.RouteNodeDocument>;
    export type WordOrID = DocumentOrID<Word.WordDocument>;

    function reference(to: string): {} {
        return { type: String, ref: to };
    }

    /**
     * The expeditie is the wrapping object for all data related to one trip. This is represented on the home page by
     * one column.
     */
    export namespace Expeditie {
        const schema = new mongoose.Schema({
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
            participants: [reference(Tables.PersonID)],
            route: reference(Tables.RouteID),
            countries: [String]
        });

        export interface Expeditie {
            sequenceNumber: number;
            name: string;
            nameShort: string;
            subtitle: string;
            color: string;
            background: {
                imageUrl: string;
                position: {
                    x: number;
                    y: number;
                };
            };
            showMap: boolean;
            mapUrl?: string;
            movieUrl: string;
            movieCoverUrl: string;
            finished?: boolean;
            participants: PersonOrID[];
            route?: RouteOrID;
            countries: string[];
        }

        export interface ExpeditieDocument extends Expeditie, mongoose.Document {}

        export const ExpeditieSchema = mongoose.model<ExpeditieDocument>(Tables.ExpeditieID, schema);
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
        const schema = new mongoose.Schema({
            visualArea: Number,
            person: reference(Tables.PersonID),
            node: reference(Tables.RouteNodeID),
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
        });

        // Ensure fast retrieval of find query by visual area. This query is performed every site visit, so it should
        // be performant.
        schema.index({ node: 1, visualArea: -1 });
        schema.index({ node: 1, timestamp: -1 });
        schema.index({ node: 1, lat: 1 });
        schema.index({ node: 1, lon: 1 });

        export interface Location {
            visualArea?: number;
            person: PersonOrID;
            node?: RouteNodeOrID;
            timestamp: number;
            timezone: string;
            lat: number;
            lon: number;
            altitude: number;
            horizontalAccuracy?: number;
            verticalAccuracy?: number;
            bearing?: number;
            bearingAccuracy?: number;
            speed?: number;
            speedAccuracy?: number;
        }

        export interface LocationDocument extends Location, mongoose.Document {}

        export const LocationSchema = mongoose.model<Tables.Location.LocationDocument>(Tables.LocationID, schema);
    }

    /**
     * A Person describes a person who participates in an expeditie. They are guaranteed to have a name
     * and a list of expedities in which they participate (can be empty).
     */
    export namespace Person {
        const schema = new mongoose.Schema({
            email: String,
            name: String,
            expedities: [reference(Tables.ExpeditieID)],
            language: String
        });

        export interface Person {
            email?: string;
            name: string;
            expedities?: ExpeditieOrID[];
            language?: string;
        }

        export interface PersonDocument extends Person, mongoose.Document {}

        export const PersonSchema = mongoose.model<Tables.Person.PersonDocument>(Tables.PersonID, schema);
    }

    /**
     * The bounding 'box' (more like a rectangle on a sphere) for a Route. All points in a Route lie on or within the
     * defining coordinates of this rectangle.
     */
    export namespace RouteBoundingBox {
        export interface RouteBoundingBox {
            minLat: number;
            maxLat: number;
            minLon: number;
            maxLon: number;
        }
    }

    /**
     * A Route is a directed acyclic graph representing the movement of people between different groups.
     * The startingNodes array contains all nodes which do not have any ancestors (there are no edges pointing to them)
     * The currentNodes array contains all nodes that do not have any children.
     */
    export namespace Route {
        const schema = new mongoose.Schema({
            startingNodes: [reference(Tables.RouteNodeID)],
            currentNodes: [reference(Tables.RouteNodeID)]
        });

        export interface Route {
            startingNodes?: RouteNodeOrID[];
            currentNodes?: RouteNodeOrID[];
        }

        export interface RouteDocument extends Route, mongoose.Document {}

        export const RouteSchema = mongoose.model<Tables.Route.RouteDocument>(Tables.RouteID, schema);
    }

    /**
     * A RouteEdge represent a moving of people between different RouteNodes.
     */
    export namespace RouteEdge {
        export const routeEdgeSchema = new mongoose.Schema({
            to: reference(Tables.RouteNodeID),
            people: [reference(Tables.PersonID)]
        });

        export interface RouteEdge {
            to: RouteNodeOrID;
            people: PersonOrID[];
        }
    }

    /**
     * A RouteNode is a representation of the locations of one group of people over a continuous time span. This means that
     * as soon as a Person moves from one node to another, one or more RouteEdge is added to the edges array and
     * this node is deactivated.
     */
    export namespace RouteNode {
        const schema = new mongoose.Schema({
            route: reference(Tables.RouteID),
            color: String,
            persons: [reference(Tables.PersonID)],
            edges: [RouteEdge.routeEdgeSchema]
        });

        export interface RouteNode {
            route: RouteOrID;
            color?: string;
            persons: PersonOrID[];
            edges: RouteEdge.RouteEdge[];
        }

        export interface RouteNodeDocument extends RouteNode, mongoose.Document {}

        export const RouteNodeSchema = mongoose.model<RouteNodeDocument>(Tables.RouteNodeID, schema);
    }

    /**
     * TODO: Add definition
     */
    export namespace Word {
        export const schema = new mongoose.Schema(
            {
                word: String,
                definitions: [String],
                phonetic: String,
                audio: String
            },
            {
                toJSON: {
                    virtuals: true
                },
                toObject: {
                    virtuals: true
                }
            }
        );

        schema.virtual('simple').get(function() {
            return this.word
                .toLowerCase()
                .normalize('NFD')
                .replace(/[\u0300-\u036f]/g, '')
                .replace(/[^0-9a-z]+/gi, '-');
        });

        schema.index({ word: 1 }, { collation: { locale: 'nl', strength: 1 } });

        export interface Word {
            word: string;
            definitions: string[];
            phonetic?: string;
            audio?: string;
            readonly simple: string;
        }

        export interface WordDocument extends Word, mongoose.Document {}

        export const WordSchema = mongoose.model<WordDocument>(Tables.WordID, schema);
    }
}
