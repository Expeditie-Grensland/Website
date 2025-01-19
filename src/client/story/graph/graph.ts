import { Map } from 'mapbox-gl';
import { nodeColors } from '../../expeditie-map/colors';
import { resetStoryPointHover, setStoryPointHover } from '../../expeditie-map/data-layers';
import { createSvgElement, setElementAttributes } from '../../helpers/elements';
import { StoryHandler } from "../StoryHandler";
import { MapNode, MapStory } from '../../../server/common-types/expeditie-map';

export type Vertex = {
    node: MapNode;
    stories: MapStory[];
    children?: Vertex[];
  };

export class Graph {
    private readonly roots: Vertex[];         // starting vertices

    private map: Map;
    private storyHandler: StoryHandler;

    public constructor(roots: Vertex[], map: Map, storyHandler: StoryHandler) {
        this.roots = roots;
        this.map = map;
        this.storyHandler = storyHandler;
    }

    private static calculateY(story: MapStory) {
        const { top, bottom } = document.querySelector(`#story-${story.id} h1`)!.getBoundingClientRect();
        return (top + bottom) / 2.0;
    }

    private static getNodeDistance(): number {
        return 70;
    }

    private static calculateX(vertexIndex: number, layerSize: number, svgWidth: number): number {
        const svgMiddle = svgWidth / 2;
        const nodeDistance = this.getNodeDistance();

        if (layerSize % 2 == 0) { // even amount of vertices in layer
            if (vertexIndex == 0)
                return svgMiddle + (nodeDistance / 2);
            if (vertexIndex % 2 == 0)
                return svgMiddle + (vertexIndex / 2) * (nodeDistance / 2);
            else
                return svgMiddle - ((vertexIndex + 1) / 2) * (nodeDistance / 2);
        } else {  // odd amount of vertices in layer
            if (vertexIndex == 0)
                return svgMiddle;
            if (vertexIndex % 2 == 0)
                return svgMiddle - (vertexIndex / 2) * nodeDistance;
            else
                return svgMiddle + ((vertexIndex + 1) / 2) * nodeDistance;
        }
    }

    /**
     * Returns all vertices in a 2d array. First dimension is 'level' as in `getVerticesAtLevel`, containing an array
     * of vertices at that level (ordered by StoryNode timestamp).
     */
    public getAllLayers(): Vertex[][] {
        const nodes = [this.roots];

        for (let level = 0;; level++) {
            const nextLevel: Vertex[] = [];

            for (const node of nodes[level]) {
                if (node.children)
                    nextLevel.push(...node.children);
            }

            if (nextLevel.length === 0)
                break;

            // nodes are sorted in the order of their id.
            nextLevel.sort((a, b) => a.node.id - b.node.id);

            // deduplicate
            const uniqueNextLevel: Vertex[] = [];
            for (const vertex of nextLevel) {
                if (uniqueNextLevel.some(v => v.node.id === vertex.node.id))
                    continue;
                uniqueNextLevel.push(vertex);
            }

            nodes.push(uniqueNextLevel);
        }

        return nodes;
    }

    public toSVGGraph(htmlStoriesElement: Element): SVGElement {
        const svg = createSvgElement('svg');

        const layers = this.getAllLayers();
        const maxLayerSize = layers.reduce((max, layer) => Math.max(max, layer.length), 0)
        const svgWidth = Math.max(maxLayerSize * Graph.getNodeDistance(), 100);

        for (const layer of layers) {
            // draw straight lines
            for (const vertex of layer) {
                const { node, stories } = vertex;

                if (stories.length <= 1)
                    continue;
                
                const x = Graph.calculateX(layer.indexOf(vertex), layer.length, svgWidth);
                const y1 = Graph.calculateY(stories[0]);
                const y2 = Graph.calculateY(stories[stories.length - 1]);

                svg.appendChild(this.generateLine(x, y1, x, y2, nodeColors[node.nodeNum], 'none'));
            }

            // draw corners
            for (const parent of layer) {
                const { children } = parent;

                if (!children)
                    continue;

                const childLayer = layers[layers.indexOf(layer) + 1];

                const parentStories = parent.stories.sort((a, b) => a.timeStamp - b.timeStamp);

                const x1 = Graph.calculateX(layer.indexOf(parent), layer.length, svgWidth);
                const y1 = Graph.calculateY(parentStories[parentStories.length - 1]);

                for (const child of children) {
                    const x2 = Graph.calculateX(childLayer.indexOf(child), childLayer.length, svgWidth);
                    const y2 = Graph.calculateY(child.stories.sort((a, b) => a.timeStamp - b.timeStamp)[0]);

                    const color = children.length > 1 ? nodeColors[child.node.nodeNum] : nodeColors[parent.node.nodeNum];

                    svg.appendChild(this.generateLine(x1, y1, x2, y2, color, children.length > 1 ? 'begin' : 'end'));
                }
            }

            // draw circles
            for (const vertex of layer) {
                const stories = vertex.stories;

                for (const story of stories) {
                    const node = vertex.node;
                    
                    const x = Graph.calculateX(layer.indexOf(vertex), layer.length, svgWidth);
                    const y = Graph.calculateY(story);

                    svg.appendChild(this.generateCircle(x, y, nodeColors[node.nodeNum], story));
                }
            }
        }
        const graphTop = htmlStoriesElement.getBoundingClientRect().top;
        const svgHeight = htmlStoriesElement.getBoundingClientRect().height - 16;

        setElementAttributes(svg, {
            width: svgWidth.toString(),
            height: svgHeight.toString(),
            viewBox: `0 ${graphTop} ${svgWidth} ${svgHeight}`
        });

        return svg;
    }

    private generateCircle(x: number, y: number, color: string, story: MapStory) {
        const circle = createSvgElement('circle', {
            class: "graph-circle",
            id: `circle-${story.id}`,
            cx: x.toString(),
            cy: y.toString(),
            stroke: color,
        });

        circle.addEventListener("mouseenter", () => {
            setStoryPointHover(this.map, story.id);
        })

        circle.addEventListener("mouseleave", () => {
            resetStoryPointHover(this.map);
        })

        // zoom map when clicking on circle
        circle.addEventListener("click", () => {
            this.map.flyTo({
                center: [story.lng, story.lat],
                zoom: 13,
            });
            this.storyHandler.scrollToStory(`${story.id}`);
        });

        return circle;
    }

    private generateLine(xA: number, yA: number, xB: number, yB: number, color: string, curve: 'none' | 'begin' | 'end') {
        let pathProps = `M ${xA} ${yA} `;

        if (curve === 'none') {
            pathProps += `V ${yB}`;
        } else if (curve === 'begin') {
            if (xB > xA) pathProps += `H ${xB - 20} a 20 20 0 0 1 20 20`;
            else pathProps += `H ${xB + 20} a 20 20 0 0 0 -20 20`;

            pathProps += `V ${yB}`;
        } else if (curve === 'end') {
            pathProps += `V ${yB - 20}`;
            if (xB < xA) pathProps += `a 20 20 0 0 1 -20 20 H ${xB}`;
            else pathProps += `a 20 20 0 0 0 20 20 H ${xB}`;
        }

        return createSvgElement("path", {
            class: "graph-line",
            stroke: color,
            "d": pathProps
        })
    }
}
