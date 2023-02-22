function getEachYearData(data) {
    // remove Year
    delete data.Year
    return Object.keys(data).map(key => ({ key, value: parseInt(data[key]) }))
}


function createBarchart() {
    /* barchart position */
    let chartG = d3.select("#charts").append("g")
        .attr("id", "barchart")
        .style("transform", "translate(40px, 100px)")


    chartG.append("text")
        .text("Phone Brands")
        .style("font-size", 30)
        .style("font-weight", "bold")
        .style("font-family", "Times New Roman");

    chartG.append("g")
        .attr("id", "bars")
        .style("transform", "translateX(5px)")

    chartG.append('g')
        .attr("id", "axis")
        .style("transform", "translateY(20px)")

    UpdateBarChart();
}


function UpdateBarChart() {
    // let filteredData = ctx.barchart_data.filter((d) => (d.Year <= ctx.year));
    let filteredData = ctx.barchart_data
        .filter((d) => (d.Year >= ctx.year1 && d.Year <= ctx.year2));
    // console.log('---filteredData---')
    // console.log(filteredData)
    let sumdata = [];

    filteredData.forEach(function (item) {
        item.Brands.forEach(function (brand) {
            let isfound = 0;
            for (let i = 0; i < sumdata.length; i++) {
                if (brand.key == sumdata[i].key) {
                    isfound = 1;
                    let newbrand = {};
                    newbrand['key'] = brand.key;
                    newbrand['value'] = sumdata[i].value + brand.value;
                    sumdata[i] = newbrand;
                }
            }
            if (isfound == 0) {
                sumdata.push(brand)
            }
        })
    })

    // console.log('---sumdata---')
    // console.log(sumdata)


    /* Y scale, axis */
    let yScale = d3.scaleLinear()
        .domain([0, d3.max(Object.values(sumdata), d => d.value)])
        .range([ctx.barchart_h, 0])

    let yScaler = d3.scaleLinear()
        .domain([0, d3.max(Object.values(sumdata), d => d.value)])
        .range([0, ctx.barchart_h])

    d3.select("#axis").transition()
        .duration(ctx.duration)
        .ease(d3.easeLinear)
        .call(d3.axisLeft(yScaler))

    let colorScale = d3.scaleSequential()
        .domain([0, 115])
        .interpolator(d3.interpolateRainbow);


    let Tooltip = d3.select("#tool")
    let mouseover = function (e, d) {
        Tooltip.style("opacity", 1)
        d3.select("#streams").selectAll("path").style("opacity", 0.2)
        d3.select("#bars").selectAll("rect").style("opacity", 0.2)
        d3.select(this)
            .style("stroke", "black")
            .style("opacity", 1)

        d3.select("#streams").select(`.${d.key}`)
            .style("stroke", "black")
            .style("opacity", 1)
    }
    let mousemove = function (e, d) {
        let idx = sortedRange.findIndex(e => e.key === d.key);
        Tooltip.text(`${idx + 1}. ${d.key} (${d.value})`)
            .style("fill", colorScale(ctx.brandsidx[d.key]));
    }
    let mouseleave = function (e) {
        Tooltip.style("opacity", 0)
        d3.select("#streams").selectAll("path").style("opacity", 1).style("stroke", "none")
        d3.select("#bars").selectAll("rect").style("opacity", 1).style("stroke", "none")
    }


    const sortedRange = [...sumdata].sort((a, b) => b.value - a.value)


    let barG = d3.select("#bars");

    /* bars */
    let selectrec = barG.selectAll("rect")
        .data(sumdata, d => d.key)

    selectrec.enter()
        .append("rect")
        .attr('class', d => d.key)
        .attr("y", 20)
        .style("fill", d => colorScale(ctx.brandsidx[d.key]))
        .attr("x", (d) => sortedRange.findIndex(e => e.key === d.key) * (ctx.rect_w + ctx.padding))
        .attr("height", d => ctx.barchart_h - yScale(d.value))
        .attr("width", ctx.rect_w)
        .on("mouseover", mouseover)
        .on("mousemove", mousemove)
        .on("mouseleave", mouseleave)

    selectrec
        .transition()
        .duration(ctx.duration)
        .attr("x", (d, i) => sortedRange.findIndex(e => e.key === d.key) * (ctx.rect_w + ctx.padding))
        .attr("height", d => ctx.barchart_h - yScale(d.value))
        .attr("width", ctx.rect_w)
    // .attr("transform", function (d) {
    //     return "translate(" + "0," + yScale(d.value) + ")";
    // })

    selectrec.exit().remove();




    /* labels */
    let selectext = barG.selectAll("text")
        .data(sumdata)


    selectext.enter()
        .append("text")
        .attr("opacity", 0)
        .text(d => d.key + " (" + d.value + ")")
        .attr("font-size", ctx.font_size)
        .attr("x", (d, i) => sortedRange.findIndex(e => e.key === d.key) * (ctx.rect_w + ctx.padding))
        // .attr("y", ctx.barchart_h + 30)
        .attr("y", d => ctx.barchart_h - yScale(d.value) + 30)
        .attr("opacity", d => d.value == 0 ? 0 : 100)
        .attr("transform", function (d, i) {
            x = sortedRange.findIndex(e => e.key === d.key) * (ctx.rect_w + ctx.padding);
            // y = ctx.barchart_h + 30;
            y = ctx.barchart_h - yScale(d.value) + 30;
            return "rotate(60, " + x + " " + y + ")";
        })

    selectext
        .text(d => d.key + " (" + d.value + ")")
        .transition()
        .duration(ctx.duration)
        .attr("x", (d, i) => sortedRange.findIndex(e => e.key === d.key) * (ctx.rect_w + ctx.padding))
        // .attr("y", ctx.barchart_h + 30)
        .attr("y", d => ctx.barchart_h - yScale(d.value) + 30)
        .attr("opacity", d => d.value == 0 ? 0 : 100)
        .attr("transform", function (d, i) {
            x = sortedRange.findIndex(e => e.key === d.key) * (ctx.rect_w + ctx.padding);
            // y = ctx.barchart_h + 30;
            y = ctx.barchart_h - yScale(d.value) + 30;
            return "rotate(60, " + x + " " + y + ")";
        })

}


