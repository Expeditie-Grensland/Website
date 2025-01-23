import { IControl, Map } from "mapbox-gl";
import { zoomToRoute } from "./view";

/**
 * Generic map control that has an icon and title and performs some action to
 * the map on click
 */
abstract class MapControl implements IControl {
  container?: HTMLElement;

  abstract title: string;
  abstract iconClass: string;

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

/**
 * Control that toggles the satellite layer of the map
 */
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

/**
 * Control that fits and centres the route into the visible area of the map
 */
export class CenterRouteControl extends MapControl {
  title = "Centreer route";
  iconClass = "mapicon-center-route";

  onClick = (map: Map) => {
    zoomToRoute(map);
  };
}
