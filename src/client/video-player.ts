import shaka from "shaka-player/dist/shaka-player.ui";

document.addEventListener("DOMContentLoaded", () => {
  shaka.polyfill.installAll();

  if (!shaka.Player.isBrowserSupported()) {
    console.error("Browser wordt niet door Shaka ondersteund");
    return;
  }

  document
    .querySelectorAll<HTMLVideoElement>(".video-box > video")
    .forEach(async (el) => {
      const source = el.querySelector<HTMLSourceElement>("source")?.src;
      if (!source) {
        console.error("Geen videobron gevonden");
        return;
      }

      const localPlayer = new shaka.Player();
      const ui = new shaka.ui.Overlay(localPlayer, el.parentElement!, el);

      localPlayer.configure({
        streaming: {
          bufferingGoal: 120,
          rebufferingGoal: 1,
        },
      });

      ui.configure({
        castReceiverAppId: "07AEE832",
        castAndroidReceiverCompatible: true,
        customContextMenu: true,
        contextMenuElements: ["save_video_frame", "statistics"],
      });

      await localPlayer.attach(el);

      const controls = ui.getControls();
      const player = controls?.getPlayer();

      if (!player || !controls) {
        console.error("Shaka niet juist geïnitialiseerd");
        return;
      }

      player.addEventListener("error", (e) => {
        console.error("Shaka error", e);
      });

      controls.addEventListener("error", (e) => {
        console.error("Shaka UI error", e);
      });

      try {
        await player.load(source);
      } catch (e) {
        console.error(e);
      }
    });
});
