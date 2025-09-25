import type { FunctionComponent } from "preact";
import type { getMemberWritingsList } from "../../../../db/member-writings.js";
import type { authenticatePerson } from "../../../../db/person.js";
import { AdminPage } from "../../../admin/admin-page.js";
import {
  NumberInput,
  TextAreaInput,
  TextInput,
} from "../../../admin/form-inputs.js";

export const WritingsAdminPage: FunctionComponent<{
  writings: Awaited<ReturnType<typeof getMemberWritingsList>>;
  user: NonNullable<Awaited<ReturnType<typeof authenticatePerson>>>;
  messages: Record<string, string[]>;
}> = ({ writings, user, messages }) => (
  <AdminPage
    title="Geschriften Admin"
    fluid
    user={user}
    messages={messages}
    newAction={{ action: "/leden/admin/geschriften/add" }}
    items={writings}
    columns={[
      {
        label: "Id, titel & beschrijving",
        style: { minWidth: "17.5rem" },
        render: (writing, attrs) => (
          <>
            <TextInput
              name="id"
              placeholder="Id"
              required
              value={writing?.id}
              {...attrs}
            />

            <TextInput
              name="title"
              placeholder="Titel"
              required
              value={writing?.title}
              {...attrs}
            />

            <TextInput
              name="description"
              placeholder="Beschrijving"
              required
              value={writing?.description}
              {...attrs}
            />
          </>
        ),
      },

      {
        label: "Tekst",
        style: { minWidth: "25rem" },
        render: (writing, attrs) => (
          <TextAreaInput
            name="text"
            placeholder="Tekst"
            required
            value={writing?.text}
            {...attrs}
          />
        ),
      },

      {
        label: "Index",
        style: { width: "7rem" },
        render: (writing, attrs) => (
          <NumberInput
            name="index"
            placeholder="Index"
            required
            value={writing?.index}
            {...attrs}
          />
        ),
      },
    ]}
    actions={[
      {
        label: "Wijzigen",
        action: (writing) => `/leden/admin/geschriften/update/${writing.id}`,
        confirmMessage: (writing) =>
          `Weet je zeker dat je het geschrift "${writing.title}" wilt wijzigen?`,
      },
      {
        label: "Verwijderen",
        action: (writing) => `/leden/admin/geschriften/delete/${writing.id}`,
        confirmMessage: (writing) =>
          `Weet je zeker dat je het geschrift "${writing.title}" wilt verwijderen?`,
        style: "danger",
      },
    ]}
  />
);
