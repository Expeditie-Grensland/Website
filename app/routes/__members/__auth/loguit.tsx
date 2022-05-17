import { redirect } from "@remix-run/node";
import { destroySession, getSessionFromRequest } from "~/utils/session/session";
import type { LoaderFunction, MetaFunction } from "@remix-run/node";

const loader: LoaderFunction = async ({ request }) => {
  await destroySession(await getSessionFromRequest(request));
  return redirect("/");
};

const meta: MetaFunction = () => ({
  title: `Log uit - Expeditie Grensland`,
});

const LogoutPage = () => <></>;

export { loader, meta };
export default LogoutPage;
