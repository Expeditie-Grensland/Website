import shaka from "shaka-player/dist/shaka-player.ui";
import nlLang from "shaka-player/ui/locales/nl.json";

document.addEventListener("DOMContentLoaded", async () => {
  shaka.polyfill.installAll();

  const container = document.getElementById("container") as HTMLDivElement;
  const video = document.getElementById("video") as HTMLVideoElement;
  const logo = document.getElementById("logo") as HTMLDivElement;

  const player = new shaka.Player();
  await player.attach(video);
  const ui = new shaka.ui.Overlay(player, container, video);
  const receiver = new shaka.cast.CastReceiver(video, player);
  const localization = ui.getControls()?.getLocalization();

  ui.configure({
    controlPanelElements: ["play_pause", "time_and_duration", "spacer"],
  });

  localization?.insert("nl", new Map(Object.entries(nlLang)));
  localization?.changeLocale(["nl"]);

  receiver.addEventListener("caststatuschanged", () => {
    if (receiver.isIdle()) {
      logo.style.display = "block";
    } else {
      logo.style.display = "none";
    }
  });
});
