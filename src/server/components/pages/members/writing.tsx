import { marked } from "marked";
import type { FunctionComponent } from "preact";
import type { getFullMemberWriting } from "../../../db/member-writings.js";
import type { authenticatePerson } from "../../../db/person.js";
import { NavigationBar } from "../../page-structure/navigation-bar.js";
import { Page } from "../../page-structure/page.js";

export const WritingPage: FunctionComponent<{
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
        // biome-ignore lint/security/noDangerouslySetInnerHtml: rendering markdown
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
