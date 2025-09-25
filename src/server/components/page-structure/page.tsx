import type { ComponentChildren, FunctionComponent } from "preact";
import { getUmamiConfig } from "../../helpers/config.js";

export const Page: FunctionComponent<{
  title: string;
  head?: ComponentChildren;
  afterBody?: ComponentChildren;
}> = ({ title, children, head, afterBody }) => (
  <html lang="nl">
    <head>
      <meta charSet="utf-8" />
      <meta
        name="viewport"
        content="width=device-width,initial-scale=1,shrink-to-fit=no"
      />

      <title>{title}</title>

      <meta name="application-name" content="Expeditie Grensland" />
      <meta name="apple-mobile-web-app-title" content="Expeditie Grensland" />
      <meta name="theme-color" content="#000718" />

      <link rel="manifest" href="/static/favicons/manifest.webmanifest" />
      <meta
        name="msapplication-config"
        content="/static/favicons/browserconfig.xml"
      />

      <link rel="shortcut icon" href="/static/favicons/favicon.ico" />

      {[16, 32, 48].map((size) => (
        <link
          rel="icon"
          type="image/png"
          sizes={`${size}x${size}`}
          href={`/static/favicons/icon-${size}.png`}
        />
      ))}

      {[60, 76, 120, 152, 180].map((size) => (
        <link
          rel="apple-touch-icon"
          sizes={`${size}x${size}`}
          href={`/static/favicons/touch-icon-${size}.png`}
        />
      ))}

      {getUmamiConfig() && (
        <script
          src={getUmamiConfig()!.scriptUrl}
          data-website-id={getUmamiConfig()!.websiteId}
        />
      )}

      {head}
    </head>

    <body>{children}</body>

    {afterBody}
  </html>
);
