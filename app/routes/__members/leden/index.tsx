import { getUserFromRequest, requireUser } from "~/utils/authentication/sessionUser";
import type { LoaderFunction } from "@remix-run/node";

const loader: LoaderFunction = async ({ request }) => {
  requireUser(await getUserFromRequest(request));
  return null;
};

const MembersHome = () => {
  return <span>Ledensite!</span>;
};

export { loader };
export default MembersHome;
