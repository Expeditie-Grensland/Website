declare var routeData: Tables.Route

$(document).ready(() => {
    const svg = d3.select('svg'),
        width = +svg.attr("width"),
        height = +svg.attr("height");

    const simulation = d3.forceSimulation()
        .force('charge', d3.forceManyBody().strength(-20))
        .force('center', d3.forceCenter(width / 2, height / 2))

    console.log(routeData)

})