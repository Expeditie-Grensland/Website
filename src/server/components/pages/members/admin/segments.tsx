import { Selectable } from "kysely";
import { render } from "preact-render-to-string";
import { ComponentProps, FC } from "preact/compat";
import {
  getExpeditieSegments,
  geoSegmentTypeNames,
} from "../../../../db/geo.js";
import { authenticatePerson, getAllPersons } from "../../../../db/person.js";
import { Expeditie } from "../../../../db/schema/types.js";
import { AdminPage } from "../../../admin/admin-page.js";
import {
  ColorInput,
  EnumSelectorInput,
  FormInputArray,
  NumberInput,
  PersonInput,
  TextInput,
} from "../../../admin/form-inputs.js";

const ExpeditieSegmentsAdminPage: FC<{
  segments: Awaited<ReturnType<typeof getExpeditieSegments>>;
  expeditie: Selectable<Expeditie>;
  persons: Awaited<ReturnType<typeof getAllPersons>>;
  user: NonNullable<Awaited<ReturnType<typeof authenticatePerson>>>;
  messages: Record<string, string[]>;
}> = ({ segments, expeditie, persons, user, messages }) => (
  <AdminPage
    title={`Segmenten Admin (Expeditie ${expeditie.name})`}
    fluid
    backTo={{ text: "Expeditie Admin", href: "/leden/admin/expedities" }}
    user={user}
    messages={messages}
    newAction={{
      action: `/leden/admin/expedities/${expeditie.id}/segmenten/add`,
    }}
    items={segments}
    columns={[
      {
        label: "Id",
        style: { width: "3rem" },
        onlyIn: "existing",
        render: (segment) => <div>{segment!.id}</div>,
      },

      {
        label: "Beschrijving",
        style: { minWidth: "17.5rem" },
        render: (segment, attrs) => (
          <TextInput
            name="description"
            placeholder="Beschrijving"
            required
            value={segment?.description || undefined}
            {...attrs}
          />
        ),
      },

      {
        label: "Stijl",
        style: { minWidth: "12.5rem" },
        render: (segment, attrs) => (
          <>
            <EnumSelectorInput
              name="type"
              placeholder="Type"
              textMap={geoSegmentTypeNames}
              value={segment?.type}
              {...attrs}
            />

            <ColorInput
              name="color"
              placeholder="Kleur"
              required
              value={segment?.color}
              {...attrs}
            />
          </>
        ),
      },

      {
        label: "Positie",
        style: { width: "7.5rem" },
        render: (segment, attrs) => (
          <>
            <NumberInput
              name="position_part"
              placeholder="Positie"
              required
              value={segment?.position_part}
              {...attrs}
            />

            <NumberInput
              name="position_total"
              placeholder="Uit totaal"
              required
              value={segment?.position_total}
              {...attrs}
            />
          </>
        ),
      },

      {
        label: "Personen",
        style: { minWidth: "17.5rem" },
        render: (segment, attrs) => (
          <FormInputArray minSize={1} values={segment?.persons} {...attrs}>
            {(person, attrs) => (
              <PersonInput
                name="person_ids[]"
                persons={persons}
                value={person?.id}
                {...attrs}
              />
            )}
          </FormInputArray>
        ),
      },

      {
        label: "Kinderen",
        style: { minWidth: "7.5rem" },
        render: (segment, attrs) => (
          <FormInputArray minSize={0} values={segment?.child_ids} {...attrs}>
            {(id, attrs) => (
              <NumberInput
                name="child_ids[]"
                placeholder="Id"
                value={id}
                {...attrs}
              />
            )}
          </FormInputArray>
        ),
      },
    ]}
    actions={[
      {
        label: "Wijzigen",
        action: (segment) =>
          `/leden/admin/expedities/${expeditie.id}/segmenten/update/${segment.id}`,
        confirmMessage: (segment) =>
          `Weet je zeker dat je het segment "${segment.description}" (#${segment.id}) wilt wijzigen?`,
      },
      {
        label: "Verwijderen",
        action: (segment) =>
          `/leden/admin/expedities/${expeditie.id}/segmenten/delete/${segment.id}`,
        confirmMessage: (segment) =>
          `Weet je zeker dat je segment "${segment.description}" (#${segment.id}) wilt verwijderen?`,
        style: "danger",
      },
    ]}
  />
);

export const renderExpeditieSegmentsAdminPage = (
  props: ComponentProps<typeof ExpeditieSegmentsAdminPage>
) => render(<ExpeditieSegmentsAdminPage {...props} />);
