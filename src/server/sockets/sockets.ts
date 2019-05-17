import * as socketio from 'socket.io';
import * as R from 'ramda';

import {Expedities} from '../components/expedities';
import {SocketIds} from './ids';
import {Util} from '../components/documents/util';
import {SocketTypes} from './types';
import {ExpeditieOrID} from '../components/expedities/model';
import {People} from '../components/people';
import {GeoLocationDocument, geoLocationModel} from '../components/geoLocations/model';
import {GeoNodeDocument} from '../components/geoNodes/model';

export namespace Sockets {
    export const getExpeditie = (socket: socketio.Socket) => async (expeditieName: string, lastClientUpdateTime?: number): Promise<void> => {
        const expeditie = (await Expedities.getByNameShort(expeditieName))!;

        const personMap = await _getPersonMap();
        const [nodes, count, box, lastUpdateTime] = await Promise.all([
            _getNodes(expeditie),
            _getLocationCount(expeditie, lastClientUpdateTime),
            _getBoundingBox(expeditie),
            _getLastLocationTime(expeditie)
        ]);

        const sInfo = <SocketTypes.Expeditie>{
            id: Util.getObjectID(expeditie),
            nodes,
            box,
            personMap: [...personMap].reduce((obj, [s, n]) => Object.assign(obj, { [n]: s }), {}),
            count,
            lastUpdateTime
        };

        socket.emit(SocketIds.INFO, sInfo);

        await _sendLocations(socket, expeditie, personMap, lastClientUpdateTime);

        const story = await _getStory(expeditie, lastClientUpdateTime);
        socket.emit(SocketIds.STORY, story);

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
                id: Util.getObjectID(node),
                personIds: node.personIds.map(x => x.toHexString()),
                timeFrom: node.timeFrom,
                timeTill: node.timeTill != Number.POSITIVE_INFINITY ? node.timeTill : 1e10,
                color: COLORS[colorsIds[n++]]
            };
        });
    };


    export const _getLocationCount = (expeditie: ExpeditieOrID, lastUpdateTime?: number): Promise<number> =>
        geoLocationModel.count(Object.assign(
            { expeditieId: Util.getObjectID(expeditie) },
            !lastUpdateTime ? {} : { time: { $gt: lastUpdateTime } }
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

    const _getLastLocationTime = async (expeditie: ExpeditieOrID): Promise<number | null> =>
        geoLocationModel.find({ expeditieId: Util.getObjectID(expeditie) })
            .select({ _id: 1, time: 1 })
            .sort({ _id: -1 })
            .limit(1)
            .exec()
            .then(locations => locations[0].time)
            .catch(() => null);

    const _sendLocations = (socket: socketio.Socket, expeditie: ExpeditieOrID, personMap: Map<string, number>, lastClientUpdateTime?: number) =>
        function sendBatchAndRecurse(skip = 0, count = 500): Promise<any> {
            if (!socket.connected) return Promise.resolve();

            return _getLocations(expeditie, personMap, skip, count, lastClientUpdateTime)
                .then(batch =>
                    new Promise(resolve => {
                        if (batch.length != 0)
                            socket.emit(SocketIds.LOCATIONS, batch, () => {
                                if (batch.length == count * 37)
                                    resolve(sendBatchAndRecurse(skip + count, Math.min(count * 2, 5000)));
                                else resolve();
                            });
                        else resolve();
                    })
                )
                .catch(console.error);
        }();

    const writeLocations = (locs: GeoLocationDocument[], personMap: Map<string, number>): Buffer => {
        const buf = Buffer.allocUnsafe(37 * locs.length);

        for (let i = 0; i < locs.length; i++) {
            const offset = i * 37;

            for (let j = 0; j < 12; j++)
                // @ts-ignore: id represents ObjectId buffer, but is not documented
                buf[offset + j] = locs[i]._id.id[j];

            buf.writeUInt8(personMap.get(locs[i].personId.toHexString()) || 0, offset + 12);
            buf.writeDoubleBE(locs[i].time, offset + 13);
            buf.writeDoubleBE(locs[i].longitude, offset + 21);
            buf.writeDoubleBE(locs[i].latitude, offset + 29);
        }

        return buf;
    };
    const writeLocationsR = R.curry(writeLocations);

    const _getLocations = (expeditie: ExpeditieOrID, personMap: Map<string, number>, skip: number, limit: number, lastClientUpdateTime?: number): Promise<Buffer> => {
        return geoLocationModel.find(Object.assign(
            { expeditieId: Util.getObjectID(expeditie) },
            !lastClientUpdateTime ? {} : { time: { $gt: lastClientUpdateTime } }
        )).select({
            _id: 1,
            time: 1,
            latitude: 1,
            longitude: 1,
            personId: 1
        })
            .sort({ visualArea: -1 }).skip(skip).limit(limit).exec()
            .then(writeLocationsR(R.__, personMap));
    };

    const _getStory = (expeditie: ExpeditieOrID, lastClientUpdateTime?: number): Promise<SocketTypes.StoryElement[]> => {
        if (lastClientUpdateTime != undefined)
            return Promise.resolve(<SocketTypes.StoryElement[]> []);

        return Promise.resolve(<SocketTypes.StoryElement[]> [
            {
                id:          "0",
                type:        "location",
                expeditieId: "5afb39bf6c878654c67c0a29",
                geoNodeId:   "5afb3db06c878654c67ccb42",
                time:        1526464800,
                name:        "Teheran"
            },
            {
                id:          "1",
                type:        "location",
                expeditieId: "5afb39bf6c878654c67c0a29",
                geoNodeId:   "5afb3db06c878654c67ccb43",
                time:        1526464800,
                name:        "Bakoe"
            },
            {
                id:          "2",
                type:        "location",
                expeditieId: "5afb39bf6c878654c67c0a29",
                geoNodeId:   "5afb3db26c878654c67ce062",
                time:        1526464800,
                name:        "Bakoe"
            },
            {
                id:          "3",
                type:        "text",
                expeditieId: "5afb39bf6c878654c67c0a29",
                geoNodeId:   "5afb3db26c878654c67ce062",
                time:        1526464800,
                title:       "Tbilisi",
                text:        "Jarenlang heeft de heer M.G. Meedendorp aan deze website gewerkt maar hij moet nog veel leren voordat hij de wereld kan veranderen."
            },
            {
                id:          "4",
                type:        "location",
                expeditieId: "5afb39bf6c878654c67c0a29",
                geoNodeId:   "5afb3db26c878654c67ce062",
                time:        1526464800,
                name:        "Yerevan"
            },
            {
                id:          "5",
                type:        "location",
                expeditieId: "5afb39bf6c878654c67c0a29",
                geoNodeId:   "5afb3db26c878654c67ce062",
                time:        1526464800,
                name:        "Sochi"
            },
            {
                id:          "6",
                type:        "location",
                expeditieId: "5afb39bf6c878654c67c0a29",
                geoNodeId:   "5afb3db26c878654c67ce062",
                time:        1526464800,
                name:        "Sukhum"
            },
            {
                id:          "7",
                type:        "location",
                expeditieId: "5afb39bf6c878654c67c0a29",
                geoNodeId:   "5afb3db26c878654c67ce062",
                time:        1526464800,
                name:        "Lake Ritsa"
            },
            {
                id:          "8",
                type:        "location",
                expeditieId: "5afb39bf6c878654c67c0a29",
                geoNodeId:   "5afb3db26c878654c67ce062",
                time:        1526464800,
                name:        "Olympisch Park Sochi"
            },
            {
                id:          "9",
                type:        "location",
                expeditieId: "5afb39bf6c878654c67c0a29",
                geoNodeId:   "5afb3db26c878654c67ce062",
                time:        1526464800,
                name:        "Moskou"
            },
            {
                id:          "10",
                type:        "location",
                expeditieId: "5afb39bf6c878654c67c0a29",
                geoNodeId:   "5afb3dbd6c878654c67d6368",
                time:        1526464800,
                name:        "Finsterwolde"
            },
            {
                id:          "11",
                type:        "location",
                expeditieId: "5afb39bf6c878654c67c0a29",
                geoNodeId:   "5afb3dbd6c878654c67d6369",
                time:        1547978400,
                name:        "Minsk"
            },
            {
                id:          "12",
                type:        "location",
                expeditieId: "5afb39bf6c878654c67c0a29",
                geoNodeId:   "5afb3dbd6c878654c67d6369",
                time:        1557993600,
                name:        "Žiežmariai"
            },
            {
                id:          "13",
                type:        "location",
                expeditieId: "5afb39bf6c878654c67c0a29",
                geoNodeId:   "5afb3dbd6c878654c67d6369",
                time:        1558080000,
                name:        "Brussel"
            }
        ]);
    }
}
