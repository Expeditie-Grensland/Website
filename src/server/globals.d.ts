import mongoose from "mongoose";

import { getPopulatedExpeditieByName } from "./components/expedities/index.ts";
import {
  getPersonByLdapId,
  getPersonByUserName,
} from "./components/people/index.ts";
import { getFileUrl } from "./helpers/files.ts";

declare module "fastify" {
  export interface FastifyReply {
    locals: {
      getFileUrl: typeof getFileUrl;
      user?: Awaited<ReturnType<typeof getPersonByLdapId>>;
      person?: Awaited<ReturnType<typeof getPersonByUserName>>;
      expeditie?: Awaited<ReturnType<typeof getPopulatedExpeditieByName>>;
    };
  }

  interface Session {
    userId?: mongoose.Types.ObjectId;
    returnTo?: string;
    infoMsg: string[];
    errorMsg: string[];
  }
}

declare global {
  // eslint-disable-next-line no-var
  var rootDir: string;
}
