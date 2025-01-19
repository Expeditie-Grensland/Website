import { ComponentProps, FunctionComponent } from "preact";
import { render } from "preact-render-to-string";
import { MapNode, MapStory } from "../../../common-types/expeditie-map.js";
import { getFullExpeditie } from "../../../db/expeditie.js";
import { getExpeditieNodes } from "../../../db/geo.js";
import { getExpeditieStories } from "../../../db/story.js";
import { getFileType, getFileUrl } from "../../../files/files.js";
import { getMapboxConfig } from "../../../helpers/config.js";
import { formatTimeFull, formatTimeNicely } from "../../../helpers/time.js";
import { ClientVariable } from "../../page-structure/client-variable.js";
import { Page } from "../../page-structure/page.js";

const peopleNames = (
  node?: Awaited<ReturnType<typeof getExpeditieNodes>>[number]
) =>
  new Intl.ListFormat("nl-NL", { style: "short", type: "conjunction" }).format(
    node?.persons
      ?.map((person) => person.first_name!)
      ?.toSorted((p1, p2) => p1?.localeCompare(p2)) || []
  );

const Story: FunctionComponent<{
  story: Awaited<ReturnType<typeof getExpeditieStories>>[number];
  node?: Awaited<ReturnType<typeof getExpeditieNodes>>[number];
}> = ({ story, node }) => (
  <div id={`story-${story.id}`} class="story">
    <div class="story-title">
      <div class="story-header">
        <h1>{story.title}</h1>
        <p
          class="story-time"
          title={formatTimeFull(story.time_stamp, story.time_zone)}
        >
          {formatTimeNicely(story.time_stamp, story.time_zone)}
        </p>
      </div>
      <p class="story-people">{peopleNames(node)}</p>
    </div>

    {story.text && <p>{story.text}</p>}

    {story.media.map((medium) => (
      <div class="story-media">
        {getFileType(medium.file) == "video" && (
          <video
            controls
            preload="none"
            poster={getFileUrl(medium.file, "poster.jpg")}
          >
            <source
              src={getFileUrl(medium.file, "1080p30.mp4")}
              type="video/mp4"
            />
          </video>
        )}
        {getFileType(medium.file) == "afbeelding" && (
          <img src={getFileUrl(medium.file, "normaal.jpg")} />
        )}

        {medium.description && <p>{medium.description}</p>}
      </div>
    ))}
  </div>
);

const ExpeditieMapPage: FunctionComponent<{
  expeditie: NonNullable<Awaited<ReturnType<typeof getFullExpeditie>>>;
  stories: Awaited<ReturnType<typeof getExpeditieStories>>;
  nodes: Awaited<ReturnType<typeof getExpeditieNodes>>;
}> = ({ expeditie, stories, nodes }) => (
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
        <link rel="stylesheet" href="/static/styles/expeditie-map.css" />
        <link
          rel="preload"
          href={`/${expeditie.id}/kaart/binary`}
          as="fetch"
          crossOrigin="use-credentials"
        />
      </>
    }
    afterBody={
      <>
        <ClientVariable
          name="routeLink"
          value={`/${expeditie.id}/kaart/binary`}
        />
        <ClientVariable name="mbToken" value={getMapboxConfig().token} />
        <ClientVariable
          name="nodes"
          value={nodes.map(
            (node, idx): MapNode => ({
              id: node.id,
              childIds: node.child_ids,
              nodeNum: idx,
            })
          )}
        />
        <ClientVariable
          name="stories"
          value={stories.map(
            (story): MapStory => ({
              id: story.id,
              nodeId: story.node_id,
              timeStamp: story.time_stamp,
              lng: story.longitude || 0,
              lat: story.latitude || 0,
              nodeNum: nodes.findIndex((node) => node.id == story.node_id)
            })
          )}
        />
        <script src="/static/scripts/expeditie-map.js" />
      </>
    }
  >
    <div id="map" />

    {stories.length > 0 && (
      <div id="storyline">
        <div class="storyline-header">
          <h1>Expeditie {expeditie.name}</h1>
          <h2>{expeditie.subtitle}</h2>
        </div>

        <div class="storyline-content">
          <div id="storyline-graph" />
          <div id="stories">
            {stories.map((story) => (
              <Story
                story={story}
                node={nodes.find((node) => node.id == story.node_id)}
              />
            ))}
          </div>
        </div>
      </div>
    )}
  </Page>
);

export const renderExpeditieMapPage = (
  props: ComponentProps<typeof ExpeditieMapPage>
) => render(<ExpeditieMapPage {...props} />);
