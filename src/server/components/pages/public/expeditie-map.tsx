import { ComponentProps, FunctionComponent } from "preact";
import { render } from "preact-render-to-string";
import { getFullExpeditie } from "../../../db/expeditie.js";
import { getNodesWithPersons } from "../../../db/geo.js";
import { getAllStories } from "../../../db/story.js";
import { getFileType, getFileUrl } from "../../../files/files.js";
import { getMapboxConfig } from "../../../helpers/config.js";
import { getDateTime } from "../../../helpers/time.js";
import { ClientVariable } from "../../page-structure/client-variable.js";
import { Page } from "../../page-structure/page.js";

// FIXME: Relative and short-format dates/times
const visualDateString = (stamp: number, zone: string) =>
  getDateTime(stamp, zone).toLocaleString({
    year: "numeric",
    month: "long",
    day: "numeric",
    hour: "numeric",
    minute: "2-digit",
  });

const completeDateString = (stamp: number, zone: string) =>
  getDateTime(stamp, zone).toLocaleString({
    day: "numeric",
    month: "long",
    year: "numeric",
    hour: "numeric",
    minute: "2-digit",
    second: "2-digit",
    timeZoneName: "long",
  });

const peopleNames = (
  node?: Awaited<ReturnType<typeof getNodesWithPersons>>[number]
) =>
  new Intl.ListFormat("nl-NL", { style: "short", type: "conjunction" }).format(
    node?.persons
      ?.map((person) => person.first_name!)
      ?.toSorted((p1, p2) => p1?.localeCompare(p2)) || []
  );

const StoryElement: FunctionComponent<{
  story: Awaited<ReturnType<typeof getAllStories>>[number];
  node?: Awaited<ReturnType<typeof getNodesWithPersons>>[number];
}> = ({ story, node }) => (
  <div id={`${story.id}`} class="story-element card">
    <div class="title">
      <div class="header">
        <h1>{story.title}</h1>
        <p
          class="time"
          title={completeDateString(story.time_stamp, story.time_zone)}
        >
          {visualDateString(story.time_stamp, story.time_zone)}
        </p>
      </div>
      <p class="people">{peopleNames(node)}</p>
    </div>

    {story.text && <p>{story.text}</p>}

    {story.media.map((medium) => (
      <div class="media-wrapper">
        {getFileType(medium.file) == "video" && (
          <video
            class="media-preview"
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
          <img
            class="media-preview"
            src={getFileUrl(medium.file, "normaal.jpg")}
          />
        )}

        {medium.description && (
          <p class="media-description">{medium.description}</p>
        )}
      </div>
    ))}
  </div>
);

const getNodeForStory = (
  story: Awaited<ReturnType<typeof getAllStories>>[number],
  nodes: Awaited<ReturnType<typeof getNodesWithPersons>>
): Awaited<ReturnType<typeof getNodesWithPersons>>[number] | undefined =>
  nodes.filter(
    (node) =>
      node.persons.some((p) => p.id == story.person_id) &&
      node.time_from <= story.time_stamp &&
      node.time_till > story.time_stamp
  )[0];

const ExpeditieMapPage: FunctionComponent<{
  expeditie: NonNullable<Awaited<ReturnType<typeof getFullExpeditie>>>;
  stories: Awaited<ReturnType<typeof getAllStories>>;
  nodes: Awaited<ReturnType<typeof getNodesWithPersons>>;
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
        <script src="/static/scripts/expeditieMap.js" />
      </>
    }
  >
    <div id="map" />

    {stories.length > 0 && (
      <div id="story-wrapper">
        <div id="story-title" class="card">
          <p class="subtitle">{expeditie.subtitle}</p>
          <h1>{expeditie.name}</h1>
        </div>

        <div id="story">
          <div id="graph" class="card" />
          <div id="story-elements">
            {stories.map((story) => (
              <StoryElement
                story={story}
                node={getNodeForStory(story, nodes)}
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
