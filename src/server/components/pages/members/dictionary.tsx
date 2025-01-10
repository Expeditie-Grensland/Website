import { ComponentProps, FunctionComponent } from "preact";
import { render } from "preact-render-to-string";
import { authenticatePerson } from "../../../db/person.js";
import { getAllWords } from "../../../db/word.js";
import { DictionaryEntry } from "../../members/dictionary-entry.js";
import { NavigationBar } from "../../page-structure/navigation-bar.js";
import { Page } from "../../page-structure/page.js";

const DictionaryPage: FunctionComponent<{
  words: Awaited<ReturnType<typeof getAllWords>>;
  user: NonNullable<Awaited<ReturnType<typeof authenticatePerson>>>;
}> = ({ words, user }) => (
  <Page
    title="Expeditie - Woordenboek"
    head={<link rel="stylesheet" href="/static/styles/members.css" />}
    afterBody={<script src="/static/scripts/members.js" />}
  >
    <div class="container">
      <NavigationBar type="members" backTo="members" user={user} />

      <h1 class="page-title">Het Grote Woordenboek der Expediets</h1>

      {words.map((word) => (
        <DictionaryEntry
          id={word.id}
          term={word.word}
          smallTerm={word.phonetic && `[${word.phonetic}]`}
          descriptions={word.definitions}
          attachmentFile={word.attachment_file}
        />
      ))}
    </div>
  </Page>
);

export const renderDictionaryPage = (
  props: ComponentProps<typeof DictionaryPage>
) => render(<DictionaryPage {...props} />);
