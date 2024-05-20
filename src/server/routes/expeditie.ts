import { FastifyPluginAsync } from "fastify";
import { getFullExpeditie } from "../db/expeditie.js";
import {
  getLocationCount,
  getNewestLocation,
  getNodeLocations,
  getNodesWithPersonIds,
} from "../db/geo.js";

const HEADER_REV = "x-revision-id";

const expeditieRoutes: FastifyPluginAsync = async (app) => {
  app.addHook("onRequest", async (request, reply) => {
    const { expeditieId } = request.params as { expeditieId: string };
    const expeditie = await getFullExpeditie(expeditieId);

    if (!expeditie) return reply.callNotFound();
    reply.locals.expeditie = expeditie;

    if (
      !expeditie.show_map &&
      request.routerPath.startsWith("/:expeditieId/kaart")
    )
      return reply.callNotFound();
  });

  app.get("/", async (request, reply) => reply.view("public/expeditie"));

  app.get("/kaart", async (request, reply) => {
    // const expeditie = reply.locals.expeditie!;

    const storyCount = 0; // FIXME: Update with actual story count

    return reply.view("expeditieMap", { hasStory: storyCount > 0 });
  });

  app.get("/kaart/binary", async (request, reply) => {
    const expeditie = reply.locals.expeditie!;

    const locationCount = getLocationCount(expeditie.id);
    const lastLocation = getNewestLocation(expeditie.id);

    const newHeader = `v1-${await locationCount}-${await lastLocation}`;

    if (request.headers[HEADER_REV] === newHeader)
      return reply.code(304).send();

    reply.raw.writeHead(200, {
      "Content-Type": "application/octet-stream",
      [HEADER_REV]: newHeader,
    });

    const nodes = await getNodesWithPersonIds(expeditie.id);

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

  // FIXME: Complete below to pg

  // app.get("/kaart/story", async (request, reply) => {
  //   const expeditie = reply.locals.expeditie!;

  //   const storyCount = getStoryCountByExpeditie(expeditie._id);

  //   const lastStory = BaseStoryElementModel.find({ expeditieId: expeditie._id })
  //     .sort({ _id: -1 })
  //     .limit(1)
  //     .exec()
  //     .then((x) =>
  //       x.length > 0
  //         ? x[0]._id
  //         : new mongoose.Types.ObjectId("000000000000000000000000")
  //     );

  //   reply.header("Content-Type", "application/json");
  //   reply.header("Charset", "utf-8");

  //   const newHeader: Promise<string> = (async () =>
  //     `v1-${await storyCount}-${(await lastStory).toHexString()}`)();

  //   if (
  //     request.headers[HEADER_REV] &&
  //     request.headers[HEADER_REV] === (await newHeader)
  //   )
  //     return reply.code(304).send();

  //   const stories = getStoryByExpeditie(expeditie._id);
  //   const nodes = await getPopulatedNodesByExpeditie(expeditie._id);

  //   reply.header(HEADER_REV, await newHeader);

  //   const result = {
  //     nodes: nodes.map((node, index) => {
  //       return {
  //         id: node._id.toHexString(),
  //         nodeNum: index,
  //         timeFrom: node.timeFrom,
  //         timeTill: node.timeTill,
  //         personNames: node.personIds.map(
  //           (p) => `${p.firstName} ${p.lastName}`
  //         ),
  //       };
  //     }),
  //     story: await Promise.all(
  //       (await stories).map(async (story) => {
  //         const nodeIdx = nodes.findIndex(
  //           (node) =>
  //             story.dateTime.stamp >= node.timeFrom &&
  //             story.dateTime.stamp < node.timeTill &&
  //             node.personIds.some((p) => p._id.equals(story.personId))
  //         );

  //         const storyLocation = (
  //           await geoLocationModel
  //             .find(
  //               {
  //                 expeditieId: expeditie._id,
  //                 personId: { $in: nodes[nodeIdx].personIds.map((p) => p._id) },
  //                 "dateTime.stamp": { $gte: story.dateTime.stamp },
  //               },
  //               { _id: false, longitude: true, latitude: true }
  //             )
  //             .sort({ "dateTime.stamp": 1 })
  //             .limit(1)
  //             .exec()
  //         )[0];

  //         const media =
  //           (story as HydratedDocument<MediaStoryElement>).media || [];

  //         return {
  //           id: story._id.toHexString(),
  //           type: story.type,
  //           nodeNum: nodeIdx,
  //           dateTime: {
  //             stamp: story.dateTime.stamp,
  //             zone: story.dateTime.zone,
  //           },
  //           title: (story as HydratedDocument<TextStoryElement>).title,
  //           text: (story as HydratedDocument<TextStoryElement>).text,
  //           name: (story as HydratedDocument<LocationStoryElement>).name,
  //           latitude: storyLocation?.latitude || 0,
  //           longitude: storyLocation?.longitude || 0,
  //           media: media.map((medium) => ({
  //             file: getFileUrl(medium.file),
  //             description: medium.description,
  //           })),
  //         };
  //       })
  //     ),
  //     finished: expeditie.finished,
  //   };

  //   return reply.send(JSON.stringify(result));
  // });
};

export default expeditieRoutes;
