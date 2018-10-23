import * as socketio from 'socket.io';
import * as R from 'ramda';
import * as mongoose from 'mongoose';

import { Expedities } from '../components/expedities';
import { SocketIds } from './ids';
import { Util } from '../components/documents/util';
import { SocketTypes } from './types';
import { ExpeditieOrID } from '../components/expedities/model';
import { People } from '../components/people';
import { GeoLocationDocument, geoLocationModel } from '../components/geoLocations/model';
import { GeoNodeDocument } from '../components/geoNodes/model';
import Pbf = require('pbf');

export namespace Sockets {
    export const getExpeditie = (socket: socketio.Socket) => async (expeditieName: string, minLocationId?: string): Promise<void> => {
        const expeditie = (await Expedities.getByNameShort(expeditieName))!;

        const personMap = await _getPersonMap();
        const [nodes, count, box, maxLocationId] = await Promise.all([
            _getNodes(expeditie),
            _getLocationCount(expeditie, minLocationId),
            _getBoundingBox(expeditie),
            _getMaxLocationId(expeditie)
        ]);

        const sInfo = <SocketTypes.Expeditie>{
            id: Util.getObjectID(expeditie),
            nodes,
            box,
            personMap: [...personMap].reduce((obj, [s, n]) => Object.assign(obj, { [n]: s }), {}),
            count,
            maxLocationId
        };

        socket.emit(SocketIds.INFO, sInfo);

        await _sendLocations(socket, expeditie, personMap, minLocationId);

        socket.emit(SocketIds.DONE);

        socket.disconnect();
    };

    const _getPersonMap = async (): Promise<Map<string, number>> => {
        const personMap = new Map<string, number>();
        const people = await People.getAll();

        for (let i = 0; i < people.length; i++)
            personMap.set(people[i]._id.toHexString(), i);

        return personMap;
    };

    const _getNodes = async (expeditie: ExpeditieOrID): Promise<SocketTypes.Node[]> => {
        const geoNodes = await Expedities.getNodes(expeditie); // TODO: reverse lookup by implementing nodes in ExpeditieDocument
        const colorsIds = _getNodeColors(geoNodes);

        let n = 0;
        return geoNodes.map(node => {
            return <SocketTypes.Node>{
                personIds: node.personIds.map(x => x.toHexString()),
                timeFrom: node.timeFrom,
                timeTill: node.timeTill != Number.POSITIVE_INFINITY ? node.timeTill : 1e10,
                color: COLORS[colorsIds[n++]]
            };
        });
    };


    export const _getLocationCount = (expeditie: ExpeditieOrID, minLocationId?: string): Promise<number> =>
        geoLocationModel.count(Object.assign(
            { expeditieId: Util.getObjectID(expeditie) },
            !minLocationId ? {} : { _id: { $gt: mongoose.Types.ObjectId(minLocationId) } }
        )).exec();

    const COLORS = [
        '#2962FF',
        '#D50000',
        '#00C853',
        '#FF6D00',
        '#C51162',
        '#AA00FF',
        '#AEEA00',
        '#00BFA5',
        '#00B8D4'
    ];

    const _getNodeColors = (nodes: GeoNodeDocument[]): number[] => {
        const colors: number[] = [];

        for (let nodeId = 0; nodeId < nodes.length; nodeId++) {
            let color = 0;

            for (let prevId = 0; prevId < colors.length; prevId++) {
                if (R.equals(nodes[nodeId].personIds.sort(), nodes[prevId].personIds.sort())) {
                    color = colors[prevId];
                    break;
                }
                color = Math.max(color, colors[prevId] + 1);
            }

            colors.push(color);
        }

        return colors;
    };

    const _getBoundingBox = async (expeditie: ExpeditieOrID): Promise<SocketTypes.BoundingBox> => {
        const [minLat, maxLat, minLon, maxLon] = await Promise.all((<['latitude' | 'longitude', 1 | -1][]>[
            ['latitude', 1], ['latitude', -1], ['longitude', 1], ['longitude', -1]
        ]).map(([latLon, minMax]) =>
            geoLocationModel.find({ expeditieId: Util.getObjectID(expeditie) })
                .select({ [latLon]: 1 })
                .sort({ [latLon]: minMax })
                .limit(1)
                .exec()
                .then(locations => locations[0][latLon])
                .catch(() => 0)));

        return <SocketTypes.BoundingBox>{ minLat, maxLat, minLon, maxLon };
    };

    const _getMaxLocationId = async (expeditie: ExpeditieOrID): Promise<string | null> =>
        geoLocationModel.find({ expeditieId: Util.getObjectID(expeditie) })
            .select({ _id: 1 })
            .sort({ _id: -1 })
            .limit(1)
            .exec()
            .then(locations => locations[0]._id.toHexString())
            .catch(() => null);

    const _sendLocations = (socket: socketio.Socket, expeditie: ExpeditieOrID, personMap: Map<string, number>, minLocationId?: string) =>
        function sendBatchAndRecurse(skip = 0, count = 500): Promise<any> {
            if (!socket.connected) return Promise.resolve();

            return _getLocations(expeditie, personMap, skip, count, minLocationId)
                .then(batch =>
                    new Promise(resolve => {
                        if (batch.length != 0)
                            socket.emit(SocketIds.LOCATIONS, batch, () => {
                                if (batch.length == count)
                                    resolve(sendBatchAndRecurse(skip + count, Math.min(count * 2, 7500)));
                                else resolve();
                            });
                        else resolve();
                    })
                )
                .catch(console.error);
        }();

    const writeLocation = (loc: GeoLocationDocument, personMap: Map<string, number>): Buffer => {
        const x = new Pbf();
        // @ts-ignore
        x.writeString(loc._id.toString('ascii'));
        x.writeVarint(personMap.get(loc.personId.toHexString()) || 0);
        x.writeDouble(loc.time);
        x.writeDouble(loc.longitude);
        x.writeDouble(loc.latitude);
        return Buffer.from(x.finish());
    };
    const writeLocationR = R.curry(writeLocation);

    const _getLocations = (expeditie: ExpeditieOrID, personMap: Map<string, number>, skip: number, limit: number, minLocationId?: string): Promise<Buffer[]> => {
        return geoLocationModel.find(Object.assign(
            { expeditieId: Util.getObjectID(expeditie) },
            !minLocationId ? {} : { _id: { $gt: mongoose.Types.ObjectId(minLocationId) } }
        )).select({
            _id: 1,
            time: 1,
            latitude: 1,
            longitude: 1,
            personId: 1
        })
            .sort({ visualArea: -1 }).skip(skip).limit(limit).exec()
            .then(locs => locs.map(writeLocationR(R.__, personMap)));
    };
}
