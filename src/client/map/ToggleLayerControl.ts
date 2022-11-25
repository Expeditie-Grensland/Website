
import mapboxgl, {IControl} from "mapbox-gl"

export class ToggleLayerControl implements IControl {
    _map: mapboxgl.Map | undefined
    _container: HTMLElement | undefined
    _layerId: string

    constructor(layerId: string) {
        this._layerId = layerId
        this._map = undefined
        this._container = undefined
    }

    onAdd(map: mapboxgl.Map) {
        this._map = map;

        this._container = window.document.createElement('div');
        this._container.className = 'mapboxgl-ctrl mapboxgl-ctrl-group'

        this._setupUI()
        return this._container;
    }

    onRemove() {
        this._container!.remove();
        this._map = undefined;
    }

    _setupUI() {
        const button = window.document.createElement('button')
        button.className = `mapboxgl-ctrl-fullscreen`
        button.addEventListener('click', this._onClickFullscreen);

        const icon = window.document.createElement('span')
        icon.className = 'satellite-icon'
        icon.setAttribute('aria-hidden', 'true')
        button.appendChild(icon)

        this._container!.appendChild(button)
    }

    // This is an arrow function to avoid this binding to the click event
    _onClickFullscreen = () => {
        const map = this._map;
        if (!map) return;

        const visibility = map.getLayoutProperty(
            this._layerId,
            'visibility'
        );

        // Toggle layer visibility by changing the layout object's visibility property.
        if (visibility === 'visible') {
            map.setLayoutProperty(this._layerId, 'visibility', 'none');
        } else {
            map.setLayoutProperty(
                this._layerId,
                'visibility',
                'visible'
            );
        }
    }
}
