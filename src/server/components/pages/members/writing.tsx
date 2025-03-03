import { marked } from "marked";
import { ComponentProps, FunctionComponent } from "preact";
import { render } from "preact-render-to-string";
import { getFullMemberWriting } from "../../../db/member-writings.js";
import { authenticatePerson } from "../../../db/person.js";
import { NavigationBar } from "../../page-structure/navigation-bar.js";
import { Page } from "../../page-structure/page.js";

const WritingPage: FunctionComponent<{
  writing: NonNullable<Awaited<ReturnType<typeof getFullMemberWriting>>>;
  user: NonNullable<Awaited<ReturnType<typeof authenticatePerson>>>;
}> = ({ writing, user }) => (
  <Page
    title={`Expeditie - ${writing?.title}`}
    head={<link rel="stylesheet" href="/static/styles/members.css" />}
    afterBody={<script src="/static/scripts/members.js" />}
  >
    <div class="container">
      <NavigationBar type="members" backTo="members" user={user} />

      <h1 class="page-title">{writing.title}</h1>

      <div
        class="writing"
        dangerouslySetInnerHTML={{
          __html: marked.parse(writing.text, {
            async: false,
            gfm: true,
            breaks: true,
          }),
        }}
      />
    </div>
  </Page>
);

export const renderWritingPage = (props: ComponentProps<typeof WritingPage>) =>
  render(<WritingPage {...props} />);
