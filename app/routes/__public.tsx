import { json } from "@remix-run/node";
import { Outlet, useLoaderData } from "@remix-run/react";
import PublicNavBar from "~/components/public/PublicNavBar";
import { getSession } from "~/utils/session/session";
import type { LoaderFunction } from "@remix-run/node";
import type { Person } from "~/generated/db";

const handle = {
  bodyClasses: "bg-back-gray text-white-ish min-h-screen",
};

const loader: LoaderFunction = async ({ request }) => {
  const session = await getSession(request.headers.get("Cookie"));
  const user = session?.get("user") as Person | undefined;

  return json({ user });
};

const PublicPageHolder = () => {
  const { user } = useLoaderData();

  return (
    <>
      <PublicNavBar user={user} />
      <Outlet />
    </>
  );
};

export { handle, loader };
export default PublicPageHolder;
