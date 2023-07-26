import express from "express";
import mongoose, { HydratedDocument } from "mongoose";

import {
  getMovieUrlsFromExpeditie,
  getPopulatedExpeditieByName,
} from "../components/expedities/index.js";
import { getLocationCountByExpeditie } from "../components/geoLocations/index.js";
import { geoLocationModel } from "../components/geoLocations/model.js";
import {
  getNodesByExpeditie,
  getPopulatedNodesByExpeditie,
} from "../components/geoNodes/index.js";
import {
  getStoryByExpeditie,
  getStoryCountByExpeditie,
} from "../components/storyElements/index.js";
import {
  BaseStoryElementModel,
  LocationStoryElement,
  MediaStoryElement,
  TextStoryElement,
} from "../components/storyElements/model.js";

export const router = express.Router({ mergeParams: true });

router.use(async (req, res, next) => {
  const expeditie = await getPopulatedExpeditieByName(req.params.expeditie);

  if (expeditie != null) {
    res.locals.expeditie = expeditie;
    next();
  } else {
    next("router");
  }
});

router.get("/", async (req, res) => {
  res.render("public/expeditie", {
    movieUrls: getMovieUrlsFromExpeditie(res.locals.expeditie),
  });
});

router.use(async (req, res, next) => {
  if (res.locals.expeditie.showMap) next();
  else next("router");
});

router.get("/kaart", async (req, res) => {
  const expeditie = res.locals.expeditie;

  const storyCount = await getStoryCountByExpeditie(expeditie._id);

  res.render("expeditieMap", { hasStory: storyCount > 0 });
});

const H_LC = "X-Location-Count";
const H_LL = "X-Last-Location";

router.get("/kaart/binary", async (req, res) => {
  const expeditie = res.locals.expeditie;

  const locationCount = getLocationCountByExpeditie(expeditie._id);

  const lastLocation = geoLocationModel
    .find({ expeditieId: expeditie._id })
    .sort({ _id: -1 })
    .limit(1)
    .exec()
    .then((x) =>
      x.length > 0
        ? x[0]._id
        : new mongoose.Types.ObjectId("000000000000000000000000")
    );

  res.setHeader("Content-Type", "application/octet-stream");

  if (
    req.header(H_LC) != undefined &&
    req.header(H_LL) != undefined &&
    req.header(H_LC) == (await locationCount).toString(16) &&
    req.header(H_LL) == (await lastLocation).toHexString()
  )
    return res.sendStatus(304);

  const nodes = getNodesByExpeditie(expeditie._id);

  let buf = Buffer.allocUnsafe(4);

  buf.writeUInt32BE((await nodes).length, 0);

  res.setHeader(H_LC, (await locationCount).toString(16));
  res.setHeader(H_LL, (await lastLocation).toHexString());

  res.write(buf, "binary");

  for (const node of await nodes) {
    const nodeLocs = await geoLocationModel
      .find(
        {
          expeditieId: node.expeditieId,
          personId: { $in: node.personIds },
          "dateTime.stamp": { $gte: node.timeFrom, $lt: node.timeTill },
        },
        { _id: false, longitude: true, latitude: true }
      )
      .sort({ "dateTime.stamp": 1 })
      .exec();

    buf = Buffer.allocUnsafe(4 + 16 * nodeLocs.length);

    buf.writeUInt32BE(nodeLocs.length, 0);

    nodeLocs.forEach((loc, i) => {
      buf.writeDoubleBE(loc.longitude, i * 16 + 4);
      buf.writeDoubleBE(loc.latitude, i * 16 + 12);
    });

    res.write(buf, "binary");
  }

  res.end(null, "binary");
});

// TODO: one X-Revision-Id header instead of separate
const H_SC = "X-Story-Count";
const H_LS = "X-Last-Story";

router.get("/kaart/story", async (req, res) => {
  const expeditie = res.locals.expeditie;

  const storyCount = getStoryCountByExpeditie(expeditie._id);

  const lastStory = BaseStoryElementModel.find({ expeditieId: expeditie._id })
    .sort({ _id: -1 })
    .limit(1)
    .exec()
    .then((x) =>
      x.length > 0
        ? x[0]._id
        : new mongoose.Types.ObjectId("000000000000000000000000")
    );

  res.setHeader("Content-Type", "application/json");
  res.setHeader("Charset", "utf-8");

  if (
    req.header(H_SC) != undefined &&
    req.header(H_LS) != undefined &&
    req.header(H_SC) == (await storyCount).toString(16) &&
    req.header(H_LS) == (await lastStory).toHexString()
  )
    return res.sendStatus(304);

  const stories = getStoryByExpeditie(expeditie._id);
  const nodes = await getPopulatedNodesByExpeditie(expeditie._id);

  res.setHeader(H_SC, (await storyCount).toString(16));
  res.setHeader(H_LS, (await lastStory).toHexString());

  const result = {
    nodes: nodes.map((node, index) => {
      return {
        id: node._id.toHexString(),
        nodeNum: index,
        timeFrom: node.timeFrom,
        timeTill: node.timeTill,
        personNames: node.personIds.map((p) => `${p.firstName} ${p.lastName}`), // FIXME: see geonodes model
      };
    }),
    story: await Promise.all(
      (
        await stories
      ).map(async (story) => {
        const nodeIdx = nodes.findIndex(
          (node) =>
            story.dateTime.stamp >= node.timeFrom &&
            story.dateTime.stamp < node.timeTill && // fixme: does this comparison take timezone into account for both sides?
            node.personIds.some((p) => p._id.equals(story.personId))
        ); // FIXME: see geonodes model

        const storyLocation = (
          await geoLocationModel
            .find(
              {
                expeditieId: expeditie._id,
                personId: { $in: nodes[nodeIdx].personIds },
                "dateTime.stamp": { $gte: story.dateTime.stamp },
              },
              { _id: false, longitude: true, latitude: true }
            )
            .sort({ "dateTime.stamp": 1 })
            .limit(1)
            .exec()
        )[0];

        const media =
          (story as HydratedDocument<MediaStoryElement>).media || [];

        return {
          id: story._id.toHexString(),
          type: story.type,
          nodeNum: nodeIdx,
          dateTime: {
            stamp: story.dateTime.stamp,
            zone: story.dateTime.zone,
          },
          title: (story as HydratedDocument<TextStoryElement>).title,
          text: (story as HydratedDocument<TextStoryElement>).text,
          name: (story as HydratedDocument<LocationStoryElement>).name,
          latitude: storyLocation?.latitude || 0,
          longitude: storyLocation?.longitude || 0,
          media: media.map((medium) => ({
            file: `/media/${medium.file}`,
            description: medium.description,
          })),
        };
      })
    ),
    finished: expeditie.finished,
  };

  res.end(JSON.stringify(result));
});
