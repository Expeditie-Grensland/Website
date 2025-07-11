import { FunctionComponent } from "preact";
import { getAllPacklists } from "../../../db/packlist.js";
import { authenticatePerson } from "../../../db/person.js";
import { NavigationBar } from "../../page-structure/navigation-bar.js";
import { Page } from "../../page-structure/page.js";
import { CheckInput } from "../../admin/form-inputs.js";

export const PacklistChoicePage: FunctionComponent<{
  lists: Awaited<ReturnType<typeof getAllPacklists>>;
  user: NonNullable<Awaited<ReturnType<typeof authenticatePerson>>>;
}> = ({ lists, user }) => (
  <Page
    title="Expeditie - Paklijst"
    head={<link rel="stylesheet" href="/static/styles/members.css" />}
    afterBody={<script src="/static/scripts/members.js" />}
  >
    <div class="container">
      <NavigationBar type="members" backTo="members" user={user} />

      <h1 class="page-title">Paklijst</h1>

      <form method="GET" action="/leden/paklijst" id="packlists">
        {lists.map((list) => (
          <label class="packlist-choice">
            <CheckInput name={list.id} value={list.default} />
            {list.name}
          </label>
        ))}
      </form>

      <button
        class="button-main"
        type="submit"
        form="packlists"
        name="gen"
        value="y"
      >
        Genereer
      </button>
    </div>
  </Page>
);
