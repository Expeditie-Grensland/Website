import {TableData, Tables} from "./Tables"
import LocationDocument = TableData.Location.LocationDocument

export namespace Location {

    export function createLocation(location: TableData.Location.Location): Promise<LocationDocument> {
        return Tables.Location.create(location)
    }

    export function createLocations(locations: TableData.Location.Location[]): Promise<LocationDocument[]> {
        return Tables.Location.create(locations)
    }
}