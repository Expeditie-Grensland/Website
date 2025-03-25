import { FunctionComponent } from "preact";
import { authenticatePerson } from "../../../../db/person.js";
import { getAllWords } from "../../../../db/word.js";
import { AdminPage } from "../../../admin/admin-page.js";
import {
  FormInputArray,
  TextAreaInput,
  TextInput,
} from "../../../admin/form-inputs.js";

export const DictionaryAdminPage: FunctionComponent<{
  words: Awaited<ReturnType<typeof getAllWords>>;
  user: NonNullable<Awaited<ReturnType<typeof authenticatePerson>>>;
  messages: Record<string, string[]>;
}> = ({ words, user, messages }) => (
  <AdminPage
    title="Woordenboek Admin"
    fluid
    user={user}
    messages={messages}
    newAction={{ action: "/leden/admin/woordenboek/add" }}
    items={words}
    columns={[
      {
        label: "Id",
        style: { minWidth: "15rem" },
        render: (word, attrs) => (
          <TextInput
            name="id"
            placeholder="Id"
            required
            value={word?.id}
            {...attrs}
          />
        ),
      },

      {
        label: "Woord",
        style: { minWidth: "20rem" },
        render: (word, attrs) => (
          <TextInput
            name="word"
            placeholder="Woord"
            required
            value={word?.word}
            {...attrs}
          />
        ),
      },

      {
        label: "Definities",
        style: { minWidth: "30rem", width: "100%" },
        render: (word, attrs) => (
          <FormInputArray values={word?.definitions} {...attrs}>
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
        label: "Phonetisch",
        style: { minWidth: "12.5rem" },
        render: (word, attrs) => (
          <TextInput
            name="phonetic"
            placeholder="Phonetisch"
            value={word?.phonetic || undefined}
            {...attrs}
          />
        ),
      },

      {
        label: "Bijlage",
        style: { minWidth: "17.5rem" },
        render: (word, attrs) => (
          <TextInput
            name="attachment_file"
            placeholder="Bijlage"
            value={word?.attachment_file || undefined}
            {...attrs}
          />
        ),
      },
    ]}
    actions={[
      {
        label: "Wijzigen",
        action: (word) => `/leden/admin/woordenboek/update/${word.id}`,
        confirmMessage: (word) =>
          `Weet je zeker dat je het woord "${word.word}" wilt wijzigen?`,
      },
      {
        label: "Verwijderen",
        action: (word) => `/leden/admin/woordenboek/delete/${word.id}`,
        confirmMessage: (word) =>
          `Weet je zeker dat je het woord "${word.word}" wilt verwijderen?`,
        style: "danger",
      },
    ]}
  />
);
