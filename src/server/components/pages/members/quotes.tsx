import { marked } from "marked";
import { ComponentProps, FunctionComponent } from "preact";
import { render } from "preact-render-to-string";
import { authenticatePerson } from "../../../db/person.js";
import { getAllQuotes } from "../../../db/quote.js";
import { MediaPlayer } from "../../media/media-player.js";
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
          <>
            <div id={quote.id} class="col-12 col-xl-9 pb-5">
              <div class="h2 pb-2">
                “{quote.quote}”{" "}
                <small class="text-muted">―&nbsp;{quote.quotee}</small>
              </div>

              <span
                dangerouslySetInnerHTML={{
                  __html: marked(quote.context) as string,
                }}
              />
            </div>

            {quote.attachment_file && (
              <div class="col-12 col-xl-3 pb-4">
                <MediaPlayer file={quote.attachment_file} />
              </div>
            )}
          </>
        ))}
      </div>
    </div>
  </Page>
);

export const renderQuotesPage = (props: ComponentProps<typeof QuotesPage>) =>
  render(<QuotesPage {...props} />);
