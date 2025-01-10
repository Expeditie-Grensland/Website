import { ComponentProps, FunctionComponent } from "preact";
import { render } from "preact-render-to-string";
import { authenticatePerson, getPerson } from "../../../db/person.js";
import { TitleImage } from "../../media/title-image.js";
import { NavigationBar } from "../../page-structure/navigation-bar.js";
import { Page } from "../../page-structure/page.js";

const MemberPage: FunctionComponent<{
  person: NonNullable<Awaited<ReturnType<typeof getPerson>>>;
  user?: Awaited<ReturnType<typeof authenticatePerson>>;
}> = ({ person, user }) => (
  <Page
    title={`Expeditie Lid ${person.first_name} ${person.last_name}`}
    head={<link rel="stylesheet" href="/static/styles/public.css" />}
    afterBody={<script src="/static/scripts/public.js" />}
  >
    <div class="container">
      <NavigationBar type="public" backTo="home" user={user} />

      <TitleImage
        size="large"
        title={`${person.first_name} ${person.last_name}`}
      />
    </div>
  </Page>
);

export const renderMemberPage = (props: ComponentProps<typeof MemberPage>) =>
  render(<MemberPage {...props} />);
