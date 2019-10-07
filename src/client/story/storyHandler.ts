import $ from 'jquery';
import {Util} from './util'
import {SocketTypes} from "../sockets/types"
import {GraphBuilder} from "./graph/graphbuilder"

export namespace StoryHandler {
    type StoryElement = SocketTypes.StoryElement;

    let storyWrapper: HTMLDivElement;
    let storyElementsDiv: HTMLDivElement;

    let personInfo: SocketTypes.PersonInfo;
    let nodes: SocketTypes.Node[];

    let storyElements: StoryElement[] = [];

    const graphBuilder = new GraphBuilder(document!.getElementById("graph")!)


    export function init(pI: SocketTypes.PersonInfo, ns: SocketTypes.Node[]) {
        personInfo = pI;
        nodes = ns;

        storyWrapper = <HTMLDivElement>document!.getElementById("storyWrapper");
        storyElementsDiv = <HTMLDivElement>document!.getElementById('storyElements');
        storyWrapper.addEventListener("scroll", onStoryScroll);
    }

    export function appendStoryElements(story: StoryElement[]) {
        if (story.length === 0)
            return;

        const newEls: StoryElement[] = [];

        for (let el of story)
            if (storyElements.find(st => st.id === el.id) == undefined)
                newEls.push(el)

        storyElements.push(...newEls)

        for (let element of newEls)
            appendStoryElement(element);

        graphBuilder.constructGraph(nodes, storyElements)
        graphBuilder.drawSVG(document!.getElementById("storyElements")!)
    }

    function appendStoryElement(element: StoryElement) {
        let el: JQuery<HTMLElement> | undefined = undefined;

        switch (element.type) {
            case "location": {
                el = createLocationStoryElement(<SocketTypes.LocationStoryElement>element);
                break;
            }
            case "text": {
                el = createTextStoryElement(<SocketTypes.TextStoryElement>element);
                break;
            }
            case "gallery": {
                el = createGalleryStoryElement(<SocketTypes.GalleryStoryElement>element);
                break;
            }
        }

        if (el != undefined)
            $(storyElementsDiv).append(el);
    }

    function createLocationStoryElement(element: SocketTypes.LocationStoryElement): JQuery<HTMLElement> {
        return $('<div>')
            .attr('id', element.id)
            .addClass('storyElement')
            .addClass('card')
            .addClass('location')
            .append( createStoryElementHeader(element, element.name) )
    }

    function createTextStoryElement(element: SocketTypes.TextStoryElement): JQuery<HTMLElement> {
        return $('<div>')
            .attr('id', element.id)
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
            .attr('id', element.id)
            .addClass('storyElement')
            .addClass('card')
            .addClass('gallery')
            .append( createStoryElementHeader(element, "Gallery") )
    }

    function createStoryElementHeader(element: StoryElement, title: string): JQuery<HTMLElement> {
        return $('<div>')
            .addClass('title')
            .append( $('<div>')
                .addClass('header')
                .append( $('<h1>')
                    .text(title)
                )
                .append( $('<p>')
                    .addClass('time')
                    .text(Util.unixTimeToDisplayDate(element.time * 1000))
                    .prop('title', Util.unixTimeToTitleDate(element.time * 1000))
                )
            )
            .append( $('<p>')
                .addClass('people')
                .text(getPeopleString(element))
            )
    }

    function getPeopleString(element: StoryElement): string {
        const people = getPeople(element);
        let ret = "";
        let idx = 0;

        ret += people[idx++].name.split(' ')[0];

        if (people.length > 1) {
            for (; idx != people.length - 1; ++idx)
                ret += ', ' + people[idx].name.split(' ')[0];
            ret += " & " + people[idx].name.split(' ')[0];
        }

        return ret;
    }

    function getPeople(element: StoryElement): SocketTypes.ClientPerson[] {
        const node = nodes.find(node => node.id === element.geoNodeId);

        if (node != null)
            return node.personIds.map(personId => personInfo[personId]).sort((p1, p2) => p1.name.localeCompare(p2.name));
        return [];
    }

    function onStoryScroll(event: Event) {
        const titleEl = document!.getElementById("storyTitle");
        const wrapperEl = document!.getElementById("storyWrapper");
        const mobileLayout = window.innerWidth < 1500;

        // Change header CSS based on whether it is 'stuck' to the top of the window
        if (titleEl != null) {
            const titleRect = titleEl.getBoundingClientRect();
            if (titleEl.classList.contains('fixed'))
                if (titleRect.top > 0)
                    titleEl.classList.remove('fixed')
            else
                if (titleRect.top <= 0)
                    titleEl.classList.add('fixed')
        }

    }
}
