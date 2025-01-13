import { ComponentProps, FunctionComponent } from "preact";
import { render } from "preact-render-to-string";
import { getAllEarnedPoints } from "../../../../db/earned-point.js";
import { getAllExpedities } from "../../../../db/expeditie.js";
import { authenticatePerson, getAllPersons } from "../../../../db/person.js";
import { AdminPage } from "../../../admin/admin-page.js";
import {
  ExpeditieInput,
  LocalTimeInput,
  NumberInput,
  PersonInput,
  SelectorInput,
  TimezoneInput,
} from "../../../admin/form-inputs.js";

const PointsAdminPage: FunctionComponent<{
  points: Awaited<ReturnType<typeof getAllEarnedPoints>>;
  expedities: Awaited<ReturnType<typeof getAllExpedities>>;
  persons: Awaited<ReturnType<typeof getAllPersons>>;
  user: NonNullable<Awaited<ReturnType<typeof authenticatePerson>>>;
  messages: Record<string, string[]>;
}> = ({ points, expedities, persons, user, messages }) => (
  <AdminPage
    title="Punten Admin"
    fluid
    user={user}
    messages={messages}
    newAction={{ action: "/leden/admin/punten/add" }}
    items={points}
    columns={[
      {
        label: "Persoon",
        style: { minWidth: "20rem" },
        render: (point, attrs) => (
          <PersonInput
            persons={persons}
            value={point?.person_id}
            name="person_id"
            {...attrs}
          />
        ),
      },

      {
        label: "Expeditie",
        style: { minWidth: "20rem" },
        render: (point, attrs) => (
          <ExpeditieInput
            expedities={expedities}
            value={point?.expeditie_id}
            name="expeditie_id"
            allowEmpty
            {...attrs}
          />
        ),
      },

      {
        label: "Team",
        style: { minWidth: "10rem" },
        render: (point, attrs) => (
          <SelectorInput
            placeholder="Team"
            name="team"
            options={[
              { id: "b", text: "Blauw" },
              { id: "r", text: "Rood" },
            ]}
            value={point?.team}
            {...attrs}
          />
        ),
      },

      {
        label: "Aantal",
        style: { minWidth: "10rem" },
        render: (point, attrs) => (
          <NumberInput
            name="amount"
            placeholder="Aantal punten"
            value={point?.amount}
            required
            {...attrs}
          />
        ),
      },

      {
        label: "Lokale tijd en tijdzone",
        style: { minWidth: "12.5rem" },
        render: (point, attrs) => (
          <>
            <LocalTimeInput
              name="time_local"
              required
              value={
                point && { stamp: point.time_stamp, zone: point.time_zone }
              }
              {...attrs}
            />
            <TimezoneInput
              name="time_zone"
              required
              value={point?.time_zone}
              {...attrs}
            />
          </>
        ),
      },
    ]}
    actions={[
      {
        label: "Wijzigen",
        action: (point) => `/leden/admin/punten/update/${point.id}`,
      },
      {
        label: "Verwijderen",
        action: (point) => `/leden/admin/punten/delete/${point.id}`,
        style: "danger",
      },
    ]}
  />
);

export const renderPointsAdminPage = (
  props: ComponentProps<typeof PointsAdminPage>
) => render(<PointsAdminPage {...props} />);
