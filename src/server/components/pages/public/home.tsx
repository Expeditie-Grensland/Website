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
    <div class="container">
      <NavigationBar type="public" user={user} />

      <TitleImage
        size="large"
        file={expedities[0].background_file}
        title={expedities[0].name}
        subtitle={expedities[0].subtitle}
        link={`/${expedities[0].id}`}
      />

      <div class="midtitle">Voorgaande Expedities</div>

      <div class="grid-3">
        {expedities.slice(1).map((expeditie) => (
          <TitleImage
            size="small"
            file={expeditie.background_file}
            title={expeditie.name}
            subtitle={expeditie.subtitle}
            link={`/${expeditie.id}`}
          />
        ))}
      </div>
    </div>
  </Page>
);

export const renderHomePage = (props: ComponentProps<typeof HomePage>) =>
  render(<HomePage {...props} />);
