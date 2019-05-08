import {SocketTypes} from "../sockets/types"

export namespace StoryHandler {

    export function addStoryElements(story: SocketTypes.StoryElement[]) {
        console.log("Added storyElements:");
        console.log(story);

        // TODO: check for duplicates
    }
}
