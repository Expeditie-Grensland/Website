import * as express from "express";
import {SocketIDs} from "./SocketHandler";
import {Expeditie} from "../database/Expeditie";
import {Route} from "../database/Route";
import {TableData} from "../database/Tables";
import * as mongoose from "mongoose";

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

        return (name) =>
            Expeditie.getExpeditieByNameShort(name)
                .then(Expeditie.getLocationCursor(batchSize))
                .then(batchCursor(batchSize))
                .then(nextBatch => {
                    nextBatch((batch: LocationDocument[]) => io.emit(SocketIDs.GET_LOCATIONS, name, batch))
                })
    }

    function batchCursor<T extends mongoose.Document>(batchSize: number): (query: mongoose.QueryCursor<T>) => ((callback: (batch: T[]) => void) => void) {
        return cursor => {
            return (callback) => {
                let aggregate = []

                cursor.eachAsync((document: T) => {
                    aggregate.push(document)

                    if(aggregate.length >= batchSize) {
                        callback(aggregate)
                        aggregate = []
                        console.log('batch')
                    }
                }, {}, () => {
                    callback(aggregate)
                    console.log('done')
                })
            }
        }
    }
}