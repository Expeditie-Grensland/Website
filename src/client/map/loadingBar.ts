export namespace LoadingBar {
    const loadingBar = document.getElementById('loadingBar')!;
    const loadingText = document.getElementById('loadingText')!;

    export function setLoadingText(text: string) {
        loadingText.innerText = `\u00A0${text}`;
        console.log(text);
    }

    export function setLoadingDone() {
        loadingBar.style.display = 'none';
        console.log('Laden geslaagd.');
    }
}
