import { json } from "@remix-run/node";
import { Prisma } from "~/generated/db";
import { GeoNode, GeoData } from "~/generated/protobufs";
import db from "~/utils/database/db";
import type { LoaderFunction } from "@remix-run/node";

const loader: LoaderFunction = async ({ params, request }) => {
  const expeditie = await db.expeditie.findUnique({
    where: { slug: params.expeditie },
    select: {
      slug: true,
      showMap: true,
      geoNodes: {
        select: {
          id: true,
          beginTimestamp: true,
          endTimestamp: true,
          people: {
            select: {
              id: true,
            },
          },
        },
      },
      geoLocations: {
        select: {
          id: true,
          timestamp: true,
          personId: true,
          longitude: true,
          latitude: true,
        },
        orderBy: {
          timestamp: Prisma.SortOrder.asc,
        },
      },
    },
  });

  if (!expeditie) throw json("Expeditie niet gevonden", { status: 404 });

  if (!expeditie.showMap)
    throw json("Kaart niet beschikbaar voor expeditie", { status: 404 });

  if (expeditie.geoNodes.length === 0 || expeditie.geoLocations.length === 0)
    throw json("De kaart voor deze expeditie is nog leeg", { status: 404 });

  const etag =
    expeditie.slug +
    "-nc" +
    expeditie.geoNodes.length +
    "-lc" +
    expeditie.geoLocations.length +
    "-nm" +
    expeditie.geoNodes.reduce(
      (acc, node) => (node.id > acc ? node.id : acc),
      0
    ) +
    "-gm" +
    expeditie.geoLocations.reduce(
      (acc, location) => (location.id > acc ? location.id : acc),
      0
    );

  if (request.headers.get("If-None-Match") === etag)
    throw new Response(null, { status: 304 });

  const nodes: {
    [key: number]: { latitudes: number[]; longitudes: number[] };
  } = {};

  for (const expNode of expeditie.geoNodes) {
    nodes[expNode.id] = { latitudes: [], longitudes: [] };
  }

  for (const expLocation of expeditie.geoLocations) {
    for (const expNode of expeditie.geoNodes) {
      if (
        expNode.people.some((person) => person.id === expLocation.personId) &&
        expLocation.timestamp > expNode.beginTimestamp &&
        expLocation.timestamp <= expNode.endTimestamp
      ) {
        nodes[expNode.id].latitudes.push(expLocation.latitude);
        nodes[expNode.id].longitudes.push(expLocation.longitude);
      }
    }
  }

  const geoData = GeoData.create({
    nodes: Object.entries(nodes).map(([nodeId, { latitudes, longitudes }]) =>
      GeoNode.create({ id: parseInt(nodeId), latitudes, longitudes })
    ),
  });

  const buffer = GeoData.encode(geoData).finish();

  return new Response(buffer, {
    headers: {
      "Cache-Control": "max-age=60, must-revalidate",
      ETag: etag,
    },
  });
};

const fetcher = async (slug: string) => {
  const response = await fetch(`/${slug}/geodata`);
  const buffer = new Uint8Array(await response.arrayBuffer());

  return GeoData.decode(buffer);
};

export { loader, fetcher as geoDataFetcher };
