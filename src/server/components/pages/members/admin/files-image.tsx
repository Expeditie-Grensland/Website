import type { FunctionComponent } from "preact";
import type { authenticatePerson } from "../../../../db/person.js";
import { AdminPage } from "../../../admin/admin-page.js";
import { FileInput, TextInput } from "../../../admin/form-inputs.js";

export const FilesImageAdminPage: FunctionComponent<{
  user: NonNullable<Awaited<ReturnType<typeof authenticatePerson>>>;
  messages: Record<string, string[]>;
}> = ({ user, messages }) => (
  <AdminPage
    title={`Afbeelding Upload`}
    backTo={{ text: "Bestanden Admin", href: "/leden/admin/bestanden" }}
    user={user}
    messages={messages}
    newAction={{
      action: `/leden/admin/bestanden/afbeelding/upload`,
      label: "Uploaden",
    }}
    multipart
    columns={[
      {
        label: "Naam (zie bestaande bestanden)",
        render: (_, attrs) => (
          <>
            <TextInput name="name" required {...attrs} />
            <p>
              Bijvoorbeeld: "expeditie-achtergrond",
              "expeditie-verhaal-gebeurtenis"
            </p>
          </>
        ),
      },

      {
        label: "Bestand",
        render: (_, attrs) => (
          <FileInput name="file" accept="image/*" required {...attrs} />
        ),
      },
    ]}
  />
);
