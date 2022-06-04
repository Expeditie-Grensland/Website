import Hls, {HlsConfig} from "hls.js"

const video = document.getElementById('video') as HTMLVideoElement | null;
const videoSrc = video?.dataset?.manifestUrl

const hlsConfig: Partial<HlsConfig> = {
    capLevelToPlayerSize: true,
}

if (Hls.isSupported() && video && videoSrc) {
    const hls = new Hls(hlsConfig);
    hls.loadSource(videoSrc);
    hls.attachMedia(video);

            // fall back to mp4 video on error
    hls.on(Hls.Events.ERROR, function (event, data) {
        if (data.fatal) {
            hls.destroy();
        }
    });
}
    // hls.js is not supported on platforms that do not have Media Source
    // Extensions (MSE) enabled.
    //
    // When the browser has built-in HLS support (check using `canPlayType`),
    // we can provide an HLS manifest (i.e. .m3u8 URL) directly to the video
    // element through the `src` property. This is using the built-in support
    // of the plain video element, without using hls.js.
else if (video && videoSrc && video.canPlayType('application/vnd.apple.mpegurl')) {
    video.src = videoSrc;
}
