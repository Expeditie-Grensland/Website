export const registerWorker = () => {
    if ('serviceWorker' in navigator) {
        navigator.serviceWorker.register('/worker.js')
            .then(registration => {
                console.log('Service worker registration succeeded:', registration);
            }, error => {
                console.log('Service worker registration failed:', error);
            });
    } else {
        console.log('Service workers are not supported.');
    }
};
