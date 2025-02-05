import fastifyMultipart from "@fastify/multipart";
import {
  FastifyInstance,
  FastifyPluginAsync,
  FastifyReply,
  FastifyRequest,
} from "fastify";
import { z, ZodError, ZodTypeAny } from "zod";
import { fromZodError } from "zod-validation-error";
import { renderAfkowoboAdminPage } from "../components/pages/members/admin/afkowobo.js";
import { renderDictionaryAdminPage } from "../components/pages/members/admin/dictionary.js";
import { renderExpeditiesAdminPage } from "../components/pages/members/admin/expedities.js";
import { renderFilesAdminPage } from "../components/pages/members/admin/files.js";
import { renderGpxUploadAdminPage } from "../components/pages/members/admin/gpx.js";
import { renderPersonsAdminPage } from "../components/pages/members/admin/person.js";
import { renderPointsAdminPage } from "../components/pages/members/admin/points.js";
import { renderQuotesAdminPage } from "../components/pages/members/admin/quotes.js";
import { renderExpeditieSegmentsAdminPage } from "../components/pages/members/admin/segments.js";
import { renderStoryAdminPage } from "../components/pages/members/admin/story.js";
import { addAfko, deleteAfko, getAllAfkos, updateAfko } from "../db/afko.js";
import {
  addEarnedPoint,
  deleteEarnedPoint,
  getAllEarnedPoints,
  updateEarnedPoint,
} from "../db/earned-point.js";
import {
  addExpeditie,
  deleteExpeditie,
  getAllExpedities,
  getAllExpeditiesWithPeopleIds,
  updateExpeditie,
} from "../db/expeditie.js";
import {
  addLocations,
  addSegment,
  deleteSegment,
  getExpeditieSegments,
  updateSegment,
} from "../db/geo.js";
import {
  addPerson,
  deletePerson,
  getAllPersons,
  getAllPersonsWithAddresses,
  updatePerson,
} from "../db/person.js";
import {
  addQuote,
  deleteQuote,
  getAllQuotes,
  updateQuote,
} from "../db/quote.js";
import {
  addStories,
  addStory,
  deleteStory,
  getExpeditieStories,
  updateStory,
} from "../db/story.js";
import { addWord, deleteWord, getAllWords, updateWord } from "../db/word.js";
import { deleteS3Prefix, getS3Files } from "../files/s3.js";
import { getUsesForFiles } from "../files/uses.js";
import { promiseAllProps } from "../helpers/async.js";
import { parseGpx } from "../helpers/gpx.js";
import { afkoSchema } from "../validation-schemas/admin/afko.js";
import { pointSchema } from "../validation-schemas/admin/earned-point.js";
import { expeditieSchema } from "../validation-schemas/admin/expeditie.js";
import {
  gpxPrefixParamsSchema,
  gpxSchema,
} from "../validation-schemas/admin/gpx.js";
import {
  idParamsSchema,
  keyParamsSchema,
  numIdParamsSchema,
} from "../validation-schemas/admin/params.js";
import { personSchema } from "../validation-schemas/admin/person.js";
import { quoteSchema } from "../validation-schemas/admin/quote.js";
import {
  segmentPrefixParamsSchema,
  segmentSchema,
} from "../validation-schemas/admin/segment.js";
import {
  storyPrefixParamsSchema,
  storySchema,
} from "../validation-schemas/admin/story.js";
import { wordSchema } from "../validation-schemas/admin/word.js";

const friendlyError = (err: unknown) => {
  if (err instanceof ZodError) {
    return fromZodError(err).message;
  }

  if (err instanceof Error) {
    return err.message;
  }

  return `${err}`;
};

const executeAndFlash = async (
  req: FastifyRequest,
  func: () => string | Promise<string>
) => {
  try {
    req.flash("info", await func());
  } catch (err) {
    req.flash("error", friendlyError(err));
  }
};

type RegisterAdminRoute = <
  Schema extends ZodTypeAny,
  ParamSchema extends ZodTypeAny,
  PrefixSchema extends ZodTypeAny,
>(
  app: FastifyInstance,
  prefix: string,

  opts: {
    schema?: Schema;
    paramSchema?: ParamSchema;
    prefixSchema?: PrefixSchema;

    renderPage: (opts: {
      user: NonNullable<FastifyReply["locals"]["user"]>;
      messages: Record<string, string[]>;
      parsedPrefix: z.output<PrefixSchema>;
    }) => Promise<string>;

    addPath?: string;
    onAdd?: (
      obj: z.output<Schema>,
      extras: {
        parsedPrefix: z.output<PrefixSchema>;
      }
    ) => Promise<string>;

    updatePath?: string;
    onUpdate?: (
      params: z.output<ParamSchema>,
      obj: z.output<Schema>,
      extras: {
        parsedPrefix: z.output<PrefixSchema>;
      }
    ) => Promise<string>;

    deletePath?: string;
    onDelete?: (
      params: z.output<ParamSchema>,
      extras: {
        parsedPrefix: z.output<PrefixSchema>;
      }
    ) => Promise<string>;
  }
) => Promise<void>;

const returnToPage = (
  prefix: string,
  req: FastifyRequest,
  reply: FastifyReply
) => {
  reply.redirect(
    Object.getOwnPropertyNames(req.params).reduce(
      (url, key) =>
        url.replace(`:${key}`, (req.params as Record<string, string>)[key]),
      `/leden/admin${prefix}`
    )
  );

  return reply;
};

const registerAdminRoute: RegisterAdminRoute = async (
  app,
  prefix,
  {
    schema,
    paramSchema,
    prefixSchema,

    renderPage,

    addPath = "/add",
    onAdd,

    updatePath = "/update/:id",
    onUpdate,

    deletePath = "/delete/:id",
    onDelete,
  }
) =>
  await app.register(
    async (app) => {
      if (prefixSchema) {
        app.addHook("onRequest", async (req, reply) => {
          const { success, data } = await prefixSchema.safeParseAsync(
            req.params
          );
          if (!success) return reply.callNotFound();

          reply.locals.parsedPrefix = data;
        });
      }

      app.get("/", async (_req, reply) =>
        reply.sendHtml(
          await renderPage({
            user: reply.locals.user!,
            messages: reply.flash() as Record<string, string[]>,
            parsedPrefix: reply.locals.parsedPrefix,
          })
        )
      );

      if (schema && onAdd) {
        app.post(addPath, async (req, reply) => {
          await executeAndFlash(req, () =>
            onAdd(schema.parse(req.body), {
              parsedPrefix: reply.locals.parsedPrefix,
            })
          );

          return returnToPage(prefix, req, reply);
        });
      }

      if (schema && paramSchema && onUpdate) {
        app.post(updatePath, async (req, reply) => {
          await executeAndFlash(req, () =>
            onUpdate(paramSchema.parse(req.params), schema.parse(req.body), {
              parsedPrefix: reply.locals.parsedPrefix,
            })
          );

          return returnToPage(prefix, req, reply);
        });
      }

      if (paramSchema && onDelete) {
        app.post(deletePath, async (req, reply) => {
          await executeAndFlash(req, () =>
            onDelete(paramSchema.parse(req.params), {
              parsedPrefix: reply.locals.parsedPrefix,
            })
          );

          return returnToPage(prefix, req, reply);
        });
      }
    },
    { prefix }
  );

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

  await registerAdminRoute(app, "/woordenboek", {
    schema: wordSchema,
    paramSchema: idParamsSchema,

    renderPage: async ({ user, messages }) =>
      renderDictionaryAdminPage({
        words: await getAllWords(),
        user,
        messages,
      }),

    onAdd: async (word) =>
      `Woord "${(await addWord(word)).word}" is toegevoegd`,

    onUpdate: async ({ id }, word) =>
      `Woord "${(await updateWord(id, word)).word}" is gewijzigd`,

    onDelete: async ({ id }) =>
      `Woord "${(await deleteWord(id)).word}" is verwijderd`,
  });

  await registerAdminRoute(app, "/citaten", {
    schema: quoteSchema,
    paramSchema: idParamsSchema,

    renderPage: async ({ user, messages }) =>
      renderQuotesAdminPage({
        quotes: await getAllQuotes(),
        user,
        messages,
      }),

    onAdd: async (quote) =>
      `Citaat "${(await addQuote(quote)).quote}" is toegevoegd`,

    onUpdate: async ({ id }, quote) =>
      `Citaat "${(await updateQuote(id, quote)).quote}" is gewijzigd`,

    onDelete: async ({ id }) =>
      `Citaat "${(await deleteQuote(id)).quote}" is verwijderd`,
  });

  await registerAdminRoute(app, "/afkowobo", {
    schema: afkoSchema,
    paramSchema: idParamsSchema,

    renderPage: async ({ user, messages }) =>
      renderAfkowoboAdminPage({
        afkos: await getAllAfkos(),
        user,
        messages,
      }),

    onAdd: async (afko) => `Afko "${(await addAfko(afko)).afko}" is toegevoegd`,

    onUpdate: async ({ id }, afko) =>
      `Afko "${(await updateAfko(id, afko)).afko}" is gewijzigd`,

    onDelete: async ({ id }) =>
      `Afko "${(await deleteAfko(id)).afko}" is verwijderd`,
  });

  await registerAdminRoute(app, "/punten", {
    schema: pointSchema,
    paramSchema: numIdParamsSchema,

    renderPage: async ({ user, messages }) =>
      renderPointsAdminPage(
        await promiseAllProps({
          points: getAllEarnedPoints(),
          expedities: getAllExpedities(),
          persons: getAllPersons(true),
          user,
          messages,
        })
      ),

    onAdd: async (point) =>
      `${(await addEarnedPoint(point)).amount} punten zijn toegevoegd`,

    onUpdate: async ({ id }, point) =>
      `${(await updateEarnedPoint(id, point)).amount} punten zijn gewijzigd`,

    onDelete: async ({ id }) =>
      `${(await deleteEarnedPoint(id)).amount} punten zijn verwijderd`,
  });

  await registerAdminRoute(app, "/personen", {
    schema: personSchema,
    paramSchema: idParamsSchema,

    renderPage: async ({ user, messages }) =>
      renderPersonsAdminPage(
        await promiseAllProps({
          persons: getAllPersonsWithAddresses(),
          user,
          messages,
        })
      ),

    onAdd: async (person) => {
      const { first_name, last_name } = await addPerson(person);
      return `${first_name} ${last_name} is toegevoegd`;
    },

    onUpdate: async ({ id }, person) => {
      const { first_name, last_name } = await updatePerson(id, person);
      return `${first_name} ${last_name} is gewijzigd`;
    },

    onDelete: async ({ id }) => {
      const { first_name, last_name } = await deletePerson(id);
      return `${first_name} ${last_name} is verwijderd`;
    },
  });

  await registerAdminRoute(app, "/expedities", {
    schema: expeditieSchema,
    paramSchema: idParamsSchema,

    renderPage: async ({ user, messages }) =>
      renderExpeditiesAdminPage(
        await promiseAllProps({
          expedities: getAllExpeditiesWithPeopleIds(),
          persons: getAllPersons(),
          user,
          messages,
        })
      ),

    onAdd: async (exp) =>
      `Expeditie ${(await addExpeditie(exp)).name} is toegevoegd`,

    onUpdate: async ({ id }, exp) =>
      `Expeditie ${(await updateExpeditie(id, exp)).name} is gewijzigd`,

    onDelete: async ({ id }) =>
      `Expeditie ${(await deleteExpeditie(id)).name} is verwijderd`,
  });

  await registerAdminRoute(app, "/expedities/:expeditie/verhalen", {
    schema: storySchema,
    paramSchema: numIdParamsSchema,
    prefixSchema: storyPrefixParamsSchema,

    renderPage: async ({ user, messages, parsedPrefix }) =>
      renderStoryAdminPage(
        await promiseAllProps({
          stories: getExpeditieStories(parsedPrefix.expeditie.id),
          segments: getExpeditieSegments(parsedPrefix.expeditie.id),
          user,
          messages,
          expeditie: parsedPrefix.expeditie,
        })
      ),

    onAdd: async (story) =>
      `Verhaal "${(await addStory(story)).title}" is toegevoegd`,

    onUpdate: async ({ id }, story) =>
      `Verhaal "${(await updateStory(id, story)).title}" is gewijzigd`,

    onDelete: async ({ id }) =>
      `Verhaal "${(await deleteStory(id)).title}" is verwijderd`,
  });

  await registerAdminRoute(app, "/expedities/:expeditie/segmenten", {
    schema: segmentSchema,
    paramSchema: numIdParamsSchema,
    prefixSchema: segmentPrefixParamsSchema,

    renderPage: async ({ user, messages, parsedPrefix }) =>
      renderExpeditieSegmentsAdminPage(
        await promiseAllProps({
          expeditie: parsedPrefix.expeditie,
          segments: getExpeditieSegments(parsedPrefix.expeditie.id),
          persons: getAllPersons(),
          user,
          messages,
        })
      ),

    onAdd: async (segment, { parsedPrefix }) => {
      const s = await addSegment({
        ...segment,
        expeditie_id: parsedPrefix.expeditie.id,
      });

      return `Segment "${s.description}" (#${s.id}) is toegevoegd`;
    },

    onUpdate: async ({ id }, segment, { parsedPrefix }) => {
      const s = await updateSegment(id, {
        ...segment,
        expeditie_id: parsedPrefix.expeditie.id,
      });

      return `Segment "${s.description}" (#${s.id}) is gewijzigd`;
    },

    onDelete: async ({ id }) => {
      const s = await deleteSegment(id);

      return `Segment "${s.description}" (#${s.id}) is verwijderd`;
    },
  });

  await registerAdminRoute(app, "/expedities/:expeditie/gpx", {
    schema: gpxSchema,
    prefixSchema: gpxPrefixParamsSchema,

    renderPage: async ({ user, messages, parsedPrefix }) =>
      renderGpxUploadAdminPage(
        await promiseAllProps({
          segments: getExpeditieSegments(parsedPrefix.expeditie.id),
          user,
          messages,
          expeditie: parsedPrefix.expeditie,
        })
      ),

    addPath: "/upload",
    onAdd: async ({
      file: files,
      segment_id,
      time_zone,
      enable_locations,
      enable_stories,
    }) => {
      let locCount = 0n;
      let storyCount = 0n;

      for (const file of files) {
        const { locations, stories } = parseGpx(file, segment_id, time_zone);

        if (enable_locations && locations.length > 0) {
          locCount += await addLocations(locations);
        }

        if (enable_stories && stories.length > 0) {
          storyCount += await addStories(stories);
        }
      }

      return `${locCount} locaties en ${storyCount} verhalen zijn geüpload`;
    },
  });

  await registerAdminRoute(app, "/bestanden", {
    paramSchema: keyParamsSchema,

    renderPage: async ({ user, messages }) =>
      renderFilesAdminPage({
        filesWithUses: await getUsesForFiles(await getS3Files()),
        user,
        messages,
      }),

    deletePath: "/delete/:key",
    onDelete: async ({ key }) =>
      `Bestand "${await deleteS3Prefix(key)}" is verwijderd`,
  });
};

export default adminRoutes;
