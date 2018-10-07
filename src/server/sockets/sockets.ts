import * as socketio from 'socket.io';

import { Expedities } from '../components/expedities';
import { SocketIds } from './ids';
import { Util } from '../components/documents/util';
import { SocketTypes } from './types';
import { ExpeditieOrID } from '../components/expedities/model';
import { GeoNodes } from '../components/geoNodes';
import { People } from '../components/people';
import { GeoLocationDocument, geoLocationModel } from '../components/geoLocations/model';

export namespace Sockets {
    export const getExpeditie = (socket: socketio.Socket) => async (expeditieName: string): Promise<void> => {
        const expeditie = (await Expedities.getByNameShort(expeditieName))!;

        const personMap = await _getPersonMap();
        const [nodes, count, box] = await Promise.all([
            _getNodes(expeditie, personMap),
            Expedities.getLocationCount(expeditie),
            Expedities.getBoundingBox(expeditie)
        ]);

        const sInfo = <SocketTypes.Info>{
            nodes,
            box,
            personMap: [...personMap],
            count
        };

        socket.emit(SocketIds.INFO, sInfo);

        await _sendLocations(socket, expeditie, personMap);

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

    const _getNodes = async (expeditie: ExpeditieOrID, personMap: Map<string, number>): Promise<SocketTypes.Node[]> => {
        const geoNodes = await GeoNodes.getByExpeditie(expeditie); // TODO: reverse lookup by implementing nodes in ExpeditieDocument

        return geoNodes.map(node => {
            return <SocketTypes.Node>{
                personIds: node.personIds.map(p => personMap.get(p.toHexString())),
                timeFrom: node.timeFrom,
                timeTill: node.timeTill,
                color: '#000'
            };
        });
    };

    const _sendLocations = (socket: socketio.Socket, expeditie: ExpeditieOrID, personMap: Map<string, number>) => {
        const _sendBatchAndRecurse = (batchN = 0): Promise<any> => {
            if (!socket.connected) return Promise.resolve();

            let skip = 100 * (2 ** batchN - 1);
            let count = 100 * 2 ** batchN;

            return _getLocations(expeditie, personMap, skip, count)
                .then(batch => {
                    socket.emit(SocketIds.LOCATIONS, ++batchN, batch);
                    if (batch.length == count)
                        return _sendBatchAndRecurse(batchN);
                })
                .catch(() => {
                    return;
                });
        };
        return _sendBatchAndRecurse();
    };

    const _getLocations = (expeditie: ExpeditieOrID, personMap: Map<string, number>, skip: number, limit: number): Promise<SocketTypes.Location[]> => {
        let i = skip;
        return geoLocationModel.find({ expeditieId: Util.getObjectID(expeditie) }).select({ _id: 0, time: 1, latitude: 1, longitude: 1, personId: 1 })
            .sort({ visualArea: 'desc' }).skip(skip).limit(limit).exec()
            .then(locations => locations.map((location: GeoLocationDocument) =>
                <SocketTypes.Location>[
                    i++,
                    personMap.get(location.personId.toHexString()),
                    location.time,
                    location.latitude,
                    location.longitude
                ]
            ));
    };
}
