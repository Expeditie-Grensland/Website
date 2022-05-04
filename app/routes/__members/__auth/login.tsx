import { redirect, json } from "@remix-run/node";
import { useActionData, useTransition } from "@remix-run/react";
import LoginForm from "~/components/members/LoginForm";
import authenticate from "~/utils/authentication/authenticate";
import { getUserFromRequest, requireUser } from "~/utils/authentication/sessionUser";
import { commitSession, getSession } from "~/utils/session/session";
import type { ActionFunction, LoaderFunction , MetaFunction } from "@remix-run/node";

const loader: LoaderFunction = async ({ request }) => {
  requireUser(await getUserFromRequest(request), "/leden", true);
  return null;
};

const action: ActionFunction = async ({ request }) => {
  const formData = await request.formData();
  const username = formData.get("username");
  const password = formData.get("password");

  if (!username || !password)
    return json({ error: "Gelieve uw gegevens in te voeren" });

  const user = await authenticate(username as string, password as string);

  if (!user) return json({ error: "De ingevoerde gegevens zijn incorrect" });

  const session = await getSession(request.headers.get("Cookies"));
  session.set("user", user);

  return redirect("/leden", {
    headers: {
      "Set-Cookie": await commitSession(session),
    },
  });
};

const meta: MetaFunction = () => ({
  title: `Log In - Expeditie Grensland`,
});

const LoginPage = () => {
  const actionData = useActionData();
  const { state } = useTransition();

  return <LoginForm error={actionData?.error} isWaiting={state === "submitting"} />;
};

export { loader, action, meta };
export default LoginPage;
