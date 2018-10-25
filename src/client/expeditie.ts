import 'core-js/fn/promise';

import {LoadingBar} from './map/loadingBar';
import {MapHandler} from './map/mapHandler';
import {registerWorker} from './helpers/worker';
import {ready} from './helpers/ready';
import createMap from "./map/createMap"
import {SocketHandler} from "./sockets/handler";

ready(() => {
    registerWorker();

    LoadingBar.setLoadingText('Loading map...');

    const map = createMap();

    SocketHandler.init();
    MapHandler.init(map);
});
