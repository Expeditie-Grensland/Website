import {TableData, Tables} from "./Tables"
import LocationDocument = TableData.Location.LocationDocument
import {ObjectID} from "bson"
import {Util} from "./Util"

export namespace Location {

    import LocationOrID = TableData.LocationOrID

    export function getLocationById(_id: string): Promise<LocationDocument> {
        return Tables.Location.findById(_id).exec()
    }

    export function getLocationsById(ids: string[]): Promise<LocationDocument[]> {
        return Tables.Location.find({_id: {$in: ids}}).exec()
    }

    export function getLocation(location: LocationOrID): Promise<LocationDocument> {
        return Util.getDocument(location, getLocationById)
    }

    export function getLocations(locations: LocationOrID[]): Promise<LocationDocument[]> {
        return Util.getDocuments(locations, getLocationsById)
    }

    export function createLocation(location: TableData.Location.Location): Promise<LocationDocument> {
        return Tables.Location.create(location)
    }

    export function createLocations(locations: TableData.Location.Location[]): Promise<LocationDocument[]> {
        return Tables.Location.create(locations)
    }

    export function removeLocation(location): Promise<void> {
        return getLocation(location).then(document => {
            document.remove()
        })
    }
}