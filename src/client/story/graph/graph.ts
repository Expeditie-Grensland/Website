import {Vertex} from "./vertex"
import $ from 'jquery';
import {SocketTypes} from "../../sockets/types"
import StoryElement = SocketTypes.StoryElement

export class Graph {
    private readonly roots: Vertex[]         // starting vertices

    public constructor(roots: Vertex[]) {
        this.roots = roots
    }

    /**
     * Returns all vertices in a 2d array. First dimension is 'level' as in `getVerticesAtLevel`, containing an array
     * of vertices at that level (ordered by StoryNode timestamp).
     */
    public getAllLayers(): Vertex[][] {
        let nodes = [this.roots]

        let level = 0;
        while (true) {
            let nextLevel: Vertex[] = []

            for (let node of nodes[level]) {
                const children = node.getChildren()

                if (children != null)
                    nextLevel.push(...children)
            }

            if (nextLevel.length === 0)
                break;

            // nodes are sorted in the order in which they start.
            nextLevel.sort((a, b) => a.getStoryNode().timeFrom - b.getStoryNode().timeFrom)

            // deduplicate
            const uniqueNextLevel: Vertex[] = []
            for (let vertex of nextLevel) {
                if (uniqueNextLevel.some(v => v.getStoryNode().id === vertex.getStoryNode().id))
                    continue;
                uniqueNextLevel.push(vertex)
            }

            nodes.push(uniqueNextLevel);
            ++level
        }

        return nodes
    }

    public toSVGGraph(htmlStoryElements: HTMLElement): SVGElement {
        const svg = this.svgElement('svg')

        const layers = this.getAllLayers()
        const maxLayerSize = this.maxLayerSize(layers)
        const horizontalSpace = 70
        const svgWidth = Math.max(maxLayerSize * horizontalSpace, 150)

        for (let layer of layers) {
            // draw straight lines
            for (let vertex of layer) {
                const storyElements = vertex.getStoryElements()

                if (storyElements.length <= 1)
                    continue;

                const vertexIdx = layer.indexOf(vertex)
                const firstStoryElement = $('#' + storyElements[0].id + ' h1')[0]
                const lastStoryElement = $('#' + storyElements[storyElements.length - 1].id + ' h1')[0]

                const x = this.calculateX(vertexIdx, layer.length, svgWidth, horizontalSpace)
                const y1 = this.calculateY(firstStoryElement)
                const y2 = this.calculateY(lastStoryElement)

                svg.appendChild(this.generateLine(x, y1, x, y2, vertex.getStoryNode().color, 'none'))
            }

            // draw corners
            for (let parent of layer) {
                if (parent.getChildren() == null)
                    continue;

                const layerIdx = layers.indexOf(layer);
                const childLayer = layers[layerIdx + 1]

                const parentStoryElements = parent.getStoryElements().sort((a, b) => a.time - b.time)
                const parentIdx = layer.indexOf(parent)
                const parentEnd = parentStoryElements[parentStoryElements.length - 1]
                const parentHeader = $('#' + parentEnd.id + ' h1')[0]

                const x1 = this.calculateX(parentIdx, layer.length, svgWidth, horizontalSpace)
                const y1 = this.calculateY(parentHeader)

                const children = parent.getChildren()!

                for (let child of children) {
                    const childStoryElements = child.getStoryElements().sort((a, b) => a.time - b.time)
                    const childIdx = childLayer.indexOf(child)
                    const childStart = childStoryElements[0]
                    const childHeader = $('#' + childStart.id + ' h1')[0]

                    const x2 = this.calculateX(childIdx, childLayer.length, svgWidth, horizontalSpace)
                    const y2 = this.calculateY(childHeader)

                    const color = children.length > 1 ? child.getStoryNode().color : parent.getStoryNode().color;

                    svg.appendChild(this.generateLine(x1, y1, x2, y2, color, children.length > 1 ? 'begin' : 'end'))
                }
            }

            // draw circles
            for (let vertex of layer) {
                const storyElements = vertex.getStoryElements()

                for (let storyElement of storyElements) {
                    const node = vertex.getStoryNode()
                    const header = $('#' + storyElement.id + ' h1')![0]

                    const vertexIdx = layer.indexOf(vertex)
                    const x = this.calculateX(vertexIdx, layer.length, svgWidth, horizontalSpace)
                    const y = this.calculateY(header)

                    svg.appendChild(this.generateCircle(x, y, node.color))
                }
            }
        }
        const graphTop = htmlStoryElements.getBoundingClientRect().top;
        const svgHeight = htmlStoryElements.getBoundingClientRect().height - 16 // 16px  padding

        svg.setAttribute('width', svgWidth.toString());
        svg.setAttribute('height', svgHeight.toString());
        svg.setAttribute('viewBox', '0 ' + graphTop + ' ' + svgWidth + ' ' + svgHeight)

        return svg
    }

    private calculateY(header: HTMLElement): number {
        const headerRect = header.getBoundingClientRect();
        return (headerRect.top + headerRect.bottom) / 2.0;
    }

    private calculateX(vertexIndex: number, layerSize: number, svgWidth: number, nodeDistance: number): number {
        const svgMiddle = svgWidth / 2

        if (layerSize % 2 == 0) { // even amount of vertices in layer
            if (vertexIndex == 0)
                return svgMiddle + (nodeDistance / 2)
            if (vertexIndex % 2 == 0)
                return svgMiddle + (vertexIndex / 2) * (nodeDistance / 2)
            else
                return svgMiddle - ((vertexIndex + 1) / 2) * (nodeDistance / 2)
        } else {  // odd amount of vertices in layer
            if (vertexIndex == 0)
                return svgMiddle
            if (vertexIndex % 2 == 0)
                return svgMiddle - (vertexIndex / 2) * nodeDistance
            else
                return svgMiddle + ((vertexIndex + 1) / 2) * nodeDistance
        }
    }

    private maxLayerSize(layers: Vertex[][] = this.getAllLayers()): number {
        let max = 0

        for (let layer of layers)
            if (layer.length > max)
                max = layer.length

        return max
    }

    private svgElement = (type: string) => document.createElementNS('http://www.w3.org/2000/svg', type)

    private generateCircle(x: number, y: number, color: string) {
        const circle = this.svgElement('circle');
        circle.setAttribute('cx', x.toString());
        circle.setAttribute('cy', y.toString());
        circle.setAttribute('r', '8');
        circle.setAttribute('stroke', color);
        circle.setAttribute('fill', '#fff');
        circle.setAttribute('stroke-width', '5');
        return circle;
    };

    private generateLine(xA: number, yA: number, xB: number, yB: number, color: string, curve: 'none' | 'begin' | 'end') {
        const path = this.svgElement('path');
        path.setAttribute('fill', 'none');
        path.setAttribute('stroke', color);
        path.setAttribute('stroke-width', '5');

        let pathProps = `M ${xA} ${yA} `;

        if (curve === 'none') {
            pathProps += `V ${yB}`;
        } else if (curve === 'begin') {
            if (xB > xA) pathProps += `H ${xB - 20} a 20 20 0 0 1 20 20`;
            else pathProps += `H ${xB + 20} a 20 20 0 0 0 -20 20`;

            pathProps += `V ${yB}`
        } else if (curve === 'end') {
            pathProps += `V ${yB - 20}`;
            if (xB < xA) pathProps += `a 20 20 0 0 1 -20 20 H ${xB}`;
            else pathProps += `a 20 20 0 0 0 20 20 H ${xB}`;
        }

        path.setAttribute('d', pathProps);
        return path;
    };
}
