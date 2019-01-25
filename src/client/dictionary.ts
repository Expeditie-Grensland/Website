const playMedia = (word: string) => () => {
    let player = <HTMLMediaElement>document.getElementById('player:' + word);

    console.log(player);

    if (player.tagName === "VIDEO")
        if (player.style.display === "none") {
            player.style.display = "block";
            player.addEventListener('ended', () => {
                player.style.display = "none";
                player.load();
            })
        } else {
            player.style.display = "none";
            player.pause();         // pause video
            player.load();          // reload video to restart it
            return false;
        }

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
            ls[i].onclick = playMedia(anchor.slice(5));
        } else {
            ls[i].onclick = gotoAnchor(anchor);
        }
    }
}
