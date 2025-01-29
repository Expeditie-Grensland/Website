import { ComponentProps, FunctionComponent } from "preact";
import { render } from "preact-render-to-string";
import {
  authenticatePerson,
  getAllPersonsWithAddresses,
} from "../../../../db/person.js";
import { AdminPage } from "../../../admin/admin-page.js";
import {
  EmailInput,
  FormInputArray,
  HiddenInput,
  PersonTeamInput,
  PersonTypeInput,
  TextInput,
} from "../../../admin/form-inputs.js";

const PersonsAdminPage: FunctionComponent<{
  persons: Awaited<ReturnType<typeof getAllPersonsWithAddresses>>;
  user: NonNullable<Awaited<ReturnType<typeof authenticatePerson>>>;
  messages: Record<string, string[]>;
}> = ({ persons: p, user, messages }) => (
  <AdminPage
    title="Personen Admin"
    fluid
    user={user}
    messages={messages}
    newAction={{ action: "/leden/admin/personen/add" }}
    items={p}
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
            <PersonTypeInput name="type" value={person?.type} {...attrs} />
            <PersonTeamInput name="team" value={person?.team} {...attrs} />
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

      {
        label: "Adressen",
        style: { minWidth: "12.5rem" },
        render: (person, attrs) => (
          <FormInputArray minSize={0} values={person?.addresses} {...attrs}>
            {(address, attrs) => (
              <>
                <HiddenInput
                  name="addresses.id[]"
                  value={address?.id}
                  {...attrs}
                />

                <TextInput
                  name="addresses.name[]"
                  placeholder="Naam (als niet zelf)"
                  value={address?.name || undefined}
                  {...attrs}
                />

                <TextInput
                  name="addresses.line_1[]"
                  placeholder="Adresregel 1"
                  required
                  value={address?.line_1}
                  {...attrs}
                />

                <TextInput
                  name="addresses.line_2[]"
                  placeholder="Adresregel 2"
                  required
                  value={address?.line_2}
                  {...attrs}
                />

                <TextInput
                  name="addresses.country[]"
                  placeholder="Land"
                  required
                  value={address?.country}
                  {...attrs}
                />
              </>
            )}
          </FormInputArray>
        ),
      },
    ]}
    actions={[
      {
        label: "Wijzigen",
        action: (person) => `/leden/admin/personen/update/${person.id}`,
        confirmMessage: (person) =>
          `Weet je zeker dat je ${person.first_name} ${person.last_name} wilt wijzigen?`,
      },
      {
        label: "Verwijderen",
        action: (person) => `/leden/admin/personen/delete/${person.id}`,
        style: "danger",
        confirmMessage: (person) =>
          `Weet je zeker dat je ${person.first_name} ${person.last_name} wilt verwijderen?`,
      },
    ]}
  />
);

export const renderPersonsAdminPage = (
  props: ComponentProps<typeof PersonsAdminPage>
) => render(<PersonsAdminPage {...props} />);
