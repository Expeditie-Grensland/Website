namespace Tables {
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
        participants: (string | Person)[]
        route?: string | Route
        countries: string[]
    }


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

    export interface Person {
        email?: string
        name: string
        expedities?: (string | Expeditie)[]
        language?: string
    }

    export interface Route {
        startingNodes?: (RouteNode | string)[]
        currentNodes?: (RouteNode | string)[]
    }


    export interface RouteEdge {
        to: RouteNode | string
        people: (Person | string)[]
    }


    export interface RouteNode {
        color?: string
        persons: (Person | string)[]
        locations: (Location | string)[]
        edges: (RouteEdge | string)[]
    }
}