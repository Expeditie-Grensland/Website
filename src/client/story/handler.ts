import $ from 'jquery';
import {SocketTypes} from "../sockets/types"

export namespace StoryHandler {

    let storyWrapper: HTMLDivElement;
    let storyElements: HTMLDivElement;

    export function init(wrapperEl: HTMLDivElement) {
        storyWrapper = wrapperEl;
        storyElements = <HTMLDivElement>document!.getElementById('storyElements');
        wrapperEl.addEventListener("scroll", onStoryScroll);

        $(storyElements).empty();
    }

    export function appendStoryElements(story: SocketTypes.StoryElement[]) {
        console.log("Added storyElements:");
        console.log(story);

        for (let element of story) {
            appendStoryElement(element);
        }

        // TODO: check for duplicates
    }

    function appendStoryElement(element: SocketTypes.StoryElement) {
        let el: JQuery<HTMLElement>;

        switch (element.type) {
            case "location": {
                el = createLocationStoryElement(<SocketTypes.LocationStoryElement>element)
                break;
            }
            case "text": {
                el = createTextStoryElement(<SocketTypes.TextStoryElement>element)
                break;
            }
            case "gallery": {
                break;
            }
        }

        if (el != undefined)
            $(storyElements).append(el);
    }

    function createLocationStoryElement(element: SocketTypes.LocationStoryElement): JQuery<HTMLElement> {
        return $('<div>')
            .addClass('storyElement')
            .addClass('card')
            .addClass('location')
            .append( createStoryElementHeader(element, element.name) )
    }

    function createTextStoryElement(element: SocketTypes.TextStoryElement): JQuery<HTMLElement> {
        return $('<div>')
            .addClass('storyElement')
            .addClass('card')
            .addClass('text')
            .append( createStoryElementHeader(element, element.title) )
            .append( $('<p>')
                .text(element.text)
            )
    }

    function createGalleryStoryElement(element: SocketTypes.GalleryStoryElement): JQuery<HTMLElement> {
        return $('<div>')
            .addClass('storyElement')
            .addClass('card')
            .addClass('gallery')
            .append( createStoryElementHeader(element, "Gallery") )
    }

    function createStoryElementHeader(element: SocketTypes.StoryElement, title: string): JQuery<HTMLElement> {
        return $('<div>')
            .addClass('title')
            .append( $('<div>')
                .addClass('header')
                .append( $('<h1>')
                    .text(title)
                )
                .append( $('<p>')
                    .addClass('time')
                    .text(element.time)
                )
            )
            .append( $('<p>')
                .addClass('people')
                .text(element.geoNodeId)
            )
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
