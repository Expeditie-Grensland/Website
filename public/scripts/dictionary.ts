const playAudio = (ind: string) => () => {
    let player: HTMLAudioElement = <HTMLAudioElement>document.getElementById('player' + ind);
    player.play();
    return false;
};

const gotoAnchor = (word: string) => () => {
    let top = document.getElementById(word).offsetTop;
    window.scrollTo(0, top);
    return false;
};

for (let ls = document.links, numLinks = ls.length, i = 0; i < numLinks; i++) {
    if (ls[i].href.indexOf('#') !== -1) {
        let anchor = ls[i].href.replace(/^.*#/, '');
        if (anchor === '') {
        } else if (anchor.slice(0, 4) === 'play') {
            ls[i].onclick = playAudio(anchor.slice(4));
        } else {
            ls[i].onclick = gotoAnchor(anchor);
        }
    }
}
