import { json } from "@remix-run/node";
import { useLoaderData } from "@remix-run/react";
import { toDate } from "date-fns";
import { formatInTimeZone } from "date-fns-tz";
import { nl } from "date-fns/locale";
import kg_flag from "~/assets/flag_kg.svg";
import kz_flag from "~/assets/flag_kz.svg";
import { Prisma } from "~/generated/db";
import {
  getUserFromRequest,
  requireUser,
} from "~/utils/authentication/sessionUser";
import cx from "~/utils/classNames/cx";
import db from "~/utils/database/db";
import type { LoaderFunction, MetaFunction } from "@remix-run/node";
import type { PersonTeam } from "~/generated/db";

const handle = {
  backLink: () => ({
    to: "/leden",
    text: "← Leden",
  }),
};

const meta: MetaFunction = () => ({
  title: `Woordenboek - Expeditie Grensland`,
});

type LoaderData = {
  items: {
    id: number;
    amount: number;
    timestamp: number;
    timezone: string;
    expeditie: {
      name: string;
    } | null;
    person: {
      firstName: string;
      lastName: string;
      team: PersonTeam | null;
    };
  }[];
};

const loader: LoaderFunction = async ({ request }) => {
  requireUser(await getUserFromRequest(request));

  const items = await db.earnedPoint.findMany({
    select: {
      id: true,
      amount: true,
      timestamp: true,
      timezone: true,
      expeditie: {
        select: {
          name: true,
        },
      },
      person: {
        select: {
          firstName: true,
          lastName: true,
          team: true,
        },
      },
    },
    orderBy: [
      {
        timestamp: Prisma.SortOrder.desc,
      },
      {
        person: {
          team: Prisma.SortOrder.asc,
        },
      },
      {
        person: {
          lastName: Prisma.SortOrder.asc,
        },
      },
    ],
  });

  return json<LoaderData>({
    items,
  });
};

const PointsPage = () => {
  const { items } = useLoaderData<LoaderData>();

  const groupedItems = [] as LoaderData["items"][];
  items.forEach((item, i) => {
    if (i === 0 || item.expeditie?.name !== items[i - 1].expeditie?.name) {
      groupedItems.push([item]);
    } else {
      groupedItems[groupedItems.length - 1].push(item);
    }
  });

  const [bluePoints, redPoints] = items.reduce(
    ([blueAcc, redAcc], item) =>
      item.person.team === "BLUE"
        ? [blueAcc + item.amount, redAcc]
        : [blueAcc, redAcc + item.amount],
    [0, 0]
  );

  return (
    <div className="container mx-auto mb-20">
      <div className="flex items-center gap-x-5 flex-wrap pb-8">
        <div className="w-28 text-center text-[#6c757d] text-sm flex-none">
          <img className="mb-2 rounded-md" src={kz_flag} alt="" />
          <div>Team Blauw</div>
        </div>

        <div className="flex-1 text-right text-6xl pb-4">{bluePoints}</div>

        <div className="flex-none text-6xl pb-4">–</div>

        <div className="flex-1 text-left text-6xl pb-4">{redPoints}</div>

        <div className="w-28 text-center text-[#6c757d] text-sm flex-none ml-auto">
          <img className="mb-2 rounded-md" src={kg_flag} alt="" />
          <div>Team Rood</div>
        </div>
      </div>

      {groupedItems.map((group) => (
        <div key={group[0].id}>
          <div className="relative flex items-center h-8 mt-4 mb-1">
            <div className="flex-grow border-t-2 border-[#eee] border-m-" />

            {group[0].expeditie && (
              <>
                <div className="flex-none mx-4 text-[#6c757d] font-bold uppercase">
                  Expeditie {group[0].expeditie.name}
                </div>
                <div className="flex-grow border-t-2 border-[#eee]" />
              </>
            )}
          </div>

          {group.map(({ id, amount, timestamp, timezone, person }) => {
            const date = toDate(timestamp * 1000);

            return (
              <div
                key={id}
                className={cx([
                  "flex gap-x-2 mb-1",
                  person.team === "BLUE" && "flex-row text-left",
                  person.team === "RED" && "flex-row-reverse text-right",
                ])}
              >
                <div className="font-bold w-7">+{amount}</div>
                <div>
                  {person.firstName} {person.lastName}
                </div>
                <div
                  className="text-[#6c757d]"
                  title={formatInTimeZone(
                    date,
                    timezone,
                    "d MMMM yyyy, 'rond' HH:mm",
                    {
                      locale: nl,
                    }
                  )}
                >
                  ({formatInTimeZone(date, timezone, "dd-MM", { locale: nl })})
                </div>
              </div>
            );
          })}
        </div>
      ))}
    </div>
  );
};

export { handle, meta, loader };
export default PointsPage;
