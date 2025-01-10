import { FunctionComponent } from "preact";
import { authenticatePerson } from "../../db/person.js";

export const NavigationBar: FunctionComponent<{
  type: "public" | "members" | "no-user";
  backTo?: "home" | "members";
  user?: Awaited<ReturnType<typeof authenticatePerson>> | null;
}> = ({ type, backTo, user }) => (
  <nav class="navbar">
    <div class="navbar-left">
      {backTo && (
        <a href={backTo == "home" ? "/" : "/leden"}>
          &larr;&nbsp;{backTo == "home" ? "Home" : "Leden"}
        </a>
      )}
    </div>

    <div class="navbar-right">
      {type == "public" && (
        <a href="/leden">
          {user ? `${user.first_name} ${user.last_name}` : "Log In"}
        </a>
      )}

      {type == "members" && user && (
        <span>
          {user.first_name} {user.last_name} <a href="/leden/loguit">Log Uit</a>
        </span>
      )}
    </div>
  </nav>
);
