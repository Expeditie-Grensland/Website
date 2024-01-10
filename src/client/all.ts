import { ready } from './helpers/ready';

ready(() => {
    /*
     * Register service worker
     */

    if ('serviceWorker' in navigator)
        navigator.serviceWorker.register('/worker.js').then(
            registration => console.info('Service worker registration succeeded:', registration),
            error => console.error('Service worker registration failed:', error)
        );
    else
        console.warn('Service workers are not supported.');
});
