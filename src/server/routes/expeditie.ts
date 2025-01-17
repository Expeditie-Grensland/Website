import { FastifyPluginAsync } from "fastify";
import { renderExpeditieMapPage } from "../components/pages/public/expeditie-map.js";
import { renderExpeditiePage } from "../components/pages/public/expeditie.js";
import { getFullExpeditie } from "../db/expeditie.js";
import {
  getFirstNodeLocationAfter,
  getLocationCount,
  getNewestLocation,
  getNodeLocations,
  getNodesWithPersons,
} from "../db/geo.js";
import { getNewestStoryId, getStories, getStoryCount } from "../db/story.js";
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
          stories: getStories(reply.locals.expeditie!.id),
          nodes: getNodesWithPersons(reply.locals.expeditie!.id),
        })
      )
    )
  );

  app.get("/kaart/binary", async (request, reply) => {
    const expeditie = reply.locals.expeditie!;

    const [locationCount, lastLocation] = await Promise.all([
      getLocationCount(expeditie.id),
      getNewestLocation(expeditie.id),
    ]);

    const newHeader = `v1-${locationCount}-${lastLocation}`;

    if (request.headers[HEADER_REV] === newHeader)
      return reply.code(304).send();

    reply.raw.writeHead(200, {
      "Content-Type": "application/octet-stream",
      [HEADER_REV]: newHeader,
    });

    const nodes = await getNodesWithPersons(expeditie.id);

    let buf = Buffer.allocUnsafe(4);

    buf.writeUInt32BE(nodes.length, 0);

    reply.raw.write(buf);

    for (const node of nodes) {
      const nodeLocs = await getNodeLocations(node);

      buf = Buffer.allocUnsafe(4 + 16 * nodeLocs.length);

      buf.writeUInt32BE(nodeLocs.length, 0);

      nodeLocs.forEach((loc, i) => {
        buf.writeDoubleBE(loc.longitude, i * 16 + 4);
        buf.writeDoubleBE(loc.latitude, i * 16 + 12);
      });

      reply.raw.write(buf);
    }

    reply.raw.end();

    return reply;
  });

  app.get("/kaart/story", async (request, reply) => {
    const expeditie = reply.locals.expeditie!;

    const [storyCount, newestStory] = await Promise.all([
      getStoryCount(expeditie.id),
      getNewestStoryId(expeditie.id),
    ]);

    reply.header("Content-Type", "application/json");
    reply.header("Charset", "utf-8");

    const newHeader = `v1-${storyCount}-${newestStory}`;

    if (request.headers[HEADER_REV] === newHeader)
      return reply.code(304).send();

    const [stories, nodes] = await Promise.all([
      getStories(expeditie.id),
      getNodesWithPersons(expeditie.id),
    ]);

    reply.header(HEADER_REV, newHeader);

    const result = {
      nodes: nodes.map((node, index) => {
        return {
          id: node.id,
          nodeNum: index,
          timeFrom: node.time_from,
          timeTill: node.time_till,
          personNames: node.persons.map(
            (p) => `${p.first_name} ${p.last_name}`
          ),
        };
      }),
      story: await Promise.all(
        stories.map(async (story) => {
          const nodeIdx = nodes.findIndex(
            (node) =>
              story.time_stamp >= node.time_from &&
              story.time_stamp < node.time_till &&
              node.persons.some((p) => p.id == story.person_id)
          );

          const storyLocation = await getFirstNodeLocationAfter(
            nodes[nodeIdx],
            story.time_stamp
          );

          return {
            id: story.id,
            nodeNum: nodeIdx,
            dateTime: {
              stamp: story.time_stamp,
              zone: story.time_zone,
            },
            title: story.title,
            latitude: storyLocation?.latitude || 0,
            longitude: storyLocation?.longitude || 0,
          };
        })
      ),
    };

    return reply.send(JSON.stringify(result));
  });
};

export default expeditieRoutes;
