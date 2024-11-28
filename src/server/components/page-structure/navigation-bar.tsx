import { FunctionComponent } from "preact";
import { authenticatePerson } from "../../db/person.js";

export const NavigationBar: FunctionComponent<{
  type: "public" | "members" | "no-user";
  backTo?: "home" | "members";
  user?: Awaited<ReturnType<typeof authenticatePerson>> | null;
}> = ({ type, backTo, user }) => (
  <nav
    class={`navbar navbar-expand ${type == "public" ? "navbar-dark" : "navbar-light"}`}
  >
    {backTo && (
      <ul class="navbar-nav">
        <li class="nav-item">
          <a class="nav-link" href={backTo == "home" ? "/" : "/leden"}>
            &larr;&nbsp;{backTo == "home" ? "Home" : "Leden"}
          </a>
        </li>
      </ul>
    )}

    {type == "public" && (
      <ul class="navbar-nav ms-auto">
        <li class="nav-item">
          <a class="nav-link" href="/leden">
            {user ? `${user.first_name} ${user.last_name}` : "Log In"}
          </a>
        </li>
      </ul>
    )}

    {type == "members" && user && (
      <ul class="navbar-nav ms-auto">
        <li class="nav-item">
          <a class="nav-link disabled">
            {user.first_name} {user.last_name}
          </a>
        </li>
        <li class="nav-item ps-2">
          <a class="nav-link" href="/leden/loguit">
            Log Uit
          </a>
        </li>
      </ul>
    )}
  </nav>
);
