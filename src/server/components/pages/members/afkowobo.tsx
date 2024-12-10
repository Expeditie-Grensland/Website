import { marked } from "marked";
import { ComponentProps, FunctionComponent } from "preact";
import { render } from "preact-render-to-string";
import { getAllAfkos } from "../../../db/afko.js";
import { authenticatePerson } from "../../../db/person.js";
import { MediaPlayer } from "../../media/media-player.js";
import { NavigationBar } from "../../page-structure/navigation-bar.js";
import { Page } from "../../page-structure/page.js";

const AfkowoboPage: FunctionComponent<{
  afkos: Awaited<ReturnType<typeof getAllAfkos>>;
  user: NonNullable<Awaited<ReturnType<typeof authenticatePerson>>>;
}> = ({ afkos, user }) => (
  <Page
    title="Expeditie - Afkowobo"
    head={<link rel="stylesheet" href="/static/styles/members.css" />}
    afterBody={<script src="/static/scripts/members.js" />}
  >
    <div class="container">
      <NavigationBar type="members" backTo="members" user={user} />

      <div class="row pb-5">
        <div class="col-12">
          <div class="h1">
            Het enige echte afkortingenwoordenboek der Expediets
          </div>
        </div>
      </div>

      <div class="row pb-5">
        {afkos.map((afko) => (
          <>
            <div id={afko.id} class="col-12 col-xl-9 pb-4">
              <div class="h2 pb-2">{afko.afko}</div>

              <ol class="serif">
                {afko.definitions.map((definition) => (
                  <li
                    class="pb-1"
                    dangerouslySetInnerHTML={{
                      __html: marked(definition) as string,
                    }}
                  />
                ))}
              </ol>
            </div>

            {afko.attachment_file && (
              <div class="col-12 col-xl-3 pb-4">
                <MediaPlayer file={afko.attachment_file} />
              </div>
            )}
          </>
        ))}
      </div>
    </div>
  </Page>
);

export const renderAfkowobopage = (
  props: ComponentProps<typeof AfkowoboPage>
) => render(<AfkowoboPage {...props} />);
