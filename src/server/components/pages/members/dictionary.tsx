import { marked } from "marked";
import { ComponentProps, FunctionComponent } from "preact";
import { render } from "preact-render-to-string";
import { authenticatePerson } from "../../../db/person.js";
import { getAllWords } from "../../../db/word.js";
import { MediaPlayer } from "../../media/media-player.js";
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

      <div class="row pb-5">
        <div class="col-12">
          <div class="h1">Het Grote Woordenboek der Expediets</div>
        </div>
      </div>

      <div class="row pb-5">
        {words.map((word) => (
          <>
            <div id={word.id} class="col-12 col-xl-9 pb-4">
              <div class="h2 pb-2">
                {word.word}{" "}
                {word.phonetic && (
                  <small class="text-muted">[{word.phonetic}]</small>
                )}
              </div>

              <ol class="serif">
                {word.definitions.map((definition) => (
                  <li
                    class="pb-1"
                    dangerouslySetInnerHTML={{
                      __html: marked(definition) as string,
                    }}
                  />
                ))}
              </ol>
            </div>

            {word.attachment_file && (
              <div class="col-12 col-xl-3 pb-4">
                <MediaPlayer file={word.attachment_file} />
              </div>
            )}
          </>
        ))}
      </div>
    </div>
  </Page>
);

export const renderDictionaryPage = (
  props: ComponentProps<typeof DictionaryPage>
) => render(<DictionaryPage {...props} />);
