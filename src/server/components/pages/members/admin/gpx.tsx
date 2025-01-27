import { ComponentProps, FunctionComponent } from "preact";
import { render } from "preact-render-to-string";
import { getAllNodes } from "../../../../db/geo.js";
import { authenticatePerson } from "../../../../db/person.js";
import { AdminPage } from "../../../admin/admin-page.js";
import {
  CheckInput,
  FileInput,
  NodeInput,
  TimezoneInput,
} from "../../../admin/form-inputs.js";

const GpxUploadAdminPage: FunctionComponent<{
  nodes: Awaited<ReturnType<typeof getAllNodes>>;
  user: NonNullable<Awaited<ReturnType<typeof authenticatePerson>>>;
  messages: Record<string, string[]>;
}> = ({ nodes, user, messages }) => (
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
        label: "Node",
        render: (_, attrs) => (
          <NodeInput nodes={nodes} name="node_id" {...attrs} />
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
