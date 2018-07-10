import * as express from 'express'

import {Expeditie} from '../database/expeditie'
import {Route} from '../database/route'
import {SocketIDs} from './socketHandler'

const sprintf = require('sprintf-js').sprintf


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

            let batchSize = 100
            let batch = await Expeditie.getLocationsSortedByVisualArea(expeditie, 0, batchSize)
            let batchCount = 1

            while (batch.length > 0) {
                if (!io.connected)
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
}
