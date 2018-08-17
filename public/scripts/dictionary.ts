function playAudio (ind) {
    let player: HTMLAudioElement = <HTMLAudioElement>document.getElementById('player' + ind);
    player.play();
    return false;
}

function gotoWord (word) {
    let top = document.getElementById(word).offsetTop;
    window.scrollTo(0, top);
    return false;
}
