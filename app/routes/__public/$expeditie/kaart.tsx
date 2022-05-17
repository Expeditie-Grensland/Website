import { json, LoaderFunction, MetaFunction } from "@remix-run/node";
import { useParams } from "@remix-run/react";
import { useEffect, useState } from "react";
import { NavBarHandle } from "~/components/NavBar";
import db from "~/utils/database/db";
import { geoDataFetcher } from "./geodata";

const handle: NavBarHandle = {
  backLink: ({ params, data }) => ({
    to: `/${params.expeditie}`,
    text: `← Expeditie ${data.name}`,
  }),
};

const meta: MetaFunction = ({ data }) => ({
  title: `Kaart - Expeditie ${data.name}`,
});

const loader: LoaderFunction = async ({ params }) => {
  const expeditie = await db.expeditie.findUnique({
    where: { slug: params.expeditie },
    select: {
      name: true,
      showMap: true,
    },
  });

  if (!expeditie) throw json("Expeditie niet gevonden", { status: 404 });

  if (!expeditie.showMap)
    throw json("Kaart niet beschikbaar voor expeditie", { status: 404 });

  return expeditie;
};

const ExpeditieMapPage = () => {
  const params = useParams();
  const [locations, setLocations] = useState("abc");

  useEffect(() => {
    (async () => {
      const geoData = await geoDataFetcher(params.expeditie!);
      setLocations(JSON.stringify(geoData.toJSON()));
    })();
  });

  return <div>{locations}</div>;
};

export { handle, meta, loader };
export default ExpeditieMapPage;
