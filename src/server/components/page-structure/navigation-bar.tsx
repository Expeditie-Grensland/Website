import type { FunctionComponent } from "preact";
import type { authenticatePerson } from "../../db/person.js";

export const NavigationBar: FunctionComponent<{
  type: "public" | "members" | "no-user";
  backTo?: "home" | "members" | { text: string; href: string };
  user?: Awaited<ReturnType<typeof authenticatePerson>> | null;
}> = ({ type, backTo, user }) => (
  <nav class="navbar">
    <div class="navbar-left">
      {backTo === "home" && <a href="/">←&nbsp;Home</a>}
      {backTo === "members" && <a href="/leden">←&nbsp;Leden</a>}
      {typeof backTo === "object" && (
        <a href={backTo.href}>←&nbsp;{backTo.text}</a>
      )}
    </div>

    <div class="navbar-right">
      {type === "public" && (
        <a href="/leden">
          {user ? `${user.first_name} ${user.last_name}` : "Log In"}
        </a>
      )}

      {type === "members" && user && (
        <span>
          {user.first_name} {user.last_name} <a href="/leden/loguit">Log Uit</a>
        </span>
      )}
    </div>
  </nav>
);
