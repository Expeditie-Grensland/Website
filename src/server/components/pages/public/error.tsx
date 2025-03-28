import { FunctionComponent } from "preact";
import { authenticatePerson } from "../../../db/person.js";
import { TitleImage } from "../../media/title-image.js";
import { NavigationBar } from "../../page-structure/navigation-bar.js";
import { Page } from "../../page-structure/page.js";

export const ErrorPage: FunctionComponent<{
  code: number | string;
  description: string;
  details?: string;
  staticRender?: boolean;
  user?: Awaited<ReturnType<typeof authenticatePerson>>;
}> = ({ code, description, details, staticRender, user }) => (
  <Page
    title="Expeditie Grensland"
    head={<link rel="stylesheet" href="/static/styles/public.css" />}
  >
    <div class="container">
      <NavigationBar
        backTo="home"
        type={staticRender ? "no-user" : "public"}
        user={user}
      />

      <TitleImage
        size="large"
        colour="#b00"
        title="Corrupt!"
        subtitle={`Code ${code}: ${description}`}
      />

      {details && <div class="error-details">{details}</div>}
    </div>
  </Page>
);
