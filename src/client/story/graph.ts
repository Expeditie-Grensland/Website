export namespace Graph {
    const WIDTH = 150
    const HORIZONTAL_SPACE = 70
    const KNOWN_STORY_CLASSES = ['location', 'text', 'gallery'];
    const LINE_COLORS = [
        '#2962FF',
        '#D50000',
        '#00C853',
        '#FF6D00',
        '#C51162',
        '#AA00FF',
        '#AEEA00',
        '#00BFA5',
        '#00B8D4'
    ];

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
        const height = elements[elements.length - 1].find(e => e != null)![0] + 15;

        const svg = svgElement('svg');
        svg.setAttribute('width', WIDTH.toString());
        svg.setAttribute('height', height.toString());

        [
            ...createLines(elements),
            ...createCircles(elements)
        ].forEach(e => svg.appendChild(e));

        return svg;
    };

    const generateStorySvg = (story: HTMLDivElement) => {
        const startGraphWidth = parseInt(story.getAttribute('data-track-start-count')!);

        let trackCount = startGraphWidth;
        let trackIds: string[] = [];
        let trackColors = LINE_COLORS;

        const storyElements = Array.from(story.children);

        const svgArray: [number, string][][] = [];

        let merged = false;

        for (let storyElement of storyElements) {
            if (!storyElement.classList.contains('storyElement'))
                continue;

            const trackId = storyElement.getAttribute('data-track-id')!;

            if (trackIds.indexOf(trackId) < 0) {
                trackIds.push(trackId);

                if (merged) {
                    trackCount++;
                    trackColors.splice(0, 1);
                }
            }

            let mergeId = storyElement.getAttribute('data-track-merge');

            if (mergeId) {
                const trackIdx = trackIds.indexOf(mergeId);

                if (trackIdx > -1){
                    trackIds.splice(trackIdx, 1);
                    trackColors.splice(trackIdx, 1);

                    trackColors.splice(trackIds.indexOf(trackId), 1);
                }

                trackCount--;

                merged = true;
            }

            const array: [number, string][] = new Array(trackCount).fill(null);
            const idx = trackIds.indexOf(trackId);

            array[idx] = [storyElement.getBoundingClientRect().top, trackColors[idx]];

            svgArray.push(array);
        }

        console.log(svgArray);

        return generateSvg(svgArray);
    }

    export function init() {
        document!.getElementById("graph")!.appendChild(generateStorySvg(document.getElementById('storyElements') as HTMLDivElement));
    }
}
