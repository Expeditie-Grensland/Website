import { json } from "@remix-run/node";
import { Link, useLoaderData } from "@remix-run/react";
import { Prisma } from "~/generated/db";
import {
  getUserFromRequest,
  requireUser,
} from "~/utils/authentication/sessionUser";
import db from "~/utils/database/db";
import type { LoaderFunction, MetaFunction } from "@remix-run/node";

type LinkItem = {
  title: string;
  text: string;
  link?: string;
  adminLink?: string;
  external?: boolean;
};

type LoaderData = {
  externalLinks: LinkItem[];
};

const loader: LoaderFunction = async ({ request }) => {
  requireUser(await getUserFromRequest(request));

  const externalLinks: LinkItem[] = (
    await db.memberLink.findMany({
      orderBy: {
        index: Prisma.SortOrder.asc,
      },
    })
  ).map(({ title, text, link, adminLink }) => ({
    title,
    text,
    link: link || undefined,
    adminLink: adminLink || undefined,
    external: true,
  }));

  return json<LoaderData>({
    externalLinks,
  });
};

const meta: MetaFunction = () => ({
  title: `Leden - Expeditie Grensland`,
});

const MembersHome = () => {
  const { externalLinks } = useLoaderData<LoaderData>();

  const internalLinks: LinkItem[] = [
    {
      title: "Hoofdpagina",
      text: "Alle Expedities (en verborgen videos)",
      link: "/",
    },
    {
      title: "Woordenboek",
      text: "Het Grote Woordenboek der Expedities",
      link: "/leden/woordenboek",
      adminLink: "/admin/woordenboek",
    },
    {
      title: "Citaten",
      text: "De Lange Citatenlijst der Expeditie Grensland",
      link: "/leden/citaten",
      adminLink: "/admin/citaten",
    },
    {
      title: "De Punt'n",
      text: "Welk team is het vurigst? Blauw, of Rood?",
      link: "/leden/punten",
      adminLink: "/admin/punten",
    },
    {
      title: "Bestanden",
      text: "Laad ze op, of laad ze neer",
      adminLink: "/admin/bestanden",
    },
    {
      title: "GPX Upload",
      text: "Omdat we nog steeds geen app hebben",
      adminLink: "/admin/gpx",
    },
  ];

  const links = [...internalLinks, ...externalLinks];

  return (
    <div className="container mx-auto grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 mb-20">
      {links.map(({ title, text, link, adminLink, external }) => (
        <div
          className="border border-gray-300 rounded p-5 flex flex-col space-y-3"
          key={title}
        >
          <h1 className="text-xl">{title}</h1>
          <p className="flex-auto">{text}</p>
          <div className="space-x-5">
            {link &&
              (!external ? (
                <Link
                  className="block text-blue-500 hover:text-blue-700 float-left"
                  to={link}
                >
                  Open
                </Link>
              ) : (
                <a
                  className="block text-blue-500 hover:text-blue-700 float-left"
                  href={link}
                  target="_blank"
                >
                  Open
                </a>
              ))}

            {adminLink &&
              (!external ? (
                <Link
                  className="block text-blue-500 hover:text-blue-700 float-left"
                  to={adminLink}
                >
                  Admin
                </Link>
              ) : (
                <a
                  className="block text-blue-500 hover:text-blue-700 float-left"
                  href={adminLink}
                  target="_blank"
                >
                  Admin
                </a>
              ))}
          </div>
        </div>
      ))}
    </div>
  );
};

export { loader, meta };
export default MembersHome;
