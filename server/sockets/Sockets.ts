import * as express from "express";
import {SocketIDs} from "./SocketHandler";
import {Expeditie} from "../database/Expeditie";
import {Location} from "../database/Location";
import {Route} from "../database/Route";
import {LocationHelper} from "../helper/LocationHelper"
import {QueryCursor} from "mongoose"
import {TableData} from "../database/Tables"
import {Place} from "../database/Place"
const sprintf = require('sprintf-js').sprintf


export namespace Sockets {

    import LocationDocument = TableData.Location.LocationDocument

    export function getRoute(app: express.Express, io: SocketIO.Socket): (expeditieName: string) => void {
        return async name => {
            const expeditie = await Expeditie.getExpeditieByNameShort(name)
            const route = await Expeditie.getRoute(expeditie)

            io.emit(SocketIDs.GET_ROUTE, name, route)
        }
    }

    export function getNodes(app: express.Express, io: SocketIO.Socket): (expeditieName: string) => void {
        return async name => {
            const expeditie = await Expeditie.getExpeditieByNameShort(name)
            const route = await Expeditie.getRoute(expeditie)
            const nodes = await Route.getNodes(route)

            io.emit(SocketIDs.GET_NODES, name, nodes)
        }
    }

    export function getLocations(app: express.Express, io: SocketIO.Socket): (expeditieName: string) => void {
        return async name => {
            const expeditie = await Expeditie.getExpeditieByNameShort(name)

            let batchSize = 100
            let batch = await Expeditie.getLocationsSortedByVisualArea(expeditie, 0, batchSize)
            let batchCount = 1

            while(batch.length > 0) {
                if(!io.connected)
                    return

                console.log(sprintf("Sending batch %d with %d locations", batchCount, batch.length))
                io.emit(SocketIDs.GET_LOCATIONS, name, batchCount, batch)

                batchCount++
                batchSize *= 2
                batch = await Expeditie.getLocationsSortedByVisualArea(expeditie, batchCount * batchSize, batchSize)
            }

            io.emit(SocketIDs.LOCATIONS_DONE, name)
            console.log('location sending done.')
        }
    }

    export function getPlaces(app: express.Express, io: SocketIO.Socket): (expeditieName: string) => void {
        return async name => {
            const expeditie = await Expeditie.getExpeditieByNameShort(name)
            const route = await Expeditie.getRoute(expeditie)
            const places = await Place.getPlacesInRoute(route)

            console.log("Sending places..")
            io.emit(SocketIDs.GET_PLACES, name, places)
        }
    }
}