import fastifyMultipart from "@fastify/multipart";
import {
  FastifyInstance,
  FastifyPluginAsync,
  FastifyReply,
  FastifyRequest,
} from "fastify";
import { z, ZodError, ZodTypeAny } from "zod";
import { fromZodError } from "zod-validation-error";
import { AfkowoboAdminPage } from "../components/pages/members/admin/afkowobo.js";
import { DictionaryAdminPage } from "../components/pages/members/admin/dictionary.js";
import { ExpeditiesAdminPage } from "../components/pages/members/admin/expedities.js";
import { FilesAdminPage } from "../components/pages/members/admin/files.js";
import { GpxUploadAdminPage } from "../components/pages/members/admin/gpx.js";
import { LinksAdminPage } from "../components/pages/members/admin/links.js";
import { PersonsAdminPage } from "../components/pages/members/admin/person.js";
import { PointsAdminPage } from "../components/pages/members/admin/points.js";
import { QuotesAdminPage } from "../components/pages/members/admin/quotes.js";
import { ExpeditieSegmentsAdminPage } from "../components/pages/members/admin/segments.js";
import { StoryAdminPage } from "../components/pages/members/admin/story.js";
import { WritingsAdminPage } from "../components/pages/members/admin/writings.js";
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
  addMemberLink,
  deleteMemberLink,
  getMemberLinks,
  updateMemberLink,
} from "../db/member-link.js";
import {
  addMemberWriting,
  deleteMemberWriting,
  getMemberWritingsList,
  updateMemberWriting,
} from "../db/member-writings.js";
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
import { parseGpx } from "../helpers/gpx.js";
import { renderComponent } from "../helpers/render.js";
import { afkoSchema } from "../validation-schemas/admin/afko.js";
import { pointSchema } from "../validation-schemas/admin/earned-point.js";
import { expeditieSchema } from "../validation-schemas/admin/expeditie.js";
import {
  gpxPrefixParamsSchema,
  gpxSchema,
} from "../validation-schemas/admin/gpx.js";
import { linkSchema } from "../validation-schemas/admin/link.js";
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
import { writingSchema } from "../validation-schemas/admin/writing.js";
import { PacklistsAdminPage } from "../components/pages/members/admin/packlists.js";
import {
  addPacklist,
  addPacklistItem,
  deletePacklist,
  deletePacklistItem,
  getAllPacklists,
  getPacklistItems,
  updatePacklist,
  updatePacklistItem,
} from "../db/packlist.js";
import {
  packlistItemSchema,
  packlistPrefixParamsSchema,
  packlistSchema,
} from "../validation-schemas/admin/packlist.js";
import { PacklistItemsAdminPage } from "../components/pages/members/admin/packlist-items.js";

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

    renderPage: ({ user, messages }) =>
      renderComponent(DictionaryAdminPage, {
        words: getAllWords(),
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

    renderPage: ({ user, messages }) =>
      renderComponent(QuotesAdminPage, {
        quotes: getAllQuotes(),
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

    renderPage: ({ user, messages }) =>
      renderComponent(AfkowoboAdminPage, {
        afkos: getAllAfkos(),
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

    renderPage: ({ user, messages }) =>
      renderComponent(PointsAdminPage, {
        points: getAllEarnedPoints(),
        expedities: getAllExpedities(),
        persons: getAllPersons(true),
        user,
        messages,
      }),

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

    renderPage: ({ user, messages }) =>
      renderComponent(PersonsAdminPage, {
        persons: getAllPersonsWithAddresses(),
        user,
        messages,
      }),

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

    renderPage: ({ user, messages }) =>
      renderComponent(ExpeditiesAdminPage, {
        expedities: getAllExpeditiesWithPeopleIds(),
        persons: getAllPersons(),
        user,
        messages,
      }),

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

    renderPage: ({ user, messages, parsedPrefix }) =>
      renderComponent(StoryAdminPage, {
        stories: getExpeditieStories(parsedPrefix.expeditie.id),
        segments: getExpeditieSegments(parsedPrefix.expeditie.id),
        user,
        messages,
        expeditie: parsedPrefix.expeditie,
      }),

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

    renderPage: ({ user, messages, parsedPrefix }) =>
      renderComponent(ExpeditieSegmentsAdminPage, {
        expeditie: parsedPrefix.expeditie,
        segments: getExpeditieSegments(parsedPrefix.expeditie.id),
        persons: getAllPersons(),
        user,
        messages,
      }),

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

    renderPage: ({ user, messages, parsedPrefix }) =>
      renderComponent(GpxUploadAdminPage, {
        segments: getExpeditieSegments(parsedPrefix.expeditie.id),
        user,
        messages,
        expeditie: parsedPrefix.expeditie,
      }),

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

  await registerAdminRoute(app, "/paklijst", {
    schema: packlistSchema,
    paramSchema: idParamsSchema,

    renderPage: ({ user, messages }) =>
      renderComponent(PacklistsAdminPage, {
        packlists: getAllPacklists(),
        user,
        messages,
      }),

    onAdd: async (list) =>
      `Paklijst "${(await addPacklist(list)).name}" is toegevoegd`,

    onUpdate: async ({ id }, list) =>
      `Paklijst "${(await updatePacklist(id, list)).name}" is gewijzigd`,

    onDelete: async ({ id }) =>
      `Paklijst "${(await deletePacklist(id)).name}" is verwijderd`,
  });

  await registerAdminRoute(app, "/paklijst/:packlist/items", {
    schema: packlistItemSchema,
    paramSchema: numIdParamsSchema,
    prefixSchema: packlistPrefixParamsSchema,

    renderPage: ({ user, messages, parsedPrefix }) =>
      renderComponent(PacklistItemsAdminPage, {
        packlist: parsedPrefix.packlist,
        items: getPacklistItems(parsedPrefix.packlist.id),
        user,
        messages,
      }),

    onAdd: async (item, { parsedPrefix }) =>
      `Item "${(await addPacklistItem(parsedPrefix.packlist.id, item)).name}" is toegevoegd`,

    onUpdate: async ({ id }, item, { parsedPrefix }) =>
      `Item "${(await updatePacklistItem(parsedPrefix.packlist.id, id, item)).name}" is gewijzigd`,

    onDelete: async ({ id }, { parsedPrefix }) =>
      `Item "${(await deletePacklistItem(parsedPrefix.packlist.id, id)).name}" is verwijderd`,
  });

  await registerAdminRoute(app, "/bestanden", {
    paramSchema: keyParamsSchema,

    renderPage: async ({ user, messages }) =>
      await renderComponent(FilesAdminPage, {
        filesWithUses: getUsesForFiles(await getS3Files()),
        user,
        messages,
      }),

    deletePath: "/delete/:key",
    onDelete: async ({ key }) => {
      await deleteS3Prefix(key);
      return `Bestand "${key}" is verwijderd`;
    },
  });

  await registerAdminRoute(app, "/links", {
    schema: linkSchema,
    paramSchema: numIdParamsSchema,

    renderPage: ({ user, messages }) =>
      renderComponent(LinksAdminPage, {
        links: getMemberLinks(),
        user,
        messages,
      }),

    onAdd: async (link) => {
      const { title } = await addMemberLink(link);
      return `"${title} is toegevoegd`;
    },

    onUpdate: async ({ id }, link) => {
      const { title } = await updateMemberLink(id, link);
      return `"${title}" is gewijzigd`;
    },

    onDelete: async ({ id }) => {
      const { title } = await deleteMemberLink(id);
      return `"${title}" is verwijderd`;
    },
  });

  await registerAdminRoute(app, "/geschriften", {
    schema: writingSchema,
    paramSchema: idParamsSchema,

    renderPage: ({ user, messages }) =>
      renderComponent(WritingsAdminPage, {
        writings: getMemberWritingsList(),
        user,
        messages,
      }),

    onAdd: async (writing) => {
      const { title } = await addMemberWriting(writing);
      return `"${title} is toegevoegd`;
    },

    onUpdate: async ({ id }, writing) => {
      const { title } = await updateMemberWriting(id, writing);
      return `"${title}" is gewijzigd`;
    },

    onDelete: async ({ id }) => {
      const { title } = await deleteMemberWriting(id);
      return `"${title}" is verwijderd`;
    },
  });
};

export default adminRoutes;
