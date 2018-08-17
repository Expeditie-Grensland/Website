namespace Tables {
    export type DocumentOrID<T> = T | string;
    export type ExpeditieOrID = DocumentOrID<Expeditie>;
    export type LocationOrID = DocumentOrID<Location>;
    export type PersonOrID = DocumentOrID<Person>;
    export type RouteOrID = DocumentOrID<Route>;
    export type RouteNodeOrID = DocumentOrID<RouteNode>;

    export interface Expeditie {
        _id: string;
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
        participants: PersonOrID[];
        route?: RouteOrID;
        countries: string[];
    }

    export interface Location {
        _id: string;
        visualArea: number;
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

    export interface Person {
        _id: string;
        email?: string;
        name: string;
        expedities?: ExpeditieOrID[];
        language?: string;
    }

    export interface Route {
        _id: string;
        startingNodes?: RouteNodeOrID[];
        currentNodes?: RouteNodeOrID[];
        boundingBox: RouteBoundingBox;
    }

    export interface RouteBoundingBox {
        minLat: number;
        maxLat: number;
        minLon: number;
        maxLon: number;
    }

    export interface RouteEdge {
        _id: string;
        to: RouteNodeOrID;
        people: PersonOrID[];
    }

    export interface RouteNode {
        _id: string;
        route: RouteOrID;
        color?: string;
        persons: PersonOrID[];
        edges: RouteEdge[];
    }
}
