import { ComponentProps, FunctionComponent } from "preact";
import { render } from "preact-render-to-string";
import { authenticatePerson, getAllPersons } from "../../../../db/person.js";
import { AdminPage } from "../../../admin/admin-page.js";
import {
  EmailInput,
  SelectorInput,
  TextInput,
} from "../../../admin/form-inputs.js";

const PersonsAdminPage: FunctionComponent<{
  persons: Awaited<ReturnType<typeof getAllPersons>>;
  user: NonNullable<Awaited<ReturnType<typeof authenticatePerson>>>;
  messages: Record<string, string[]>;
}> = ({ persons, user, messages }) => (
  <AdminPage
    title="Personen Admin"
    fluid
    user={user}
    messages={messages}
    newAction={{ action: "/leden/admin/personen/add" }}
    items={persons}
    columns={[
      {
        label: "Id",
        style: { minWidth: "12.5rem" },
        render: (person, attrs) => (
          <TextInput
            name="id"
            placeholder="Id"
            required
            value={person?.id}
            {...attrs}
          />
        ),
      },

      {
        label: "Namen",
        style: { minWidth: "12.5rem" },
        render: (person, attrs) => (
          <>
            <TextInput
              name="first_name"
              placeholder="Voornaam"
              required
              value={person?.first_name}
              {...attrs}
            />
            <TextInput
              name="last_name"
              placeholder="Achternaam"
              required
              value={person?.last_name}
              {...attrs}
            />
            <TextInput
              name="sorting_name"
              placeholder="Sorteernaam"
              required
              value={person?.sorting_name}
              {...attrs}
            />
            <TextInput
              name="initials"
              placeholder="Initialen"
              required
              value={person?.initials}
              {...attrs}
            />
          </>
        ),
      },

      {
        label: "Type & team",
        style: { minWidth: "7.5rem" },
        render: (person, attrs) => (
          <>
            <SelectorInput
              name="type"
              placeholder="Type"
              options={[
                { id: "admin", text: "Administrator" },
                { id: "member", text: "Lid" },
                { id: "former", text: "Voormalig lid" },
                { id: "guest", text: "Gast" },
              ]}
              value={person?.type}
              {...attrs}
            />
            <SelectorInput
              name="team"
              placeholder="Team"
              options={[
                { id: "blue", text: "Blauw" },
                { id: "red", text: "Rood" },
                { id: "green", text: "Groen" },
              ]}
              allowEmpty
              value={person?.team}
              {...attrs}
            />
          </>
        ),
      },

      {
        label: "Email",
        style: { minWidth: "12.5rem" },
        render: (person, attrs) => (
          <EmailInput
            name="email"
            placeholder="Email"
            value={person?.email || undefined}
            {...attrs}
          />
        ),
      },
    ]}
    actions={[
      {
        label: "Wijzigen",
        action: (afko) => `/leden/admin/personen/update/${afko.id}`,
      },
      {
        label: "Verwijderen",
        action: (afko) => `/leden/admin/personen/delete/${afko.id}`,
        style: "danger",
      },
    ]}
  />
);

export const renderPersonsAdminPage = (
  props: ComponentProps<typeof PersonsAdminPage>
) => render(<PersonsAdminPage {...props} />);
