import { json } from "@remix-run/node";
import { Outlet, useLoaderData } from "@remix-run/react";
import NavBar from "~/components/NavBar";
import {
  getUserFromSession,
  requireUser,
} from "~/utils/authentication/sessionUser";
import { getSessionFromRequest } from "~/utils/session/session";
import type { LoaderFunction } from "@remix-run/node";
import type { Person } from "~/generated/db";

const handle = {
  bodyClasses: "bg-m-back text-m-text min-h-screen",
};

type LoaderData = {
  user: Person;
};

const loader: LoaderFunction = async ({ request }) => {
  const user = getUserFromSession(await getSessionFromRequest(request));
  requireUser(user);

  return json<LoaderData>({ user: user! });
};

const LedenPageHolder = () => {
  const { user } = useLoaderData();

  return (
    <>
      <NavBar type="member" user={user} />
      <Outlet />
    </>
  );
};

export { handle, loader };
export default LedenPageHolder;
