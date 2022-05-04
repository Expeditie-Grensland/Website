import { redirect } from "@remix-run/node";
import { destroySession, getSessionFromRequest } from "~/utils/session/session";
import type { LoaderFunction } from "@remix-run/node";

const loader: LoaderFunction = async ({ request }) => {
  await destroySession(await getSessionFromRequest(request));
  return redirect("/");
};

const LogoutPage = () => <></>;

export { loader };
export default LogoutPage;
