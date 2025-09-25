import type { FunctionComponent } from "preact";
import type { getAllPacklists } from "../../../../db/packlist.js";
import type { authenticatePerson } from "../../../../db/person.js";
import { AdminPage } from "../../../admin/admin-page.js";
import {
  CheckInput,
  NumberInput,
  TextInput,
} from "../../../admin/form-inputs.js";

export const PacklistsAdminPage: FunctionComponent<{
  packlists: Awaited<ReturnType<typeof getAllPacklists>>;
  user: NonNullable<Awaited<ReturnType<typeof authenticatePerson>>>;
  messages: Record<string, string[]>;
}> = ({ packlists, user, messages }) => (
  <AdminPage
    title="Paklijst Admin"
    user={user}
    messages={messages}
    newAction={{ action: "/leden/admin/paklijst/add" }}
    items={packlists}
    columns={[
      {
        label: "Id & naam",
        style: { minWidth: "12.5rem" },
        render: (packlist, attrs) => (
          <>
            <TextInput
              name="id"
              placeholder="Id"
              required
              value={packlist?.id}
              {...attrs}
            />
            <TextInput
              name="name"
              placeholder="Naam"
              required
              value={packlist?.name}
              {...attrs}
            />
          </>
        ),
      },

      {
        label: "Standaard",
        style: { minWidth: "2.5rem" },
        render: (packlist, attrs) => (
          <CheckInput
            name="default"
            value={packlist?.default || undefined}
            {...attrs}
          />
        ),
      },

      {
        label: "Positie",
        style: { minWidth: "7.5rem" },
        render: (packlist, attrs) => (
          <NumberInput name="position" value={packlist?.position} {...attrs} />
        ),
      },

      {
        label: "Items",
        style: { minWidth: "10rem" },
        onlyIn: "existing",
        render: (packlist) => (
          <>
            <div>
              <a href={`/leden/admin/paklijst/${packlist!.id}/items`}>
                Bewerken
              </a>
            </div>
          </>
        ),
      },
    ]}
    actions={[
      {
        label: "Wijzigen",
        action: (packlist) => `/leden/admin/paklijst/update/${packlist.id}`,
        confirmMessage: (packlist) =>
          `Weet je zeker dat je de paklijst "${packlist.name}" wilt wijzigen?`,
      },
      {
        label: "Verwijderen",
        action: (packlist) => `/leden/admin/paklijst/delete/${packlist.id}`,
        confirmMessage: (packlist) =>
          `Weet je zeker dat je de paklijst "${packlist.name}" wilt verwijderen?`,
        style: "danger",
      },
    ]}
  />
);
