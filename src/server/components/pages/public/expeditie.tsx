import { ComponentProps, FunctionComponent } from "preact";
import { render } from "preact-render-to-string";
import { getFullExpeditie } from "../../../db/expeditie.js";
import { authenticatePerson } from "../../../db/person.js";
import { getFileType, getFileUrl } from "../../../files/files.js";
import { TitleImage } from "../../media/title-image.js";
import { NavigationBar } from "../../page-structure/navigation-bar.js";
import { Page } from "../../page-structure/page.js";

const ExpeditiePage: FunctionComponent<{
  expeditie: NonNullable<Awaited<ReturnType<typeof getFullExpeditie>>>;
  user?: Awaited<ReturnType<typeof authenticatePerson>>;
}> = ({ expeditie, user }) => (
  <Page
    title={`Expeditie ${expeditie.name}`}
    head={
      <>
        <meta property="og:title" content={`Expeditie ${expeditie.name}`} />
        <meta property="og:description" content={expeditie.subtitle} />
        {expeditie.background_file && (
          <meta
            property="og:image"
            content={getFileUrl(expeditie.background_file, "normaal.jpg")}
          />
        )}
        <link rel="stylesheet" href="/static/styles/public.css" />
      </>
    }
    afterBody={
      <>
        <script src="/static/scripts/public.js" />
        <script src="/static/scripts/expeditie.js" />
      </>
    }
  >
    <div class="container text-center">
      <NavigationBar type="public" backTo="home" user={user} />

      <div class="row">
        <div class="col">
          <TitleImage
            size="large"
            file={expeditie.background_file}
            title={expeditie.name}
            subtitle={expeditie.subtitle}
          />
        </div>
      </div>

      <div class="row">
        <div class="col-12 col-md-4 order-md-2 sidebar text-md-right">
          {expeditie.show_map && (
            <a
              class="btn btn-map btn-outline-light sidebar-item"
              href={`/${expeditie.id}/kaart`}
            >
              Open de kaart
            </a>
          )}

          {expeditie.movie_editors &&
            expeditie.movie_editors.length > 0 &&
            (!expeditie.movie_restricted || user) && (
              <div class="sidebar-item">
                <span class="sidebar-title">
                  {expeditie.movie_editors.length === 1
                    ? "Filmmonteur"
                    : "Filmmonteurs"}
                </span>
                {expeditie.movie_editors.map((person) => (
                  <span>
                    {person.first_name} {person.last_name}
                  </span>
                ))}
              </div>
            )}

          <div class="sidebar-item">
            <span class="sidebar-title">Deelnemers</span>
            {expeditie.persons.map((person) => (
              <span>
                {person.first_name} {person.last_name}
                {person.type === "guest" && (
                  <span class="sidebar-detail"> (gast)</span>
                )}
              </span>
            ))}
          </div>
        </div>

        <div class="col-12 col-md-8 order-md-1">
          {expeditie.movie_file &&
            (!expeditie.movie_restricted || user) &&
            getFileType(expeditie.movie_file) == "film-dash" && (
              <div class="ratio ratio-16x9">
                <video
                  id="video"
                  class="embed-responsive-item"
                  controls
                  poster={getFileUrl(expeditie.movie_file, "poster.jpg")}
                  preload="none"
                  data-manifest-url={getFileUrl(
                    expeditie.movie_file,
                    "hls.m3u8"
                  )}
                  onPlay={`this.onplay=null;window.umami?.track("film-start",{film:"${expeditie.id}"})`}
                >
                  <source
                    src={getFileUrl(expeditie.movie_file, "720p30.mp4")}
                    type="video/mp4"
                  />
                  <p>
                    Sorry, deze video wordt niet door je browser ondersteund.
                  </p>
                </video>
              </div>
            )}
        </div>
      </div>
    </div>
  </Page>
);

export const renderExpeditiePage = (
  props: ComponentProps<typeof ExpeditiePage>
) => render(<ExpeditiePage {...props} />);
