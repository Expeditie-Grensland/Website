import fastifyMultipart from "@fastify/multipart";
import {
  FastifyInstance,
  FastifyPluginAsync,
  FastifyReply,
  FastifyRequest,
} from "fastify";
import { output, ZodError, ZodTypeAny } from "zod";
import { fromZodError } from "zod-validation-error";
import { renderAfkowoboAdminPage } from "../components/pages/members/admin/afkowobo.js";
import { renderDictionaryAdminPage } from "../components/pages/members/admin/dictionary.js";
import { renderExpeditiesAdminPage } from "../components/pages/members/admin/expedities.js";
import { renderFilesAdminPage } from "../components/pages/members/admin/files.js";
import { renderGpxUploadAdminPage } from "../components/pages/members/admin/gpx.js";
import { renderPersonsAdminPage } from "../components/pages/members/admin/person.js";
import { renderPointsAdminPage } from "../components/pages/members/admin/points.js";
import { renderQuotesAdminPage } from "../components/pages/members/admin/quotes.js";
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
import { insertLocationsFromGpx } from "../db/geo.js";
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
  addStory,
  deleteStory,
  getAllStories,
  updateStory,
} from "../db/story.js";
import { addWord, deleteWord, getAllWords, updateWord } from "../db/word.js";
import { deleteS3Prefix, getS3Files } from "../files/s3.js";
import { getUsesForFiles } from "../files/uses.js";
import { promiseAllProps } from "../helpers/async.js";
import { afkoSchema } from "../validation-schemas/admin/afko.js";
import { pointSchema } from "../validation-schemas/admin/earned-point.js";
import { expeditieSchema } from "../validation-schemas/admin/expeditie.js";
import { gpxSchema } from "../validation-schemas/admin/gpx.js";
import {
  idParamsSchema,
  keyParamsSchema,
  numIdParamsSchema,
} from "../validation-schemas/admin/params.js";
import { personSchema } from "../validation-schemas/admin/person.js";
import { quoteSchema } from "../validation-schemas/admin/quote.js";
import { storySchema } from "../validation-schemas/admin/story.js";
import { wordSchema } from "../validation-schemas/admin/word.js";

const flashAndRedirect =
  <Req extends FastifyRequest, Rep extends FastifyReply>(
    redirectTo: string,
    func: (request: Req, reply: Rep) => Promise<string>
  ) =>
  async (request: Req, reply: Rep) => {
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

type RegisterAdminRoute = <
  Schema extends ZodTypeAny,
  ParamSchema extends ZodTypeAny,
>(
  app: FastifyInstance,
  prefix: string,

  opts: {
    schema?: Schema;
    paramSchema?: ParamSchema;

    renderPage: (opts: {
      user: NonNullable<FastifyReply["locals"]["user"]>;
      messages: Record<string, string[]>;
    }) => Promise<string>;

    addPath?: string;
    onAdd?: (obj: output<Schema>) => Promise<string>;

    updatePath?: string;
    onUpdate?: (
      params: output<ParamSchema>,
      obj: output<Schema>
    ) => Promise<string>;

    deletePath?: string;
    onDelete?: (params: output<ParamSchema>) => Promise<string>;
  }
) => void;

const registerAdminRoute: RegisterAdminRoute = (
  app,
  prefix,
  {
    schema,
    paramSchema,

    renderPage,

    addPath = "/add",
    onAdd,

    updatePath = "/update/:id",
    onUpdate,

    deletePath = "/delete/:id",
    onDelete,
  }
) => {
  app.get(prefix, async (_req, reply) =>
    reply.sendHtml(
      await renderPage({
        user: reply.locals.user!,
        messages: reply.flash() as Record<string, string[]>,
      })
    )
  );

  if (schema && onAdd) {
    app.post(
      `${prefix}${addPath}`,
      flashAndRedirect(prefix, ({ body }) => onAdd(schema.parse(body)))
    );
  }

  if (schema && paramSchema && onUpdate) {
    app.post(
      `${prefix}${updatePath}`,
      flashAndRedirect(prefix, ({ body, params }) =>
        {
          console.dir(body);
          return onUpdate(paramSchema.parse(params), schema.parse(body));
        }
      )
    );
  }

  if (paramSchema && onDelete) {
    app.post(
      `${prefix}${deletePath}`,
      flashAndRedirect(prefix, ({ params }) =>
        onDelete(paramSchema.parse(params))
      )
    );
  }
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

  registerAdminRoute(app, "/woordenboek", {
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

  registerAdminRoute(app, "/citaten", {
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

  registerAdminRoute(app, "/afkowobo", {
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

  registerAdminRoute(app, "/punten", {
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

  registerAdminRoute(app, "/personen", {
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

  registerAdminRoute(app, "/expedities", {
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

  registerAdminRoute(app, "/gpx", {
    schema: gpxSchema,

    renderPage: async ({ user, messages }) =>
      renderGpxUploadAdminPage(
        await promiseAllProps({
          expedities: getAllExpedities(),
          persons: getAllPersons(true),
          user,
          messages,
        })
      ),

    addPath: "/upload",
    onAdd: async ({ file: files, ...location }) => {
      let count = 0n;

      for (const file of files) {
        count += await insertLocationsFromGpx(location, file);
      }

      return `${count} locaties zijn geüpload`;
    },
  });

  registerAdminRoute(app, "/verhalen", {
    schema: storySchema,
    paramSchema: numIdParamsSchema,

    renderPage: async ({ user, messages }) =>
      renderStoryAdminPage(
        await promiseAllProps({
          stories: getAllStories(),
          expedities: getAllExpedities(),
          persons: getAllPersons(true),
          user,
          messages,
        })
      ),

    onAdd: async (story) =>
      `Verhaal "${(await addStory(story)).title}" is toegevoegd`,

    onUpdate: async ({ id }, story) =>
      `Verhaal "${(await updateStory(id, story)).title}" is gewijzigd`,

    onDelete: async ({ id }) =>
      `Verhaal "${(await deleteStory(id)).title}" is verwijderd`,
  });

  registerAdminRoute(app, "/bestanden", {
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
