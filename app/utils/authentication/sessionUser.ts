import { redirect } from "@remix-run/node";
import { getSessionFromRequest } from "../session/session";
import type { Session } from "@remix-run/node";
import type { Person } from "~/generated/db";

const getUserFromSession = (session: Session) =>
  session?.get("user") as Person | undefined;

const getUserFromRequest = async (request: Request) =>
  getUserFromSession(await getSessionFromRequest(request));

const requireUser = (user: Person | undefined, requireAdmin = false) => {
  if (!user) throw redirect("/login");
  if (requireAdmin && !user.isAdmin) throw redirect("/leden");
  return user!;
};

export { getUserFromSession, getUserFromRequest, requireUser };
