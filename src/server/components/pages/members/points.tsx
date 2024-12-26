import { ComponentProps, FunctionComponent } from "preact";
import { render } from "preact-render-to-string";
import { getFullEarnedPoints } from "../../../db/earned-point.js";
import { authenticatePerson } from "../../../db/person.js";
import { NavigationBar } from "../../page-structure/navigation-bar.js";
import { Page } from "../../page-structure/page.js";
import { PersonTeam } from "../../../db/schema/types.js";
import { getDateTime } from "../../../helpers/time.js";

const HeaderRow: FunctionComponent<{ name?: string | null }> = ({ name }) => (
  <div class="row pt-3 pb-2">
    <div class="col-12">
      <div class="pnt-exp-h">
        <span class="text-muted text-uppercase font-weight-bold">
          {name && `Expeditie ${name}`}
        </span>
      </div>
    </div>
  </div>
);

const PointRow: FunctionComponent<{
  point: Awaited<ReturnType<typeof getFullEarnedPoints>>[number];
}> = ({ point }) => {
  const amount = <strong class="pnt-points">+{point.amount}</strong>;
  const person = (
    <span>
      {point.person_first_name} {point.person_last_name}
    </span>
  );
  const date = (
    <span class="text-muted">
      (
      {getDateTime(point.time_stamp, point.time_zone).toLocaleString({
        month: "2-digit",
        day: "2-digit",
      })}
      )
    </span>
  );

  return (
    <div class="row pb-1">
      <div class={`col-12 ${point.team == "r" ? "text-end" : "text-start"}`}>
        {point.team == "b" ? (
          <>
            {amount} {person} {date}
          </>
        ) : (
          <>
            {date} {person} {amount}
          </>
        )}
      </div>
    </div>
  );
};

const TeamFlag: FunctionComponent<{ team: "r" | "b" }> = ({ team }) => {
  const name = team == "b" ? "Team Blauw" : "Team Rood";
  return (
    <figure class="figure pnt-team">
      <img
        class="figure-img rounded"
        src={`/static/images/${team == "b" ? "KZ" : "KG"}.png`}
        alt={name}
      />
      <figcaption class="figure-caption text-center">{name}</figcaption>
    </figure>
  );
};

const PointsPage: FunctionComponent<{
  points: Awaited<ReturnType<typeof getFullEarnedPoints>>;
  user: NonNullable<Awaited<ReturnType<typeof authenticatePerson>>>;
}> = ({ points, user }) => {
  const teamScores = points.reduce(
    (acc, cur) =>
      Object.assign(acc, { [cur.team]: (acc[cur.team] || 0) + cur.amount }),
    {} as Record<PersonTeam, number>
  );

  return (
    <Page
      title="Expeditie - Punt'n"
      head={<link rel="stylesheet" href="/static/styles/members.css" />}
      afterBody={<script src="/static/scripts/members.js" />}
    >
      <div class="container">
        <NavigationBar type="members" backTo="members" user={user} />

        <div class="row align-items-start d-flex pb-4">
          <div class="col-auto me-auto">
            <TeamFlag team="b" />
          </div>

          <div class="col-auto ms-auto me-auto">
            <h1 class="display-4">
              <span class="pnt-score no-wrap text-end">{teamScores.b}</span>
              <span class="pnt-dash text-center">–</span>
              <span class="pnt-score no-wrap text-start">{teamScores.r}</span>
            </h1>
          </div>

          <div class="col-auto ms-auto">
            <TeamFlag team="r" />
          </div>
        </div>

        {points.map((point, i) => (
          <>
            {(i === 0 || point.expeditie_id != points[i - 1].expeditie_id) && (
              <HeaderRow name={point.expeditie_name} />
            )}

            <PointRow point={point} />
          </>
        ))}

        <div class="row pb-5" />
      </div>
    </Page>
  );
};

export const renderPointsPage = (props: ComponentProps<typeof PointsPage>) =>
  render(<PointsPage {...props} />);
