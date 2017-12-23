import * as express from "express";
import {SocketIDs} from "./SocketHandler";
import {Expeditie} from "../database/Expeditie";
import {Route} from "../database/Route";
import {LocationHelper} from "../helper/LocationHelper"

export namespace Sockets {

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

            for(let zoomLevel of LocationHelper.ZOOM_LEVEL_RANGE) {
                if(!io.connected)
                    break

                const locationsAtZoom = await Expeditie.getLocationsAtZoomLevel(zoomLevel)(expeditie)

                console.log('sending zoomLevel: ' + zoomLevel + ' with: ' + locationsAtZoom.length + ' locations')
                if(locationsAtZoom.length > 0)
                    io.emit(SocketIDs.GET_LOCATIONS, name, zoomLevel, locationsAtZoom)
            }

            io.emit(SocketIDs.LOADING_DONE)
            console.log('location sending done.')
        }
    }
}