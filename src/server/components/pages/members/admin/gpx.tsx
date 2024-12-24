import { ComponentProps, FunctionComponent } from "preact";
import { render } from "preact-render-to-string";
import { getAllExpedities } from "../../../../db/expeditie.js";
import { authenticatePerson, getAllPersons } from "../../../../db/person.js";
import { AdminPage } from "../../../admin/admin-page.js";
import { FileInput, TimezoneInput } from "../../../admin/form-inputs/basic.js";
import {
  ExpeditieSelector,
  PersonSelector,
} from "../../../admin/form-inputs/selector.js";

const GpxUploadAdminPage: FunctionComponent<{
  expedities: Awaited<ReturnType<typeof getAllExpedities>>;
  persons: Awaited<ReturnType<typeof getAllPersons>>;
  user: NonNullable<Awaited<ReturnType<typeof authenticatePerson>>>;
  messages: Record<string, string[]>;
}> = ({ expedities, persons, user, messages }) => (
  <AdminPage
    title="GPX Upload"
    user={user}
    messages={messages}
    newAction={{ action: "/leden/admin/gpx/upload", label: "Uploaden" }}
    multipart
    columns={[
      {
        label: "Bestand",
        render: (_, attrs) => (
          <FileInput name="file" accept=".gpx" multiple required {...attrs} />
        ),
      },

      {
        label: "Expeditie",
        render: (_, attrs) => (
          <ExpeditieSelector
            expedities={expedities}
            name="expeditie_id"
            {...attrs}
          />
        ),
      },

      {
        label: "Persoon",
        render: (_, attrs) => (
          <PersonSelector
            persons={persons}
            name="person_id"
            value={user.id}
            {...attrs}
          />
        ),
      },

      {
        label: "Tijdzone",
        render: (_, attrs) => (
          <TimezoneInput name="time_zone" required {...attrs} />
        ),
      },
    ]}
  />
);

export const renderGpxUploadAdminPage = (
  props: ComponentProps<typeof GpxUploadAdminPage>
) => render(<GpxUploadAdminPage {...props} />);
