import { ComponentProps, FunctionComponent } from "preact";
import { render } from "preact-render-to-string";
import { authenticatePerson } from "../../../db/person.js";
import { TitleImage } from "../../media/title-image.js";
import { NavigationBar } from "../../page-structure/navigation-bar.js";
import { Page } from "../../page-structure/page.js";

const ErrorPage: FunctionComponent<{
  code: number | string;
  description: string;
  details?: string;
  staticRender?: boolean;
  user?: Awaited<ReturnType<typeof authenticatePerson>>;
}> = ({ code, description, details, staticRender, user }) => (
  <Page
    title="Expeditie Grensland"
    head={<link rel="stylesheet" href="/static/styles/public.css" />}
    afterBody={<script src="/static/scripts/public.js" />}
  >
    <div class="container text-center">
      <NavigationBar type={staticRender ? "no-user" : "public"} user={user} />

      <div class="row">
        <div class="col">
          <TitleImage
            size="large"
            colour="#b00"
            title="Corrupt!"
            subtitle={`Code ${code}: ${description}`}
          />
        </div>
      </div>

      {details && (
        <div class="row">
          <div class="col">
            <span class="error-details">{details}</span>
          </div>
        </div>
      )}
    </div>
  </Page>
);

export const renderErrorPage = (props: ComponentProps<typeof ErrorPage>) =>
  render(<ErrorPage {...props} />);
