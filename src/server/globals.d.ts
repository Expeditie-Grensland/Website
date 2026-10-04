import "preact";
import type { getFullExpeditie } from "./db/expeditie.js";
import type { authenticatePerson, getPerson } from "./db/person.js";
import type { replyComponent, replyHtml } from "./helpers/render.js";

declare module "fastify" {
  export interface FastifyReply {
    sendHtml: typeof replyHtml;
    sendComponent: typeof replyComponent;

    locals: {
      user?: Awaited<ReturnType<typeof authenticatePerson>>;
      person?: Awaited<ReturnType<typeof getPerson>>;
      expeditie?: Awaited<ReturnType<typeof getFullExpeditie>>;
      parsedPrefix?: unknown;
    };
  }
}

declare module "@fastify/secure-session" {
  interface SessionData {
    userId: string;
    returnTo: string;
  }
}

declare global {
  var rootDir: string;
  var cliMode: boolean;
}
