import type { FunctionComponent } from "preact";
import type { getAllAfkos } from "../../../../db/afko.js";
import type { authenticatePerson } from "../../../../db/person.js";
import { AdminPage } from "../../../admin/admin-page.js";
import {
  FormInputArray,
  TextAreaInput,
  TextInput,
} from "../../../admin/form-inputs.js";

export const AfkowoboAdminPage: FunctionComponent<{
  afkos: Awaited<ReturnType<typeof getAllAfkos>>;
  user: NonNullable<Awaited<ReturnType<typeof authenticatePerson>>>;
  messages: Record<string, string[]>;
}> = ({ afkos, user, messages }) => (
  <AdminPage
    title="Afkowobo Admin"
    fluid
    user={user}
    messages={messages}
    newAction={{ action: "/leden/admin/afkowobo/add" }}
    items={afkos}
    columns={[
      {
        label: "Id",
        style: { minWidth: "15rem" },
        render: (afko, attrs) => (
          <TextInput
            name="id"
            placeholder="Id"
            required
            value={afko?.id}
            {...attrs}
          />
        ),
      },

      {
        label: "Afko",
        style: { minWidth: "20rem" },
        render: (afko, attrs) => (
          <TextInput
            name="afko"
            placeholder="Afko"
            required
            value={afko?.afko}
            {...attrs}
          />
        ),
      },

      {
        label: "Definities",
        style: { minWidth: "30rem", width: "100%" },
        render: (afko, attrs) => (
          <FormInputArray values={afko?.definitions} {...attrs}>
            {(definition, attrs) => (
              <>
                <TextAreaInput
                  name="definitions[]"
                  placeholder="Definitie"
                  required
                  value={definition}
                  {...attrs}
                />
              </>
            )}
          </FormInputArray>
        ),
      },

      {
        label: "Bijlage",
        style: { minWidth: "17.5rem" },
        render: (afko, attrs) => (
          <TextInput
            name="attachment_file"
            placeholder="Bijlage"
            value={afko?.attachment_file || undefined}
            {...attrs}
          />
        ),
      },
    ]}
    actions={[
      {
        label: "Wijzigen",
        action: (afko) => `/leden/admin/afkowobo/update/${afko.id}`,
        confirmMessage: (afko) =>
          `Weet je zeker dat je de afkorting "${afko.afko}" wilt wijzigen?`,
      },
      {
        label: "Verwijderen",
        action: (afko) => `/leden/admin/afkowobo/delete/${afko.id}`,
        confirmMessage: (afko) =>
          `Weet je zeker dat je de afkorting "${afko.afko}" wilt verwijderen?`,
        style: "danger",
      },
    ]}
  />
);
