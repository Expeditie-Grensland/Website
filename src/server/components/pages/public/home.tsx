import { ComponentProps, FunctionComponent } from "preact";
import { render } from "preact-render-to-string";
import { getAllExpedities } from "../../../db/expeditie.js";
import { authenticatePerson } from "../../../db/person.js";
import { TitleImage } from "../../media/title-image.js";
import { NavigationBar } from "../../page-structure/navigation-bar.js";
import { Page } from "../../page-structure/page.js";

const HomePage: FunctionComponent<{
  expedities: Awaited<ReturnType<typeof getAllExpedities>>;
  user?: Awaited<ReturnType<typeof authenticatePerson>>;
}> = ({ expedities, user }) => (
  <Page
    title="Expeditie Grensland"
    head={<link rel="stylesheet" href="/static/styles/public.css" />}
    afterBody={<script src="/static/scripts/public.js" />}
  >
    <div class="container text-center">
      <NavigationBar type="public" user={user} />

      <div class="row">
        <div class="col">
          <TitleImage
            size="large"
            file={expedities[0].background_file}
            title={expedities[0].name}
            subtitle={expedities[0].subtitle}
            link={`/${expedities[0].id}`}
          />
        </div>
      </div>

      <div class="row">
        <div class="col-12 midtitle">
          <span>Voorgaande Expedities</span>
        </div>

        {expedities.slice(1).map((expeditie) => (
          <div class="col-12 col-md-6 col-lg-4">
            <TitleImage
              size="small"
              file={expeditie.background_file}
              title={expeditie.name}
              subtitle={expeditie.subtitle}
              link={`/${expeditie.id}`}
            />
          </div>
        ))}
      </div>
    </div>
  </Page>
);

export const renderHomePage = (props: ComponentProps<typeof HomePage>) =>
  render(<HomePage {...props} />);
