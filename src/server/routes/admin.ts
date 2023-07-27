import express from "express";
import { Info } from "luxon";
import mongoose, { HydratedDocument } from "mongoose";
import multer from "multer";

import { ZodError, z } from "zod";
import { fromZodError } from "zod-validation-error";
import {
  getISODate,
  getInternalFromISODate,
} from "../components/dateTime/dateHelpers.js";
import {
  getAllPoints,
  getPointsById,
} from "../components/earnedPoints/index.js";
import { EarnedPointModel } from "../components/earnedPoints/model.js";
import {
  getAllExpedities,
  getExpeditieById,
} from "../components/expedities/index.js";
import { generateLocations } from "../components/geoLocations/gpxHelper.js";
import { createManyLocations } from "../components/geoLocations/index.js";
import { GeoLocation } from "../components/geoLocations/model.js";
import { getAllPeople, getPersonById } from "../components/people/index.js";
import { getAllQuotes, getQuoteById } from "../components/quotes/index.js";
import { Quote, QuoteModel } from "../components/quotes/model.js";
import {
  getAllStories,
  getStoryById,
} from "../components/storyElements/index.js";
import {
  BaseStoryElementModel,
  LocationStoryElementModel,
  MediaStoryElementModel,
  TextStoryElementModel,
} from "../components/storyElements/model.js";
import { getAllWords, getWordById } from "../components/words/index.js";
import { Word, WordModel } from "../components/words/model.js";
import { loginRedirect, noAdminRedirect } from "../helpers/authHelper.js";

export const router = express.Router();

router.use(loginRedirect);
router.use(noAdminRedirect);

const zNonEmptyArray = z
  .array(z.string())
  .transform((arr) => arr.filter((val) => val != ""))
  .refine((val) => val.length > 0, { message: "Lijst mag niet leeg zijn" });

const zObjectId = z
  .string()
  .length(24)
  .refine(mongoose.Types.ObjectId.isValid, {
    message: "Moet een Mongo ObjectId zijn",
  })
  .transform((val) => new mongoose.Types.ObjectId(val));

const testAndGetFromId = async <T extends mongoose.Document>(
  stringId: string,
  getById: (id: mongoose.Types.ObjectId) => Promise<T | null>,
  typeName: string
): Promise<T> => {
  let id;

  try {
    id = new mongoose.Types.ObjectId(stringId);
  } catch {
    throw new Error(`${typeName} '${stringId}' heeft geen geldige Id.`);
  }

  const result = await getById(id);

  if (!result) throw new Error(`${typeName} '${stringId}' bestaat niet.`);

  return result;
};

const testValidAction = (action: string, ...validActions: string[]): void =>
  testValidOption("actie", action, ...validActions);

const testValidOption = (
  name: string,
  option: string,
  ...validOptions: string[]
): void => {
  if (!validOptions.reduce((acc: boolean, cur) => acc || cur == option, false))
    throw new Error(`Er was geen geldige ${name} geselecteerd.`);
};

const testRequiredFields = (...fields: any[]): void => {
  if (fields.reduce((acc: boolean, cur) => acc || !cur, false))
    throw new Error("Niet alle verplichte velden waren ingevuld.");
};

const testAndGetNumber = (num: any, typeName: string): number => {
  const number = parseInt(num);

  if (isNaN(num)) throw new Error(`${typeName} is niet een nummer.`);

  return number;
};

const testValidTimeZone = (zone: string) => {
  if (!Info.isValidIANAZone(zone))
    throw new Error(`Tijdzone ${zone} is niet geldig.`);
};

const tryCatchAndRedirect = async (
  req: express.Request,
  res: express.Response,
  destination: string,
  func: () => Promise<string>
) => {
  try {
    req.flash("info", await func());
  } catch (e) {
    let errorMsg = "Error!";

    if (typeof e === "string") errorMsg = e;
    else if (e instanceof ZodError) errorMsg = fromZodError(e).message;
    else if (e instanceof Error) errorMsg = e.message;

    req.flash("error", errorMsg);
  } finally {
    res.redirect(destination);
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
  zone: z.string(),
});

const quoteId = z.object({
  id: zObjectId
    .transform(async (id) => await getQuoteById(id))
    .refine((quote): quote is HydratedDocument<Quote> => !!quote, {
      message: "Quote bestaat niet",
    }),
});

const quotePostSchema = z.discriminatedUnion("action", [
  z.object({ action: z.literal("add") }).merge(quoteSchema),
  z
    .object({ action: z.literal("change") })
    .merge(quoteSchema)
    .merge(quoteId),
  z.object({ action: z.literal("delete") }).merge(quoteId),
]);

router.post(
  "/citaten",
  async (req, res) =>
    await tryCatchAndRedirect(req, res, "/admin/citaten", async () => {
      const input = await quotePostSchema.parseAsync(req.body);

      if (input.action === "delete") {
        const result = await input.id.deleteOne();
        return `Citaat "${result.quote}" is succesvol verwijderd`;
      }

      const quote: Quote = {
        quote: input.quote,
        quotee: input.quotee,
        context: input.context,
        attachmentFile: input.file || undefined,
        dateTime: getInternalFromISODate(input.time, input.zone),
      };

      if (input.action === "change") {
        const result = await input.id.overwrite(quote).save();
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
  definitions: zNonEmptyArray,
  phonetic: z.string().optional(),
  file: z.string().optional(),
});

const wordId = z.object({
  id: zObjectId
    .transform(async (id) => await getWordById(id))
    .refine((word): word is HydratedDocument<Word> => !!word, {
      message: "Woord bestaat niet",
    }),
});

const wordPostSchema = z.discriminatedUnion("action", [
  z.object({ action: z.literal("add") }).merge(wordSchema),
  z
    .object({ action: z.literal("change") })
    .merge(wordSchema)
    .merge(wordId),
  z.object({ action: z.literal("delete") }).merge(wordId),
]);

router.post(
  "/woordenboek",
  async (req, res) =>
    await tryCatchAndRedirect(req, res, "/admin/woordenboek", async () => {
      const input = await wordPostSchema.parseAsync(req.body);

      if (input.action === "delete") {
        const result = await input.id.deleteOne();
        return `Citaat "${result.word}" is succesvol verwijderd`;
      }

      const word: Word = {
        word: input.word,
        definitions: input.definitions,
        phonetic: input.phonetic || undefined,
        attachmentFile: input.file || undefined,
      };

      if (input.action === "change") {
        const result = await input.id.overwrite(word).save();
        return `Woord "${result.word}" is succesvol gewijzigd`;
      }

      const result = await new WordModel(word).save();
      return `Citaat "${result.word}" is successvol toegevoegd`;
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

router.post("/punten/add", async (req, res) =>
  tryCatchAndRedirect(req, res, "/admin/punten", async () => {
    const b = req.body;

    testRequiredFields(b.person, b.expeditie, b.amount, b.time, b.zone);

    const ep = new EarnedPointModel({
      amount: testAndGetNumber(b.amount, "Hoeveelheid"),
      personId: (await testAndGetFromId(b.person, getPersonById, "Persoon"))
        ._id,
      dateTime: getInternalFromISODate(b.time, b.zone),
    });

    if (b.expeditie != "none")
      ep.expeditieId = (
        await testAndGetFromId(b.expeditie, getExpeditieById, "Expeditie")
      )._id;
    else ep.expeditieId = undefined;

    return `Punt "${(
      await ep.save()
    )._id.toHexString()}" is succesvol toegevoegd.`;
  })
);

router.post("/punten/edit", (req, res) =>
  tryCatchAndRedirect(req, res, "/admin/punten", async () => {
    const b = req.body;

    testValidAction(b.action, "delete", "change");

    const ep = await testAndGetFromId(b.id, getPointsById, "Punt");

    if (b.action == "delete")
      return `Punt "${(
        await ep.deleteOne()
      )._id.toHexString()}" is succesvol verwijderd.`;

    testRequiredFields(b.person, b.expeditie, b.amount, b.time, b.zone);

    testAndGetNumber(b.amount, "Hoeveelheid");

    ep.amount = parseInt(b.amount);

    ep.personId = (
      await testAndGetFromId(b.person, getPersonById, "Persoon")
    )._id;

    if (b.expeditie != "none")
      ep.expeditieId = (
        await testAndGetFromId(b.expeditie, getExpeditieById, "Expeditie")
      )._id;
    else ep.expeditieId = undefined;

    ep.dateTime = getInternalFromISODate(b.time, b.zone);

    return `Punt "${(
      await ep.save()
    )._id.toHexString()}" is succesvol gewijzigd.`;
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

router.post(
  "/gpx/upload",
  multer({ storage: multer.memoryStorage() }).single("file"),
  (req, res) =>
    tryCatchAndRedirect(req, res, "/admin/gpx", async () => {
      const b = req.body;

      testRequiredFields(b.person, b.expeditie, req.file, b.zone);

      const person = await testAndGetFromId(b.person, getPersonById, "Persoon");
      const expeditie = await testAndGetFromId(
        b.expeditie,
        getExpeditieById,
        "Expeditie"
      );

      if (expeditie.finished)
        throw new Error(`Expeditie '${expeditie.name}' is beëindigd.`);

      testValidTimeZone(b.zone);

      let locs: GeoLocation[];

      try {
        if (!req.file) throw new Error("Er is geen bestand");
        locs = await generateLocations(
          req.file.buffer,
          expeditie._id,
          person._id,
          b.zone
        );
      } catch (e: any) {
        throw new Error(`Bestand kan niet worden gelezen: ${e.message}`);
      }

      await createManyLocations(locs);

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

router.post("/story/add", async (req, res) =>
  tryCatchAndRedirect(req, res, "/admin/story", async () => {
    const b = req.body;

    testRequiredFields(b.type, b.expeditie, b.person, b.time, b.zone);

    testValidOption("verhaaltype", b.type, "text", "location", "media");

    const expeditieId = (
      await testAndGetFromId(b.expeditie, getExpeditieById, "Expeditie")
    )._id;
    const personId = (
      await testAndGetFromId(b.person, getPersonById, "Persoon")
    )._id;

    if (b.type === "text") {
      testRequiredFields(b.title, b.text);

      const se = new TextStoryElementModel({
        type: b.type,
        expeditieId: expeditieId,
        personId: personId,
        title: b.title,
        text: b.text,
        dateTime: getInternalFromISODate(b.time, b.zone),
      });

      return `Tekstverhaalelement "${(
        await se.save()
      )._id.toHexString()}" is succesvol toegevoegd.`;
    }

    if (b.type === "location") {
      testRequiredFields(b.name);

      const se = new LocationStoryElementModel({
        type: b.type,
        expeditieId: expeditieId,
        personId: personId,
        name: b.name,
        dateTime: getInternalFromISODate(b.time, b.zone),
      });

      return `Locatieverhaalelement "${(
        await se.save()
      )._id.toHexString()}" is succesvol toegevoegd.`;
    }

    if (b.type === "media") {
      testRequiredFields(b.title, b.files, b.descriptions);

      const filesWithDesc = b.files
        .map((file: string, i: number) => [file, b.descriptions[i] || ""])
        .filter((f: any) => f[0]);

      if (filesWithDesc.length < 1)
        throw new Error("Er moet ten minste één bestand zijn");

      const se = new MediaStoryElementModel({
        type: b.type,
        expeditieId: expeditieId,
        personId: personId,
        title: b.title,
        text: b.text,
        media: filesWithDesc.map((file: any) => ({
          file: file[0],
          description: file[1],
        })),
        dateTime: getInternalFromISODate(b.time, b.zone),
      });

      return `Mediaverhaalelement "${(
        await se.save()
      )._id.toHexString()}" is succesvol toegevoegd.`;
    }

    return "onmogelijk";
  })
);

router.post("/story/edit", (req, res) =>
  tryCatchAndRedirect(req, res, "/admin/story", async () => {
    const b = req.body;

    testValidAction(b.action, "delete", "change");

    const se = await testAndGetFromId(b.id, getStoryById, "Verhaalelement");

    if (b.action == "delete") {
      return `Verhaalelement "${(
        await se.deleteOne()
      )._id.toHexString()}" is succesvol verwijderd.`;
    }

    testRequiredFields(b.expeditie, b.person, b.time, b.zone);

    const update = {
      type: se.type,
      personId: (await testAndGetFromId(b.person, getPersonById, "Persoon"))
        ._id,
      expeditieId: (
        await testAndGetFromId(b.expeditie, getExpeditieById, "Expeditie")
      )._id,
      dateTime: getInternalFromISODate(b.time, b.zone),
    };

    if (se.type === "text") {
      testRequiredFields(b.title, b.text);

      const res = await BaseStoryElementModel.replaceOne(
        { _id: b.id },
        {
          ...update,
          title: b.title,
          text: b.text,
        }
      ).exec();

      if (res.matchedCount === 0) throw new Error("update failed");

      return `Verhaalelement "${se._id.toHexString()}" is succesvol gewijzigd.`;
    }

    if (se.type === "location") {
      testRequiredFields(b.name);

      const res = await BaseStoryElementModel.replaceOne(
        { _id: b.id },
        {
          ...update,
          name: b.name,
        }
      ).exec();

      if (res.matchedCount === 0) throw new Error("update failed");

      return `Verhaalelement "${se._id.toHexString()}" is succesvol gewijzigd.`;
    }

    if (se.type === "media") {
      testRequiredFields(b.title, b.descriptions, b.files);

      const filesWithDesc = b.files
        .map((file: string, i: number) => [file, b.descriptions[i] || ""])
        .filter((f: any) => f[0]);

      if (filesWithDesc.length < 1)
        throw new Error("Er moet ten minste één bestand zijn");

      const res = await BaseStoryElementModel.replaceOne(
        { _id: b.id },
        {
          ...update,
          title: b.title,
          media: filesWithDesc.map((file: any) => ({
            file: file[0],
            description: file[1],
          })),
        }
      ).exec();

      if (res.matchedCount === 0) throw new Error("update failed");

      return `Verhaalelement "${se._id.toHexString()}" is succesvol gewijzigd.`;
    }

    return "onmogelijk";
  })
);
