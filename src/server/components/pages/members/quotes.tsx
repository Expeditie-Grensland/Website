import { ComponentProps, FunctionComponent } from "preact";
import { render } from "preact-render-to-string";
import { authenticatePerson } from "../../../db/person.js";
import { getAllQuotes } from "../../../db/quote.js";
import { DictionaryEntry } from "../../members/dictionary-entry.js";
import { NavigationBar } from "../../page-structure/navigation-bar.js";
import { Page } from "../../page-structure/page.js";

const QuotesPage: FunctionComponent<{
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

      <div class="row pb-5">
        <div class="col-12">
          <div class="h1">De Lange Citatenlijst der Expeditie Grensland</div>
        </div>
      </div>

      <div class="row pb-5">
        {quotes.map((quote) => (
          <DictionaryEntry
            id={quote.id}
            term={quote.quote}
            smallTerm={`―\u00A0${quote.quotee}`}
            descriptions={quote.context}
            attachmentFile={quote.attachment_file}
          />
        ))}
      </div>
    </div>
  </Page>
);

export const renderQuotesPage = (props: ComponentProps<typeof QuotesPage>) =>
  render(<QuotesPage {...props} />);
