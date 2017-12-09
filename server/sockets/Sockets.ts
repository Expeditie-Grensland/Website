import * as express from "express";
import {SocketIDs} from "./SocketHandler";
import {Expeditie} from "../database/Expeditie";
import {Route} from "../database/Route";
import {TableData} from "../database/Tables";
import * as mongoose from "mongoose";
import {LocationHelper} from "../helper/LocationHelper"

export namespace Sockets {

    import LocationDocument = TableData.Location.LocationDocument;

    export function getRoute(app: express.Express, io: SocketIO.Socket): (expeditieName: string) => void {
        return (name) =>
            Expeditie.getExpeditieByNameShort(name)
                .then(Expeditie.getRoute)
                .then(route => io.emit(SocketIDs.GET_ROUTE, name, route))
    }

    export function getNodes(app: express.Express, io: SocketIO.Socket): (expeditieName: string) => void {
        return (name) =>
            Expeditie.getExpeditieByNameShort(name)
                .then(Expeditie.getRoute)
                .then(Route.getNodes)
                .then(nodes => io.emit(SocketIDs.GET_NODES, name, nodes))
    }

    export function getLocations(app: express.Express, io: SocketIO.Socket): (expeditieName: string) => void {
        const batchSize = 2000

        return async (name) => {
            const expeditie = await Expeditie.getExpeditieByNameShort(name)

            for(let zoomLevel of LocationHelper.ZOOM_LEVEL_RANGE) {
                if(!io.connected)
                    break

                const locationsAtZoom = await Expeditie.getLocationsAtZoomLevel(zoomLevel)(expeditie)

                console.log('sending zoomLevel: ' + zoomLevel + ' with: ' + locationsAtZoom.length + ' locations')
                if(locationsAtZoom.length > 0)
                    io.emit(SocketIDs.GET_LOCATIONS, name, locationsAtZoom)
            }
            console.log('location sending done.')
        }
    }

    function batchCursor<T extends mongoose.Document>(io: SocketIO.Socket, batchSize: number): (query: mongoose.QueryCursor<T>) => ((callback: (batch: T[]) => void) => void) {
        return cursor => {
            return (callback) => {
                let aggregate = []

                cursor.eachAsync((document: T) => {
                    if(!io.connected) {
                        console.log("Stopping to send locations via socket because connection was closed.")
                        cursor.close()
                        return
                    }

                    aggregate.push(document)

                    if(aggregate.length >= batchSize) {
                        callback(aggregate)
                        aggregate = []
                        console.log('batch')
                    }
                }, {}, () => {
                    if(io.connected) {
                        callback(aggregate)
                        console.log('done')
                    }
                }).catch(err => {
                    if(io.connected) {
                        console.error("Error occurred while retrieving locations from database: " + err)
                    }
                })
            }
        }
    }
}