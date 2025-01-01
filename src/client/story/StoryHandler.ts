import {
    StoryResult
} from '../helpers/retrieval';
import { MapHandler } from "../map/MapHandler";
import { GraphBuilder } from './graph/graphbuilder';

export class StoryHandler {
    private nodeColors: string[]
    private mapHandler: MapHandler
    private graphBuilder: GraphBuilder
    private hoveringStoryId: string | null = null

    constructor(nodeColors: string[], mapHandler: MapHandler) {
        this.nodeColors = nodeColors;
        this.mapHandler = mapHandler;
        this.graphBuilder = new GraphBuilder(document.getElementById('graph')!);
    }

    public renderStory = (result: StoryResult) => {
        const storyWrapper = document.getElementById("story-wrapper");
        if (!storyWrapper) return;

        this.graphBuilder.constructGraph(result.nodes, result.story, this.mapHandler, this);

        const renderGraph = () => {
            this.graphBuilder.drawSVG(document.getElementById('story-elements')!, this.nodeColors);
        }

        renderGraph();
        new ResizeObserver(renderGraph).observe(document.getElementById("story-elements")!);
    }

    public resetHoveringStory = () => {
        if (this.hoveringStoryId != null) {
            document.getElementById(`circle-${this.hoveringStoryId}`)?.setAttribute('r', '8');
            this.hoveringStoryId = null;
        }
    }

    public setHoveringStory = (featureId: string) => {
        if (this.hoveringStoryId === featureId)
            return;

        this.resetHoveringStory();
        // set feature state to increase circle size on hover
        this.hoveringStoryId = featureId;
        document.getElementById(`circle-${this.hoveringStoryId}`)?.setAttribute('r', '12');
    }

    public scrollToStoryElement = (storyId: string) => {
        document.getElementById(storyId)?.scrollIntoView({block: "start", inline: "nearest", behavior: 'smooth'})
    }
}
