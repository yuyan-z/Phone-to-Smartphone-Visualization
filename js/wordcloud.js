function createWordCloud() {
    /* wordcloud position */
    let chartG = d3.select("#charts").append("g")
        .attr("id", "wordcloudchart")
        .style("transform", "translate(500px, 80px)");

    chartG
        .append("g")
        .attr("id", "wordcloud")
        .attr("transform", "translate(" + ctx.wordcloud_w / 2 + ", " + ctx.wordcloud_h / 2 + ")")

    UpdateWordCloud();
}


function UpdateWordCloud() {
    // if(ctx.layout != {}) {ctx.layout.stop()}

    console.log(ctx.year1, ctx.year2);
    let data = ctx.wordcloud_data;
    // let filteredData = data.filter((d) => (d.Year == ctx.year));
    let filteredData = data.filter((d) => (d.Year >= ctx.year1 && d.Year <= ctx.year2));

    // console.log('---filteredData---');
    // console.log(filteredData);

    let wordsdata = [];

    filteredData.forEach(function (item) {
        item.Words.forEach(function (word) {
            let isfound = 0;
            for (let i = 0; i < wordsdata.length; i++) {
                if (word.name == wordsdata[i].name && word.label == wordsdata[i].label) {
                    isfound = 1;
                    let newbrand = {};
                    newbrand['name'] = word.name;
                    newbrand['label'] = word.label;
                    newbrand['value'] = wordsdata[i].value + word.value;
                    wordsdata[i] = newbrand;
                }
            }
            if (isfound == 0) {
                wordsdata.push(word)
            }
        })
    })

    wordsdata.sort(compareDesc('value'));
    wordsdata = wordsdata.slice(0, ctx.max_words)
    // console.log('---wordsdata---')
    // console.log(wordsdata)


    let fontScale = d3.scaleLinear()
        .domain(d3.extent(wordsdata, d => d.value))
        .range([14, 90]);

    ctx.layout = d3.layout.cloud()
        .size([ctx.wordcloud_w, ctx.wordcloud_h])
        .words(wordsdata)
        .timeInterval(10)
        .padding(2)
        // .rotate(0)
        .rotate(function () {
            return ~~(Math.random() * 3) * 45;
        })
        .spiral("rectangular")
        .fontSize(d => fontScale(d.value))
        .on("end", draw)
        .start();
}


function draw(words) {
    // console.log(words);

    let colorScale = d3.scaleOrdinal(d3.schemeCategory10);

    let tooltip = d3.select("#main").select("#toolb")
    let mouseover = function (e, d) {
        d3.select("#wordcloud")
        .selectAll("text").style("opacity", 0.1);
        d3.select(this).style("opacity", 1);

        tooltip.style("left", (e.pageX+10) + "px")
        .style("top", (e.pageY) + "px")
        .text(d.name + " (" + d.value + ") " + d.label)
        .transition()		
        .duration(200)
        .style("opacity", 1)
;
    }
    let mouseleave = function (e, d) {
        tooltip.style("opacity", 0);
        d3.select("#wordcloud")
        .selectAll("text").style("opacity", 1);
    }

    let selecttext = d3.select("#wordcloud")
        .selectAll("text")
        .data(words, d => d.name)

    selecttext.enter().append("text")
        .style("font-size", function (d) { return d.size + "px"; })
        .style("fill", d => colorScale(d.label))
        .attr("text-anchor", "middle")
        .style("font-family", "Impact")
        .text(function (d) {
            s = d.name;
            if (s.length > 12) { s = s.substring(0, 10) + "..."; }
            else if (s.length < 2) { s = s + ' ' + d.label }
            return s;
        })
        .on("mouseover", mouseover)
        .on("mouseleave", mouseleave)
        .transition().duration(ctx.duration)
        .attr("transform", function (d) {
            return "translate(" + [d.x, d.y] + ")rotate(" + d.rotate + ")";
        })

    selecttext
        .transition().duration(ctx.duration)
        .style("font-size", function (d) { return d.size + "px"; })
        .attr("transform", function (d) {
            return "translate(" + [d.x, d.y] + ")rotate(" + d.rotate + ")";
        })


    selecttext.exit().remove();
}



function compareDesc(propertyName) {
    return function(object1, object2) {
      var value1 = object1[propertyName];
      var value2 = object2[propertyName];
      if(value2 < value1) {
        return -1;
      } else if(value2 > value1) {
        return 1;
      } else {
        return 0;
      }
    }
  }