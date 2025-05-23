import { FunctionComponent } from "preact";
import { getAllExpeditiesWithPeopleIds } from "../../../../db/expeditie.js";
import { authenticatePerson, getAllPersons } from "../../../../db/person.js";
import { AdminPage } from "../../../admin/admin-page.js";
import {
  CheckInput,
  DateInput,
  FormInputArray,
  PersonInput,
  TextInput,
} from "../../../admin/form-inputs.js";

export const ExpeditiesAdminPage: FunctionComponent<{
  expedities: Awaited<ReturnType<typeof getAllExpeditiesWithPeopleIds>>;
  persons: Awaited<ReturnType<typeof getAllPersons>>;
  user: NonNullable<Awaited<ReturnType<typeof authenticatePerson>>>;
  messages: Record<string, string[]>;
}> = ({ expedities, persons, user, messages }) => (
  <AdminPage
    title="Expeditie Admin"
    fluid
    user={user}
    messages={messages}
    newAction={{ action: "/leden/admin/expedities/add" }}
    items={expedities}
    columns={[
      {
        label: "Id, naam & ondertitel",
        style: { minWidth: "12.5rem" },
        render: (expeditie, attrs) => (
          <>
            <TextInput
              name="id"
              placeholder="Id"
              required
              value={expeditie?.id}
              {...attrs}
            />
            <TextInput
              name="name"
              placeholder="Naam"
              required
              value={expeditie?.name}
              {...attrs}
            />
            <TextInput
              name="subtitle"
              placeholder="Ondertitel"
              required
              value={expeditie?.subtitle}
              {...attrs}
            />
          </>
        ),
      },

      {
        label: "Concept",
        style: { minWidth: "2.5rem" },
        render: (expeditie, attrs) => (
          <CheckInput
            name="draft"
            value={expeditie?.draft || undefined}
            {...attrs}
          />
        ),
      },

      {
        label: "Start- & einddatum",
        style: { minWidth: "7.5rem" },
        render: (expeditie, attrs) => (
          <>
            <DateInput
              name="start_date"
              placeholder="Startdatum"
              value={expeditie?.start_date}
              {...attrs}
            />
            <DateInput
              name="end_date"
              placeholder="Einddatum"
              value={expeditie?.end_date}
              {...attrs}
            />
          </>
        ),
      },

      {
        label: "Deelnemers",
        style: { minWidth: "12.5rem" },
        render: (expeditie, attrs) => (
          <FormInputArray values={expeditie?.persons} {...attrs}>
            {(person, attrs) => (
              <PersonInput
                persons={persons}
                placeholder="Deelnemer"
                name="persons[]"
                value={person}
                {...attrs}
              />
            )}
          </FormInputArray>
        ),
      },

      {
        label: "Toon kaart",
        style: { minWidth: "2.5rem" },
        render: (expeditie, attrs) => (
          <CheckInput
            name="show_map"
            value={expeditie?.show_map || undefined}
            {...attrs}
          />
        ),
      },

      {
        label: "Landen",
        style: { minWidth: "12.5rem" },
        render: (expeditie, attrs) => (
          <FormInputArray values={expeditie?.countries} {...attrs}>
            {(country, attrs) => (
              <TextInput
                name="countries[]"
                value={country}
                placeholder="Land"
                required
                {...attrs}
              />
            )}
          </FormInputArray>
        ),
      },

      {
        label: "Achtergrond & film",
        style: { minWidth: "12.5rem" },
        render: (expeditie, attrs) => (
          <>
            <TextInput
              name="background_file"
              placeholder="Achtergrond"
              value={expeditie?.background_file || undefined}
              {...attrs}
            />
            <TextInput
              name="movie_file"
              placeholder="Film"
              value={expeditie?.movie_file || undefined}
              {...attrs}
            />
          </>
        ),
      },

      {
        label: "Beperk film",
        style: { minWidth: "2.5rem" },
        render: (expeditie, attrs) => (
          <CheckInput
            name="movie_restricted"
            placeholder="Beperk film"
            value={expeditie?.movie_restricted || undefined}
            {...attrs}
          />
        ),
      },

      {
        label: "Filmmonteurs",
        style: { minWidth: "12.5rem" },
        render: (expeditie, attrs) => (
          <FormInputArray
            values={expeditie?.movie_editors}
            minSize={0}
            {...attrs}
          >
            {(person, attrs) => (
              <PersonInput
                persons={persons}
                placeholder="Filmmonteur"
                name="movie_editors[]"
                value={person}
                {...attrs}
              />
            )}
          </FormInputArray>
        ),
      },

      {
        label: "Links",
        style: { minWidth: "10rem" },
        onlyIn: "existing",
        render: (expeditie) => (
          <>
            <div>
              <a href={`/leden/admin/expedities/${expeditie!.id}/gpx`}>
                GPX Upload
              </a>
            </div>
            <div>
              <a href={`/leden/admin/expedities/${expeditie!.id}/segmenten`}>
                Segmenten
              </a>
            </div>
            <div>
              <a href={`/leden/admin/expedities/${expeditie!.id}/verhalen`}>
                Verhalen
              </a>
            </div>
          </>
        ),
      },
    ]}
    actions={[
      {
        label: "Wijzigen",
        action: (expeditie) => `/leden/admin/expedities/update/${expeditie.id}`,
        confirmMessage: (expeditie) =>
          `Weet je zeker dat je Expeditie ${expeditie.name} wilt wijzigen?`,
      },
      {
        label: "Verwijderen",
        action: (expeditie) => `/leden/admin/expedities/delete/${expeditie.id}`,
        confirmMessage: (expeditie) =>
          `Weet je zeker dat je Expeditie ${expeditie.name} wilt verwijderen?`,
        style: "danger",
      },
    ]}
  />
);
