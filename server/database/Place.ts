import {TableData, Tables} from "./Tables"
import {Util} from "./Util"
import {Route} from "./Route"

export namespace Place {

    import PlaceDocument = TableData.Place.PlaceDocument
    import RouteOrID = TableData.RouteOrID
    import PlaceOrID = TableData.PlaceOrID
    import RouteNodeOrID = TableData.RouteNodeOrID

    export function createPlace(place: TableData.Place.Place): Promise<PlaceDocument> {
        return Tables.Place.create(place)
    }

    export function getPlaceById(_id: string): Promise<PlaceDocument> {
        return Tables.Place.findById(_id).exec()
    }

    export function getPlacesByIds(ids: string[]): Promise<PlaceDocument[]> {
        return Tables.Place.find({_id: {$in: ids}}).exec()
    }

    export function getPlaces(): Promise<PlaceDocument[]> {
        return Tables.Place.find().exec()
    }

    export function getPlaceDocument(place: PlaceOrID): Promise<PlaceDocument> {
        return Util.getDocument(place, getPlaceById)
    }

    export function addRouteNodes(nodes: RouteNodeOrID[]): (place: PlaceOrID) => Promise<PlaceDocument> {
        return place => Tables.Place.findByIdAndUpdate(
            Util.getObjectID(place),
            {
                $pushAll: {
                    nodes: Util.getObjectIDs(nodes)
                }
            }, {new: true}).exec()
    }

    export function removeRoutes(nodes: RouteNodeOrID[]): (place: PlaceOrID) => Promise<PlaceDocument> {
        return place => Tables.Place.findByIdAndUpdate(
            Util.getObjectID(place),
            {
                $pullAll: {
                    nodes: Util.getObjectIDs(nodes)
                }
            }, {new: true}).exec()
    }

    export function expandPlaceTo(lat, lon, radius): (place: PlaceOrID) => Promise<PlaceDocument> {
        return place => Tables.Place.findByIdAndUpdate(
            Util.getObjectID(place),
            {
                lat: lat,
                lon: lon,
                radius: radius
            },
            {new: true}
        ).exec()
    }

    export async function getPlacesInRoute(route: RouteOrID): Promise<PlaceDocument[]> {
        const routeDoc = await Route.getRoute(route)
        const nodes = await Route.getNodes(routeDoc)

        return Tables.Place.find({node: {$in: Util.getObjectIDs(nodes)}}).exec()
    }
}