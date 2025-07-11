import { FunctionComponent } from "preact";
import { getPacklist, getPacklistItems } from "../../../../db/packlist.js";
import { authenticatePerson } from "../../../../db/person.js";
import { AdminPage } from "../../../admin/admin-page.js";
import { NumberInput, TextInput } from "../../../admin/form-inputs.js";

export const PacklistItemsAdminPage: FunctionComponent<{
  packlist: NonNullable<Awaited<ReturnType<typeof getPacklist>>>;
  items: Awaited<ReturnType<typeof getPacklistItems>>;
  user: NonNullable<Awaited<ReturnType<typeof authenticatePerson>>>;
  messages: Record<string, string[]>;
}> = ({ packlist, items, user, messages }) => (
  <AdminPage
    title={`Paklijst "${packlist.name}" Admin`}
    backTo={{ text: "Paklijst Admin", href: "/leden/admin/paklijst" }}
    user={user}
    messages={messages}
    newAction={{ action: `/leden/admin/paklijst/${packlist.id}/items/add` }}
    items={items}
    columns={[
      {
        label: "Naam",
        style: { minWidth: "12.5rem" },
        render: (item, attrs) => (
          <>
            <TextInput
              name="name"
              placeholder="Naam"
              required
              value={item?.name}
              {...attrs}
            />
          </>
        ),
      },

      {
        label: "Beschrijving",
        style: { minWidth: "17.5rem" },
        render: (item, attrs) => (
          <TextInput
            name="description"
            value={item?.description || undefined}
            {...attrs}
          />
        ),
      },

      {
        label: "Positie",
        style: { minWidth: "7.5rem" },
        render: (item, attrs) => (
          <NumberInput name="position" value={item?.position} {...attrs} />
        ),
      },
    ]}
    actions={[
      {
        label: "Wijzigen",
        action: (item) =>
          `/leden/admin/paklijst/${packlist.id}/items/update/${item.id}`,
        confirmMessage: (item) =>
          `Weet je zeker dat je het item "${item.name}" wilt wijzigen?`,
      },
      {
        label: "Verwijderen",
        action: (item) =>
          `/leden/admin/paklijst/${packlist.id}/items/delete/${item.id}`,
        confirmMessage: (item) =>
          `Weet je zeker dat je het item "${item.name}" wilt verwijderen?`,
        style: "danger",
      },
    ]}
  />
);
