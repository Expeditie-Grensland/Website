import { ready } from './helpers/ready';

declare global {
    interface Window {
        _paq: string[][];
    }
}

ready(() => {
    /*
     * Setup tracking
     */
    const _paq = window._paq = window._paq || [];

    _paq.push(['disableCookies']);
    _paq.push(['trackPageView']);
    _paq.push(['enableLinkTracking']);

    const url = 'https://matomo.atema.one/';

    const doc = document;
    const element = doc.createElement('script');
    const first_script = doc.getElementsByTagName('script')[0];
    _paq.push(['setTrackerUrl', url + 'piwik.php']);
    _paq.push(['setSiteId', '1']);

    element.defer = true;
    element.src = url + 'piwik.js';

    first_script.parentNode!.insertBefore(element, first_script);

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
