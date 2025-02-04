import { Selectable } from "kysely";
import { ComponentProps, FunctionComponent } from "preact";
import { render } from "preact-render-to-string";
import { getExpeditieSegments } from "../../../../db/geo.js";
import { authenticatePerson } from "../../../../db/person.js";
import { Expeditie } from "../../../../db/schema/types.js";
import { AdminPage } from "../../../admin/admin-page.js";
import {
  CheckInput,
  FileInput,
  SegmentInput,
  TimezoneInput,
} from "../../../admin/form-inputs.js";

const GpxUploadAdminPage: FunctionComponent<{
  segments: Awaited<ReturnType<typeof getExpeditieSegments>>;
  user: NonNullable<Awaited<ReturnType<typeof authenticatePerson>>>;
  messages: Record<string, string[]>;
  expeditie: Selectable<Expeditie>;
}> = ({ segments, user, messages, expeditie }) => (
  <AdminPage
    title={`GPX Upload (Expeditie ${expeditie.name})`}
    backTo={{ text: "Expeditie Admin", href: "/leden/admin/expedities" }}
    user={user}
    messages={messages}
    newAction={{
      action: `/leden/admin/expedities/${expeditie.id}/gpx/upload`,
      label: "Uploaden",
    }}
    multipart
    columns={[
      {
        label: "Bestand",
        render: (_, attrs) => (
          <FileInput name="file" accept=".gpx" multiple required {...attrs} />
        ),
      },

      {
        label: "Segment",
        render: (_, attrs) => (
          <SegmentInput segments={segments} name="segment_id" {...attrs} />
        ),
      },

      {
        label: "Tijdzone",
        render: (_, attrs) => (
          <TimezoneInput name="time_zone" required {...attrs} />
        ),
      },

      {
        label: "Upload locaties",
        render: (_, attrs) => (
          <CheckInput name="enable_locations" value={true} {...attrs} />
        ),
      },

      {
        label: "Upload verhalen",
        render: (_, attrs) => (
          <CheckInput name="enable_stories" value={true} {...attrs} />
        ),
      },
    ]}
  />
);

export const renderGpxUploadAdminPage = (
  props: ComponentProps<typeof GpxUploadAdminPage>
) => render(<GpxUploadAdminPage {...props} />);
