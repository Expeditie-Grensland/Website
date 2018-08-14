function playAudio (ind) {
    let player: HTMLAudioElement = <HTMLAudioElement>document.getElementById('player' + ind);
    player.play();
    return false;
}
