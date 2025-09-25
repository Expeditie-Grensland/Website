import type { FunctionComponent } from "preact";
import type { getMemberLinks } from "../../../../db/member-link.js";
import type { authenticatePerson } from "../../../../db/person.js";
import { AdminPage } from "../../../admin/admin-page.js";
import { NumberInput, TextInput } from "../../../admin/form-inputs.js";

export const LinksAdminPage: FunctionComponent<{
  links: Awaited<ReturnType<typeof getMemberLinks>>;
  user: NonNullable<Awaited<ReturnType<typeof authenticatePerson>>>;
  messages: Record<string, string[]>;
}> = ({ links, user, messages }) => (
  <AdminPage
    title="Links Admin"
    fluid
    user={user}
    messages={messages}
    newAction={{ action: "/leden/admin/links/add" }}
    items={links}
    columns={[
      {
        label: "Titel & beschrijving",
        style: { minWidth: "17.5rem" },
        render: (link, attrs) => (
          <>
            <TextInput
              name="title"
              placeholder="Titel"
              required
              value={link?.title}
              {...attrs}
            />

            <TextInput
              name="description"
              placeholder="Beschrijving"
              required
              value={link?.description}
              {...attrs}
            />
          </>
        ),
      },

      {
        label: "Url",
        style: { minWidth: "25rem" },
        render: (link, attrs) => (
          <TextInput
            name="url"
            placeholder="Url"
            required
            value={link?.url}
            {...attrs}
          />
        ),
      },

      {
        label: "Index",
        style: { width: "7rem" },
        render: (link, attrs) => (
          <NumberInput
            name="index"
            placeholder="Index"
            required
            value={link?.index}
            {...attrs}
          />
        ),
      },
    ]}
    actions={[
      {
        label: "Wijzigen",
        action: (link) => `/leden/admin/links/update/${link.id}`,
        confirmMessage: (link) =>
          `Weet je zeker dat je de link "${link.title}" wilt wijzigen?`,
      },
      {
        label: "Verwijderen",
        action: (link) => `/leden/admin/links/delete/${link.id}`,
        confirmMessage: (link) =>
          `Weet je zeker dat je de link "${link.title}" wilt verwijderen?`,
        style: "danger",
      },
    ]}
  />
);
