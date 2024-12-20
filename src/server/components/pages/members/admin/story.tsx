import { ComponentProps, FunctionComponent } from "preact";
import { render } from "preact-render-to-string";
import { getAllExpedities } from "../../../../db/expeditie.js";
import { authenticatePerson, getAllPersons } from "../../../../db/person.js";
import { getAllStories } from "../../../../db/story.js";
import { getISODate } from "../../../../helpers/time.js";
import { InfoMessages } from "../../../admin/info-messages.js";
import {
  ExpeditieSelectorOptions,
  PersonSelectorOptions,
} from "../../../admin/selector-options.js";
import { NavigationBar } from "../../../page-structure/navigation-bar.js";
import { Page } from "../../../page-structure/page.js";

const StoryAdminPage: FunctionComponent<{
  stories: Awaited<ReturnType<typeof getAllStories>>;
  expedities: Awaited<ReturnType<typeof getAllExpedities>>;
  persons: Awaited<ReturnType<typeof getAllPersons>>;
  user: NonNullable<Awaited<ReturnType<typeof authenticatePerson>>>;
  messages: Record<string, string[]>;
}> = ({ stories, expedities, persons, user, messages }) => (
  <Page
    title="Expeditie - Verhalen Admin"
    head={<link rel="stylesheet" href="/static/styles/members.css" />}
    afterBody={<script src="/static/scripts/members.js" />}
  >
    <div class="container-fluid">
      <NavigationBar type="members" backTo="members" user={user} />

      <div class="row">
        <div class="col-12 mb-4">
          <div class="h1">Verhalen Admin</div>
        </div>

        <InfoMessages messages={messages} />

        <div class="col-12 mb-4">
          <hr />
          <div class="h2 mb-3">Verhaal toevoegen</div>
          <form method="POST" action="/leden/admin/verhalen/add">
            <div class="form-row align-items-center">
              <div class="col-12 col-md-3 mb-2">
                <select class="form-select" name="expeditie_id" required>
                  <ExpeditieSelectorOptions expedities={expedities} />
                </select>
              </div>
              <div class="col-12 col-md-3 mb-2">
                <select class="form-select" name="person_id" required>
                  <PersonSelectorOptions persons={persons} />
                </select>
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
                />
              </div>
              <div class="col-12 col-md-3 mb-2">
                <input
                  class="form-control"
                  type="text"
                  name="title"
                  placeholder="Titel"
                  required
                />
              </div>
              <div class="col-12 col-md-3 mb-2">
                <textarea
                  class="form-control"
                  name="text"
                  placeholder="Verhaaltekst"
                />
              </div>
              <div class="col-12 col-md-3 mb-2">
                <div class="form-array form-array-allow-empty">
                  <div class="form-array-proto" hidden>
                    <input name="media_ids[]" type="hidden" disabled />
                    <input
                      class="form-control mb-2"
                      name="media_files[]"
                      type="text"
                      placeholder="Media bestandsnaam"
                      disabled
                      required
                    />
                    <textarea
                      class="form-control mb-2"
                      name="media_descriptions[]"
                      placeholder="Media beschrijving (optioneel)"
                      disabled
                    />
                  </div>
                  <button class="form-array-add btn btn-secondary me-2">
                    +
                  </button>
                  <button class="form-array-remove btn btn-secondary">–</button>
                </div>
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
          <div class="h2 mb-3">Bestaande verhalen aanpassen</div>

          <table class="table table-sticky-header">
            <thead>
              <tr>
                <th style={{ minWidth: "12.5rem" }}>Expeditie</th>
                <th style={{ minWidth: "12.5rem" }}>Persoon</th>
                <th style={{ minWidth: "12.5rem" }}>Lokale tijd en tijdzone</th>
                <th style={{ minWidth: "17.5rem" }}>Titel</th>
                <th style={{ minWidth: "17.5rem" }}>Tekst</th>
                <th style={{ minWidth: "17.5rem" }}>Media</th>
                <th />
              </tr>
            </thead>

            <tbody>
              {stories.map((story) => (
                <tr>
                  <td>
                    <select
                      class="form-select"
                      form={`f-${story.id}`}
                      name="expeditie_id"
                      required
                    >
                      <ExpeditieSelectorOptions
                        expedities={expedities}
                        selected={story.expeditie_id}
                      />
                    </select>
                  </td>
                  <td>
                    <select
                      class="form-select"
                      form={`f-${story.id}`}
                      name="person_id"
                      required
                    >
                      <PersonSelectorOptions
                        persons={persons}
                        selected={story.person_id}
                      />
                    </select>
                  </td>
                  <td>
                    <input
                      class="form-control mb-2"
                      form={`f-${story.id}`}
                      type="datetime-local"
                      name="time_local"
                      placeholder="Lokale tijd"
                      step={1}
                      pattern="[0-9]{4}-[0-9]{2}-[0-9]{2}T[0-9]{2}:[0-9]{2}([0-9]{2})?"
                      required
                      value={getISODate(story.time_stamp, story.time_zone)}
                    />
                    <input
                      class="form-control"
                      form={`f-${story.id}`}
                      type="text"
                      name="time_zone"
                      placeholder="Tijdzone"
                      value={story.time_zone}
                    />
                  </td>
                  <td>
                    <input
                      class="form-control"
                      form={`f-${story.id}`}
                      type="text"
                      name="title"
                      placeholder="Titel"
                      required
                      value={story.title}
                    />
                  </td>
                  <td>
                    <textarea
                      class="form-control"
                      form={`f-${story.id}`}
                      name="text"
                      placeholder="Verhaaltekst"
                    >
                      {story.text}
                    </textarea>
                  </td>
                  <td>
                    <div class="form-array form-array-allow-empty">
                      {story.media.map((medium) => (
                        <div class="form-array-item">
                          <input
                            form={`f-${story.id}`}
                            name="media_ids[]"
                            type="hidden"
                            value={medium.id}
                          />
                          <input
                            form={`f-${story.id}`}
                            class="form-control mb-2"
                            name="media_files[]"
                            type="text"
                            placeholder="Media bestandsnaam"
                            required
                            value={medium.file}
                          />
                          <textarea
                            form={`f-${story.id}`}
                            class="form-control mb-2"
                            name="media_descriptions[]"
                            placeholder="Media beschrijving (optioneel)"
                          >
                            {medium.description}
                          </textarea>
                        </div>
                      ))}
                      <div class="form-array-proto" hidden>
                        <input
                          form={`f-${story.id}`}
                          name="media_ids[]"
                          type="hidden"
                          disabled
                        />
                        <input
                          form={`f-${story.id}`}
                          class="form-control mb-2"
                          name="media_files[]"
                          type="text"
                          placeholder="Media bestandsnaam"
                          disabled
                          required
                        />
                        <textarea
                          form={`f-${story.id}`}
                          class="form-control mb-2"
                          name="media_descriptions[]"
                          placeholder="Media beschrijving (optioneel)"
                          disabled
                        />
                      </div>
                      <button class="form-array-add btn btn-secondary me-2">
                        +
                      </button>
                      <button class="form-array-remove btn btn-secondary">
                        –
                      </button>
                    </div>
                  </td>
                  <td>
                    <form
                      class="form-confirm"
                      id={`f-${story.id}`}
                      method="POST"
                      action={`/leden/admin/verhalen/update/${story.id}`}
                    >
                      <button class="btn btn-info d-block mb-2" type="submit">
                        Wijzigen
                      </button>
                      <button
                        class="btn btn-danger d-block"
                        type="submit"
                        formAction={`/leden/admin/verhalen/delete/${story.id}`}
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

export const renderStoryAdminPage = (
  props: ComponentProps<typeof StoryAdminPage>
) => render(<StoryAdminPage {...props} />);
