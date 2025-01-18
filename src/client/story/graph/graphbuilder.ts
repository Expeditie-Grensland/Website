import { Map } from 'mapbox-gl';
import { GeoNode, Story } from '../../expeditie-map';
import { StoryHandler } from "../StoryHandler";
import { Graph, Vertex } from './graph';

export class GraphBuilder {
    private parentEl: HTMLElement;
    private graph: Graph | null;

    public constructor(parentEl: HTMLElement) {
        this.parentEl = parentEl;
        this.graph = null;
    }

    public constructGraph(nodes: GeoNode[], elements: Story[], map: Map, storyHandler: StoryHandler) {
        if (nodes.length === 0 || elements.length === 0)
            return;

        const roots: Vertex[] = this.findRootNodes(nodes, elements);

        nodes = nodes.filter(node => !roots.some(root => root.node.nodeNum === node.nodeNum));

        this.populateChildren(roots, nodes, elements);

        this.graph = new Graph(roots, map, storyHandler);
    }

    public drawSVG(storiesElement: HTMLElement) {
        if (this.graph == null)
            return;

        const svg = this.graph.toSVGGraph(storiesElement);

        this.parentEl.innerHTML = "";
        this.parentEl.appendChild(svg);
    }

    private findRootNodes(nodes: GeoNode[], stories: Story[]): Vertex[] {
        const roots: Vertex[] = [];
        const knownPeople: string[] = [];

        // oldest nodes first
        nodes.sort((a, b) => a.timeFrom < b.timeFrom ? -1 : 1);

        // only nodes with people we haven't seen before can be root nodes.
        for (const node of nodes) {
            if (node.persons.some(person => knownPeople.includes(person)))
                continue;

            knownPeople.push(...node.persons);
            roots.push(this.createVertex(node, stories));
        }

        return roots;
    }

    private populateChildren(parents: Vertex[], nodes: GeoNode[], elements: Story[]): Vertex[] {
        if (nodes.length == 0)
            return [];

        const candidates = this.findAllChildCandidates(parents.map(vertex => vertex.node), nodes);

        if (candidates.length == 0) {
            console.error('no candidates left!');
            console.error(nodes);
            return [];
        }

        const allChildren: Vertex[] = [];

        for (const parent of parents) {
            const parentNode = parent.node;
            const children: GeoNode[] = [];

            for (const child of candidates)
                if (child.persons.some(person => parentNode.persons.includes(person)))
                    children.push(child);

            if (children.length > 0) {
                const vertices = children.map(node => this.createVertex(node, elements));
                parent.children = vertices;
                allChildren.push(...vertices);
            }
        }

        const remainingNodes = nodes.filter(node => !allChildren.some(vertex => vertex.node.nodeNum === node.nodeNum));

        return this.populateChildren(allChildren, remainingNodes, elements);
    }

    private findAllChildCandidates(parents: GeoNode[], nodes: GeoNode[]) {
        const childPool: GeoNode[] = [];    // all potential children

        parents.forEach(root => childPool.push(...this.findChildCandidates(root, nodes)));
        return childPool.filter((child, idx) => childPool.indexOf(child) === idx);
    }

    private findChildCandidates(parent: GeoNode, nodes: GeoNode[]) {
        const candidates: GeoNode[] = [];

        // oldest first
        nodes.sort((a, b) => a.timeFrom < b.timeFrom ? -1 : 1);

        // find all nodes that contain the same people as vertex.
        for (const node of nodes) {
            if (parent.nodeNum === node.nodeNum)
                continue;

            // candidate starts before parent ends
            if (parent.timeTill > node.timeFrom)
                continue;

            // no person matches
            if (node.persons.every(person => !parent.persons.includes(person)))
                continue;

            // after another candidate node
            if (candidates.some(candidate => node.timeFrom >= candidate.timeTill))
                continue;

            candidates.push(node);
        }

        return candidates;
    }

    private createVertex(node: GeoNode, stories: Story[], children?: Vertex[]): Vertex {
        return {
            node,
            stories: stories.filter(el => el.nodeNum == node.nodeNum),
            children
        }
    }
}




