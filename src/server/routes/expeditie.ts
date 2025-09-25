import type { FastifyPluginAsync } from "fastify";
import { ExpeditiePage } from "../components/pages/public/expeditie.js";
import { ExpeditieMapPage } from "../components/pages/public/expeditie-map.js";
import { getFullExpeditie } from "../db/expeditie.js";
import {
  getExpeditieSegments,
  getRouteVersion,
  getSegmentLocations,
} from "../db/geo.js";
import { getExpeditieStories } from "../db/story.js";

const expeditieRoutes: FastifyPluginAsync = async (app) => {
  app.addHook("onRequest", async (req, reply) => {
    const { expeditieId } = req.params as { expeditieId: string };
    const expeditie = await getFullExpeditie(expeditieId);

    if (!expeditie) return reply.callNotFound();
    reply.locals.expeditie = expeditie;

    if (
      !expeditie.show_map &&
      req.routeOptions.url?.startsWith("/:expeditieId/kaart")
    )
      return reply.callNotFound();
  });

  app.get("/", (_req, reply) =>
    reply.sendComponent(ExpeditiePage, {
      expeditie: reply.locals.expeditie!,
      user: reply.locals.user,
    })
  );

  app.get("/kaart", (_req, reply) =>
    reply.sendComponent(ExpeditieMapPage, {
      expeditie: reply.locals.expeditie!,
      stories: getExpeditieStories(reply.locals.expeditie!.id),
      segments: getExpeditieSegments(reply.locals.expeditie!.id),
      routeVersion: getRouteVersion(reply.locals.expeditie!.id),
    })
  );

  app.get("/kaart/route-data", async (_req, reply) => {
    reply.raw.writeHead(200, {
      "Content-Type": "application/octet-stream",
      "Cache-Control": "public, max-age=2592000, immutable",
    });

    const segments = await getExpeditieSegments(reply.locals.expeditie!.id);

    let buf = Buffer.alloc(8);
    buf.writeUInt32BE(segments.length, 0);

    reply.raw.write(buf);

    for (const segment of segments) {
      const locations = await getSegmentLocations(segment);

      buf = Buffer.allocUnsafe(8 + 16 * locations.length);

      buf.writeUInt32BE(segment.id, 0);
      buf.writeUInt32BE(locations.length, 4);

      locations.forEach((loc, i) => {
        buf.writeDoubleBE(loc.longitude, i * 16 + 8);
        buf.writeDoubleBE(loc.latitude, i * 16 + 16);
      });

      reply.raw.write(buf);
    }

    reply.raw.end();

    return reply;
  });
};

export default expeditieRoutes;
