import type { FunctionComponent } from "preact";
import type { getPacklistsWithItems } from "../../../db/packlist.js";
import type { authenticatePerson } from "../../../db/person.js";
import { CheckInput } from "../../admin/form-inputs.js";
import { NavigationBar } from "../../page-structure/navigation-bar.js";
import { Page } from "../../page-structure/page.js";

export const PacklistPage: FunctionComponent<{
  listsWithItems: Awaited<ReturnType<typeof getPacklistsWithItems>>;
  user: NonNullable<Awaited<ReturnType<typeof authenticatePerson>>>;
}> = ({ listsWithItems, user }) => (
  <Page
    title="Expeditie - Paklijst"
    head={<link rel="stylesheet" href="/static/styles/members.css" />}
    afterBody={<script src="/static/scripts/members.js" />}
  >
    <div class="container">
      <NavigationBar
        type="members"
        backTo={{ text: "Paklijst keuze", href: "/leden/paklijst" }}
        user={user}
      />

      <h1 class="page-title">Paklijst</h1>

      {listsWithItems.map((list) => (
        <>
          <div id={list.id} class="packlist-heading">
            {list.name}
          </div>

          <div>
            {list.items.map((item) => (
              <label class="packlist-item">
                <CheckInput name={`item-${item.id}`} />

                <div class="packlist-text">
                  <div class="packlist-name">{item.name}</div>
                  <div class="packlist-desc">{item.description}</div>
                </div>
              </label>
            ))}
          </div>
        </>
      ))}
    </div>
  </Page>
);
