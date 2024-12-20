import { ComponentProps, FunctionComponent } from "preact";
import { render } from "preact-render-to-string";
import { getAllExpedities } from "../../../../db/expeditie.js";
import { authenticatePerson, getAllPersons } from "../../../../db/person.js";
import { InfoMessages } from "../../../admin/info-messages.js";
import {
  ExpeditieSelectorOptions,
  PersonSelectorOptions,
} from "../../../admin/selector-options.js";
import { NavigationBar } from "../../../page-structure/navigation-bar.js";
import { Page } from "../../../page-structure/page.js";

const GpxUploadAdminPage: FunctionComponent<{
  expedities: Awaited<ReturnType<typeof getAllExpedities>>;
  persons: Awaited<ReturnType<typeof getAllPersons>>;
  user: NonNullable<Awaited<ReturnType<typeof authenticatePerson>>>;
  messages: Record<string, string[]>;
}> = ({ expedities, persons, user, messages }) => (
  <Page
    title="Expeditie - GPX Upload"
    head={<link rel="stylesheet" href="/static/styles/members.css" />}
    afterBody={<script src="/static/scripts/members.js" />}
  >
    <div class="container">
      <NavigationBar type="members" backTo="members" user={user} />

      <div class="row">
        <div class="col-12 mb-4">
          <div class="h1">GPX Upload</div>
        </div>

        <InfoMessages messages={messages} />

        <div class="col-12 mb-4">
          <form
            method="POST"
            action="/leden/admin/gpx/upload"
            enctype="multipart/form-data"
          >
            <div class="form-row align-items-center">
              <div class="col-12 col-md-4 mb-2 me-md-2">
                <input
                  class="form-control"
                  name="file"
                  type="file"
                  accept=".gpx"
                  multiple
                  required
                />
              </div>
              <div class="col-12 col-md-4 mb-2 me-md-2">
                <select class="form-select" name="expeditie_id" required>
                  <ExpeditieSelectorOptions expedities={expedities} />
                </select>
              </div>
              <div class="col-12 col-md-4 mb-2 me-md-2">
                <select class="form-select" name="person_id" required>
                  <PersonSelectorOptions persons={persons} selected={user.id} />
                </select>
              </div>
              <div class="col-12 col-md-4 mb-2 me-md-2">
                <label class="form-label" for="timezone">
                  Kies een geldige tijdzone uit de 'tz database'
                </label>
                <input
                  id="timezone"
                  class="form-control"
                  type="text"
                  name="time_zone"
                  placeholder="Tijdzone"
                  value="Europe/Amsterdam"
                  required
                />
              </div>
              <div class="col-12 col-md-4 mb-2">
                <button class="btn btn-primary" type="submit">
                  Uploaden
                </button>
              </div>
            </div>
          </form>
        </div>
      </div>
    </div>
  </Page>
);

export const renderGpxUploadAdminPage = (
  props: ComponentProps<typeof GpxUploadAdminPage>
) => render(<GpxUploadAdminPage {...props} />);
