import {SocketTypes} from "../../sockets/types"
import StoryElement = SocketTypes.StoryElement
import $ from "jquery"
import {Vertex} from "./vertex"
import Node = SocketTypes.Node
import {Graph} from "./graph"

export class GraphBuilder {
    private parentEl: HTMLElement
    private graph: Graph | null

    public constructor(parentEl: HTMLElement) {
        this.parentEl = parentEl
        this.graph = null
    }

    /**
     * Finds the most recent Node and
     * @param {SocketTypes.Node[]} nodes
     * @param {SocketTypes.StoryElement[]} elements
     */
    public constructGraph(nodes: Node[], elements: StoryElement[]) {
        if (nodes.length === 0 || elements.length === 0)
            return;

        const roots: Vertex[] = this.findRootNodes(nodes, elements);

        nodes = nodes.filter(node => !roots.some(root => root.getStoryNode().id === node.id))

        this.populateChildren(roots, nodes, elements)

        this.graph = new Graph(roots)
    }

    private findRootNodes(nodes: Node[], storyElements: SocketTypes.StoryElement[]): Vertex[] {
        const roots: Vertex[] = [];
        const knownPeople: string[] = [];

                // oldest nodes first
        nodes.sort((a, b) => a.timeFrom < b.timeFrom ? -1 : 1)

                // only nodes with people we haven't seen before can be root nodes.
        for (let node of nodes) {
            if (node.personIds.some(personId => knownPeople.indexOf(personId) >= 0))
                continue;

            knownPeople.push(...node.personIds);
            roots.push(this.createVertex(node, storyElements))
        }

        return roots;
    }

    private populateChildren(parents: Vertex[], nodes: Node[], elements: SocketTypes.StoryElement[]): Vertex[] {
        if (nodes.length == 0)
            return []

        const candidates = this.findAllChildCandidates(parents.map(vertex => vertex.getStoryNode()), nodes)

        if (candidates.length == 0)
        {
            console.error("no candidates left!")
            console.error(nodes)
            return []
        }

        const allChildren: Vertex[] = []

        for (let parent of parents) {
            const parentNode = parent.getStoryNode()
            const children: Node[] = []

            for (let child of candidates)
                if (child.personIds.some(personId => parentNode.personIds.indexOf(personId) >= 0))
                    children.push(child)

            if (children.length > 0) {
                const vertices = children.map(node => this.createVertex(node, elements))
                parent.setChildren(vertices)
                allChildren.push(...vertices)
            }
        }

        const remainingNodes = nodes.filter(node => !allChildren.some(vertex => vertex.getStoryNode().id === node.id))

        return this.populateChildren(allChildren, remainingNodes, elements)
    }

    private findAllChildCandidates(parents: Node[], nodes: Node[]) {
        const childPool: Node[] = []    // all potential children

        parents.forEach(root => childPool.push(...this.findChildCandidates(root, nodes)))
        return childPool.filter((child, idx) => childPool.indexOf(child) === idx)
    }

    private findChildCandidates(parent: Node, nodes: Node[]): Node[] {
        const candidates: Node[] = []

        // oldest first
        nodes.sort((a, b) => a.timeFrom < b.timeFrom ? -1 : 1)

            // find all nodes that contain the same people as vertex.
        for (let node of nodes) {
            if (parent.id === node.id)
                continue;

                    // candidate starts before parent ends
            if (parent.timeTill > node.timeFrom)
                continue;

                    // no person matches
            if (node.personIds.every(personId => parent.personIds.indexOf(personId) < 0))
                continue;

                    // after another candidate node
            if (candidates.some(candidate => node.timeFrom >= candidate.timeTill))
                continue;

            candidates.push(node)
        }

        return candidates
    }

    private createVertex(node: Node, elements: SocketTypes.StoryElement[], children: Vertex[] | null = null): Vertex {
        return new Vertex(node, elements.filter(el => el.geoNodeId == node.id), children)
    }

    public drawSVG(storyElements: HTMLElement) {
        if (this.graph == null)
            return;

        const svg = this.graph.toSVGGraph(storyElements)

        $(this.parentEl).empty();
        this.parentEl.appendChild(svg)
    }
}





