import $ from 'jquery';
import { LoadingBar } from './map/loadingBar';
import { registerWorker } from './workerHelper/register';
import createMap from "./map/createMap"
import {SocketHandler} from "./sockets/handler"
import {MapHandler} from "./map/mapHandler"

declare var expeditieNameShort: string;

$(() => {
    registerWorker();

    LoadingBar.setLoadingText('Loading map...');

    const map = createMap(false, false, false);

    SocketHandler.init();
    MapHandler.init(map, expeditieNameShort);
});
