import { Map } from "mapbox-gl";
import { StoryHandler } from "../StoryHandler";
import { Graph, Vertex } from "./graph";
import { MapNode, MapStory } from "../../../server/common-types/expeditie-map";

export class GraphBuilder {
  private parentEl: HTMLElement;
  private graph: Graph | null;

  public constructor(parentEl: HTMLElement) {
    this.parentEl = parentEl;
    this.graph = null;
  }

  public constructGraph(
    nodes: MapNode[],
    stories: MapStory[],
    map: Map,
    storyHandler: StoryHandler
  ) {
    if (nodes.length === 0 || stories.length === 0) return;

    const roots = this.findRootIds(nodes).map((id) =>
      this.createVertexById(id, nodes, stories)
    );

    this.graph = new Graph(roots, map, storyHandler);
  }

  public drawSVG(storiesElement: HTMLElement) {
    if (this.graph == null) return;

    const svg = this.graph.toSVGGraph(storiesElement);

    this.parentEl.innerHTML = "";
    this.parentEl.appendChild(svg);
  }

  private findRootIds(nodes: MapNode[]): number[] {
    const rootIds = new Set(nodes.map((node) => node.id));

    for (const node of nodes) {
      node.childIds.forEach((id) => rootIds.delete(id));
    }

    return Array.from(rootIds);
  }

  private createVertexById(
    id: number,
    nodes: MapNode[],
    stories: MapStory[]
  ): Vertex {
    const node = nodes.find((node) => node.id == id);
    if (!node) throw new Error("Node niet gevonden");

    return {
      node,
      stories: stories.filter((story) => story.nodeId == id),
      children: node.childIds.map((childId) =>
        this.createVertexById(childId, nodes, stories)
      ),
    };
  }
}
