function createBubbleChart() {
    /* bubblechart position */
    let chartG = d3.select("#charts").append("g")
        .attr("id", "bubblechart")
        .style("transform", "translate(40px, 100px)");


    chartG.append("g").attr("id", "bubbles");
    chartG.append("text")
    .text("Colors & Other Features")
    .style("font-size", 30)
    .style("font-weight", "bold")
    .style("font-family", "Times New Roman")
    ;

    UpdateBubbleChart();
}


function UpdateBubbleChart() {
    let data = ctx.bubblechart_data;
    // let filteredData = data.filter((d) => (d.Year <= ctx.year));
    let filteredData = data.filter((d) => (d.Year >= ctx.year1 && d.Year <= ctx.year2));

    // let sumdata = filteredData[0].Colors;
    let sumdata = [];

    filteredData.forEach(function(item){
        item.Colors.forEach(function(color){
            let isfound = 0;
            for (let i=0; i < sumdata.length; i++) {
                if(color.name == sumdata[i].name){
                    isfound = 1;
                    let newcolor = {};
                    newcolor['name'] = color.name;
                    newcolor['value'] = sumdata[i].value + color.value;
                    sumdata[i] = newcolor;
                }
            }
            if(isfound == 0) {
                sumdata.push(color)
            }
        })
    })


    // console.log('---sumdata---')
    // console.log(sumdata)

    // let colordata = sumdata.filter((d) => (d.value>0))


    let pack = d3.pack()
        .size([ctx.bubblechart_w, ctx.bubblechart_h])
        .padding(0);

    let root = d3.hierarchy({ children: sumdata })
        .sum(function (d) { return d.value; })
        .sort(function (a, b) {
            return (b.value*Math.random() - a.value*Math.random()); 
        });

    // console.log("---root---")
    // console.log(root)

    packedData = pack(root).leaves()
    // console.log("---packedData---")
    // console.log(packedData)


    let tooltip = d3.select("#main").select("#toolb")
    let mouseover = function (e, d) {
        d3.selectAll(".node").style("opacity", 0.1);
        d3.select(this).style("opacity", 1);

        tooltip.style("left", (e.pageX+10) + "px")
        .style("top", (e.pageY) + "px")
        .html(d.data.name + " (" + d.value + ")")
        .transition()		
        .duration(200)
        .style("opacity", 1)
;
    }
    let mouseleave = function (e, d) {
        tooltip.style("opacity", 0);
        d3.selectAll(".node").style("opacity", 1);
    }

    d3.select("#bubbles").selectAll(".node")
        .data(packedData, (d) => d.data.name)
        .join(
            function (enter) {
                let nodeG = enter.append('g').attr('class', 'node');

                nodeG.on("mouseover", mouseover)
                    .on("mouseleave", mouseleave)
                    .attr("transform", d => transformNode(d));


                nodeG.append("circle")
                    .attr("id", d => d.data.name)
                    .attr("r", d => d.r ? d.r : 0)
                    .style("fill", d => colorNameToHex(d.data.name))
                    .style("stroke", "black")
                    .style("opacity", 0.9);


                nodeG.append("text")
                    .text(d => d.data.name)
                    .style("opacity", d => d.r ? 1 : 0)
                    .style("text-anchor", "middle")
                    .attr("dy", "0.3em")
                    .style("fill", "black")
                    .style('font-weight', "bold")
                    .style('text-shadow', "0px 0px 6px white")
                    .style('font-size', d => d.r ? d.r * 0.4 : 0);
            },
            function (update) {
                update
                    .transition()
                    .duration(600)
                    .delay(ctx.duration*2)
                    .attr("transform", d => transformNode(d));

                update.select(".node circle")
                    .transition()
                    .duration(ctx.duration*2)
                    .attr("r", d => d.r ? d.r : 0);

                update.select(".node text").style('font-size', d => d.r ? d.r * 0.4 : 0)
                    .transition()
                    .duration(ctx.duration*2)
                    .style("opacity", d => d.r ? 1 : 0);
            },
            function (exit) {
                exit.transition()
                    .duration(ctx.duration)
                    .style("opacity", 0)
                    .remove();
            },
        );


    // let selectcir = d3.select("#bubbles").selectAll("circle")
    //     .data(packedData, (d) => d.data.name)

    // selectcir.enter()
    //     .append("circle")
    //     .attr("id", d => d.data.name)
    //     .attr("r", d => d.r ? d.r : 0)
    //     .attr("transform", d => transformNode(d))
    //     .style("fill", d => colorNameToHex(d.data.name))
    //     .style("stroke", "black")
    //     .style("opacity", 0.9)
    //     .on("mouseover", mouseover)
    //     .on("mouseleave", mouseleave);
        
    // selectcir
    // .transition()
    // .duration(ctx.duration)
    // .attr("transform", d => "translate(" + d.x + "," + d.y + ")")
    // .attr("r", d => d.r ? d.r : 0);

    // selectcir.exit()
    // .transition()
    // .duration(ctx.duration)
    // .style("opacity", 0)
    // .remove();
}

function transformNode(d) {
    let x = 200, y = 250;
    if (d.x) { x = d.x }
    if (d.y) { y = d.y }
    return "translate(" + x + "," + y + ")";
}


function colorNameToHex(name) {
    let colors = {
        "aliceblue": "#f0f8ff", "antiquewhite": "#faebd7", "aqua": "#00ffff", "aquamarine": "#7fffd4", "azure": "#f0ffff",
        "beige": "#f5f5dc", "bisque": "#ffe4c4", "black": "#000000", "blanchedalmond": "#ffebcd", "blue": "#0000ff", "blueviolet": "#8a2be2", "brown": "#964B00", "burlywood": "#deb887", "bronze": "#CD7F32",
        "cadetblue": "#5f9ea0", "champagne": "#F7E7CE", "chocolate": "#d2691e", "coral": "#ff7f50", "chrome": "#dbe4eb", "copper": "#b87333", "crimson": "#dc143c", "cyan": "#00ffff",
        "darkblue": "#00008b", "darkcyan": "#008b8b", "darkgoldenrod": "#b8860b", "darkgray": "#a9a9a9", "darkgreen": "#006400", "darkkhaki": "#bdb76b", "darkmagenta": "#8b008b", "darkolivegreen": "#556b2f",
        "darkorange": "#ff8c00", "darkorchid": "#9932cc", "darkred": "#8b0000", "darksalmon": "#e9967a", "darkseagreen": "#8fbc8f", "darkslateblue": "#483d8b", "darkslategray": "#2f4f4f", "darkturquoise": "#00ced1",
        "darkviolet": "#9400d3", "deeppink": "#ff1493", "deepskyblue": "#00bfff", "dimgray": "#696969", "dodgerblue": "#1e90ff",
        "firebrick": "#b22222", "floralwhite": "#fffaf0", "forestgreen": "#228b22", "fuchsia": "#ff00ff",
        "gainsboro": "#dcdcdc", "ghostwhite": "#f8f8ff", "gold": "#ffd700", "goldenrod": "#daa520", "gray": "#808080", "green": "#008000", "grey": "#808080",
        "honeydew": "#f0fff0", "hotpink": "#ff69b4",
        "indianred ": "#cd5c5c", "indigo": "#4b0082", "ivory": "#fffff0", "khaki": "#f0e68c",
        "lavender": "#e6e6fa", "lavenderblush": "#fff0f5", "lawngreen": "#7cfc00", "lemonchiffon": "#fffacd", "lightblue": "#add8e6", "lightcoral": "#f08080", "lightcyan": "#e0ffff", "lightgoldenrodyellow": "#fafad2",
        "lightgrey": "#d3d3d3", "lightgreen": "#90ee90", "lightpink": "#ffb6c1", "lightsalmon": "#ffa07a", "lightseagreen": "#20b2aa", "lightskyblue": "#87cefa", "lightslategray": "#778899", "lightsteelblue": "#b0c4de",
        "lightyellow": "#ffffe0", "lime": "#00ff00", "limegreen": "#32cd32", "linen": "#faf0e6",
        "magenta": "#ff00ff", "maroon": "#800000", "mediumaquamarine": "#66cdaa", "mediumblue": "#0000cd", "mediumorchid": "#ba55d3", "mediumpurple": "#9370d8", "mediumseagreen": "#3cb371", "mediumslateblue": "#7b68ee",
        "metallic": "#aaa9ad", "mint": "#3EB489", "mediumvioletred": "#c71585", "midnightblue": "#191970", "mintcream": "#f5fffa", "mistyrose": "#ffe4e1", "moccasin": "#ffe4b5",
        "navajowhite": "#ffdead", "navy": "#000080",
        "oldlace": "#fdf5e6", "olive": "#808000", "olivedrab": "#6b8e23", "orange": "#ffa500", "orangered": "#ff4500", "orchid": "#da70d6",
        "platinum": "#E5E4E2", "palegreen": "#98fb98", "paleturquoise": "#afeeee", "palevioletred": "#d87093", "papayawhip": "#ffefd5", "peachpuff": "#ffdab9", "peru": "#cd853f", "pink": "#ffc0cb", "plum": "#dda0dd", "powderblue": "#b0e0e6", "purple": "#800080",
        "rebeccapurple": "#663399", "red": "#ff0000", "rosybrown": "#bc8f8f", "royalblue": "#4169e1", "rose": "#FF007F",
        "saddlebrown": "#8b4513", "salmon": "#fa8072", "sandybrown": "#f4a460", "seagreen": "#2e8b57", "seashell": "#fff5ee", "sienna": "#a0522d", "silver": "#c0c0c0", "skyblue": "#87ceeb", "slateblue": "#6a5acd", "slategray": "#708090", "snow": "#fffafa", "springgreen": "#00ff7f", "steelblue": "#4682b4",
        "tan": "#d2b48c", "teal": "#008080", "thistle": "#d8bfd8", "titanium": "#878681", "turquoise": "#40e0d0",
        "violet": "#ee82ee",
        "wheat": "#f5deb3", "white": "#ffffff", "whitesmoke": "#f5f5f5",
        "yellow": "#ffff00", "yellowgreen": "#9acd32"
    };

    let c = "#000000";

    if (typeof colors[name.toLowerCase()] != 'undefined') {
        c = colors[name.toLowerCase()];
    }
    else {
        console.log(name, c)
    }
    return c;

}