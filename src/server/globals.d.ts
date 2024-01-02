/* eslint-disable no-var */
import mongoose from "mongoose";

import { getPopulatedExpeditieByName } from "./components/expedities/index.ts";
import {
  getPersonByLdapId,
  getPersonByUserName,
} from "./components/people/index.ts";
import { getFileType, getFileUrl } from "./files/files.js";

declare module "fastify" {
  export interface FastifyReply {
    locals: {
      getFileUrl: typeof getFileUrl;
      getFileType: typeof getFileType;
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

interface Global {
  rootDir: string;
  isCli: boolean;
}

declare global {
  var rootDir: string;
  var cliMode: boolean;
}
