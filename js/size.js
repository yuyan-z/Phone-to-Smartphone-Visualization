const ctx_size = {
    year1: 1995,
    year2: 2000,

    selectedBrandData: [],
    avgSizeData: [],

    domains: {
        length: [80, 180],
        width: [30, 100],
        weight: [80, 220],
        thickness: [5, 28]
    },

    sizeWidth: 1420,
    sizeHeight: 250,
    sizeMargin: {
        top: 20,
        right: 1,
        bottom: 1,
        left: 120
    },
    ys: null,
    sizeColors: ["red", "green", "blue", "orange"],

    lwWidth: 350,
    lwHeight: 350,
    lwMargin: {
        top: 20,
        right: 1,
        bottom: 1,
        left: 20
    },
    LW_x: null,
    LW_y: null,
    WT_x: null,
    WT_y: null,
    colorScaler: d3
        .scaleLinear()
        .domain([1994, 2021])
        .range(["#004C99", "#66B2FF"]),

    infoWidth: 200
}

function createSizeChart() {
    ctx_size.year1 = ctx.year1;
    ctx_size.year2 = ctx.year2;

    let sizeData = ctx.sizeData;

    let brand = null;

    if (brand == null) {
        ctx_size.selectedBrandData = sizeData;
    } else {
        selectData(sizeData, brand);
    }
    getAvg();

    initializeSize(ctx_size.year1, ctx_size.year2);
    initializeLW(ctx_size.year1, ctx_size.year2);
    initializeWT(ctx_size.year1, ctx_size.year2);
    initializeInfo();
}

function updateSizeChart(year1, year2) {
    ctx_size.year1 = year1;
    ctx_size.year2 = year2;

    cancelSelect();
    updateSize(ctx_size.year1, ctx_size.year2);
    updateLW(ctx_size.year1, ctx_size.year2);
    updateWT(ctx_size.year1, ctx_size.year2);
}

function selectData(sizeData, brand) {
    ctx_size.selectedBrandData = [];
    sizeData.forEach(function (element) {
        if ((element.Brand == brand)) {
            ctx_size.selectedBrandData.push(element);
        }
    });
}

function getAvg() {
    let avgData = {};
    ctx_size.selectedBrandData.forEach(function (element) {
        let e_year = parseInt(element.year),
            e_length = parseFloat(element.length),
            e_width = parseFloat(element.width),
            e_weight = parseFloat(element.weight),
            e_thickness = parseFloat(element.thickness);
        if (avgData.hasOwnProperty(e_year)) {
            avgData[e_year].length += e_length;
            avgData[e_year].width += e_width;
            avgData[e_year].weight += e_weight;
            avgData[e_year].thickness += e_thickness;
            avgData[e_year].counter += 1;
        } else {
            let avg = {
                length: e_length,
                width: e_width,
                weight: e_weight,
                thickness: e_thickness,
                counter: 1
            };
            avgData[e_year] = avg;
        }
    });

    let keys_sorted = Object.keys(avgData).sort();
    //console.log(keys_sorted);
    ctx_size.avgSizeData = []
    keys_sorted.forEach(key => {
        let counter = avgData[key].counter;
        let element = {
            year: parseInt(key),
            length: avgData[key].length / counter,
            width: avgData[key].width / counter,
            weight: avgData[key].weight / counter,
            thickness: avgData[key].thickness / counter
        };
        ctx_size.avgSizeData.push(element);
    });
    // console.log(ctx_size.avgSizeData);
}

function initializeSize(year1, year2) {
    // size chart position
    let sizeG = d3.select("#charts").append("g")
        .attr("id", "sizechart")
        .style("transform", "translate(160px, 440px)");

    let width = ctx_size.sizeWidth - ctx_size.sizeMargin.left - ctx_size.sizeMargin.right;
    let height = ctx_size.sizeHeight - ctx_size.sizeMargin.top - ctx_size.sizeMargin.bottom;

    let x = d3
        .scaleLinear()
        .domain([year1, year2])
        .range([0, width]);
    let xAxis = d3.axisBottom(x).ticks(year2 - year1)
        ;
    sizeG.append("g")
        .attr("class", "xAxis")
        .attr("transform", "translate(0," + height + ")")
        .call(xAxis)
        ;
    let list_y = ["length", "width", "weight", "thickness"];
    let ys = [];

    for (let i = 0; i < 4; i++) {
        let y = d3.scaleLinear().range([height, 0]);
        //console.log(d3.extent(ctx_size.avgSizeData, function(d) { return d[list_y[i]]; }));
        y.domain(ctx_size.domains[list_y[i]]);
        let yAxis = d3.axisLeft(y);
        ys.push(y);
        sizeG.append("g")
            .attr("class", "y" + String(i + 1) + "Axis")
            .attr("transform", "translate(" + String(-40 * i) + ",0)")
            .attr('stroke', ctx_size.sizeColors[i])
            .call(yAxis)
            .append("text")
            .attr("transform", "rotate(-90)")
            .attr("y", 6)
            .attr("dy", ".71em")
            .style("text-anchor", "end")
            .text(list_y[i]);
    }

    ctx_size.ys = ys;

    for (let i = 0; i < 4; i++) {
        let line = d3.line().x(d => x(d.year))
            .y(function (d) {
                //console.log(ys[i](d[list_y[i]]));
                return ys[i](d[list_y[i]]);
            });
        sizeG.append("path")
            .datum(ctx_size.avgSizeData.filter(function (d) {
                return (d.year >= year1) && (d.year <= year2)
            }))
            .attr("class", "line" + String(i + 1))
            .attr("d", line)
            .attr('fill', 'none')
            .attr('stroke-width', 3)
            .attr('stroke', ctx_size.sizeColors[i]);

        sizeG.append('g')
            .attr('class', 'circles' + String(i + 1))
            .selectAll('circle')
            .data(ctx_size.avgSizeData.filter(function (d) {
                return (d.year >= year1) && (d.year <= year2)
            }), (d) => (d.year))
            .enter()
            .append('circle')
            .attr('stroke', ctx_size.sizeColors[i])
            .attr('fill', ctx_size.sizeColors[i])
            .attr('cx', function (d) {
                return x(d.year);
            })
            .attr('cy', function (d) {
                return ys[i](d[list_y[i]]);
            })
            .attr('r', 5)
            .append('title')
            .text(function (d) {
                let content = 'year:' + String(d.year) + '\n' + list_y[i] + ':' + String(d[list_y[i]]);
                return content;
            });
    }
}

function initializeLW(year1, year2) {
    // length-width chart position
    let LWG = d3.select("#charts").append("g")
        .attr("id", "lwchart")
        .style("transform", "translate(40px, 80px)");

    LWG.on("dblclick", cancelSelect);

    let width = ctx_size.lwWidth - ctx_size.lwMargin.left - ctx_size.lwMargin.right;
    let height = ctx_size.lwHeight - ctx_size.lwMargin.top - ctx_size.lwMargin.bottom;

    let x = d3
        .scaleLinear()
        .domain([ctx_size.domains.length[0] * 0.3, ctx_size.domains.length[1] * 3])
        .range([0, width]);
    ctx_size.LW_x = x;

    let xAxis = d3.axisBottom(x);
    LWG.append("g")
        .attr("class", "xAxis")
        .attr("transform", "translate(0," + height + ")")
        .call(xAxis)
        .append("text")
        .attr("fill", "black")
        .style("text-anchor", "end")
        .attr("x", width)
        .attr("y", ctx_size.lwMargin.bottom - 6)
        .text("length(mm)");

    let y = d3
        .scaleLinear()
        .domain([ctx_size.domains.width[0] * 0.3, ctx_size.domains.width[1] * 3])
        .range([height, 0]);
    ctx_size.LW_y = y;

    let yAxis = d3.axisLeft(y);
    LWG.append("g")
        .attr("class", "yAxis")
        .call(yAxis)
        .append("text")
        .attr("fill", "black")
        .attr("transform", "rotate(-90)")
        .attr("y", 6)
        .attr("dy", ".71em")
        .style("text-anchor", "end")
        .text("width(mm)");

    let colorScaler = ctx_size.colorScaler;

    LWG.append('g')
        .attr('class', 'circles')
        .selectAll('circle')
        .data(ctx_size.selectedBrandData.filter(function (d) {
            return (d.year >= year1) && (d.year <= year2)
        }),(d)=>(d.Name))
        .enter()
        .append('circle')
        .attr('stroke', (d) => colorScaler(d.year))
        .attr('fill', 'none')
        .attr('cx', function (d) {
            return x(d.length);
        })
        .attr('cy', function (d) {
            return y(d.width);
        })
        .attr('r', 2)
        .on('click', clickOnCircle)
        .append('title')
        .text(function (d) {
            let content = 'year:' + d.year + '\n' + 'length:' + d.length + '\n' + 'width:' + d.width;
            return content;
        });

}

function initializeWT(year1, year2) {
    // weight-thickness chart position
    let WTG = d3.select("#charts").append("g")
        .attr("id", "wtchart")
        .style("transform", "translate(440px, 80px)");

    WTG.on("dblclick", cancelSelect);

    let width = ctx_size.lwWidth - ctx_size.lwMargin.left - ctx_size.lwMargin.right;
    let height = ctx_size.lwHeight - ctx_size.lwMargin.top - ctx_size.lwMargin.bottom;

    let x = d3
        .scaleLinear()
        .domain([ctx_size.domains.weight[0] * 0.3, ctx_size.domains.weight[1] * 3])
        .range([0, width]);
    ctx_size.WT_x = x;

    let xAxis = d3.axisBottom(x);
    WTG.append("g")
        .attr("class", "xAxis")
        .attr("transform", "translate(0," + height + ")")
        .call(xAxis)
        .append("text")
        .attr("fill", "black")
        .style("text-anchor", "end")
        .attr("x", width)
        .attr("y", ctx_size.lwMargin.bottom - 6)
        .text("weight(g)");

    let y = d3
        .scaleLinear()
        .domain([ctx_size.domains.thickness[0] * 0.3, ctx_size.domains.thickness[1] * 3])
        .range([height, 0]);
    ctx_size.WT_y = y;

    let yAxis = d3.axisLeft(y);
    WTG.append("g")
        .attr("class", "yAxis")
        .call(yAxis)
        .append("text")
        .attr("fill", "black")
        .attr("transform", "rotate(-90)")
        .attr("y", 6)
        .attr("dy", ".71em")
        .style("text-anchor", "end")
        .text("thickness(mm)");

    let colorScaler = d3
        .scaleLinear()
        .domain([1994, 2021])
        .range(["#004C99", "#66B2FF"]);

    WTG.append('g')
        .attr('class', 'circles')
        .selectAll('circle')
        .data(ctx_size.selectedBrandData.filter(function (d) {
            return (d.year >= year1) && (d.year <= year2)
        }),(d)=>(d.Name))
        .enter()
        .append('circle')
        .attr('stroke', (d) => colorScaler(d.year))
        .attr('fill', 'none')
        .attr('cx', function (d) {
            return x(d.weight);
        })
        .attr('cy', function (d) {
            return y(d.thickness);
        })
        .attr('r', 2)
        .on('click', clickOnCircle)
        .append('title')
        .text(function (d) {
            let content = 'year:' + d.year + '\n' + 'weight:' + d.weight + '\n' + 'thickness:' + d.thickness;
            return content;
        });
}

function initializeInfo() {
    /* position */
    let infoG = d3.select("#charts").append("g")
        .attr("id", "info")
        .style("transform", "translate(800px, 150px)")
        .style("font-size", 20)
        ;

    infoG.append("g")
        .attr("id", "intro")
        .append("text")
        .attr("fill", "black")
        .text("Click on the chart to select a phone:")
        .style("font-size", 30)
        .style("font-weight", "bold")
        .style("font-family", "Times New Roman")
        .style("transform", "translate(0, -50px)")
        ;
}

function clickOnCircle(event, d) {
    ctx_size.selectedBrandData.forEach(function (d) {
        if (d.hasOwnProperty('selected')) {
            delete d['selected'];
        }
    });
    d['selected'] = true;

    let LWGCircles = d3.select("g#lwchart").select("g.circles");
    LWGCircles.selectAll("circle")
        .data(ctx_size.selectedBrandData.filter(function (d) {
            return (d.year >= ctx_size.year1) && (d.year <= ctx_size.year2)
        }),(d)=>(d.Name))
        .classed("selected", (d) => (d.hasOwnProperty('selected')))
        .attr("opacity", 0.1)
        .attr('stroke', (d) => ctx_size.colorScaler(d.year));
    LWGCircles.selectAll("circle.selected").attr("opacity", 1)
        .attr('stroke', 'red');

    let WTGCircles = d3.select("g#wtchart").select("g.circles");
    WTGCircles.selectAll("circle")
        .data(ctx_size.selectedBrandData.filter(function (d) {
            return (d.year >= ctx_size.year1) && (d.year <= ctx_size.year2)
        }),(d)=>(d.Name))
        .classed("selected", (d) => (d.hasOwnProperty('selected')))
        .attr("opacity", 0.1)
        .attr('stroke', (d) => ctx_size.colorScaler(d.year));
    WTGCircles.selectAll("circle.selected").attr("opacity", 1)
        .attr('stroke', 'red');

    let infoG = d3.select("g#info");
    infoG.select("#phoneinfo").remove();
    let info = infoG.append("text")
        .attr("id", "phoneinfo")
        .attr("x", ctx_size.infoWidth * 1.2)
        .attr("y", 0)
        ;
    for (const [key, value] of Object.entries(d)) {
        if ((key != "coverImage") && (key != "selected")) {
            info.append("tspan")
                .attr("x", info.attr("x"))
                .attr("dy", "1.2em")
                .text(
                    key + ":    " + value + "\n"
                );
        }
    }

    infoG.select("image").remove();
    infoG.append("image")
        .attr('x', 0)
        .attr('y', 0)
        .attr('width', ctx_size.infoWidth)
        .attr('height', ctx_size.infoWidth)
        .attr("xlink:href", d.coverImage);
}

function cancelSelect() {
    console.log("cancel");
    ctx_size.selectedBrandData.forEach(function (d) {
        if (d.hasOwnProperty('selected')) {
            delete d['selected'];
        }
    });

    let LWGCircles = d3.select("g#lwchart").select("g.circles");
    LWGCircles.selectAll("circle")
        .data(ctx_size.selectedBrandData.filter(function (d) {
            return (d.year >= ctx_size.year1) && (d.year <= ctx_size.year2)
        }),(d)=>(d.Name))
        .classed("selected", (d) => (d.hasOwnProperty('selected')))
        .attr("opacity", 1)
        .attr('stroke', (d) => ctx_size.colorScaler(d.year));

    let WTGCircles = d3.select("g#wtchart").select("g.circles");
    WTGCircles.selectAll("circle")
        .data(ctx_size.selectedBrandData.filter(function (d) {
            return (d.year >= ctx_size.year1) && (d.year <= ctx_size.year2)
        }),(d)=>(d.Name))
        .classed("selected", (d) => (d.hasOwnProperty('selected')))
        .attr("opacity", 1)
        .attr('stroke', (d) => ctx_size.colorScaler(d.year));

    let infoG = d3.select("g#info");
    infoG.select("#phoneinfo").remove();
    // infoG.append("text")
    // .attr("fill", "black")
    // .text("click on the chart to select a phone");
    infoG.select("image").remove();
}

function updateSize(year1, year2) {
    let sizeG = d3.select("g#sizechart");

    let width = ctx_size.sizeWidth - ctx_size.sizeMargin.left - ctx_size.sizeMargin.right;
    let height = ctx_size.sizeHeight - ctx_size.sizeMargin.top - ctx_size.sizeMargin.bottom;

    let x = d3
        .scaleLinear()
        .domain([year1, year2 + 1])
        .range([0, width]);
    let xAxis = d3.axisBottom(x);
    sizeG.select("g.xAxis")
        .transition()
        .duration(ctx.duration)
        .ease(d3.easeLinear)
        .call(xAxis);

    let list_y = ["length", "width", "weight", "thickness"];

    for (let i = 0; i < 4; i++) {
        let line = d3.line().x(d => x(d.year))
            .y(function (d) {
                //console.log(ys[i](d[list_y[i]]));
                return ctx_size.ys[i](d[list_y[i]]);
            });
        sizeG.select("path.line" + String(i + 1))
            .datum(ctx_size.avgSizeData.filter(function (d) {
                return (d.year >= year1) && (d.year <= year2)
            }))
            .transition()
            .duration(ctx.duration)
            .attr("class", "line" + String(i + 1))
            .attr("d", line)
            .attr('fill', 'none')
            .attr('stroke-width', 3)
            .attr('stroke', ctx_size.sizeColors[i]);

        let circles = sizeG.select('g.circles' + String(i + 1))
            .selectAll('circle')
            .data(ctx_size.avgSizeData.filter(function (d) {
                return (d.year >= year1) && (d.year <= year2)
            }), (d) => (d.year));

        circles.exit().remove();

        circles.enter()
            .append('circle')
            .attr('stroke', ctx_size.sizeColors[i])
            .attr('fill', ctx_size.sizeColors[i])
            .attr('r', 5)
            .append('title')
            .text(function (d) {
                let content = 'year:' + String(d.year) + '\n' + list_y[i] + ':' + String(d[list_y[i]]);
                return content;
            });

        circles = sizeG.select('g.circles' + String(i + 1))
            .selectAll('circle')
            .data(ctx_size.avgSizeData.filter(function (d) {
                return (d.year >= year1) && (d.year <= year2)
            }), (d) => (d.year));

        circles.transition()
            .duration(ctx.duration)
            .attr('cx', function (d) {
                return x(d.year);
            })
            .attr('cy', function (d) {
                return ctx_size.ys[i](d[list_y[i]]);
            });
    }
}

function updateLW(year1, year2) {
    let LWG = d3.select("g#lwchart");

    let circles = LWG.select('g.circles').selectAll('circle')
        .data(ctx_size.selectedBrandData.filter(function (d) {
            return (d.year >= year1) && (d.year <= year2)
        }));

    let x = ctx_size.LW_x;
    let y = ctx_size.LW_y;
    let colorScaler = ctx_size.colorScaler;

    circles.exit().remove();
    circles.enter()
        .append('circle')
        .attr('stroke', (d) => colorScaler(d.year))
        .attr('fill', 'none')
        .attr('cx', function (d) {
            return x(d.length);
        })
        .attr('cy', function (d) {
            return y(d.width);
        })
        .attr('r', 2)
        .on('click', clickOnCircle)
        .append('title')
        .text(function (d) {
            let content = 'year:' + d.year + '\n' + 'length:' + d.length + '\n' + 'width:' + d.width;
            return content;
        });
}

function updateWT(year1, year2) {
    let WTG = d3.select("g#wtchart");

    let circles = WTG.select('g.circles').selectAll('circle')
        .data(ctx_size.selectedBrandData.filter(function (d) {
            return (d.year >= year1) && (d.year <= year2)
        }),(d)=>(d.Name));

    let x = ctx_size.WT_x;
    let y = ctx_size.WT_y;
    let colorScaler = ctx_size.colorScaler;

    circles.exit().remove();
    circles.enter()
        .append('circle')
        .attr('stroke', (d) => colorScaler(d.year))
        .attr('fill', 'none')
        .attr('cx', function (d) {
            return x(d.weight);
        })
        .attr('cy', function (d) {
            return y(d.thickness);
        })
        .attr('r', 2)
        .on('click', clickOnCircle)
        .append('title')
        .text(function (d) {
            let content = 'year:' + d.year + '\n' + 'weight:' + d.weight + '\n' + 'thickness:' + d.thickness;
            return content;
        });
}