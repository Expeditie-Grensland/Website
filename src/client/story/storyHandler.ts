import $ from 'jquery';
import { GraphBuilder } from './graph/graphbuilder';
import {
    LocationStoryElement,
    MediaStoryElement,
    Node,
    StoryElement, StoryMedia,
    StoryResult,
    TextStoryElement
} from '../helpers/retrieval';
import { DateTime } from 'luxon';
import mapboxgl from "mapbox-gl"

export namespace StoryHandler {
    const storyWrapperDiv = document.getElementById('storyWrapper')!;
    const storyElementsDiv = document.getElementById('storyElements')!;

    const graphBuilder = new GraphBuilder(document.getElementById('graph')!);

    export function init(result: StoryResult, nodeColors: string[], map: mapboxgl.Map) {
        storyWrapperDiv.addEventListener('scroll', onStoryScroll);

        if (result.story.length == 0) return;

        result.story.forEach(el => appendStoryElement(el, result.nodes));

        graphBuilder.constructGraph(result.nodes, result.story);
        graphBuilder.drawSVG(storyElementsDiv, nodeColors, map);
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
            case 'media': {
                el = createMediaStoryElement(<MediaStoryElement>element, nodes);
                break;
            }
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

    function createMediaStoryElement(element: MediaStoryElement, nodes: Node[]): JQuery<HTMLElement> {
        const base = $('<div>')
            .attr('id', element.id)
            .addClass('storyElement')
            .addClass('card')
            .addClass('media')
            .append(createStoryElementHeader(element, element.title, nodes));

        const content = element.media.map((medium) => {
            const wrapper = $('<div>').addClass('media-wrapper').append(getMediaPlayer(medium));

            if (medium.description)
                wrapper.append($('<p>')
                    .addClass('media-description')
                    .text(medium.description)
                );

            return wrapper;
        })

        return base.append(content);
    }

    const getMediaPlayer = (media: StoryMedia) => {
        if (media.mime === 'video/mp4')
            return $('<video>')
                .addClass('media-preview')
                .attr('controls', '')
                .append($('<source>')
                    .attr("src", media.fileUrl)
                    .attr("type", media.mime)
                );

        if (media.mime === "image/jpeg")
            return $(`<img>`)
                .addClass('media-preview')
                .attr("src", media.fileUrl);

        return $('<div>')
    }

    const getDisplayDate = (dt: DateTime): string => {
        // Today and less than 6 hours ago
        if (dt.diffNow('hours').hours > -6 && dt.endOf('day').diffNow().milliseconds > 0)
            return dt.toRelative()!; // Relative time

        // Today, yesterday or two days ago
        if (dt.endOf('day').diff(DateTime.local().endOf('day'), 'days').days > -3)
            return dt.toRelativeCalendar() + ' om ' + dt.toLocaleString({ hour: 'numeric', minute: '2-digit' }); // Relative date, absolute time

        // Current year
        if (dt.year === DateTime.local().year)
            return dt.toLocaleString({ day: 'numeric', month: 'long', hour: 'numeric', minute: '2-digit' }); // Absolute date without year

        return dt.toLocaleString({ year: 'numeric', day: 'numeric', month: 'long', hour: 'numeric', minute: '2-digit' }); // Absolute date
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
