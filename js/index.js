const ctx = {
    svg_w: 1510,
    svg_h: 700,
    show: "Brands",

    // slider
    slider_w: 1400,
    // year: '1994',
    year1: 1994,
    year2: 2021,

    brandsidx: {},

    // bar chart
    barchart_h: 400,
    rect_w: 9.2,
    padding: 3,
    font_size: 9,
    duration: 500,
    barchart_data: [],

    // stream chart
    streamchart_h: 300,
    streamchart_w: 1400,
    ymax: 0,

    // bubblechart
    bubblechart_h: 600,
    bubblechart_w: 420,
    bubblechart_data: [],

    // wordscloud
    wordcloud_h: 600,
    wordcloud_w: 1000,
    wordcloud_data: [],
    max_words: 100,
    wordsdata: [],
    layout: {},

    // sizes
    sizeData: [],
};


function createViz() {
    console.log("Using D3 v" + d3.version);

    let svg = d3.select("#main").append("svg")
        .attr("width", ctx.svg_w)
        .attr("height", ctx.svg_h)

    svg.append("g").attr("id", "charts")

    /* tooltip */
    svg.append("text")
        .attr("id", "tool")
        .attr("x", 700)
        .attr("y", 290)
        .style("opacity", 0)
        .style("font-size", 60)
        .attr("text-anchor", "middle")
    // .style("font-family", "Georgia")

    /* tooltip 2 */
    d3.select("#main").append("div")
        .attr("id", "toolb")
        .style("opacity", 0)
        .style("position", "absolute")
        .style("background-color", "#e6e6e6")
        .style("padding", "5px");

    loadData(svg);
};


function loadData(svg) {
    let promises = [
        d3.csv("BrandsIdx.csv"),
        d3.json("Brands.json"),
        d3.csv("BrandsYears.csv"),
        d3.json("Colors.json"),
        d3.json("Wordcloud.json"),

        d3.csv("year_brand_size_total.csv"),
    ];
    Promise.all(promises).then(function (data) {
        ctx.brandsidx = data[0][0];

        ctx.barchart_data = data[1];
        ctx.streamchart_data = data[2];
        ctx.bubblechart_data = data[3];
        ctx.wordcloud_data = data[4];

        ctx.sizeData = data[5];

        createSlider(svg);

        createBarchart();
        createStreamChart();

    }).catch(function (error) { console.log(error) });

};


// function createSlider(svg) {
//     const slider = d3.sliderHorizontal()
//         .min(1994)
//         .max(2021)
//         .step(1)
//         .width(ctx.streamchart_w)
//         .ticks(27)
//         .tickFormat(d3.format('c'))
//         .fill("blue")
//         .handle(d3.symbol().type(d3.symbolCircle).size(200))
//         .on('onchange', function (val) {
//             ctx.year = String(val);

//             if (ctx.show == "Brands") {
//                 UpdateBarChart();
//                 UpdateStreamChart();
//             }
//             else if (ctx.show == "Others") {
//                 UpdateBubbleChart();
//                 UpdateWordCloud();
//             }

//         });

//     svg.append('g')
//         .attr("id", "slider")
//         .attr('transform', 'translate(40,30)')
//         .call(slider);
// }
function createSlider(svg) {
    let sliderVals = [ctx.year1, ctx.year2];
    let sliderG = svg.append('g')
        .attr("id", "slider")
        .attr('transform', 'translate(40,30)');

    let x = d3.scaleLinear()
        .domain([1994, 2021])
        .range([0, ctx.slider_w])
        .clamp(true);

    let xMin = x(1994),
        xMax = x(2021);

    sliderG.append("line")
        .attr("class", "track")
        .attr("x1", 10 + x.range()[0])
        .attr("x2", 10 + x.range()[1])
        .style("stroke", "#bbb")
        .style("stroke-width", 10);

    let selRange = sliderG.append("line")
        .attr("class", "sel-range")
        .attr("x1", 10 + x(sliderVals[0]))
        .attr("x2", 10 + x(sliderVals[1]))
        .style("stroke", "lightblue")
        .style("stroke-width", 10);

    sliderG.insert("g", ".track-overlay")
        .attr("class", "ticks")
        .attr("transform", "translate(10,24)")
        .selectAll("text")
        .data(x.ticks(27))
        .enter().append("text")
        .attr("x", x)
        .attr("text-anchor", "middle")
        .style("font-weight", "bold")
        .text(d => d);

    let handle = sliderG.selectAll("rect")
        .data([0, 1])
        .enter().append("rect", ".track-overlay")
        .attr("class", "handle")
        .attr("y", -8)
        .attr("x", d => x(sliderVals[d]))
        .attr("rx", 3)
        .attr("height", 16)
        .attr("width", 20)
        .call(
            d3.drag()
                .on("start", startDrag)
                .on("drag", drag)
                .on("end", endDrag)
        );

    function startDrag() {
        d3.select(this).raise().classed("active", true);
    }

    function drag(event, d) {
        let x1 = event.x;
        if (x1 > xMax) {
            x1 = xMax;
        } else if (x1 < xMin) {
            x1 = xMin;
        }
        d3.select(this).attr("x", x1);
        let x2 = x(sliderVals[d == 0 ? 1 : 0])
        selRange
            .attr("x1", 10 + x1)
            .attr("x2", 10 + x2);
    }

    function endDrag(event, d) {
        let v = Math.round(x.invert(event.x));
        let elem = d3.select(this);
        sliderVals[d] = v;
        let v1 = Math.min(sliderVals[0], sliderVals[1]),
            v2 = Math.max(sliderVals[0], sliderVals[1]);
        elem.classed("active", false)
            .attr("x", x(v));
        selRange
            .attr("x1", 10 + x(v1))
            .attr("x2", 10 + x(v2));

        updateGraph(v1, v2);
    }
}

function updateGraph(v1, v2) {
    console.log(v1, v2);
    if (v2 < v1) {
        let temp = v1;
        v1 = v2;
        v2 = temp;
    }
    ctx.year1 = v1;
    ctx.year2 = v2;

    if (ctx.show == "Brands") {
        UpdateBarChart();
        UpdateStreamChart();
    }
    else if (ctx.show == "Others") {
        UpdateBubbleChart();
        UpdateWordCloud();
    }
    else {
        updateSizeChart(v1, v2);
    }
}


function showOthers() {
    if (ctx.show != "Others") {
        ctx.show = "Others";

        document.getElementById("btn3").style.background = "#c1c1c1";
        document.getElementById("btn1").style.background = "#e7e7e7";
        document.getElementById("btn2").style.background = "#e7e7e7";

        d3.select("#charts")
            .transition().duration(ctx.duration).style("opacity", 0)
            .remove()
            .on("end", function () {
                d3.select("svg").append("g").attr("id", "charts")
                    .style("opacity", 0)
                    .transition()
                    .duration(ctx.duration * 2)
                    .delay(ctx.duration * 2)
                    .style("opacity", 1);

                createBubbleChart();
                createWordCloud();
            });
    }
}

function showBrands() {
    if (ctx.show != "Brands") {
        ctx.show = "Brands";

        document.getElementById("btn1").style.background = "#c1c1c1";
        document.getElementById("btn2").style.background = "#e7e7e7";
        document.getElementById("btn3").style.background = "#e7e7e7";


        d3.select("#charts").transition()
            .duration(ctx.duration)
            .style("opacity", 0)
            .remove()
            .on("end", function () {
                d3.select("svg").append("g").attr("id", "charts")
                    .style("opacity", 0)
                    .transition()
                    .delay(ctx.duration)
                    .duration(ctx.duration)
                    .style("opacity", 1);

                createBarchart();
                createStreamChart();
            });
    }
}

function showSizes() {
    if (ctx.show != "Sizes") {
        ctx.show = "Sizes";

        document.getElementById("btn2").style.background = "#c1c1c1";
        document.getElementById("btn1").style.background = "#e7e7e7";
        document.getElementById("btn3").style.background = "#e7e7e7";

        d3.select("#charts")
            .transition().duration(ctx.duration).style("opacity", 0)
            .remove()
            .on("end", function () {
                d3.select("svg").append("g").attr("id", "charts")
                    .style("opacity", 0)
                    .transition()
                    .delay(ctx.duration)
                    .duration(ctx.duration)
                    .style("opacity", 1);

                createSizeChart();

            });
    }
}