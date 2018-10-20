var _paq = _paq || [];

_paq.push(['trackPageView']);
_paq.push(['enableLinkTracking']);

(function () {
    var url = 'https://matomo.atema.one/';
    _paq.push(['setTrackerUrl', url + 'piwik.php']);
    _paq.push(['setSiteId', '1']);

    var doc = document;
    var element = doc.createElement('script');
    var first_script = doc.getElementsByTagName('script')[0];

    element.type = 'text/javascript';
    element.async = true;
    element.defer = true;
    element.src = url + 'piwik.js';

    first_script.parentNode.insertBefore(element, first_script);
})();
