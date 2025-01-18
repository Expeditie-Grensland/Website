import { Map } from "mapbox-gl";
import { GraphBuilder } from "./graph/graphbuilder";
import { NodesAndStories } from "../expeditie-map";

export class StoryHandler {
  private map: Map;
  private graphBuilder: GraphBuilder;

  constructor(map: Map) {
    this.map = map;
    this.graphBuilder = new GraphBuilder(
      document.getElementById("storyline-graph")!
    );
  }

  public renderStory = ({ nodes, stories }: NodesAndStories) => {
    const storyline = document.getElementById("storyline");
    if (!storyline) return;

    this.graphBuilder.constructGraph(nodes, stories, this.map, this);

    const renderGraph = () => {
      this.graphBuilder.drawSVG(document.getElementById("stories")!);
    };

    renderGraph();
    new ResizeObserver(renderGraph).observe(
      document.getElementById("stories")!
    );
  };

  public resetHoveringStory = () => {
    document
      .querySelectorAll(".graph-circle")
      .forEach((el) => el.classList.remove("hover"));
  };

  public setHoveringStory = (featureId: number) => {
    document.getElementById(`circle-${featureId}`)?.classList.add("hover");
  };

  public scrollToStory = (storyId: string) => {
    document.getElementById(`story-${storyId}`)?.scrollIntoView();
  };
}
