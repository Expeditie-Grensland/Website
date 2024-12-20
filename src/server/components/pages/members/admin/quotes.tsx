import { ComponentProps, FunctionComponent } from "preact";
import { render } from "preact-render-to-string";
import { authenticatePerson } from "../../../../db/person.js";
import { getAllQuotes } from "../../../../db/quote.js";
import { getISODate } from "../../../../helpers/time.js";
import { InfoMessages } from "../../../admin/info-messages.js";
import { NavigationBar } from "../../../page-structure/navigation-bar.js";
import { Page } from "../../../page-structure/page.js";

const QuotesAdminPage: FunctionComponent<{
  quotes: Awaited<ReturnType<typeof getAllQuotes>>;
  user: NonNullable<Awaited<ReturnType<typeof authenticatePerson>>>;
  messages: Record<string, string[]>;
}> = ({ quotes, user, messages }) => (
  <Page
    title="Expeditie - Citaten Admin"
    head={<link rel="stylesheet" href="/static/styles/members.css" />}
    afterBody={<script src="/static/scripts/members.js" />}
  >
    <div class="container-fluid">
      <NavigationBar type="members" backTo="members" user={user} />

      <div class="row">
        <div class="col-12 mb-4">
          <div class="h1">Citaten Admin</div>
        </div>

        <InfoMessages messages={messages} />

        <div class="col-12 mb-4">
          <hr />
          <div class="h2 mb-3">Citaat toevoegen</div>
          <form method="POST" action="/leden/admin/citaten/add">
            <div class="form-row align-items-center">
              <div class="col-12 col-md-3 mb-2">
                <input
                  class="form-control"
                  type="text"
                  name="id"
                  placeholder="Id"
                  required
                />
              </div>
              <div class="col-12 col-md-3 mb-2">
                <textarea
                  class="form-control"
                  name="quote"
                  placeholder="Citaat"
                  rows={2}
                  required
                />
              </div>
              <div class="col-12 col-md-3 mb-2">
                <textarea
                  class="form-control"
                  name="context"
                  placeholder="Context"
                  rows={3}
                  required
                />
              </div>
              <div class="col-12 col-md-3 mb-2">
                <input
                  class="form-control"
                  type="text"
                  name="quotee"
                  placeholder="Persoon"
                />
              </div>
              <div class="col-12 col-md-3 mb-2">
                <input
                  class="form-control"
                  type="datetime-local"
                  name="time_local"
                  placeholder="Lokale tijd"
                  step={1}
                  pattern="[0-9]{4}-[0-9]{2}-[0-9]{2}T[0-9]{2}:[0-9]{2}([0-9]{2})?"
                  required
                />
              </div>
              <div class="col-12 col-md-3 mb-2">
                <input
                  class="form-control"
                  type="text"
                  name="time_zone"
                  placeholder="Tijdzone"
                  value="Europe/Amsterdam"
                  required
                />
              </div>
              <div class="col-12 col-md-3 mb-2">
                <input
                  class="form-control"
                  type="text"
                  name="attachment_file"
                  placeholder="Bijlage"
                />
              </div>
              <div class="col-auto mb-2">
                <button class="btn btn-primary" type="submit">
                  Toevoegen
                </button>
              </div>
            </div>
          </form>
        </div>

        <div class="col-12 mb-4">
          <hr />
          <div class="h2 mb-3">Bestaande citaten aanpassen</div>

          <table class="table table-sticky-header">
            <thead>
              <tr>
                <th style={{ minWidth: "15rem" }}>Id</th>
                <th style={{ minWidth: "20rem" }}>Quote</th>
                <th style={{ minWidth: "30rem", width: "100%" }}>Context</th>
                <th style={{ minWidth: "15rem" }}>Persoon</th>
                <th style={{ minWidth: "12.5rem" }}>Lokale tijd en tijdzone</th>
                <th style={{ minWidth: "17.5rem" }}>Bijlage</th>
                <th />
              </tr>
            </thead>

            <tbody>
              {quotes.map((quote) => (
                <tr>
                  <td>
                    <input
                      class="form-control"
                      type="text"
                      form={`f-${quote.id}`}
                      name="id"
                      value={quote.id}
                      required
                    />
                  </td>
                  <td>
                    <textarea
                      class="form-control"
                      form={`f-${quote.id}`}
                      name="quote"
                      value={quote.quote}
                      rows={3}
                      required
                    />
                  </td>
                  <td>
                    <textarea
                      class="form-control"
                      form={`f-${quote.id}`}
                      name="context"
                      value={quote.context}
                      rows={3}
                      required
                    />
                  </td>
                  <td>
                    <input
                      class="form-control"
                      type="text"
                      form={`f-${quote.id}`}
                      name="quotee"
                      value={quote.quotee}
                    />
                  </td>
                  <td>
                    <input
                      class="form-control mb-2"
                      type="datetime-local"
                      form={`f-${quote.id}`}
                      name="time_local"
                      value={getISODate(quote.time_stamp, quote.time_zone)}
                      step={1}
                      pattern="[0-9]{4}-[0-9]{2}-[0-9]{2}T[0-9]{2}:[0-9]{2}([0-9]{2})?"
                      required
                    />
                    <input
                      class="form-control"
                      type="text"
                      form={`f-${quote.id}`}
                      name="time_zone"
                      value={quote.time_zone}
                      required
                    />
                  </td>
                  <td>
                    <input
                      class="form-control"
                      type="text"
                      form={`f-${quote.id}`}
                      name="attachment_file"
                      value={quote.attachment_file || ""}
                    />
                  </td>
                  <td>
                    <form
                      class="form-confirm"
                      id={`f-${quote.id}`}
                      method="POST"
                      action={`/leden/admin/citaten/update/${quote.id}`}
                    >
                      <button class="btn btn-info d-block mb-2" type="submit">
                        Wijzigen
                      </button>
                      <button
                        class="btn btn-danger d-block"
                        type="submit"
                        formAction={`/leden/admin/citaten/delete/${quote.id}`}
                      >
                        Verwijderen
                      </button>
                    </form>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  </Page>
);

export const renderQuotesAdminPage = (
  props: ComponentProps<typeof QuotesAdminPage>
) => render(<QuotesAdminPage {...props} />);
