import type { LinksFunction, MetaFunction } from "@remix-run/node";
import {
  Links,
  LiveReload,
  Meta,
  Outlet,
  Scripts,
  ScrollRestoration,
  useMatches,
} from "@remix-run/react";
import twStyle from "~/generated/styles/tailwind.css";
import cx from "./utils/classNames/cx";

const links: LinksFunction = () => [
  { rel: "stylesheet", href: twStyle },
  { rel: "preconnect", href: "https://fonts.googleapis.com" },
  {
    rel: "preconnect",
    href: "https://fonts.gstatic.com",
    crossOrigin: "anonymous",
  },
  {
    rel: "stylesheet",
    href: "https://fonts.googleapis.com/css2?family=Open+Sans&display=swap",
  },
];

const meta: MetaFunction = () => ({
  charset: "utf-8",
  title: "Expeditie Grensland",
  viewport: "width=device-width,initial-scale=1",
});

const App = () => {
  const matches = useMatches();

  return (
    <html lang="en">
      <head>
        <Meta />
        <Links />
      </head>
      <body className={cx(matches.map(({ handle }) => handle?.bodyClasses))}>
        <Outlet />
        <ScrollRestoration />
        <Scripts />
        <LiveReload />
      </body>
    </html>
  );
};

export { links, meta };
export default App;
