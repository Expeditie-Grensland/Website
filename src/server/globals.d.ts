/* eslint-disable no-var */
import { getFullExpeditie } from "./db/expeditie.js";
import { getFileType, getFileUrl } from "./files/files.js";
import { getPerson, getPersonByLdapId } from "./db/person.js";

declare module "fastify" {
  export interface FastifyReply {
    locals: {
      getFileUrl: typeof getFileUrl;
      getFileType: typeof getFileType;
      user?: Awaited<ReturnType<typeof getPersonByLdapId>>;
      person?: Awaited<ReturnType<typeof getPerson>>;
      expeditie?: Awaited<ReturnType<typeof getFullExpeditie>>;
      umami?: { scriptUrl: string; websiteId: string };
    };
  }

  interface Session {
    userId?: string;
    returnTo?: string;
    infoMsg: string[];
    errorMsg: string[];
  }
}

declare global {
  var rootDir: string;
  var cliMode: boolean;
}
