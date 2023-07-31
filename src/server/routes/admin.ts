import express from "express";
import mongoose, { HydratedDocument } from "mongoose";
import multer from "multer";

import { ZodError, ZodTypeAny, z } from "zod";
import { fromZodError } from "zod-validation-error";
import {
  getISODate,
  getInternalFromISODate,
  isValidTimeZone,
} from "../components/dateTime/dateHelpers.js";
import {
  getAllPoints,
  getPointsById,
} from "../components/earnedPoints/index.js";
import {
  EarnedPoint,
  EarnedPointModel,
} from "../components/earnedPoints/model.js";
import {
  getAllExpedities,
  getExpeditieById,
} from "../components/expedities/index.js";
import { generateLocations } from "../components/geoLocations/gpxHelper.js";
import { createManyLocations } from "../components/geoLocations/index.js";
import { getAllPeople, getPersonById } from "../components/people/index.js";
import { getAllQuotes, getQuoteById } from "../components/quotes/index.js";
import { Quote, QuoteModel } from "../components/quotes/model.js";
import {
  getAllStories,
  getStoryById,
} from "../components/storyElements/index.js";
import {
  BaseStoryElement,
  BaseStoryElementModel,
  StoryElement,
} from "../components/storyElements/model.js";
import { getAllWords, getWordById } from "../components/words/index.js";
import { Word, WordModel } from "../components/words/model.js";
import { loginRedirect, noAdminRedirect } from "../helpers/auth.js";

export const router = express.Router();

router.use(loginRedirect);
router.use(noAdminRedirect);

type GetById<T> = (
  id: mongoose.Types.ObjectId
) => Promise<HydratedDocument<T> | null>;

const zDocument = <T>(getById: GetById<T>) =>
  z
    .string()
    .refine(mongoose.Types.ObjectId.isValid, {
      message: "Is geen geldige id",
    })
    .transform((val) => new mongoose.Types.ObjectId(val))
    .transform(async (id) => await getById(id))
    .refine((obj): obj is HydratedDocument<T> => !!obj, {
      message: "Item bestaat niet",
    });

const zOptionalWithNone = <T extends ZodTypeAny>(zObj: T) =>
  z.union([z.literal("none").transform(() => undefined), zObj]);

const zActionFromBody = z
  .object({
    action: z.enum(["add", "change", "delete"]),
  })
  .transform((x) => x.action);

const zDocumentFromBodyId = <T>(getById: GetById<T>) =>
  z
    .object({
      id: zDocument<T>(getById),
    })
    .transform(({ id }) => id!);

const zTimeZone = z
  .string()
  .refine(isValidTimeZone, { message: "Geen geldige tijdzone" });

const tryCatchAndRedirect =
  (func: (req: express.Request, res: express.Response) => Promise<string>) =>
  async (req: express.Request, res: express.Response) => {
    try {
      req.flash("info", await func(req, res));
    } catch (e) {
      let errorMsg = "Error!";

      if (typeof e === "string") errorMsg = e;
      else if (e instanceof ZodError) errorMsg = fromZodError(e).message;
      else if (e instanceof Error) errorMsg = e.message;

      req.flash("error", errorMsg);
    } finally {
      res.redirect(req.originalUrl);
    }
  };

router.get("/citaten", async (req, res) =>
  res.render("admin/quotes", {
    fluidContainer: true,
    quotes: await getAllQuotes(),
    infoMsgs: req.flash("info"),
    errMsgs: req.flash("error"),
    getISODate,
  })
);

const quoteSchema = z.object({
  quote: z.string(),
  quotee: z.string(),
  context: z.string(),
  file: z.string().optional(),
  time: z.string(),
  zone: zTimeZone,
});

const quoteDocSchema = zDocumentFromBodyId<Quote>(getQuoteById);

router.post(
  "/citaten",
  tryCatchAndRedirect(async (req) => {
    const action = zActionFromBody.parse(req.body);

    if (action === "delete") {
      const doc = await quoteDocSchema.parseAsync(req.body);
      const result = await doc.deleteOne();
      return `Citaat "${result.quote}" is succesvol verwijderd`;
    }

    const input = await quoteSchema.parseAsync(req.body);

    const quote: Quote = {
      quote: input.quote,
      quotee: input.quotee,
      context: input.context,
      attachmentFile: input.file || undefined,
      dateTime: getInternalFromISODate(input.time, input.zone),
    };

    if (action === "change") {
      const doc = await quoteDocSchema.parseAsync(req.body);
      const result = await doc.overwrite(quote).save();
      return `Citaat "${result.quote}" is succesvol gewijzigd`;
    }

    const result = await new QuoteModel(quote).save();
    return `Citaat "${result.quote}" is successvol toegevoegd`;
  })
);

router.get("/woordenboek", async (req, res) =>
  res.render("admin/dictionary", {
    fluidContainer: true,
    words: await getAllWords(),
    infoMsgs: req.flash("info"),
    errMsgs: req.flash("error"),
  })
);

const wordSchema = z.object({
  word: z.string(),
  definitions: z.array(z.string().nonempty()).nonempty(),
  phonetic: z.string().optional(),
  file: z.string().optional(),
});

const wordDocSchema = zDocumentFromBodyId<Word>(getWordById);

router.post(
  "/woordenboek",
  tryCatchAndRedirect(async (req) => {
    const action = zActionFromBody.parse(req.body);

    if (action === "delete") {
      const doc = await wordDocSchema.parseAsync(req.body);
      const result = await doc.deleteOne();
      return `Woord "${result.word}" is succesvol verwijderd`;
    }

    const input = await wordSchema.parseAsync(req.body);

    const word: Word = {
      word: input.word,
      definitions: input.definitions,
      phonetic: input.phonetic || undefined,
      attachmentFile: input.file || undefined,
    };

    if (action === "change") {
      const doc = await wordDocSchema.parseAsync(req.body);
      const result = await doc.overwrite(word).save();
      return `Woord "${result.word}" is succesvol gewijzigd`;
    }

    const result = await new WordModel(word).save();
    return `Woord "${result.word}" is successvol toegevoegd`;
  })
);

router.get("/punten", async (req, res) =>
  res.render("admin/earnedPoints", {
    fluidContainer: true,
    earnedPoints: await getAllPoints(),
    expedities: await getAllExpedities(),
    people: await getAllPeople(),
    infoMsgs: req.flash("info"),
    errMsgs: req.flash("error"),
    getISODate,
  })
);

const pointSchema = z.object({
  person: zDocument(getPersonById),
  expeditie: zOptionalWithNone(zDocument(getExpeditieById)),
  amount: z.coerce.number().int(),
  time: z.string(),
  zone: zTimeZone,
});

const pointDocSchema = zDocumentFromBodyId(getPointsById);

router.post(
  "/punten",
  tryCatchAndRedirect(async (req) => {
    const action = zActionFromBody.parse(req.body);

    if (action === "delete") {
      const doc = await pointDocSchema.parseAsync(req.body);
      const result = await doc.deleteOne();
      return `Punt "${result._id.toHexString()}" is succesvol verwijderd`;
    }

    const input = await pointSchema.parseAsync(req.body);

    const point: EarnedPoint = {
      personId: input.person._id,
      expeditieId: input.expeditie?._id,
      amount: input.amount,
      dateTime: getInternalFromISODate(input.time, input.zone),
    };

    if (action === "change") {
      const doc = await pointDocSchema.parseAsync(req.body);
      const result = await doc.overwrite(point).save();
      return `Punt "${result._id.toHexString()}" is succesvol gewijzigd`;
    }

    const result = await new EarnedPointModel(point).save();
    return `Punt "${result._id.toHexString()}" is successvol toegevoegd`;
  })
);

router.get("/gpx", async (req, res) =>
  res.render("admin/gpx", {
    expedities: await getAllExpedities(),
    people: await getAllPeople(),
    infoMsgs: req.flash("info"),
    errMsgs: req.flash("error"),
  })
);

const gpxUploadSchema = z.object({
  person: zDocument(getPersonById),
  expeditie: zDocument(getExpeditieById).refine((exp) => !exp.finished, {
    message: "Expeditie is beëindigd",
  }),
  zone: zTimeZone,
});

router.post(
  "/gpx",
  multer({ storage: multer.memoryStorage() }).single("file"),
  tryCatchAndRedirect(async (req) => {
    const input = await gpxUploadSchema.parseAsync(req.body);

    if (!req.file) throw new Error("Geen bestand gevonden");

    void (await createManyLocations(
      await generateLocations(
        req.file.buffer,
        input.expeditie._id,
        input.person._id,
        input.zone
      )
    ));

    return "Locaties zijn succesvol geüpload";
  })
);

router.get("/story", async (req, res) =>
  res.render("admin/story", {
    fluidContainer: true,
    expedities: await getAllExpedities(),
    people: await getAllPeople(),
    stories: await getAllStories(),
    infoMsgs: req.flash("info"),
    errMsgs: req.flash("error"),
    getISODate,
  })
);

const storySchema = z
  .discriminatedUnion("type", [
    z.object({
      type: z.literal("text"),
      expeditie: zDocument(getExpeditieById),
      person: zDocument(getPersonById),
      time: z.string(),
      zone: zTimeZone,
      title: z.string().nonempty(),
      text: z.string().nonempty(),
    }),
    z.object({
      type: z.literal("location"),
      expeditie: zDocument(getExpeditieById),
      person: zDocument(getPersonById),
      time: z.string(),
      zone: zTimeZone,
      name: z.string().nonempty(),
    }),
    z.object({
      type: z.literal("media"),
      expeditie: zDocument(getExpeditieById),
      person: zDocument(getPersonById),
      time: z.string(),
      zone: zTimeZone,
      title: z.string(),
      files: z.array(z.string().nonempty()),
      descriptions: z.array(z.string()),
    }),
  ])
  .refine(
    (story) =>
      story.type !== "media" ||
      story.files.length === story.descriptions.length,
    {
      message: "Aantal bestanden en beschrijvingen is niet gelijk",
      path: ["descriptions"],
    }
  );

const storyDocSchema = zDocumentFromBodyId<BaseStoryElement>(getStoryById);

router.post(
  "/story",
  tryCatchAndRedirect(async (req) => {
    const action = zActionFromBody.parse(req.body);

    if (action === "delete") {
      const doc = await storyDocSchema.parseAsync(req.body);
      const result = await doc.deleteOne();
      return `Verhaal "${result._id.toHexString()}" is succesvol verwijderd`;
    }

    const input = await storySchema.parseAsync(req.body);

    const baseStory = {
      type: input.type,
      expeditieId: input.expeditie._id,
      personId: input.person._id,
      dateTime: getInternalFromISODate(input.time, input.zone),
      index: 0,
    };

    let story: StoryElement;

    if (input.type === "text")
      story = {
        ...baseStory,
        title: input.title,
        text: input.text,
      };
    else if (input.type === "location")
      story = {
        ...baseStory,
        name: input.name,
      };
    else
      story = {
        ...baseStory,
        title: input.title,
        media: input.files.map((file, i) => ({
          file,
          description: input.descriptions[i],
        })),
      };

    if (action === "change") {
      const doc = await storyDocSchema.parseAsync(req.body);
      const result = await doc.overwrite(story).save();
      return `Verhaal "${result._id.toHexString()}" is succesvol gewijzigd`;
    }

    const result = await new BaseStoryElementModel(story).save();
    return `Verhaal "${result._id.toHexString()}" is successvol toegevoegd`;
  })
);
