import { ComponentProps, FunctionComponent } from "preact";
import { render } from "preact-render-to-string";
import { getFullExpeditie } from "../../../db/expeditie.js";
import { getFileUrl } from "../../../files/files.js";
import { getMapboxConfig } from "../../../helpers/config.js";
import { Page } from "../../page-structure/page.js";
import { ClientVariable } from "../../page-structure/client-variable.js";

const ExpeditieMapPage: FunctionComponent<{
  expeditie: NonNullable<Awaited<ReturnType<typeof getFullExpeditie>>>;
  hasStory: boolean;
}> = ({ expeditie, hasStory }) => (
  <Page
    title={`Expeditie ${expeditie.name} Kaart`}
    head={
      <>
        {expeditie.background_file && (
          <meta
            property="og:image"
            content={getFileUrl(expeditie.background_file, "normaal.jpg")}
          />
        )}
        <link rel="stylesheet" href="/static/styles/expeditieMap.css" />
        <link
          id="worker"
          rel="prefetch"
          href="/static/scripts/expeditieMapWorker.js"
          as="worker"
        />
      </>
    }
    afterBody={
      <>
        <ClientVariable name="expeditieNameShort" value={expeditie.id} />
        <ClientVariable name="mbToken" value={getMapboxConfig().token} />
        <ClientVariable type="let" name="hasStory" value={hasStory} />
        <script src="/static/scripts/expeditieMap.js" />
      </>
    }
  >
    <div id="map" />

    <div id="storyWrapper" hidden>
      <div id="storyTitle" class="card">
        <p class="subtitle">{expeditie.subtitle}</p>
        <button class="zoomout">uitzoomen</button>
        <h1>{expeditie.name}</h1>
      </div>

      <div id="story">
        <div id="graph" class="card" />
        <div id="storyElements" />
      </div>
    </div>
  </Page>
);

export const renderExpeditieMapPage = (
  props: ComponentProps<typeof ExpeditieMapPage>
) => render(<ExpeditieMapPage {...props} />);
