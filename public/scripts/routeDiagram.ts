declare var routeData: Tables.Route

$(document).ready(() => {
    const svg = d3.select('svg'),
        width = +svg.attr("width"),
        height = +svg.attr("height");

    const simulation = d3.forceSimulation()
        .force('charge', d3.forceManyBody().strength(-10))
        .force('center', d3.forceCenter(width / 2, height / 2))

    console.log(routeData)

    function getNodeColor(node: Tables.RouteNode) {
        return node.color
    }

    let nodes: Tables.RouteNode[] = []
    let edges: Tables.RouteEdge[] = []

    function addNode(node: Tables.RouteNode) {
        nodes.push(node)

        for(let edge of (<Tables.RouteEdge[]>node.edges)) {
            let modifiedEdge: any = edge
            modifiedEdge.from = node

            let to = <Tables.RouteNode>edge.to

            if(!nodes.map(node => node._id).includes(to._id))
                addNode(to)
            else
                modifiedEdge.to = nodes.filter(node => node._id == to._id)[0]


            edges.push(<Tables.RouteEdge>modifiedEdge)
        }
    }

    (<Tables.RouteNode[]>routeData.startingNodes).forEach(node => addNode(node))

    function getNodeLabel(index: number): (node: Tables.RouteNode) => string {
        return node => {
            let names = []

            for (let person of (node.persons as Tables.Person[])) {
                names.push(person.name)
            }

            return names[index]
        }
    }

    function setNodeLabel(element) {
        let longestNameCount = 0
        let longestName = ""

        for(let node of nodes) {
            if(node.persons.length > longestNameCount)
                longestNameCount = node.persons.length
        }

        for (let i = 0 ; i < longestNameCount; i++) {
            element.append('tspan')
                .attr('dy', "1.2em")
                .text(getNodeLabel(i))
        }
    }

    console.log(nodes)

    const nodeElements = svg.append('g')
        .selectAll('circle')
        .data(nodes)
        .enter().append('circle')
        .attr('r', 10)
        .attr('fill', getNodeColor)

    const textElements = svg.append('g')
        .selectAll('text')
        .data(nodes)
        .enter().append('text')
        .attr('font-size', 15)
        .attr('dx', 15)
        .attr('dy', 4)

    setNodeLabel(textElements)

    simulation.force('link', d3.forceLink()
        .id(link => (<Tables.RouteEdge>link)._id)
        .strength(1))

    const arrowHead = svg.append('defs')
        .append('marker')
        .attr('id', 'arrow')
        .attr('markerWidth', '10')
        .attr('markerHeight', '10')
        .attr('refX', '30')
        .attr('refY', '3')
        .attr('orient', 'auto')
        .attr('markerUnits', 'strokeWidth')
        .append('path')
        .attr('d', 'M0,0 L0,6 L9,3 z')
        .attr('fill', '#000')

    const linkElements = svg.append('g')
        .selectAll('line')
        .data(edges).enter().append('line')
        .attr('stroke-width', 2)
        .attr('stroke', '#ca0018')
        .attr('marker-end', 'url(#arrow)')


    const dragDrop = d3.drag()
        .on('start', (node: any) => {
            node.fx = node.x
            node.fy = node.y
        })
        .on('drag', (node: any) => {
            simulation.alphaTarget(0.7).restart()
            node.fx = d3.event.x
            node.fy = d3.event.y
        })
        .on('end', (node: any) => {
            if (!d3.event.active) {
                simulation.alphaTarget(0)
            }
            node.fx = null
            node.fy = null
        })

    let nodeElementsAny: any = nodeElements
    nodeElementsAny.call(dragDrop)


    simulation.nodes(nodes).on('tick', () => {
        nodeElements
            .attr("cx", node => (<any>node).x)
            .attr("cy", node => (<any>node).y)
        textElements
            .attr("x", node => (<any>node).x)
            .attr("y", node => (<any>node).y)
            .selectAll('tspan')
            .attr('x', node => (<any>node).x + 15)

        linkElements
            .attr('x1', edge => (<any>edge).from.x)
            .attr('y1', edge => (<any>edge).from.y)
            .attr('x2', edge => (<any>edge).to.x)
            .attr('y2', edge => (<any>edge).to.y)
    })

    let force: any = simulation.force('link')
    force.link(edges)
})