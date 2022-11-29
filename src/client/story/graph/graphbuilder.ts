import $ from 'jquery';
import { Vertex } from './vertex';
import { Graph } from './graph';
import { Node, StoryElement } from '../../helpers/retrieval';
import mapboxgl from "mapbox-gl"

export class GraphBuilder {
    private parentEl: HTMLElement;
    private graph: Graph | null;

    public constructor(parentEl: HTMLElement) {
        this.parentEl = parentEl;
        this.graph = null;
    }

    public constructGraph(nodes: Node[], elements: StoryElement[]) {
        if (nodes.length === 0 || elements.length === 0)
            return;

        const roots: Vertex[] = this.findRootNodes(nodes, elements);

        nodes = nodes.filter(node => !roots.some(root => root.getStoryNode().nodeNum === node.nodeNum));

        this.populateChildren(roots, nodes, elements);

        this.graph = new Graph(roots);
    }

    public drawSVG(storyElements: HTMLElement, nodeColors: string[], map: mapboxgl.Map) {
        if (this.graph == null)
            return;

        const svg = this.graph.toSVGGraph(storyElements, nodeColors, map);

        $(this.parentEl).empty();
        this.parentEl.appendChild(svg);
    }

    private findRootNodes(nodes: Node[], storyElements: StoryElement[]): Vertex[] {
        const roots: Vertex[] = [];
        const knownPeople: string[] = [];

        // oldest nodes first
        nodes.sort((a, b) => a.timeFrom < b.timeFrom ? -1 : 1);

        // only nodes with people we haven't seen before can be root nodes.
        for (let node of nodes) {
            if (node.personNames.some(name => knownPeople.includes(name)))
                continue;

            knownPeople.push(...node.personNames);
            roots.push(this.createVertex(node, storyElements));
        }

        return roots;
    }

    private populateChildren(parents: Vertex[], nodes: Node[], elements: StoryElement[]): Vertex[] {
        if (nodes.length == 0)
            return [];

        const candidates = this.findAllChildCandidates(parents.map(vertex => vertex.getStoryNode()), nodes);

        if (candidates.length == 0) {
            console.error('no candidates left!');
            console.error(nodes);
            return [];
        }

        const allChildren: Vertex[] = [];

        for (let parent of parents) {
            const parentNode = parent.getStoryNode();
            const children: Node[] = [];

            for (let child of candidates)
                if (child.personNames.some(name => parentNode.personNames.includes(name)))
                    children.push(child);

            if (children.length > 0) {
                const vertices = children.map(node => this.createVertex(node, elements));
                parent.setChildren(vertices);
                allChildren.push(...vertices);
            }
        }

        const remainingNodes = nodes.filter(node => !allChildren.some(vertex => vertex.getStoryNode().nodeNum === node.nodeNum));

        return this.populateChildren(allChildren, remainingNodes, elements);
    }

    private findAllChildCandidates(parents: Node[], nodes: Node[]) {
        const childPool: Node[] = [];    // all potential children

        parents.forEach(root => childPool.push(...this.findChildCandidates(root, nodes)));
        return childPool.filter((child, idx) => childPool.indexOf(child) === idx);
    }

    private findChildCandidates(parent: Node, nodes: Node[]): Node[] {
        const candidates: Node[] = [];

        // oldest first
        nodes.sort((a, b) => a.timeFrom < b.timeFrom ? -1 : 1);

        // find all nodes that contain the same people as vertex.
        for (let node of nodes) {
            if (parent.nodeNum === node.nodeNum)
                continue;

            // candidate starts before parent ends
            if (parent.timeTill > node.timeFrom)
                continue;

            // no person matches
            if (node.personNames.every(personName => !parent.personNames.includes(personName)))
                continue;

            // after another candidate node
            if (candidates.some(candidate => node.timeFrom >= candidate.timeTill))
                continue;

            candidates.push(node);
        }

        return candidates;
    }

    private createVertex(node: Node, elements: StoryElement[], children: Vertex[] | null = null): Vertex {
        return new Vertex(node, elements.filter(el => el.nodeNum == node.nodeNum), children);
    }
}




