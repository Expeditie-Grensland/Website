namespace LoadingBar {

    const loadingBar = $('#loadingBar')
    const loadingText = $('#loadingText')

    export function setLoadingText(text: string) {
        loadingText.html('&nbsp;' + text)
    }

    export function setLoadingDone(done: boolean) {
        loadingBar.hide()
        loadingText.html("Loading...")
    }

    export function isLoadingDone(): boolean {
        return loadingBar.is(":visible")
    }
}