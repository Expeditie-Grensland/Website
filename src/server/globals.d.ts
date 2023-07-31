import mongoose, { HydratedDocument } from "mongoose";

import { Expeditie } from "./components/expedities/model.ts";
import { Person } from "./components/people/model.ts";
import { getFileUrl } from "./helpers/files.ts";

declare module "express-session" {
  export interface SessionData {
    returnTo: string;
    userId: mongoose.Types.ObjectId;
  }
}

declare global {
  declare namespace Express {
    export interface Locals {
      user?: HydratedDocument<Person>;

      expeditie: Omit<
        HydratedDocument<Expeditie>,
        "personIds" | "movieEditorIds"
      > & { personIds: PersonDocument[]; movieEditorIds: PersonDocument[] };

      getFileUrl: typeof getFileUrl;
    }
  }
}
