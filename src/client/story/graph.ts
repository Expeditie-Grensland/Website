import $ from 'jquery';
import {SocketTypes} from "../sockets/types"

export namespace Graph {
    const WIDTH = 150
    const HORIZONTAL_SPACE = 70
    const KNOWN_STORY_CLASSES = ['location', 'text', 'gallery'];

    const svgElement = (type: string) => document.createElementNS('http://www.w3.org/2000/svg', type)
    const calculateHorizontal = (length: number, index: number) => (WIDTH - (length - 1) * HORIZONTAL_SPACE) / 2 + index * HORIZONTAL_SPACE

    const generateCircle = (x: number, y: number, color: string) => {
        const circle = svgElement('circle');
        circle.setAttribute('cx', x.toString());
        circle.setAttribute('cy', y.toString());
        circle.setAttribute('r', '8');
        circle.setAttribute('stroke', color);
        circle.setAttribute('fill', '#fff');
        circle.setAttribute('stroke-width', '5');
        return circle;
    };

    const createCircles = function* (elements: [number, string][][]) {
        for (const element of elements) {
            const index = element.findIndex(e => e != null);
            yield generateCircle(
                calculateHorizontal(element.length, index),
                element[index][0],
                element[index][1]
            );
        }
    };

    const generateLine = (xA: number, yA: number, xB: number, yB: number, color: string, curve: string) => {
        const path = svgElement('path');
        path.setAttribute('fill', 'none');
        path.setAttribute('stroke', color);
        path.setAttribute('stroke-width', '5');

        let pathProps = `M ${xA} ${yA} `;

        if (curve === 'none') {
            pathProps += `V ${yB}`;
        } else if (curve === 'begin') {
            if (xB > xA) pathProps += `H ${xB - 20} a 20 20 0 0 1 20 20`;
            else pathProps += `H ${xB + 20} a 20 20 0 0 0 -20 20`;

            pathProps += `V ${yB}`
        } else if (curve === 'end') {
            pathProps += `V ${yB - 20}`;
            if (xB < xA) pathProps += `a 20 20 0 0 1 -20 20 H ${xB}`;
            else pathProps += `a 20 20 0 0 0 20 20 H ${xB}`;
        }

        path.setAttribute('d', pathProps);
        return path;
    };

    const createLines = function* (elements: [number, string][][]) {
        for (let i = 0; i < elements.length; i++) {
            const indexA = elements[i].findIndex(e => e != null);
            const lengthA = elements[i].length;

            for (let j = i + 1; j < elements.length; j++) {
                const indexB = elements[j].findIndex(e => e != null);
                const lengthB = elements[j].length;

                let lrTodo = [true, true];

                if (
                    lengthA === lengthB && indexA === indexB ||
                    lengthA === lengthB + 1 && (indexA === indexB || indexA === indexB + 1) ||
                    lengthA + 1 === lengthB && (indexA === indexB && lrTodo[0] || indexA + 1 === indexB && lrTodo[1])
                ) {
                    yield generateLine(
                        calculateHorizontal(lengthA, indexA),
                        elements[i][indexA][0],
                        calculateHorizontal(lengthB, indexB),
                        elements[j][indexB][0],
                        lengthA < lengthB ? elements[j][indexB][1] : elements[i][indexA][1],
                        lengthA === lengthB ? 'none' : lengthA < lengthB ? 'begin' : 'end'
                    );
                    if (lengthA + 1 === lengthB) {
                        if (indexA === indexB) lrTodo[0] = false;
                        if (indexA + 1 === indexB) lrTodo[1] = false;
                        if (!lrTodo[0] && !lrTodo[1]) break;
                    } else break;
                }
            }
        }
    };

    const generateSvg = (elements: [number, string][][]) => {
        const svg = svgElement('svg');

        if (elements.length > 0) {
            const height = elements[elements.length - 1].find(e => e != null)![0] + 15;

            svg.setAttribute('width', WIDTH.toString());
            svg.setAttribute('height', height.toString());

            [
                ...createLines(elements),
                ...createCircles(elements)
            ].forEach(e => svg.appendChild(e));
        }

        return svg;
    };

    const generateStorySvg = (nodes: SocketTypes.Node[], story: SocketTypes.StoryElement[], htmlStory: HTMLElement, htmlHeaders: HTMLElement[]) => {
        const graphTop = htmlStory.getBoundingClientRect().top;

        let tracks: string[] = [];
        let people: string[] = [];

        const svgArray: [number, string][][] = [];


        for (let idx = 0; idx != story.length; ++idx) {
            const storyElement = story[idx];
            const htmlHeader = htmlHeaders[idx];
            const nodeId = storyElement.geoNodeId;
            const node = nodes.find(node => node.id == nodeId)!;

                    // node unknown, create new track or merge existing
            if (tracks.indexOf(nodeId) < 0) {
                        // create new track, and try to merge previous tracks

                const mergeCandidates = nodes.filter(n => tracks.indexOf(n.id) >= 0);
                const mergeNodes = mergeCandidates.filter(n => n.personIds.some(pId => node.personIds.indexOf(pId) >= 0));

                console.log("Adding new node: " + node.color);
                tracks.push(nodeId);
                people.push(...node.personIds)

                console.log("Trying to merge node: " + node.color);

                console.log("Possible merge candidates");
                console.log(mergeNodes);
                if (mergeNodes.length > 1 && !mergeNodes.some(node => node.id === nodeId))
                    mergeNodes.forEach(n => tracks.splice(tracks.indexOf(n.id), 1))
                // else if (!mergeNodes.some(node => node.id === nodeId))
                //     mergeNodes
            }

            const array: [number, string][] = new Array(tracks.length).fill(null);

            const headerRect = htmlHeader.getBoundingClientRect();
            const headerMiddle = (headerRect.top + headerRect.bottom) / 2.0;

            array[tracks.indexOf(nodeId)] = [headerMiddle - graphTop , node.color];

            console.log("Layer.");
            console.log(array);
            svgArray.push(array);
        }

        console.log(svgArray);
        return generateSvg(svgArray);
    }

    export function createGraph(nodes: SocketTypes.Node[], story: SocketTypes.StoryElement[]) {
        const graphEl = document!.getElementById("graph")!;
        const storyEls = document!.getElementById("storyElements")!;
        const storyHeaders = $('.storyElement h1').toArray();

        const svg = generateStorySvg(nodes, story, storyEls, storyHeaders);

        $(graphEl).empty();
        graphEl.appendChild(svg);
    }
}
