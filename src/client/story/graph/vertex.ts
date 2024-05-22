import { Node, Story, } from '../../helpers/retrieval';


export class Vertex {
    private readonly storyNode: Node;     // the story node associated with this vertex
    private readonly storyElements: Story[];   // the story elements associated with this vertex (node)

    private children: Vertex[] | null;              // the vertex's children, if any

    public constructor(node: Node, storyElements: Story[], children: Vertex[] | null = null) {
        this.storyNode = node;
        this.storyElements = storyElements;
        this.children = children;
    }

    public getStoryNode = () => this.storyNode;
    public getStoryElements = () => this.storyElements;
    public getChildren = () => this.children;

    public setChildren = (children: Vertex[] | null) => this.children = children;
}
