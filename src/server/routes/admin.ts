import mongoose, { HydratedDocument } from "mongoose";

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
import { FastifyPluginAsync, FastifyReply, FastifyRequest } from "fastify";
import { getMessages, setMessage } from "../helpers/flash.js";
import fastifyMultipart from "@fastify/multipart";
import { getFileList, getFileType } from "../helpers/files.js";

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
  (func: (request: FastifyRequest, reply: FastifyReply) => Promise<string>) =>
  async (request: FastifyRequest, reply: FastifyReply) => {
    try {
      setMessage(request.session, "infoMsg", await func(request, reply));
    } catch (e) {
      let errorMsg = "Error!";

      if (typeof e === "string") errorMsg = e;
      else if (e instanceof ZodError) errorMsg = fromZodError(e).message;
      else if (e instanceof Error) errorMsg = e.message;

      setMessage(request.session, "errorMsg", errorMsg);
    }
    reply.redirect(302, request.url);
  };

const adminRoutes: FastifyPluginAsync = async (app) => {
  app.addHook("onRequest", async (request, reply) => {
    if (!reply.locals.user?.isAdmin) reply.redirect(302, "/leden");
  });

  await app.register(fastifyMultipart, {
    attachFieldsToBody: "keyValues",
    limits: {
      fileSize: 25000000,
    },
  });

  app.get("/citaten", async (request, reply) =>
    reply.view("admin/quotes", {
      fluidContainer: true,
      quotes: await getAllQuotes(),
      infoMsgs: getMessages(request.session, "infoMsg"),
      errMsgs: getMessages(request.session, "errorMsg"),
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

  app.post(
    "/citaten",
    tryCatchAndRedirect(async (request) => {
      const action = zActionFromBody.parse(request.body);

      if (action === "delete") {
        const doc = await quoteDocSchema.parseAsync(request.body);
        const result = await doc.deleteOne();
        return `Citaat "${result.quote}" is succesvol verwijderd`;
      }

      const input = await quoteSchema.parseAsync(request.body);

      const quote: Quote = {
        quote: input.quote,
        quotee: input.quotee,
        context: input.context,
        attachmentFile: input.file || undefined,
        dateTime: getInternalFromISODate(input.time, input.zone),
      };

      if (action === "change") {
        const doc = await quoteDocSchema.parseAsync(request.body);
        const result = await doc.overwrite(quote).save();
        return `Citaat "${result.quote}" is succesvol gewijzigd`;
      }

      const result = await new QuoteModel(quote).save();
      return `Citaat "${result.quote}" is successvol toegevoegd`;
    })
  );

  app.get("/woordenboek", async (request, reply) =>
    reply.view("admin/dictionary", {
      fluidContainer: true,
      words: await getAllWords(),
      infoMsgs: getMessages(request.session, "infoMsg"),
      errMsgs: getMessages(request.session, "errorMsg"),
    })
  );

  const wordSchema = z.object({
    word: z.string(),
    definitions: z.array(z.string().nonempty()).nonempty(),
    phonetic: z.string().optional(),
    file: z.string().optional(),
  });

  const wordDocSchema = zDocumentFromBodyId<Word>(getWordById);

  app.post(
    "/woordenboek",
    tryCatchAndRedirect(async (request) => {
      const action = zActionFromBody.parse(request.body);

      if (action === "delete") {
        const doc = await wordDocSchema.parseAsync(request.body);
        const result = await doc.deleteOne();
        return `Woord "${result.word}" is succesvol verwijderd`;
      }

      const input = await wordSchema.parseAsync(request.body);

      const word: Word = {
        word: input.word,
        definitions: input.definitions,
        phonetic: input.phonetic || undefined,
        attachmentFile: input.file || undefined,
      };

      if (action === "change") {
        const doc = await wordDocSchema.parseAsync(request.body);
        const result = await doc.overwrite(word).save();
        return `Woord "${result.word}" is succesvol gewijzigd`;
      }

      const result = await new WordModel(word).save();
      return `Woord "${result.word}" is successvol toegevoegd`;
    })
  );

  app.get("/punten", async (request, reply) =>
    reply.view("admin/earnedPoints", {
      fluidContainer: true,
      earnedPoints: await getAllPoints(),
      expedities: await getAllExpedities(),
      people: await getAllPeople(),
      infoMsgs: getMessages(request.session, "infoMsg"),
      errMsgs: getMessages(request.session, "errorMsg"),
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

  app.post(
    "/punten",
    tryCatchAndRedirect(async (request) => {
      const action = zActionFromBody.parse(request.body);

      if (action === "delete") {
        const doc = await pointDocSchema.parseAsync(request.body);
        const result = await doc.deleteOne();
        return `Punt "${result._id.toHexString()}" is succesvol verwijderd`;
      }

      const input = await pointSchema.parseAsync(request.body);

      const point: EarnedPoint = {
        personId: input.person._id,
        expeditieId: input.expeditie?._id,
        amount: input.amount,
        dateTime: getInternalFromISODate(input.time, input.zone),
      };

      if (action === "change") {
        const doc = await pointDocSchema.parseAsync(request.body);
        const result = await doc.overwrite(point).save();
        return `Punt "${result._id.toHexString()}" is succesvol gewijzigd`;
      }

      const result = await new EarnedPointModel(point).save();
      return `Punt "${result._id.toHexString()}" is successvol toegevoegd`;
    })
  );

  app.get("/gpx", async (request, reply) =>
    reply.view("admin/gpx", {
      expedities: await getAllExpedities(),
      people: await getAllPeople(),
      infoMsgs: getMessages(request.session, "infoMsg"),
      errMsgs: getMessages(request.session, "errorMsg"),
    })
  );

  const gpxUploadSchema = z.object({
    person: zDocument(getPersonById),
    expeditie: zDocument(getExpeditieById).refine((exp) => !exp.finished, {
      message: "Expeditie is beëindigd",
    }),
    zone: zTimeZone,
    file: z.string(),
  });

  app.post(
    "/gpx",
    tryCatchAndRedirect(async (request) => {
      const input = await gpxUploadSchema.parseAsync(request.body);

      // if (!file || typeof file != "object" || !("buffer" in file))
      //   throw new Error("Geen bestand gevonden");

      void (await createManyLocations(
        await generateLocations(
          input.file,
          input.expeditie._id,
          input.person._id,
          input.zone
        )
      ));

      return "Locaties zijn succesvol geüpload";
    })
  );

  app.get("/story", async (request, reply) =>
    reply.view("admin/story", {
      fluidContainer: true,
      expedities: await getAllExpedities(),
      people: await getAllPeople(),
      stories: await getAllStories(),
      infoMsgs: getMessages(request.session, "infoMsg"),
      errMsgs: getMessages(request.session, "errorMsg"),
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

  app.post(
    "/story",
    tryCatchAndRedirect(async (request) => {
      const action = zActionFromBody.parse(request.body);

      if (action === "delete") {
        const doc = await storyDocSchema.parseAsync(request.body);
        const result = await doc.deleteOne();
        return `Verhaal "${result._id.toHexString()}" is succesvol verwijderd`;
      }

      const input = await storySchema.parseAsync(request.body);

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
        const doc = await storyDocSchema.parseAsync(request.body);
        const result = await doc.overwrite(story).save();
        return `Verhaal "${result._id.toHexString()}" is succesvol gewijzigd`;
      }

      const result = await new BaseStoryElementModel(story).save();
      return `Verhaal "${result._id.toHexString()}" is successvol toegevoegd`;
    })
  );

  app.get("/bestanden", async (request, reply) =>
    reply.view("admin/files", {
      files: await getFileList(),
      getFileType: getFileType,
    })
  );
};

export default adminRoutes;
