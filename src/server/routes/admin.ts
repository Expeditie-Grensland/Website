import fastifyMultipart from "@fastify/multipart";
import { FastifyPluginAsync, FastifyReply, FastifyRequest } from "fastify";
import { ZodError, z } from "zod";
import { fromZodError } from "zod-validation-error";
import { addAfko, deleteAfko, getAllAfkos, updateAfko } from "../db/afko.js";
import {
  addEarnedPoint,
  deleteEarnedPoint,
  getAllEarnedPoints,
  updateEarnedPoint,
} from "../db/earned-point.js";
import { getAllExpedities } from "../db/expeditie.js";
import { getAllPersons } from "../db/person.js";
import {
  addQuote,
  deleteQuote,
  getAllQuotes,
  updateQuote,
} from "../db/quote.js";
import {
  addStory,
  deleteStory,
  getAllStories,
  updateStory,
} from "../db/story.js";
import { addWord, deleteWord, getAllWords, updateWord } from "../db/word.js";
import { deleteS3Prefix, getS3Files } from "../files/s3.js";
import { getUsesForFiles } from "../files/uses.js";
import {
  getISODate,
  isValidTimeZone,
  parseISODateTimeStamp,
} from "../helpers/time.js";
import { insertLocationsFromGpx } from "../db/geo.js";

const timeZoneSchema = z
  .string()
  .refine(isValidTimeZone, { message: "Geen geldige tijdzone" });

const idSchema = z.string().regex(/^[a-z0-9-]+/, {
  message: "Mag alleen kleine letters, cijfers en streepjes bevatten",
});

const idParamsSchema = z.object({
  id: idSchema,
});

const numIdParamsSchema = z.object({
  id: z.coerce.number(),
});

const localTimeTransformer = <
  T extends { time_local: string; time_zone: string }
>({
  time_local,
  ...rest
}: T) => ({
  ...rest,
  time_stamp: parseISODateTimeStamp(time_local, rest.time_zone),
});

const tryCatchAndRedirect =
  (
    redirectTo: string,
    func: (request: FastifyRequest, reply: FastifyReply) => Promise<string>
  ) =>
  async (request: FastifyRequest, reply: FastifyReply) => {
    try {
      request.flash("info", await func(request, reply));
    } catch (e) {
      let errorMsg = "Error!";

      if (typeof e === "string") errorMsg = e;
      else if (e instanceof ZodError) errorMsg = fromZodError(e).message;
      else if (e instanceof Error) errorMsg = e.message;

      request.flash("error", errorMsg);
    }
    reply.redirect(`/leden/admin${redirectTo}`);
    return reply;
  };

const adminRoutes: FastifyPluginAsync = async (app) => {
  app.addHook("onRequest", async (request, reply) => {
    if (reply.locals.user?.type != "admin") reply.redirect("/leden");
  });

  await app.register(fastifyMultipart, {
    attachFieldsToBody: "keyValues",
    limits: {
      files: 500,
      fields: 500,
      fileSize: 25000000,
    },
  });

  app.get("/citaten", async (request, reply) =>
    reply.view("admin/quotes", {
      fluidContainer: true,
      quotes: await getAllQuotes(),
      infoMsgs: reply.flash("info"),
      errMsgs: reply.flash("error"),
      getISODate,
    })
  );

  const quoteSchema = z
    .object({
      id: idSchema,
      quote: z.string(),
      quotee: z.string(),
      context: z.string(),
      attachment_file: z.string().optional(),
      time_local: z.string(),
      time_zone: timeZoneSchema,
    })
    .transform(localTimeTransformer);

  app.post(
    "/citaten/add",
    tryCatchAndRedirect("/citaten", async (request) => {
      const q = await addQuote(quoteSchema.parse(request.body));
      return `"${q.quote}" is successvol toegevoegd`;
    })
  );

  app.post(
    "/citaten/update/:id",
    tryCatchAndRedirect("/citaten", async (request) => {
      const { id } = idParamsSchema.parse(request.params);
      const q = await updateQuote(id, quoteSchema.parse(request.body));
      return `"${q.quote}" is successvol gewijzigd`;
    })
  );

  app.post(
    "/citaten/delete/:id",
    tryCatchAndRedirect("/citaten", async (request) => {
      const { id } = idParamsSchema.parse(request.params);
      const q = await deleteQuote(id);
      return `"${q.quote}" is successvol verwijderd`;
    })
  );

  app.get("/woordenboek", async (request, reply) =>
    reply.view("admin/dictionary", {
      fluidContainer: true,
      words: await getAllWords(),
      infoMsgs: reply.flash("info"),
      errMsgs: reply.flash("error"),
    })
  );

  const wordSchema = z.object({
    id: idSchema,
    word: z.string(),
    definitions: z.array(z.string()).nonempty(),
    phonetic: z.string().optional(),
    attachment_file: z.string().optional(),
  });

  app.post(
    "/woordenboek/add",
    tryCatchAndRedirect("/woordenboek", async (request) => {
      const w = await addWord(wordSchema.parse(request.body));
      return `"${w.word}" is successvol toegevoegd`;
    })
  );

  app.post(
    "/woordenboek/update/:id",
    tryCatchAndRedirect("/woordenboek", async (request) => {
      const { id } = idParamsSchema.parse(request.params);
      const w = await updateWord(id, wordSchema.parse(request.body));
      return `"${w.word}" is successvol gewijzigd`;
    })
  );

  app.post(
    "/woordenboek/delete/:id",
    tryCatchAndRedirect("/woordenboek", async (request) => {
      const { id } = idParamsSchema.parse(request.params);
      const w = await deleteWord(id);
      return `"${w.word}" is successvol verwijderd`;
    })
  );

  app.get("/afkowobo", async (request, reply) =>
    reply.view("admin/afkowobo", {
      fluidContainer: true,
      afkos: await getAllAfkos(),
      infoMsgs: reply.flash("info"),
      errMsgs: reply.flash("error"),
    })
  );

  const afkoSchema = z.object({
    id: idSchema,
    afko: z.string(),
    definitions: z.array(z.string().nonempty()).nonempty(),
    attachment_file: z.string().optional(),
  });

  app.post(
    "/afkowobo/add",
    tryCatchAndRedirect("/afkowobo", async (request) => {
      const a = await addAfko(afkoSchema.parse(request.body));
      return `"${a.afko}" is successvol toegevoegd`;
    })
  );

  app.post(
    "/afkowobo/update/:id",
    tryCatchAndRedirect("/afkowobo", async (request) => {
      const { id } = idParamsSchema.parse(request.params);
      const a = await updateAfko(id, afkoSchema.parse(request.body));
      return `"${a.afko}" is successvol gewijzigd`;
    })
  );

  app.post(
    "/afkowobo/delete/:id",
    tryCatchAndRedirect("/afkowobo", async (request) => {
      const { id } = idParamsSchema.parse(request.params);
      const a = await deleteAfko(id);
      return `"${a.afko}" is successvol verwijderd`;
    })
  );

  app.get("/punten", async (request, reply) =>
    reply.view("admin/earnedPoints", {
      fluidContainer: true,
      earnedPoints: await getAllEarnedPoints(),
      expedities: await getAllExpedities(),
      persons: await getAllPersons(),
      infoMsgs: reply.flash("info"),
      errMsgs: reply.flash("error"),
      getISODate,
    })
  );

  const pointSchema = z
    .object({
      person_id: z.string(),
      expeditie_id: z.string().transform((x) => (x == "-" ? null : x)),
      team: z.enum(["r", "b"]),
      amount: z.coerce.number().int(),
      time_local: z.string(),
      time_zone: timeZoneSchema,
    })
    .transform(localTimeTransformer);

  app.post(
    "/punten/add",
    tryCatchAndRedirect("/punten", async (request) => {
      const earnedPoint = pointSchema.parse(request.body);
      const p = await addEarnedPoint(earnedPoint);
      return `${p.amount} punten zijn successvol toegevoegd`;
    })
  );

  app.post(
    "/punten/update/:id",
    tryCatchAndRedirect("/punten", async (request) => {
      const { id } = numIdParamsSchema.parse(request.params);
      const p = await updateEarnedPoint(id, pointSchema.parse(request.body));
      return `${p.amount} punten zijn successvol gewijzigd`;
    })
  );

  app.post(
    "/punten/delete/:id",
    tryCatchAndRedirect("/punten", async (request) => {
      const { id } = numIdParamsSchema.parse(request.params);
      const p = await deleteEarnedPoint(id);
      return `${p.amount} punten zijn successvol verwijderd`;
    })
  );

  app.get("/gpx", async (request, reply) =>
    reply.view("admin/gpx", {
      expedities: await getAllExpedities(),
      persons: await getAllPersons(),
      infoMsgs: reply.flash("info"),
      errMsgs: reply.flash("error"),
    })
  );

  const gpxSchema = z.object({
    person_id: z.string(),
    expeditie_id: z.string(),
    time_zone: timeZoneSchema,
    file: z.array(z.instanceof(Buffer)),
  });

  app.post(
    "/gpx/upload",
    tryCatchAndRedirect("/gpx", async (request) => {
      const { file: files, ...location } = gpxSchema.parse(request.body);

      let count = 0n;

      for (const file of files) {
        count += await insertLocationsFromGpx(location, file);
      }

      return `${count} locaties zijn succesvol geüpload`;
    })
  );

  app.get("/verhalen", async (request, reply) =>
    reply.view("admin/story", {
      fluidContainer: true,
      expedities: await getAllExpedities(),
      persons: await getAllPersons(),
      stories: await getAllStories(),
      infoMsgs: reply.flash("info"),
      errMsgs: reply.flash("error"),
      getISODate,
    })
  );

  const storySchema = z
    .object({
      expeditie_id: z.string(),
      person_id: z.string(),
      time_local: z.string(),
      time_zone: timeZoneSchema,
      title: z.string(),
      text: z.string().optional(),
      media_ids: z
        .array(
          z
            .literal("")
            .transform(() => undefined)
            .or(z.coerce.number().int())
        )
        .default([]),
      media_files: z.array(z.string()).default([]),
      media_descriptions: z.array(z.string()).default([]),
    })
    .refine(
      ({ media_ids, media_files, media_descriptions }) =>
        media_ids.length === media_files.length &&
        media_files.length == media_descriptions.length,
      {
        message: "Media aantallen zijn niet gelijk",
        path: ["media_files"],
      }
    )
    .transform(localTimeTransformer)
    .transform(({ media_ids, media_files, media_descriptions, ...rest }) => ({
      ...rest,
      media: media_files.map((file, i) => ({
        id: media_ids[i],
        file,
        description: media_descriptions[i],
      })),
    }));

  app.post(
    "/verhalen/add",
    tryCatchAndRedirect("/verhalen", async (request) => {
      const s = await addStory(storySchema.parse(request.body));
      return `"${s.title}" is successvol toegevoegd`;
    })
  );

  app.post(
    "/verhalen/update/:id",
    tryCatchAndRedirect("/verhalen", async (request) => {
      const { id } = numIdParamsSchema.parse(request.params);
      const s = await updateStory(id, storySchema.parse(request.body));
      return `"${s.title}" is successvol gewijzigd`;
    })
  );

  app.post(
    "/verhalen/delete/:id",
    tryCatchAndRedirect("/verhalen", async (request) => {
      const { id } = numIdParamsSchema.parse(request.params);
      const s = await deleteStory(id);
      return `"${s.title}" is successvol verwijderd`;
    })
  );

  app.get("/bestanden", async (request, reply) =>
    reply.view("admin/files", {
      filesWithUses: await getUsesForFiles(await getS3Files()),
      infoMsgs: reply.flash("info"),
      errMsgs: reply.flash("error"),
    })
  );

  const keyParamsSchema = z.object({
    key: z.string().min(1),
  });

  app.post(
    "/bestanden/delete/:key",
    tryCatchAndRedirect("/bestanden", async (request) => {
      const { key } = keyParamsSchema.parse(request.params);
      await deleteS3Prefix(key);
      return `Bestand '${key}' is successvol verwijderd`;
    })
  );
};

export default adminRoutes;
