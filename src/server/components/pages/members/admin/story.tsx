import { ComponentProps, FunctionComponent } from "preact";
import { render } from "preact-render-to-string";
import { getAllNodes } from "../../../../db/geo.js";
import { authenticatePerson } from "../../../../db/person.js";
import { getAllStories } from "../../../../db/story.js";
import { AdminPage } from "../../../admin/admin-page.js";
import {
  FormInputArray,
  HiddenInput,
  LocalTimeInput,
  NodeInput,
  TextAreaInput,
  TextInput,
  TimezoneInput,
} from "../../../admin/form-inputs.js";

const StoryAdminPage: FunctionComponent<{
  stories: Awaited<ReturnType<typeof getAllStories>>;
  nodes: Awaited<ReturnType<typeof getAllNodes>>;
  user: NonNullable<Awaited<ReturnType<typeof authenticatePerson>>>;
  messages: Record<string, string[]>;
}> = ({ stories, nodes, user, messages }) => (
  <AdminPage
    title="Verhalen Admin"
    fluid
    user={user}
    messages={messages}
    newAction={{ action: "/leden/admin/verhalen/add" }}
    items={stories}
    columns={[
      {
        label: "Node",
        style: { minWidth: "17.5rem" },
        render: (story, attrs) => (
          <NodeInput
            nodes={nodes}
            value={story?.node_id?.toString()}
            name="node_id"
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
          <FormInputArray minSize={0} values={story?.media} {...attrs}>
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
