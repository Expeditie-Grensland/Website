import { json } from "@remix-run/node";
import { Outlet, useLoaderData } from "@remix-run/react";
import NavBar from "~/components/NavBar";
import { getUserFromSession } from "~/utils/authentication/sessionUser";
import { getSessionFromRequest } from "~/utils/session/session";
import type { LoaderFunction } from "@remix-run/node";

const handle = {
  bodyClasses: "bg-p-back text-p-text min-h-screen",
};

const loader: LoaderFunction = async ({ request }) => {
  const user = getUserFromSession(await getSessionFromRequest(request));

  return json({ user });
};

const PublicPageHolder = () => {
  const { user } = useLoaderData();

  return (
    <div className="flex flex-col min-h-screen">
      <NavBar type="public" user={user} />
      <Outlet />
    </div>
  );
};

export { handle, loader };
export default PublicPageHolder;
