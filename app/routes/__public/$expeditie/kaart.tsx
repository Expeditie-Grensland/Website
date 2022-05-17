import { json } from "@remix-run/node";
import { useParams } from "@remix-run/react";
import mapboxgl, { LngLatBounds } from "mapbox-gl";
import mapboxglStyle from "mapbox-gl/dist/mapbox-gl.css";
import { useEffect, useRef, useState } from "react";
import db from "~/utils/database/db";
import { geoDataFetcher } from "./geodata";
import type {
  LinksFunction,
  LoaderFunction,
  MetaFunction,
} from "@remix-run/node";
import type { Feature, FeatureCollection } from "geojson";
import type { NavBarHandle } from "~/components/NavBar";

const handle: NavBarHandle = {
  backLink: ({ params, data }) => ({
    to: `/${params.expeditie}`,
    text: `← Expeditie ${data.name}`,
  }),
};

const meta: MetaFunction = ({ data }) => ({
  title: `Kaart - Expeditie ${data.name}`,
});

const links: LinksFunction = () => [
  {
    rel: "stylesheet",
    href: mapboxglStyle,
  },
];

const loader: LoaderFunction = async ({ params }) => {
  const expeditie = await db.expeditie.findUnique({
    where: { slug: params.expeditie },
    select: {
      name: true,
      showMap: true,
    },
  });

  if (!expeditie) throw json("Expeditie niet gevonden", { status: 404 });

  if (!expeditie.showMap)
    throw json("Kaart niet beschikbaar voor expeditie", { status: 404 });

  return expeditie;
};

const ExpeditieMapPage = () => {
  const params = useParams();

  const map = useRef<mapboxgl.Map>();
  const mapContainer = useRef<HTMLDivElement>(null);

  const [mapHasLoaded, setMapHasLoaded] = useState(false);
  const [geoJson, setGeoJson] = useState<FeatureCollection>();
  const [boundaries, setBoundaries] = useState<LngLatBounds>();

  useEffect(() => {
    if (geoJson) return;

    (async () => {
      const geoData = await geoDataFetcher(params.expeditie!);
      if (!geoData) return;

      let minLat = Infinity,
        maxLat = -Infinity,
        minLng = Infinity,
        maxLng = -Infinity;

      setGeoJson({
        type: "FeatureCollection",
        features: geoData.nodes
          .map((geoNode) => {
            const locationCount = Math.min(
              geoNode.latitudes?.length || 0,
              geoNode.longitudes?.length || 0
            );

            if (locationCount === 0) return null;

            for (let lng of geoNode.longitudes!) {
              if (lng < minLng) minLng = lng;
              if (lng > maxLng) maxLng = lng;
            }

            for (let lat of geoNode.latitudes!) {
              if (lat < minLat) minLat = lat;
              if (lat > maxLat) maxLat = lat;
            }

            return {
              type: "Feature",
              properties: { nodeId: geoNode.id },
              geometry: {
                type: "LineString",
                coordinates: Array.from({ length: locationCount }, (_, i) => [
                  geoNode.longitudes![i],
                  geoNode.latitudes![i],
                ]),
              },
            };
          })
          .filter((geoNode) => geoNode !== null) as Feature[],
      });

      setBoundaries(
        new LngLatBounds([
          [minLng, minLat],
          [maxLng, maxLat],
        ])
      );
    })();
  });

  useEffect(() => {
    if (map.current) return;
    if (!mapContainer.current) return;

    mapboxgl.accessToken =
      "pk.eyJ1IjoibWF1cmljZW1lZWRlbmRvcnAiLCJhIjoiY2o4NzV5amh5MTVidzJxcWhlbDNhMWlmOCJ9.DvTrMNuuFX3QZZ3boymWPw";

    map.current = new mapboxgl.Map({
      container: mapContainer.current,
      style:
        "mapbox://styles/mauricemeedendorp/cj9zhseph8lev2rqd3f6vsmkj?optimize=true",
      center: [7.048, 53.0545],
      zoom: 14,
    });

    map.current.on("load", () => setMapHasLoaded(true));
  });

  useEffect(() => {
    if (
      !map.current ||
      !geoJson ||
      !boundaries ||
      !mapHasLoaded ||
      map.current.getSource("route-source")
    )
      return;

    map.current.fitBounds(boundaries, { padding: 20, animate: false });
    map.current.addSource("route-source", { type: "geojson", data: geoJson });

    map.current.addLayer({
      id: "route-layer",
      type: "line",
      source: "route-source",
      paint: {
        "line-opacity": 1,
        "line-width": 3,
        "line-color": "#f00",
      },
    });
  }, [map, geoJson, boundaries, mapHasLoaded]);

  return (
    <div>
      <div className="w-full h-[600px]" ref={mapContainer}></div>
    </div>
  );
};

export { handle, meta, links, loader };
export default ExpeditieMapPage;
