const playAudio = (word: string) => () => {
    let player = <HTMLAudioElement>document.getElementById('player:' + word);
    player.play();
    return false;
};

const gotoAnchor = (word: string) => () => {
    let element = <HTMLElement>document.getElementById(word);
    window.scrollTo(0, element.offsetTop);
    return false;
};

for (let ls = document.links, numLinks = ls.length, i = 0; i < numLinks; i++) {
    if (ls[i].href.indexOf('#') !== -1) {
        let anchor = ls[i].href.replace(/^.*#/, '');
        if (anchor === '') {
        } else if (anchor.slice(0, 5) === 'play:') {
            ls[i].onclick = playAudio(anchor.slice(5));
        } else {
            ls[i].onclick = gotoAnchor(anchor);
        }
    }
}
