import $ from 'jquery';
import { DateTime } from 'luxon';
import {
    Node,
    Story,
    StoryMedia,
    StoryResult
} from '../helpers/retrieval';
import { MapHandler } from "../map/MapHandler";
import { GraphBuilder } from './graph/graphbuilder';

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

        this.graphBuilder.constructGraph(result.nodes, result.story, this.mapHandler, this);

        // This renders the graph only after all images and videos are loaded.
        // Media aspect ratios are not known beforehand so they have to be loaded before the graph can be created with the correct size
        // FIXME determine media aspect ratio on upload and put it in the database
        let mediaCount = result.story.reduce((acc, curr) => acc + (curr.media ? curr.media.length : 0), 0)

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

        storyWrapper.find("video").each(function () {
            const poster = $(this).prop("poster");
            const image = new Image();

            $(image).on("load", function () {
                if (--mediaCount === 0)
                    onAllMediaLoaded();
            });

            image.src = poster;
        });

        // Set scroll margin for auto-scrolling
        const sheet = window.document.styleSheets[0];
        const scrollMargin = document.getElementById('storyTitle')!.getBoundingClientRect().height + 16;
        sheet.insertRule(`.storyElement {scroll-margin: ${scrollMargin}px; }`, sheet.cssRules.length);
    }

    public resetHoveringStory = () => {
        if (this.hoveringStoryId != null) {
            document.getElementById(`circle-${this.hoveringStoryId}`)?.setAttribute('r', '8');
            this.hoveringStoryId = null;
        }
    }

    public setHoveringStory = (featureId: string) => {
        if (this.hoveringStoryId === featureId)
            return;

        this.resetHoveringStory();
        // set feature state to increase circle size on hover
        this.hoveringStoryId = featureId;
        document.getElementById(`circle-${this.hoveringStoryId}`)?.setAttribute('r', '12');
    }

    public scrollToStoryElement = (storyId: string) => {
        document.getElementById(storyId)?.scrollIntoView({block: "start", inline: "nearest", behavior: 'smooth'})
    }

    private createStoryElement = (element: Story, nodes: Node[]): JQuery<HTMLElement> => {
        const el = $('<div>')
            .attr('id', element.id)
            .addClass('storyElement')
            .addClass('card')
            .append(this.createStoryElementHeader(element, element.title, nodes));

        if (element.text) el.append($('<p>').text(element.text));

        const mediaContent = element.media.map((medium) => {
            const wrapper = $('<div>').addClass('media-wrapper').append(this.getMediaPlayer(medium));

            if (medium.description)
                wrapper.append($('<p>')
                    .addClass('media-description')
                    .text(medium.description)
                );

            return wrapper;
        });

        return el.append(mediaContent);
    }

    private getMediaPlayer = (media: StoryMedia) => {
        switch (media.file.split('.').pop()) {
            case "video":
                return $('<video>')
                    .addClass('media-preview')
                    .attr('controls', '')
                    .attr('preload', 'none')
                    .attr('poster', media.file + '/poster.jpg')
                    .append($('<source>')
                        .attr("src", media.file + "/1080p30.mp4")
                        .attr("type", "video/mp4")
                    );

            case "afbeelding":
                return $(`<img>`)
                    .addClass('media-preview')
                    .attr("src", media.file + "/normaal.jpg");

            default:
                return $("<div>")
        }
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

    private createStoryElementHeader = (element: Story, title: string, nodes: Node[]): JQuery<HTMLElement> => {
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

    private getPeopleNames = (element: Story, nodes: Node[]): string => {
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
