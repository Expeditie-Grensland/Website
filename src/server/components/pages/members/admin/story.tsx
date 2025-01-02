import { ComponentProps, FunctionComponent } from "preact";
import { render } from "preact-render-to-string";
import { getAllExpedities } from "../../../../db/expeditie.js";
import { authenticatePerson, getAllPersons } from "../../../../db/person.js";
import { getAllStories } from "../../../../db/story.js";
import { AdminPage } from "../../../admin/admin-page.js";
import { FormInputArray } from "../../../admin/form-inputs.js";
import {
  HiddenInput,
  LocalTimeInput,
  TextAreaInput,
  TextInput,
  TimezoneInput,
} from "../../../admin/form-inputs.js";
import {
  ExpeditieInput,
  PersonInput
} from "../../../admin/form-inputs.js";

const StoryAdminPage: FunctionComponent<{
  stories: Awaited<ReturnType<typeof getAllStories>>;
  expedities: Awaited<ReturnType<typeof getAllExpedities>>;
  persons: Awaited<ReturnType<typeof getAllPersons>>;
  user: NonNullable<Awaited<ReturnType<typeof authenticatePerson>>>;
  messages: Record<string, string[]>;
}> = ({ stories, expedities, persons, user, messages }) => (
  <AdminPage
    title="Verhalen Admin"
    fluid
    user={user}
    messages={messages}
    newAction={{ action: "/leden/admin/verhalen/add" }}
    items={stories}
    itemKey="id"
    columns={[
      {
        label: "Expeditie",
        style: { minWidth: "12.5rem" },
        render: (story, attrs) => (
          <ExpeditieInput
            expedities={expedities}
            value={story?.expeditie_id}
            name="expeditie_id"
            allowEmpty
            {...attrs}
          />
        ),
      },

      {
        label: "Persoon",
        style: { minWidth: "12.5rem" },
        render: (story, attrs) => (
          <PersonInput
            persons={persons}
            value={story?.person_id}
            name="person_id"
            {...attrs}
          />
        ),
      },

      {
        label: "Lokale tijd en tijdzone",
        style: { minWidth: "12.5rem" },
        render: (story, attrs) => (
          <>
            <LocalTimeInput
              name="time_local"
              required
              value={
                story && { stamp: story.time_stamp, zone: story.time_zone }
              }
              {...attrs}
            />
            <TimezoneInput
              name="time_zone"
              required
              value={story?.time_zone}
              {...attrs}
            />
          </>
        ),
      },

      {
        label: "Titel",
        style: { minWidth: "17.5rem" },
        render: (story, attrs) => (
          <TextInput
            name="title"
            placeholder="Titel"
            required
            value={story?.title}
            {...attrs}
          />
        ),
      },

      {
        label: "Tekst",
        style: { minWidth: "17.5rem" },
        render: (story, attrs) => (
          <TextAreaInput
            name="text"
            placeholder="Tekst (optioneel)"
            value={story?.text || undefined}
            {...attrs}
          />
        ),
      },

      {
        label: "Media",
        style: { minWidth: "17.5rem" },
        render: (story, attrs) => (
          <FormInputArray allowEmpty values={story?.media} {...attrs}>
            {(medium, attrs) => (
              <>
                <HiddenInput name="media_ids[]" value={medium?.id} {...attrs} />
                <TextInput
                  name="media_files[]"
                  placeholder="Bestandsnaam"
                  required
                  value={medium?.file}
                  {...attrs}
                />
                <TextAreaInput
                  name="media_descriptions[]"
                  placeholder="Beschrijving (optioneel)"
                  value={medium?.description}
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
        action: (story) => `/leden/admin/verhalen/update/${story.id}`,
      },
      {
        label: "Verwijderen",
        action: (story) => `/leden/admin/verhalen/delete/${story.id}`,
        style: "danger",
      },
    ]}
  />
);

export const renderStoryAdminPage = (
  props: ComponentProps<typeof StoryAdminPage>
) => render(<StoryAdminPage {...props} />);
