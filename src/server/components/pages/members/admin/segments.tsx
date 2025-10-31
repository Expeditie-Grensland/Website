import type { Selectable } from "kysely";
import type { FunctionComponent } from "preact";
import {
  geoSegmentTypeTexts,
  type getExpeditieSegments,
} from "../../../../db/geo.js";
import type {
  authenticatePerson,
  getAllPersons,
} from "../../../../db/person.js";
import type { Expeditie } from "../../../../db/schema/types.js";
import { AdminPage } from "../../../admin/admin-page.js";
import {
  ColorInput,
  EnumSelectorInput,
  FormInputArray,
  NumberInput,
  PersonInput,
  SegmentInput,
  TextInput,
} from "../../../admin/form-inputs.js";

export const ExpeditieSegmentsAdminPage: FunctionComponent<{
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
        render: (segment) => <div>{segment.id}</div>,
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
              textMap={geoSegmentTypeTexts}
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
        style: { minWidth: "17.5rem" },
        render: (segment, attrs) => (
          <FormInputArray minSize={0} values={segment?.child_ids} {...attrs}>
            {(id, attrs) => (
              <SegmentInput
                segments={segments.filter((s) => s.id !== segment?.id)}
                name="child_ids[]"
                placeholder="Kind-segment"
                value={id?.toString()}
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
