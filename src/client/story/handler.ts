import {SocketTypes} from "../sockets/types"

export namespace StoryHandler {

    let storyWrapper: HTMLDivElement;

    export function init(wrapperEl: HTMLDivElement) {
        storyWrapper = wrapperEl;
        wrapperEl.addEventListener("scroll", onStoryScroll);
    }

    export function appendStoryElements(story: SocketTypes.StoryElement[]) {
        console.log("Added storyElements:");
        console.log(story);

        // TODO: check for duplicates
    }

    function onStoryScroll(event: Event) {
        const titleEl = document!.getElementById("storyTitle");

        // Change title CSS based on whether it is 'stuck' to the top of the window
        if (titleEl != null) {
            const titleRect = titleEl.getBoundingClientRect();
            if (titleEl.classList.contains('fixed')) {
                if (titleRect.top > 0) {
                    titleEl.classList.remove('fixed')
                }
            } else {
                if (titleRect.top <= 0) {
                    titleEl.classList.add('fixed')
                }
            }
        }

    }
}
