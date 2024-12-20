import { ComponentProps, FunctionComponent } from "preact";
import { render } from "preact-render-to-string";
import { getAllEarnedPoints } from "../../../../db/earned-point.js";
import { getAllExpedities } from "../../../../db/expeditie.js";
import { authenticatePerson, getAllPersons } from "../../../../db/person.js";
import { getISODate } from "../../../../helpers/time.js";
import { InfoMessages } from "../../../admin/info-messages.js";
import {
  ExpeditieSelectorOptions,
  PersonSelectorOptions,
  TeamSelectorOptions,
} from "../../../admin/selector-options.js";
import { NavigationBar } from "../../../page-structure/navigation-bar.js";
import { Page } from "../../../page-structure/page.js";

const PointsAdminPage: FunctionComponent<{
  points: Awaited<ReturnType<typeof getAllEarnedPoints>>;
  expedities: Awaited<ReturnType<typeof getAllExpedities>>;
  persons: Awaited<ReturnType<typeof getAllPersons>>;
  user: NonNullable<Awaited<ReturnType<typeof authenticatePerson>>>;
  messages: Record<string, string[]>;
}> = ({ points, expedities, persons, user, messages }) => (
  <Page
    title="Expeditie - Punten Admin"
    head={<link rel="stylesheet" href="/static/styles/members.css" />}
    afterBody={<script src="/static/scripts/members.js" />}
  >
    <div class="container-fluid">
      <NavigationBar type="members" backTo="members" user={user} />

      <div class="row">
        <div class="col-12 mb-4">
          <div class="h1">Punten Admin</div>
        </div>

        <InfoMessages messages={messages} />

        <div class="col-12 mb-4">
          <hr />
          <div class="h2 mb-3">Punt toevoegen</div>
          <form method="POST" action="/leden/admin/punten/add">
            <div class="form-row align-items-center">
              <div class="col-12 col-md-3 mb-2">
                <select class="form-select" name="person_id" required>
                  <PersonSelectorOptions persons={persons} />
                </select>
              </div>
              <div class="col-12 col-md-3 mb-2">
                <select class="form-select" name="expeditie_id" required>
                  <ExpeditieSelectorOptions
                    expedities={expedities}
                    allowEmpty
                  />
                </select>
              </div>
              <div class="col-12 col-md-3 mb-2">
                <select class="form-select" name="team" required>
                  <TeamSelectorOptions teams={["b", "r"]} />
                </select>
              </div>
              <div class="col-12 col-md-3 mb-2">
                <input
                  class="form-control"
                  type="number"
                  name="amount"
                  placeholder="Aantal punten"
                  required
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
          <div class="h2 mb-3">Bestaande punten aanpassen</div>

          <table class="table table-sticky-header">
            <thead>
              <tr>
                <th style={{ minWidth: "20rem" }}>Persoon</th>
                <th style={{ minWidth: "20rem" }}>Expeditie</th>
                <th style={{ minWidth: "10rem" }}>Team</th>
                <th style={{ minWidth: "10rem" }}>Hoeveelheid</th>
                <th style={{ minWidth: "12.5rem" }}>Lokale tijd en tijdzone</th>
                <th />
              </tr>
            </thead>

            <tbody>
              {points.map((point) => (
                <tr>
                  <td>
                    <select
                      class="form-select"
                      form={`f-${point.id}`}
                      name="person_id"
                      required
                    >
                      <PersonSelectorOptions
                        persons={persons}
                        selected={point.person_id}
                      />
                    </select>
                  </td>
                  <td>
                    <select
                      class="form-select"
                      form={`f-${point.id}`}
                      name="expeditie_id"
                    >
                      <ExpeditieSelectorOptions
                        expedities={expedities}
                        selected={point.expeditie_id}
                      />
                    </select>
                  </td>
                  <td>
                    <select
                      class="form-select"
                      form={`f-${point.id}`}
                      name="team"
                      required
                    >
                      <TeamSelectorOptions
                        teams={["b", "r"]}
                        selected={point.team}
                      />
                    </select>
                  </td>
                  <td>
                    <input
                      class="form-control"
                      form={`f-${point.id}`}
                      type="number"
                      name="amount"
                      placeholder="Aantal punten"
                      required
                      value={point.amount}
                    />
                  </td>
                  <td>
                    <input
                      class="form-control mb-2"
                      form={`f-${point.id}`}
                      type="datetime-local"
                      name="time_local"
                      placeholder="Lokale tijd"
                      step={1}
                      pattern="[0-9]{4}-[0-9]{2}-[0-9]{2}T[0-9]{2}:[0-9]{2}([0-9]{2})?"
                      required
                      value={getISODate(point.time_stamp, point.time_zone)}
                    />
                    <input
                      class="form-control"
                      form={`f-${point.id}`}
                      type="text"
                      name="time_zone"
                      placeholder="Tijdzone"
                      value={point.time_zone}
                    />
                  </td>
                  <td>
                    <form
                      class="form-confirm"
                      id={`f-${point.id}`}
                      method="POST"
                      action={`/leden/admin/punten/update/${point.id}`}
                    >
                      <button class="btn btn-info d-block mb-2" type="submit">
                        Wijzigen
                      </button>
                      <button
                        class="btn btn-danger d-block"
                        type="submit"
                        formAction={`/leden/admin/punten/delete/${point.id}`}
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

export const renderPointsAdminPage = (
  props: ComponentProps<typeof PointsAdminPage>
) => render(<PointsAdminPage {...props} />);
