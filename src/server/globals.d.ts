/* eslint-disable no-var */
import { getFullExpeditie } from "./db/expeditie.js";
import { getFileType, getFileUrl } from "./files/files.js";
import { getPerson, authenticatePerson } from "./db/person.js";

declare module "fastify" {
  export interface FastifyReply {
    locals: {
      getFileUrl: typeof getFileUrl;
      getFileType: typeof getFileType;
      user?: Awaited<ReturnType<typeof authenticatePerson>>;
      person?: Awaited<ReturnType<typeof getPerson>>;
      expeditie?: Awaited<ReturnType<typeof getFullExpeditie>>;
      umami?: { scriptUrl: string; websiteId: string };
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
