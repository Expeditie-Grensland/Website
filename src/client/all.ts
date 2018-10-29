import { ready } from './helpers/ready';
// @ts-ignore: Typings for 'cookieconsent' module not available.
import 'cookieconsent';

declare var _paq: any, cookieconsent: any;

ready(() => {
    // @ts-ignore
    global._paq = '_paq' in global ? _paq : [];

    _paq.push(['requireConsent']);
    _paq.push(['trackPageView']);
    _paq.push(['enableLinkTracking']);

    (() => {
        const url = 'https://matomo.atema.one/';
        _paq.push(['setTrackerUrl', url + 'piwik.php']);
        _paq.push(['setSiteId', '1']);

        const doc = document;
        const element = doc.createElement('script');
        const first_script = doc.getElementsByTagName('script')[0];

        element.defer = true;
        element.src = url + 'piwik.js';

        first_script.parentNode!.insertBefore(element, first_script);
    })();

    if ('serviceWorker' in navigator)
        navigator.serviceWorker.register('/worker.js').then(
            registration => console.log('Service worker registration succeeded:', registration),
            error => console.log('Service worker registration failed:', error)
        );
    else
        console.log('Service workers are not supported.');

    cookieconsent.initialise({
        container: document.getElementById('cookieconsent'),
        palette: {
            popup: {
                background: '#efefef',
                text: '#404040'
            },
            button: {
                background: '#8ec760',
                text: '#ffffff'
            }
        },
        theme: 'edgeless',
        content: {
            deny: 'Do not allow',
            allow: 'Allow cookies'
        },
        showLink: false,
        position: 'bottom-left',
        type: 'opt-in',
        onInitialise: (status: string) => {
            if (status == 'allow')
                _paq.push(['setConsentGiven']);
        },
        onStatusChange: (status: string) => {
            if (status == 'allow')
                _paq.push(['setConsentGiven']);
        }
    });
});
