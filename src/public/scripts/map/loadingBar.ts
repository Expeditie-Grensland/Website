export namespace LoadingBar {
    const loadingBar = $('#loadingBar');
    const loadingText = $('#loadingText');

    export function setLoadingText(text: string) {
        loadingText.html('&nbsp;' + text);
        console.log(text);
    }

    export function setLoadingDone(done: boolean) {
        loadingBar.hide();
        loadingText.html('Loading...');
        console.log('Loading done.');
    }

    export function isLoadingDone(): boolean {
        return loadingBar.is(':visible');
    }
}
