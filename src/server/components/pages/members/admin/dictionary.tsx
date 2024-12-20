import { ComponentProps, FunctionComponent } from "preact";
import { render } from "preact-render-to-string";
import { authenticatePerson } from "../../../../db/person.js";
import { getAllWords } from "../../../../db/word.js";
import { InfoMessages } from "../../../admin/info-messages.js";
import { NavigationBar } from "../../../page-structure/navigation-bar.js";
import { Page } from "../../../page-structure/page.js";

const DictionaryAdminPage: FunctionComponent<{
  words: Awaited<ReturnType<typeof getAllWords>>;
  user: NonNullable<Awaited<ReturnType<typeof authenticatePerson>>>;
  messages: Record<string, string[]>;
}> = ({ words, user, messages }) => (
  <Page
    title="Expeditie - Woordenboek Admin"
    head={<link rel="stylesheet" href="/static/styles/members.css" />}
    afterBody={<script src="/static/scripts/members.js" />}
  >
    <div class="container-fluid">
      <NavigationBar type="members" backTo="members" user={user} />

      <div class="row">
        <div class="col-12 mb-4">
          <div class="h1">Woordenboek Admin</div>
        </div>

        <InfoMessages messages={messages} />

        <div class="col-12 mb-4">
          <hr />
          <div class="h2 mb-3">Woord toevoegen</div>
          <form method="POST" action="/leden/admin/woordenboek/add">
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
                <input
                  class="form-control"
                  type="text"
                  name="word"
                  placeholder="Woord"
                  required
                />
              </div>
              <div class="col-12 col-md-3 mb-2">
                <div class="form-array">
                  <textarea
                    class="form-control form-array-item mb-2"
                    placeholder="Definitie"
                    name="definitions[]"
                    rows={3}
                    required
                  />
                  <textarea
                    class="form-control form-array-proto mb-2"
                    placeholder="Definitie"
                    name="definitions[]"
                    rows={3}
                    required
                    hidden
                    disabled
                  />
                  <button class="form-array-add btn btn-secondary me-2">
                    +
                  </button>
                  <button class="form-array-remove btn btn-secondary">–</button>
                </div>
              </div>
              <div class="col-12 col-md-3 mb-2">
                <input
                  class="form-control"
                  type="text"
                  name="phonetic"
                  placeholder="Phonetisch"
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
          <div class="h2 mb-3">Bestaande woorden aanpassen</div>

          <table class="table table-sticky-header">
            <thead>
              <tr>
                <th style={{ minWidth: "15rem" }}>Id</th>
                <th style={{ minWidth: "20rem" }}>Woord</th>
                <th style={{ minWidth: "30rem", width: "100%" }}>Definities</th>
                <th style={{ minWidth: "12.5rem" }}>Phonetisch</th>
                <th style={{ minWidth: "17.5rem" }}>Bijlage</th>
                <th />
              </tr>
            </thead>

            <tbody>
              {words.map((word) => (
                <tr>
                  <td>
                    <input
                      class="form-control"
                      type="text"
                      form={`f-${word.id}`}
                      name="id"
                      value={word.id}
                      required
                    />
                  </td>
                  <td>
                    <input
                      class="form-control"
                      type="text"
                      form={`f-${word.id}`}
                      name="word"
                      value={word.word}
                      required
                    />
                  </td>
                  <td>
                    <div class="form-array">
                      {word.definitions.map((definition) => (
                        <textarea
                          class="form-control form-array-item mb-2"
                          form={`f-${word.id}`}
                          name="definitions[]"
                          rows={3}
                          required
                        >
                          {definition}
                        </textarea>
                      ))}
                      <textarea
                        class="form-control form-array-proto mb-2"
                        form={`f-${word.id}`}
                        name="definitions[]"
                        rows={3}
                        required
                        hidden
                        disabled
                      />
                      <button class="form-array-add btn btn-secondary me-2">
                        +
                      </button>
                      <button class="form-array-remove btn btn-secondary">
                        –
                      </button>
                    </div>
                  </td>
                  <td>
                    <input
                      class="form-control"
                      type="text"
                      form={`f-${word.id}`}
                      name="phonetic"
                      value={word.phonetic || ""}
                    />
                  </td>
                  <td>
                    <input
                      class="form-control"
                      type="text"
                      form={`f-${word.id}`}
                      name="attachment_file"
                      value={word.attachment_file || ""}
                    />
                  </td>
                  <td>
                    <form
                      class="form-confirm"
                      id={`f-${word.id}`}
                      method="POST"
                      action={`/leden/admin/woordenboek/update/${word.id}`}
                    >
                      <button class="btn btn-info d-block mb-2" type="submit">
                        Wijzigen
                      </button>
                      <button
                        class="btn btn-danger d-block"
                        type="submit"
                        formAction={`/leden/admin/woordenboek/delete/${word.id}`}
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

export const renderDictionaryAdminPage = (
  props: ComponentProps<typeof DictionaryAdminPage>
) => render(<DictionaryAdminPage {...props} />);
