declare var routeData: Tables.Route

$(document).ready(() => {
    const svg = d3.select('svg'),
        width = +svg.attr("width"),
        height = +svg.attr("height");

    const simulation = d3.forceSimulation()
        .force('charge', d3.forceManyBody().strength(-20))
        .force('center', d3.forceCenter(width / 2, height / 2))

    console.log(routeData)

    function getNodeColor(node: Tables.RouteNode) {
        return node.color
    }

    function getNodeLabel(node: Tables.RouteNode) {
        let name = ""

        for(let person of node.persons) {
            name += person + "\n"
        }
        return name
    }

    const nodeElements = svg.append('g')
        .selectAll('circle')
        .data(routeData.startingNodes)
        .enter().append('circle')
        .attr('r', 10)
        .attr('fill', getNodeColor)

    const textElements = svg.append('g')
        .selectAll('text')
        .data(routeData.startingNodes)
        .enter().append('text')
        .text(getNodeLabel)
        .attr('font-size', 15)
        .attr('dx', 15)
        .attr('dy', 4)

    simulation.nodes(routeData.startingNodes).on('tick', () => {
        nodeElements
            .attr("cx", node => (<any>node).x)
            .attr("cy", node => (<any>node).y)
        textElements
            .attr("x", node => (<any>node).x)
            .attr("y", node => (<any>node).y)
    })
})