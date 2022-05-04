import { redirect } from "@remix-run/node";
import { getSessionFromRequest } from "../session/session";
import type { Session } from "@remix-run/node";
import type { Person } from "~/generated/db";

const getUserFromSession = (session: Session) =>
  session?.get("user") as Person | undefined;

const getUserFromRequest = async (request: Request) =>
  getUserFromSession(await getSessionFromRequest(request));

const requireUser = (
  user: Person | undefined,
  redirectTo = "/login",
  invert = false
) => {
  if (invert ? user : !user) throw redirect(redirectTo);
};

export { getUserFromSession, getUserFromRequest, requireUser };
