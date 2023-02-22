function createStreamChart() {
    /* streamchart position */
    let chartG = d3.select("#charts").append("g")
        .attr("id", "streamchart")
        .style("transform", "translate(40px, 300px)")
        
    chartG.append("g").attr("id", "streams")


    /* X scale, axis */
    let xScale = d3.scaleLinear()
        .domain([1994, 2021])
        .range([0, ctx.streamchart_w]);

    chartG.append("g")
        .attr("id", "axis-x")
        .attr("transform", "translate(0," + ctx.streamchart_h + ")")
        .call(d3.axisBottom(xScale));

    /* Y scale, axis */
    let yScale = d3.scaleLinear()
        .domain([0, 1000])
        .range([ctx.streamchart_h, 0]);

    d3.select("#streamchart").append("g")
        .attr("id", "axis-y")
        .attr("transform", "translate(" + ctx.streamchart_w + ",0)")
        .call(d3.axisLeft(yScale));

    UpdateStreamChart();
}


function UpdateStreamChart() {
    // let filteredData = data.filter((d) => (d.Year <= ctx.year));
    let filteredData = ctx.streamchart_data.filter((d) => (d.Year >= ctx.year1 && d.Year <= ctx.year2));
    // console.log("---filteredData---")
    // console.log(filteredData)

    let keys = ctx.streamchart_data.columns.slice(1);

    let stackedData = d3.stack()
        .order(d3.stackOrderAscending)
        .keys(keys)
        (filteredData)
    // console.log("---stackedData---")
    // console.log(stackedData)


    /* X scale, axis */
    let xScale = d3.scaleLinear()
        .domain([1994, 2021])
        .range([0, ctx.streamchart_w]);
    d3.select("#axis-x").call(d3.axisBottom(xScale).ticks(2021 - 1994, "d"));

    /* Y scale, axis*/
    let ymax = d3.max(stackedData, function (d) {
        return d.slice(-1)[0][1];
    })
    // console.log("---ymax---");
    // console.log(ymax);
    if (ctx.year2 >= 2014) { ymax = 967 }
    else if (ctx.year2 == 2001) { ymax = 83 }
    else if (ctx.year2 == 2012) { ymax = 758 }
    let yScale = d3.scaleLinear()
        .domain([0, ymax])
        .range([ctx.streamchart_h, 0]);

    d3.select("#axis-y")
    .transition()
    .duration(ctx.duration)
    .ease(d3.easeLinear)
    .call(d3.axisLeft(yScale));

    let colorScale = d3.scaleSequential()
    .domain([0, 115])
    .interpolator(d3.interpolateRainbow);


    let area = d3.area()
        .x(d => xScale(d.data.Year))
        .y0(d => yScale(d[0]))
        .y1(d => yScale(d[1]))
        .curve(d3.curveBasis);

    let Tooltip = d3.select("#tool")
    
    let mouseover = function (e, i) {
        Tooltip.style("opacity", 1)
        d3.select("#streams").selectAll("path").style("opacity", 0.2)
        d3.select("#bars").selectAll("rect").style("opacity", 0.2)
        d3.select(this)
            .style("stroke", "black")
            .style("opacity", 1)

        d3.select(`.${i.key}`)
        .style("stroke", "black")
        .style("opacity", 1)
    }
    let mousemove = function (e, i) {
        brand = i.key;
        // console.log(i);
        Tooltip.text(brand)
        .style("fill", colorScale(ctx.brandsidx[brand]));
    }
    let mouseleave = function (e) {
        Tooltip.style("opacity", 0);
        d3.select("#streams").selectAll("path").style("opacity", 1).style("stroke", "none");
        d3.select("#bars").selectAll("rect").style("opacity", 1).style("stroke", "none");
    }


    d3.select("#streams").selectAll("path")
        .data(stackedData)
        .join(
            enter => (
                enter.append("path")
                    .attr("class", d => d.key)
                    .style("fill", d => colorScale(ctx.brandsidx[d.key]))
                    .attr("d", area)
                    .on("mouseover", mouseover)
                    .on("mousemove", mousemove)
                    .on("mouseleave", mouseleave)
            ),
            update => (
                update.transition()
                .duration(ctx.duration)
                .attr("d", area)
            ),
            exit => (
                exit.transition()
                .duration(500)
                .style("opacity", 0)
                .remove()
            )
        );
}