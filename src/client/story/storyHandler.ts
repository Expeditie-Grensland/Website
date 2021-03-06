import $ from 'jquery';
import { GraphBuilder } from './graph/graphbuilder';
import { LocationStoryElement, Node, StoryElement, StoryResult, TextStoryElement } from '../helpers/retrieval';
import { DateTime } from 'luxon';

export namespace StoryHandler {
    const storyWrapperDiv = document.getElementById('storyWrapper')!;
    const storyElementsDiv = document.getElementById('storyElements')!;

    const graphBuilder = new GraphBuilder(document.getElementById('graph')!);

    export function init(result: StoryResult) {
        storyWrapperDiv.addEventListener('scroll', onStoryScroll);

        if (result.story.length == 0) return;

        result.story.forEach(el => appendStoryElement(el, result.nodes));

        graphBuilder.constructGraph(result.nodes, result.story);
        graphBuilder.drawSVG(storyElementsDiv);
    }

    function appendStoryElement(element: StoryElement, nodes: Node[]) {
        let el: JQuery<HTMLElement> | undefined = undefined;

        switch (element.type) {
            case 'location': {
                el = createLocationStoryElement(<LocationStoryElement>element, nodes);
                break;
            }
            case 'text': {
                el = createTextStoryElement(<TextStoryElement>element, nodes);
                break;
            }
            // case 'gallery': {
            //     el = createGalleryStoryElement(<GalleryStoryElement>element);
            //     break;
            // }
        }

        if (el != undefined)
            $(storyElementsDiv).append(el);
    }

    function createLocationStoryElement(element: LocationStoryElement, nodes: Node[]): JQuery<HTMLElement> {
        return $('<div>')
            .attr('id', element.id)
            .addClass('storyElement')
            .addClass('card')
            .addClass('location')
            .append(createStoryElementHeader(element, element.name, nodes));
    }

    function createTextStoryElement(element: TextStoryElement, nodes: Node[]): JQuery<HTMLElement> {
        return $('<div>')
            .attr('id', element.id)
            .addClass('storyElement')
            .addClass('card')
            .addClass('text')
            .append(createStoryElementHeader(element, element.title, nodes))
            .append($('<p>')
                .text(element.text)
            );
    }

    // function createGalleryStoryElement(element: GalleryStoryElement): JQuery<HTMLElement> {
    //     return $('<div>')
    //         .attr('id', element.id)
    //         .addClass('storyElement')
    //         .addClass('card')
    //         .addClass('gallery')
    //         .append(createStoryElementHeader(element, 'Gallery'));
    // }

    const getDisplayDate = (dt: DateTime): string => {
        if (dt.diffNow('hours').hours > -6 && dt.endOf('day').diffNow().milliseconds > 0) // Today and less than 6 hours ago
            return dt.toRelative()!; // Relative time

        if (dt.endOf('day').diff(DateTime.local().endOf('day'), 'days').days > -3) // Today, yesterday, or two days ago
            return dt.toRelativeCalendar() + ' om ' + dt.toLocaleString({ hour: 'numeric', minute: '2-digit' }); // Relative date, absolute time

        return dt.toLocaleString({ day: 'numeric', month: 'long', hour: 'numeric', minute: '2-digit' }); // Absolute date
    };


    function createStoryElementHeader(element: StoryElement, title: string, nodes: Node[]): JQuery<HTMLElement> {
        const dt = DateTime.fromSeconds(element.dateTime.stamp, { locale: 'nl-NL' });

        return $('<div>')
            .addClass('title')
            .append($('<div>')
                .addClass('header')
                .append($('<h1>')
                    .text(title)
                )
                .append($('<p>')
                    .addClass('time')
                    .text(getDisplayDate(dt))
                    .prop('title', dt.setZone(element.dateTime.zone).toLocaleString({
                        day: 'numeric',
                        month: 'long',
                        year: 'numeric',
                        hour: 'numeric',
                        minute: '2-digit',
                        second: '2-digit',
                        timeZoneName: 'long'
                    }))
                )
            )
            .append($('<p>')
                .addClass('people')
                .text(getPeopleNames(element, nodes))
            );
    }

    function getPeopleNames(element: StoryElement, nodes: Node[]): string {
        const node = nodes.find(node => node.nodeNum === element.nodeNum);

        const names = node != null ? node.personNames.sort((p1, p2) => p1.localeCompare(p2)) : [];
        const firstNames = names.map(name => name.split(' ')[0]);

        switch (firstNames.length) {
            case 0:
                return '';
            case 1:
                return firstNames[0];
            default:
                return firstNames.slice(0, -1).join(', ') + ' & ' + firstNames.slice(-1)[0];
        }
    }

    function onStoryScroll() {
        const titleEl = document!.getElementById('storyTitle');

        // Change header CSS based on whether it is 'stuck' to the top of the window
        if (titleEl != null) {
            const titleRect = titleEl.getBoundingClientRect();
            if (titleEl.classList.contains('fixed')) {
                if (titleRect.top > 0) {
                    titleEl.classList.remove('fixed');
                }
            } else {
                if (titleRect.top <= 0) {
                    titleEl.classList.add('fixed');
                }
            }
        }

    }
}
