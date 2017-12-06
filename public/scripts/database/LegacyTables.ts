namespace LegacyTables {
    export namespace Kaukasus {
        export interface ExportJSON {
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
}