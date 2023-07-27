import { HydratedDocument } from "mongoose";
import { Expeditie } from "./components/expedities/model.ts";
import { getFileUrl } from "./helpers/files.ts";

declare module "express-session" {
  export interface SessionData {
    returnTo: string;
  }
}

declare global {
  declare namespace Express {
    export interface Locals {
      expeditie: Omit<
        HydratedDocument<Expeditie>,
        "personIds" | "movieEditorIds"
      > & { personIds: PersonDocument[]; movieEditorIds: PersonDocument[] };

      getFileUrl: typeof getFileUrl;
    }
  }
}
