declare var routeData: Tables.Route
declare var nodeData: Tables.RouteNode[]
declare var d3

$(document).ready(() => {
    const svg = d3.select('svg'),
        width = +svg.attr("width"),
        height = +svg.attr("height");

    const simulation = d3.forceSimulation()
        .force('charge', d3.forceManyBody().strength(-10))
        .force('center', d3.forceCenter(width / 2, height / 2))

    console.log(nodeData)

    const map: Map<string, Tables.RouteNode> = new Map()

    for(let node of nodeData) {
        map.set(node._id, node)
    }

    function getNodeColor(node: Tables.RouteNode) {
        return node.color
    }

    let nodes: Tables.RouteNode[] = nodeData
    let edges: Tables.RouteEdge[] = []

    // let idx = 0
    //
    // for(let startingNode of <Tables.RouteNode[]>routeData.startingNodes) {
    //     edges.push(<any>{
    //         _id: "0",
    //         to: startingNode,
    //         people: startingNode.persons,
    //         from: {
    //             x: 0,
    //             y: idx * 20
    //         },
    //         force: .0001
    //     })
    //
    //     idx++
    // }

    for(let node of nodes) {
        for(let edge of (<Tables.RouteEdge[]>node.edges)) {
            if (edge.to !== undefined) {
                let modifiedEdge: any = edge
                modifiedEdge.from = node
                modifiedEdge.force = .005

                let to = <string>edge.to
                modifiedEdge.to = nodes.filter(node => node._id == to)[0]

                console.log("to: " + modifiedEdge.to)

                edges.push(<Tables.RouteEdge>modifiedEdge)
            }
        }
    }

    // idx = 0
    //
    // for(let currentNodeId of <string[]>routeData.currentNodes) {
    //     let currentNode = nodes.filter(node => node._id == currentNodeId)[0]
    //
    //     if(currentNode !== undefined) {
    //         edges.push(<any>{
    //             _id:    "0",
    //             to:     {
    //                 x: width,
    //                 y: idx * 20
    //             },
    //             people: currentNode.persons,
    //             from:   currentNode,
    //             force: .0001
    //         })
    //
    //         currentNode.edges.push(edges[edges.length - 1])
    //         idx++
    //     }
    // }

    console.log(edges)
    console.log(nodes)

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

        for (let i = 0 ; i < longestNameCount + 1; i++) {
            element.append('tspan')
                .attr('dy', "1.2em")
                .text(getNodeLabel(i))
        }
    }

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
        .strength(link => {
            console.log((<any>link).force)
            return (<any>link).force
        }))

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

    //let force: any = simulation.links(edges)


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
})
