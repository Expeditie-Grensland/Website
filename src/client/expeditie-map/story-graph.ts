import { Map } from "mapbox-gl";
import { MapNode, MapStory } from "../../server/common-types/expeditie-map";
import { createSvgElement } from "../helpers/elements";
import { resetStoryPointHover, setStoryPointHover } from "./data-layers";

export const mobileStoryMediaQuery = window.matchMedia("(max-width: 1099px)");

/**
 * Initialises the story graph and keeps it updated
 */
export const createStoryGraph = (
  nodes: MapNode[],
  stories: MapStory[],
  map: Map
) => {
  const storylineEl = document.getElementById("storyline");
  if (!storylineEl) return;

  const [items, width] = constructStory(nodes, stories);

  drawGraph(items, width, map);
  new ResizeObserver(() => drawGraph(items, width, map)).observe(
    document.getElementById("stories")!
  );
};

type StoryItemX = MapStory & {
  color: string;
  childIds: number[];
  x: number;
};

type StoryItemXY = StoryItemX & {
  y: number;
};

/**
 * Constructs a list of story items in the storyline, together with the child
 * stories they should connect to. Also returns the width of the graph
 */
const constructStory = (
  nodes: MapNode[],
  stories: MapStory[]
): [StoryItemX[], number] => {
  const margin = 30;
  const distance = 50;
  const maxPosTotal = nodes.reduce(
    (max, node) => (node.posTotal > max ? node.posTotal : max),
    0
  );

  return [
    nodes
      .flatMap((node) =>
        stories
          .filter((s) => s.nodeId == node.id)
          .map((story, idx, storyArr) => ({
            ...story,
            color: node.color,
            childIds:
              idx == storyArr.length - 1
                ? findFirstStoryOfNodes(nodes, stories, node.childIds)
                : [storyArr[idx + 1].id],
            x:
              margin +
              ((maxPosTotal - node.posTotal) * distance) / 2 +
              (node.posPart - 1) * distance,
          }))
      )
      .sort((a, b) => a.timeStamp - b.timeStamp),

    (maxPosTotal - 1) * distance + margin * 2,
  ];
};

/**
 * Finds the numbers of the first stories in the tree starting at the given nodes
 */
const findFirstStoryOfNodes = (
  nodes: MapNode[],
  stories: MapStory[],
  nodeIds: number[]
): number[] =>
  Array.from(
    new Set(
      nodeIds.flatMap(
        (id) =>
          stories.find((s) => s.nodeId == id)?.id ||
          findFirstStoryOfNodes(
            nodes,
            stories,
            nodes.find((n) => n.id == id)!.childIds
          )
      )
    )
  );

/**
 * Generates the SVG elements for the graph and puts them in the DOM
 */
const drawGraph = (items: StoryItemX[], width: number, map: Map) => {
  const storiesEl = document.getElementById("stories")!;

  const { height, top } = storiesEl.getBoundingClientRect();

  const svg = createSvgElement("svg", {
    width: `${width}`,
    height: `${height - 16}`,
    viewBox: `0 ${top} ${width} ${height - 16}`,
  });

  const itemsXY = items.map((si): StoryItemXY => {
    const { y, height } = storiesEl
      .querySelector(`#story-${si.id} h1`)!
      .getBoundingClientRect();
    return { ...si, y: y + height / 2.0 };
  });

  for (const item of itemsXY) {
    for (const childId of item.childIds) {
      const child = itemsXY.find((si) => si.id == childId)!;
      svg.appendChild(
        generateStoryLine(
          item,
          child,
          item.childIds.length > 1 ? "begin" : "end"
        )
      );
    }

    svg.appendChild(generateStoryCircle(item, map));
  }

  document.getElementById("storyline-graph")!.replaceChildren(svg);
};

/**
 * Generates the SVG circle for a single story in the graph, and adds event
 * listeners for interaction between it and the map
 */
const generateStoryCircle = (item: StoryItemXY, map: Map) => {
  const circle = createSvgElement("circle", {
    class: "graph-circle",
    id: `circle-${item.id}`,
    cx: item.x,
    cy: item.y,
    stroke: item.color,
  });

  circle.addEventListener("mouseenter", () => {
    setStoryPointHover(map, item.id);
  });

  circle.addEventListener("mouseleave", () => {
    resetStoryPointHover(map);
  });

  circle.addEventListener("click", () => {
    if (mobileStoryMediaQuery.matches) {
      document.getElementById("map")!.scrollIntoView();
    } else {
      scrollToStory(item.id);
    }

    map.flyTo({
      center: [item.lng, item.lat],
      zoom: 13,
    });
  });

  return circle;
};

/**
 * Generates the SVG path for the line between two stories in the graph
 */
const generateStoryLine = (
  parent: StoryItemXY,
  child: StoryItemXY,
  curve: "begin" | "end"
) => {
  let pathProps = `M ${parent.x} ${parent.y} `;

  switch (parent.x == child.x ? "none" : curve) {
    case "begin":
      pathProps +=
        child.x > parent.x
          ? `H ${child.x - 20} a 20 20 0 0 1 20 20 V ${child.y}`
          : `H ${child.x + 20} a 20 20 0 0 0 -20 20 V ${child.y}`;
      break;

    case "end":
      pathProps +=
        child.x < parent.x
          ? `V ${child.y - 20} a 20 20 0 0 1 -20 20 H ${child.x}`
          : `V ${child.y - 20} a 20 20 0 0 0 20 20 H ${child.x}`;
      break;

    default:
      pathProps += `V ${child.y}`;
  }

  return createSvgElement("path", {
    class: "graph-line",
    stroke: parent.color,
    d: pathProps,
  });
};

/**
 * Scrolls the storyline to the specified story
 */
export const scrollToStory = (id: number) => {
  document.getElementById(`story-${id}`)!.scrollIntoView();
};

/**
 * Sets the hovering state of a story circle in the graph
 */
export const setStoryGraphHover = (id: number) => {
  document.getElementById(`circle-${id}`)?.classList.add("hover");
};

/**
 * Resets the hovering state of all story circles in the graph
 */
export const resetStoryGraphHover = () => {
  document
    .querySelectorAll(".graph-circle.hover")
    .forEach((el) => el.classList.remove("hover"));
};
