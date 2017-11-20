namespace Tables {
    export interface Expeditie {
        _id: string
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
        participants: (string | Person)[]
        route?: string | Route
        countries: string[]
    }


    export interface Location {
        _id: string
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

    export interface Person {
        _id: string
        email?: string
        name: string
        expedities?: (string | Expeditie)[]
        language?: string
    }

    export interface Route {
        _id: string
        startingNodes?: (RouteNode | string)[]
        currentNodes?: (RouteNode | string)[]
    }


    export interface RouteEdge {
        _id: string
        to: RouteNode | string
        people: (Person | string)[]
    }


    export interface RouteNode {
        _id: string
        color?: string
        persons: (Person | string)[]
        locations: (Location | string)[]
        edges: (RouteEdge | string)[]
    }
}