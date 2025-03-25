import { FunctionComponent } from "preact";
import { authenticatePerson } from "../../../db/person.js";
import { getAllQuotes } from "../../../db/quote.js";
import { DictionaryEntry } from "../../members/dictionary-entry.js";
import { NavigationBar } from "../../page-structure/navigation-bar.js";
import { Page } from "../../page-structure/page.js";

export const QuotesPage: FunctionComponent<{
  quotes: Awaited<ReturnType<typeof getAllQuotes>>;
  user: NonNullable<Awaited<ReturnType<typeof authenticatePerson>>>;
}> = ({ quotes, user }) => (
  <Page
    title="Expeditie - Citaten"
    head={<link rel="stylesheet" href="/static/styles/members.css" />}
    afterBody={<script src="/static/scripts/members.js" />}
  >
    <div class="container">
      <NavigationBar type="members" backTo="members" user={user} />

      <h1 class="page-title">De Lange Citatenlijst der Expeditie Grensland</h1>

      {quotes.map((quote) => (
        <DictionaryEntry
          id={quote.id}
          term={`“${quote.quote}”`}
          smallTerm={`― ${quote.quotee}`}
          descriptions={quote.context}
          attachmentFile={quote.attachment_file}
        />
      ))}
    </div>
  </Page>
);
