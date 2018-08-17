import * as express from 'express';
import * as socketio from 'socket.io';

import { Expeditie } from '../components/expeditie';
import { Route } from '../components/route';
import { SocketIDs } from './socketHandler';
import { TableData } from '../models/tables';

const sprintf = require('sprintf-js').sprintf;

export namespace Sockets {
    export function getRoute(app: express.Express, io: socketio.Socket): (expeditieName: string) => void {
        return async name => {
            const expeditie = await Expeditie.getExpeditieByNameShort(name);
            const route = await Expeditie.getRoute(expeditie);

            io.emit(SocketIDs.GET_ROUTE, name, route);
        };
    }

    export function getBoundingBox(app: express.Express, io: socketio.Socket): (expeditieName: string) => void {
        return async name => {
            const expeditie = await Expeditie.getExpeditieByNameShort(name);
            const route = await Expeditie.getRoute(expeditie);
            const boundingBox = await Route.getBoundingBox(route);

            io.emit(SocketIDs.GET_BOUNDINGBOX, name, boundingBox);
        };
    }

    export function getNodes(app: express.Express, io: socketio.Socket): (expeditieName: string) => void {
        return async name => {
            const expeditie = await Expeditie.getExpeditieByNameShort(name);
            const route = await Expeditie.getRoute(expeditie);
            const nodes = await Route.getNodes(route);

            io.emit(SocketIDs.GET_NODES, name, nodes);
        };
    }

    export function getLocations(app: express.Express, io: socketio.Socket): (expeditieName: string) => void {
        return async name => {
            const expeditie = await Expeditie.getExpeditieByNameShort(name);
            const initBatch = 100;

            let batch: TableData.Location.LocationDocument[];
            let batchN = 0;

            do {
                if (!io.connected) return;

                let skip = initBatch * (2 ** batchN - 1);
                let count = initBatch * 2 ** batchN;

                batch = await Expeditie.getLocationsSortedByVisualArea(expeditie, skip, count);

                console.log(sprintf('Sending batch %d with %d locations.', batchN + 1, batch.length));
                io.emit(SocketIDs.GET_LOCATIONS, name, batchN + 1, batch);

                batchN++;
            } while (batch.length > 0);

            io.emit(SocketIDs.LOCATIONS_DONE, name);
            console.log('Location sending done.');
        };
    }
}
