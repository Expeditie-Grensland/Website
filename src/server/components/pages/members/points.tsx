import { ComponentProps, FunctionComponent } from "preact";
import { render } from "preact-render-to-string";
import { getFullEarnedPoints } from "../../../db/earned-point.js";
import { authenticatePerson } from "../../../db/person.js";
import { NavigationBar } from "../../page-structure/navigation-bar.js";
import { Page } from "../../page-structure/page.js";
import { PersonTeam } from "../../../db/schema/types.js";
import { getDateTime } from "../../../helpers/time.js";

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
            <figure class="figure pnt-team">
              <img
                class="figure-img rounded"
                src="/static/images/KZ.png"
                alt="Team Blauw"
              />
              <figcaption class="figure-caption text-center">
                Team Blauw
              </figcaption>
            </figure>
          </div>

          <div class="col-auto ms-auto me-auto">
            <h1 class="display-4">
              <span class="pnt-score no-wrap text-end">{teamScores.b}</span>
              <span class="pnt-dash text-center">–</span>
              <span class="pnt-score no-wrap text-start">{teamScores.r}</span>
            </h1>
          </div>

          <div class="col-auto ms-auto">
            <figure class="figure pnt-team">
              <img
                class="figure-img rounded"
                src="/static/images/KG.png"
                alt="Team Rood"
              />
              <figcaption class="figure-caption text-center">
                Team Rood
              </figcaption>
            </figure>
          </div>
        </div>

        {points.map((point, i) => (
          <>
            {(i === 0 || point.expeditie_id != points[i - 1].expeditie_id) && (
              <div class="row pt-3 pb-2">
                <div class="col-12">
                  <div class="pnt-exp-h">
                    <span class="text-muted text-uppercase font-weight-bold">
                      {point.expeditie_name &&
                        `Expeditie ${point.expeditie_name}`}
                    </span>
                  </div>
                </div>
              </div>
            )}

            <div class="row pb-1">
              {point.team == "b" && (
                <div class="col-12">
                  <span>
                    <strong class="pnt-points">+{point.amount} </strong>
                    <span>
                      {point.person_first_name} {point.person_last_name}{" "}
                    </span>
                    <span class="text-muted">
                      (
                      {getDateTime(
                        point.time_stamp,
                        point.time_zone
                      ).toLocaleString({
                        month: "2-digit",
                        day: "2-digit",
                      })}
                      )
                    </span>
                  </span>
                </div>
              )}

              {point.team == "r" && (
                <div class="col-12 text-end">
                  <span class="text-muted">
                    (
                    {getDateTime(
                      point.time_stamp,
                      point.time_zone
                    ).toLocaleString({
                      month: "2-digit",
                      day: "2-digit",
                    })}
                    ){" "}
                  </span>
                  <span>
                    {point.person_first_name} {point.person_last_name}{" "}
                  </span>
                  <strong class="pnt-points">+{point.amount}</strong>
                </div>
              )}
            </div>
          </>
        ))}

        <div class="row pb-5" />
      </div>
    </Page>
  );
};

export const renderPointsPage = (props: ComponentProps<typeof PointsPage>) =>
  render(<PointsPage {...props} />);
