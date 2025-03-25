import { FunctionComponent } from "preact";
import { MapSegment, MapStory } from "../../../common-types/expeditie-map.js";
import { getFullExpeditie } from "../../../db/expeditie.js";
import { getExpeditieSegments, getRouteVersion } from "../../../db/geo.js";
import { getExpeditieStories } from "../../../db/story.js";
import { getFileType, getFileUrl } from "../../../files/files.js";
import { getMapboxConfig } from "../../../helpers/config.js";
import { formatTimeFull, formatTimeNicely } from "../../../helpers/time.js";
import { ClientVariable } from "../../page-structure/client-variable.js";
import { Page } from "../../page-structure/page.js";

const peopleNames = (
  segment?: Awaited<ReturnType<typeof getExpeditieSegments>>[number]
) =>
  new Intl.ListFormat("nl-NL", { style: "short", type: "conjunction" }).format(
    segment?.persons
      ?.map((person) => person.first_name!)
      ?.toSorted((p1, p2) => p1?.localeCompare(p2)) || []
  );

const Story: FunctionComponent<{
  story: Awaited<ReturnType<typeof getExpeditieStories>>[number];
  segment?: Awaited<ReturnType<typeof getExpeditieSegments>>[number];
}> = ({ story, segment }) => (
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
      <p class="story-people">{peopleNames(segment)}</p>
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

export const ExpeditieMapPage: FunctionComponent<{
  expeditie: NonNullable<Awaited<ReturnType<typeof getFullExpeditie>>>;
  stories: Awaited<ReturnType<typeof getExpeditieStories>>;
  segments: Awaited<ReturnType<typeof getExpeditieSegments>>;
  routeVersion: Awaited<ReturnType<typeof getRouteVersion>>;
}> = ({ expeditie, stories, segments, routeVersion }) => (
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
          href="/static/scripts/expeditie-map.js"
          as="script"
        />
        <link
          rel="preload"
          href={`/${expeditie.id}/kaart/route-data?v=${routeVersion}`}
          as="fetch"
          crossOrigin="anonymous"
        />
      </>
    }
    afterBody={
      <>
        <ClientVariable
          name="routeLink"
          value={`/${expeditie.id}/kaart/route-data?v=${routeVersion}`}
        />
        <ClientVariable name="mbToken" value={getMapboxConfig().token} />
        <ClientVariable
          name="segments"
          value={segments.map(
            (segment): MapSegment => ({
              id: segment.id,
              childIds: segment.child_ids,
              type: segment.type,
              color: segment.color,
              posPart: segment.position_part,
              posTotal: segment.position_total,
            })
          )}
        />
        <ClientVariable
          name="stories"
          value={stories.map(
            (story): MapStory => ({
              id: story.id,
              segmentId: story.segment_id,
              timeStamp: story.time_stamp,
              lng: story.longitude || 0,
              lat: story.latitude || 0,
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
                segment={segments.find(
                  (segment) => segment.id == story.segment_id
                )}
              />
            ))}
          </div>
        </div>
      </div>
    )}
  </Page>
);
