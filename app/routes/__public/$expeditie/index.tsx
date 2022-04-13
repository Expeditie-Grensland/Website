import type { LoaderFunction } from "@remix-run/node";
import { json } from "@remix-run/node";
import { Link, useLoaderData } from "@remix-run/react";
import db from "app/utils/db.server";

const loader: LoaderFunction = async ({ params }) => {
  const data = await db.expeditie.findUnique({
    where: {
      slug: params.expeditie,
    },
    include: {
      backgroundFile: true,
      people: true,
      movieEditors: true,
    },
  });

  if (!data) throw json("Expeditie niet gevonden!", { status: 404 });

  return json(data);
};

const ExpeditiePage = () => {
  const data = useLoaderData();

  return (
    <>
      <Link to="/">Home</Link>
      <br />
      <pre>{JSON.stringify(data)}</pre>
    </>
  );
};

export { loader };
export default ExpeditiePage;
