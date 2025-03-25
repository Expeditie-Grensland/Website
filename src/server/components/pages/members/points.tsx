import { FunctionComponent } from "preact";
import { getFullEarnedPoints } from "../../../db/earned-point.js";
import { authenticatePerson } from "../../../db/person.js";
import { formatTimeDayMonth, formatTimeFull } from "../../../helpers/time.js";
import { NavigationBar } from "../../page-structure/navigation-bar.js";
import { Page } from "../../page-structure/page.js";

export const PointsPage: FunctionComponent<{
  points: Awaited<ReturnType<typeof getFullEarnedPoints>>;
  user: NonNullable<Awaited<ReturnType<typeof authenticatePerson>>>;
}> = ({ points, user }) => {
  const teamScores = points.reduce(
    (acc, cur) =>
      Object.assign(acc, { [cur.team]: acc[cur.team] + cur.amount }),
    { blue: 0, red: 0, green: 0 }
  );

  const pointsByExpeditie = points.reduce(
    (acc, cur) =>
      acc.length == 0 || acc.at(-1)!.name != cur.expeditie_name
        ? [...acc, { name: cur.expeditie_name, points: [cur] }]
        : [
            ...acc.slice(0, -1),
            { name: cur.expeditie_name, points: [...acc.at(-1)!.points, cur] },
          ],
    [] as { name: string | null; points: typeof points }[]
  );

  return (
    <Page
      title="Expeditie - Punt'n"
      head={<link rel="stylesheet" href="/static/styles/members.css" />}
      afterBody={<script src="/static/scripts/members.js" />}
    >
      <div class="container">
        <NavigationBar type="members" backTo="members" user={user} />

        <div class="points-teams">
          <figure class="points-flag">
            <img src={`/static/images/kazakhstan.svg`} alt="Team Blauw" />
            <figcaption>Team Blauw</figcaption>
          </figure>

          <div class="points-b">{teamScores.blue}</div>
          <div class="points-dash">–</div>
          <div class="points-r">{teamScores.red}</div>

          <figure class="points-flag">
            <img src={`/static/images/kyrgyzstan.svg`} alt="Team Rood" />
            <figcaption>Team Rood</figcaption>
          </figure>
        </div>

        {pointsByExpeditie.map(({ name, points }) => (
          <div class="points-group">
            <div class="points-expeditie">
              <h1>{name && `Expeditie ${name}`}</h1>
            </div>

            {points.map((point) => (
              <div
                class={`point-row ${point.team == "blue" ? "point-row-b" : "point-row-r"}`}
              >
                <div class="point-amount">+{point.amount}</div>
                <div class="point-person">
                  {point.person_first_name} {point.person_last_name}
                </div>
                <div
                  class="point-date"
                  title={formatTimeFull(point.time_stamp, point.time_zone)}
                >
                  ({formatTimeDayMonth(point.time_stamp, point.time_zone)})
                </div>
              </div>
            ))}
          </div>
        ))}
      </div>
    </Page>
  );
};
