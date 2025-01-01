import { IControl, Map } from "mapbox-gl";
import { MapHandler } from "./MapHandler";

abstract class MapControl implements IControl {
  mapHandler: MapHandler;
  container?: HTMLElement;

  abstract title: string;
  abstract iconClass: string;

  constructor(mapHandler: MapHandler) {
    this.mapHandler = mapHandler;
  }

  onAdd = (map: Map) => {
    this.container = document.createElement("div");
    this.container.className = "mapboxgl-ctrl mapboxgl-ctrl-group";

    const button = document.createElement("button");
    button.ariaLabel = this.title;
    button.addEventListener("click", () => this.onClick(map));

    const icon = window.document.createElement("span");
    icon.className = `mapboxgl-ctrl-icon ${this.iconClass}`;
    icon.title = this.title;
    icon.ariaHidden = "true";
    button.appendChild(icon);

    this.container.appendChild(button);

    return this.container;
  };

  onRemove = () => {
    this.container?.remove();
  };

  abstract onClick: (map: Map) => void;
}

export class SatelliteControl extends MapControl {
  title = "Satelliet";
  iconClass = "mapicon-satellite";

  onClick = (map: Map) => {
    map.setLayoutProperty(
      "satellite",
      "visibility",
      map.getLayoutProperty("satellite", "visibility") == "visible"
        ? "none"
        : "visible"
    );
  };
}

export class CenterRouteControl extends MapControl {
  title = "Centreer route";
  iconClass = "mapicon-center-route";

  onClick = () => {
    this.mapHandler.resetBounds();
  };
}
