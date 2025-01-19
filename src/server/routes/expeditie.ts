import { FastifyPluginAsync } from "fastify";
import { renderExpeditieMapPage } from "../components/pages/public/expeditie-map.js";
import { renderExpeditiePage } from "../components/pages/public/expeditie.js";
import { getFullExpeditie } from "../db/expeditie.js";
import {
  getNodeLocations,
  getExpeditieNodes,
  getRouteVersion,
} from "../db/geo.js";
import { getExpeditieStories } from "../db/story.js";
import { promiseAllProps } from "../helpers/async.js";

const HEADER_REV = "x-revision-id";

const expeditieRoutes: FastifyPluginAsync = async (app) => {
  app.addHook("onRequest", async (request, reply) => {
    const { expeditieId } = request.params as { expeditieId: string };
    const expeditie = await getFullExpeditie(expeditieId);

    if (!expeditie) return reply.callNotFound();
    reply.locals.expeditie = expeditie;

    if (
      !expeditie.show_map &&
      request.routeOptions.url?.startsWith("/:expeditieId/kaart")
    )
      return reply.callNotFound();
  });

  app.get("/", async (request, reply) =>
    reply.sendHtml(
      renderExpeditiePage({
        expeditie: reply.locals.expeditie!,
        user: reply.locals.user,
      })
    )
  );

  app.get("/kaart", async (request, reply) =>
    reply.sendHtml(
      renderExpeditieMapPage(
        await promiseAllProps({
          expeditie: reply.locals.expeditie!,
          stories: getExpeditieStories(reply.locals.expeditie!.id),
          nodes: getExpeditieNodes(reply.locals.expeditie!.id),
        })
      )
    )
  );

  app.get("/kaart/binary", async (request, reply) => {
    const expeditie = reply.locals.expeditie!;

    const newHeader = await getRouteVersion(expeditie.id);

    if (request.headers[HEADER_REV] === newHeader)
      return reply.code(304).send();

    reply.raw.writeHead(200, {
      "Content-Type": "application/octet-stream",
      [HEADER_REV]: newHeader,
    });

    const nodes = await getExpeditieNodes(expeditie.id);

    let buf = Buffer.allocUnsafe(8);

    buf.writeUInt32BE(nodes.length, 0);

    reply.raw.write(buf);

    for (const node of nodes) {
      const nodeLocs = await getNodeLocations(node);

      buf = Buffer.allocUnsafe(8 + 16 * nodeLocs.length);

      buf.writeUInt32BE(node.id, 0);
      buf.writeUInt32BE(nodeLocs.length, 4);

      nodeLocs.forEach((loc, i) => {
        buf.writeDoubleBE(loc.longitude, i * 16 + 4);
        buf.writeDoubleBE(loc.latitude, i * 16 + 12);
      });

      reply.raw.write(buf);
    }

    reply.raw.end();

    return reply;
  });
};

export default expeditieRoutes;
