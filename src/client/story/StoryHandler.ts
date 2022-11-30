import $ from 'jquery';
import {GraphBuilder} from './graph/graphbuilder';
import {
    LocationStoryElement,
    MediaStoryElement,
    Node,
    StoryElement,
    StoryMedia,
    StoryResult,
    TextStoryElement
} from '../helpers/retrieval';
import {DateTime} from 'luxon';
import {MapHandler} from "../map/MapHandler"

export class StoryHandler {

    private hasStory: boolean
    private nodeColors: string[]
    private mapHandler: MapHandler
    private graphBuilder: GraphBuilder
    private hoveringStoryId: string | null = null

    constructor(hasStory: boolean, nodeColors: string[], mapHandler: MapHandler) {
        this.hasStory = hasStory;
        this.nodeColors = nodeColors;
        this.mapHandler = mapHandler;
        this.graphBuilder = new GraphBuilder(document.getElementById('graph')!);

        if (hasStory)
            this.init();
    }

    private init = () => {
        // Move mapbox controls out of the way
        const sheet = window.document.styleSheets[0];
        sheet.insertRule('.mapboxgl-ctrl-bottom-left { left: 35%; }', sheet.cssRules.length);
    }

    public renderStory = (result: StoryResult) => {
        if (!this.hasStory)
            return

        const storyWrapper = $("#storyWrapper")

        // Show story elements
        storyWrapper.show();

        storyWrapper.on('scroll', this.onStoryScroll);

        $('.zoomout').on('click', () => {
            this.mapHandler.resetBounds()
        })

        const storyElements = $('#storyElements')
        result.story.forEach(el => storyElements.append(this.createStoryElement(el, result.nodes)));

        this.graphBuilder.constructGraph(result.nodes, result.story, this.mapHandler);

        // This renders the graph only after all images and videos are loaded.
        // Media aspect ratios are not known beforehand so they have to be loaded before the graph can be created with the correct size
        // FIXME determine media aspect ratio on upload and put it in the database
        let mediaCount = result.story.reduce((acc, curr) => acc + (curr.type === 'media' ? curr.media.length : 0), 0)

        const onAllMediaLoaded = () => {
            console.log("All media loaded!")
            this.graphBuilder.drawSVG(document.getElementById('storyElements')!, this.nodeColors);
        }

        if (mediaCount === 0)
            onAllMediaLoaded();

        storyWrapper.find('img').on('load', function() {
            if (--mediaCount === 0)
                onAllMediaLoaded()
        }).each(function() {
            if(this.complete) $(this).trigger('load');
        });

        storyWrapper.find('video').on('loadedmetadata', function() {
            if (--mediaCount === 0)
                onAllMediaLoaded()
        }).each(function() {
            //https://developer.mozilla.org/en-US/docs/Web/API/HTMLMediaElement/readyState
            if(this.readyState >= 1) $(this).trigger('loadedmetadata');
        });

    }

    public resetHoveringStory = () => {
        if (this.hoveringStoryId != null) {
            document.getElementById(this.hoveringStoryId)?.setAttribute('r', '8');
            this.hoveringStoryId = null;
        }
    }

    public setHoveringStory = (featureId: string) => {
        if (this.hoveringStoryId === featureId)
            return;

        this.resetHoveringStory();
        // set feature state to increase circle size on hover
        this.hoveringStoryId = featureId;
        document.getElementById(this.hoveringStoryId)?.setAttribute('r', '12');
    }

    private createStoryElement = (element: StoryElement, nodes: Node[]): JQuery<HTMLElement> => {
        switch (element.type) {
            case 'location': {
                return this.createLocationStoryElement(<LocationStoryElement>element, nodes);
            }
            case 'text': {
                return this.createTextStoryElement(<TextStoryElement>element, nodes);
            }
            case 'media': {
                return this.createMediaStoryElement(<MediaStoryElement>element, nodes);
            }
            default: return $('<p>').text('er is iets foutgegaan')
        }
    }

    private createLocationStoryElement = (element: LocationStoryElement, nodes: Node[]): JQuery<HTMLElement> => {
        return $('<div>')
            .attr('id', element.id)
            .addClass('storyElement')
            .addClass('card')
            .addClass('location')
            .append(this.createStoryElementHeader(element, element.name, nodes));
    }

    private createTextStoryElement = (element: TextStoryElement, nodes: Node[]): JQuery<HTMLElement> => {
        return $('<div>')
            .attr('id', element.id)
            .addClass('storyElement')
            .addClass('card')
            .addClass('text')
            .append(this.createStoryElementHeader(element, element.title, nodes))
            .append($('<p>')
                .text(element.text)
            );
    }

    private createMediaStoryElement = (element: MediaStoryElement, nodes: Node[]): JQuery<HTMLElement> => {
        const base = $('<div>')
            .attr('id', element.id)
            .addClass('storyElement')
            .addClass('card')
            .addClass('media')
            .append(this.createStoryElementHeader(element, element.title, nodes));

        const content = element.media.map((medium) => {
            const wrapper = $('<div>').addClass('media-wrapper').append(this.getMediaPlayer(medium));

            if (medium.description)
                wrapper.append($('<p>')
                    .addClass('media-description')
                    .text(medium.description)
                );

            return wrapper;
        })

        return base.append(content);
    }

    private getMediaPlayer = (media: StoryMedia) => {
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

    private getDisplayDate = (dt: DateTime): string => {
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

    private createStoryElementHeader = (element: StoryElement, title: string, nodes: Node[]): JQuery<HTMLElement> => {
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
                    .text(this.getDisplayDate(dt))
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
                .text(this.getPeopleNames(element, nodes))
            );
    }

    private getPeopleNames = (element: StoryElement, nodes: Node[]): string => {
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

    private onStoryScroll = () => {
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
