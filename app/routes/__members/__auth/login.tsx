import { redirect, json } from "@remix-run/node";
import { useActionData } from "@remix-run/react";
import LoginForm from "~/components/members/LoginForm";
import authenticate from "~/utils/authentication/authenticate";
import { commitSession, getSession } from "~/utils/session/session";
import type { ActionFunction } from "@remix-run/node";

const action: ActionFunction = async ({ request }) => {
  const formData = await request.formData();
  const username = formData.get("username") as string | undefined;
  const password = formData.get("password") as string | undefined;

  if (!username || !password)
    return json({ errorMsg: "Please enter your username and password" });

  const user = await authenticate(username, password);

  if (!user) return json({ errorMsg: "Could not login" });

  const session = await getSession(request.headers.get("Cookies"));
  session.set("user", user);

  return redirect("/leden", {
    headers: {
      "Set-Cookie": await commitSession(session),
    },
  });
};

const LoginPage = () => {
  const actionData = useActionData();

  return <LoginForm errorMsg={actionData?.errorMsg} />;
};

export { action };
export default LoginPage;
