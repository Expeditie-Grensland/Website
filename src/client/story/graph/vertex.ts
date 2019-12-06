import { Node, StoryElement } from '../../helpers/retrieval';


export class Vertex {
    private readonly storyNode: Node;     // the story node associated with this vertex
    private readonly storyElements: StoryElement[];   // the story elements associated with this vertex (node)

    private children: Vertex[] | null;              // the vertex's children, if any

    public constructor(node: Node, storyElements: StoryElement[], children: Vertex[] | null = null) {
        this.storyNode = node;
        this.storyElements = storyElements;
        this.children = children;
    }

    public getStoryNode = () => this.storyNode;
    public getStoryElements = () => this.storyElements;
    public getChildren = () => this.children;

    public setChildren = (children: Vertex[] | null) => this.children = children;
}
