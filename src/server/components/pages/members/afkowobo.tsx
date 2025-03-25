import { FunctionComponent } from "preact";
import { getAllAfkos } from "../../../db/afko.js";
import { authenticatePerson } from "../../../db/person.js";
import { DictionaryEntry } from "../../members/dictionary-entry.js";
import { NavigationBar } from "../../page-structure/navigation-bar.js";
import { Page } from "../../page-structure/page.js";

export const AfkowoboPage: FunctionComponent<{
  afkos: Awaited<ReturnType<typeof getAllAfkos>>;
  user: NonNullable<Awaited<ReturnType<typeof authenticatePerson>>>;
}> = ({ afkos, user }) => (
  <Page
    title="Expeditie - Afkowobo"
    head={<link rel="stylesheet" href="/static/styles/members.css" />}
    afterBody={<script src="/static/scripts/members.js" />}
  >
    <div class="container">
      <NavigationBar type="members" backTo="members" user={user} />

      <h1 class="page-title">
        Het enige echte afkortingenwoordenboek der Expediets
      </h1>

      {afkos.map((afko) => (
        <DictionaryEntry
          id={afko.id}
          term={afko.afko}
          descriptions={afko.definitions}
          attachmentFile={afko.attachment_file}
        />
      ))}
    </div>
  </Page>
);
