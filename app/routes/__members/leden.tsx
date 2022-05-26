import { json } from "@remix-run/node";
import { Outlet, useLoaderData } from "@remix-run/react";
import NavBar from "~/components/NavBar";
import {
  getUserFromRequest,
  requireUser,
} from "~/utils/authentication/sessionUser";
import type { LoaderFunction } from "@remix-run/node";
import type { Person } from "~/generated/db";

const handle = {
  bodyClasses: "bg-m-back text-m-text min-h-screen",
};

type LoaderData = {
  user: Person;
};

const loader: LoaderFunction = async ({ request }) => {
  const user = requireUser(await getUserFromRequest(request));

  return json<LoaderData>({ user });
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
