
var margin = {top: 20, right: 20, bottom: 30, left: 40},
width = 550 - margin.left - margin.right,
height = 500 - margin.top - margin.bottom,
scatter_width = 400;

var x = d3.scale.linear()
    .range([0, scatter_width]);

var y = d3.scale.linear()
    .range([height, 0]);

var color = d3.scale.category10();

var xAxis = d3.svg.axis()
    .scale(x)
    .orient("bottom");

var yAxis = d3.svg.axis()
    .scale(y)
    .orient("left");

var svg = d3.select("#graph").append("svg")
    .attr("width", width + margin.left + margin.right)
    .attr("height", height + margin.top + margin.bottom)
    .append("g")
    .attr("transform", "translate(" + margin.left + "," + margin.top + ")");

d3.tsv("data.tsv", function(error, data) {
    data.forEach(function(d) {
        if(d.type && d.type.indexOf("ex") != -1) {
    	    d.type = "additional exhibit";
        }
    });

    x.domain(d3.extent(data, function(d) { return d.negative*1.1; })).nice();
    y.domain(d3.extent(data, function(d) { return d.positive*1.1; })).nice();

    svg.append("g")
        .attr("class", "x axis")
        .attr("transform", "translate(0," + height + ")")
        .call(xAxis)
        .append("text")
        .attr("class", "label")
        .attr("x", scatter_width)
        .attr("y", -6)
        .style("text-anchor", "end")
        .text("Negative Sentiment");

    svg.append("g")
        .attr("class", "y axis")
        .call(yAxis)
        .append("text")
        .attr("class", "label")
        .attr("transform", "rotate(-90)")
        .attr("y", 6)
        .attr("dy", ".71em")
        .style("text-anchor", "end")
        .text("Positive Sentiment")

    svg.selectAll(".dot")
        .data(data)
        .enter().append("circle")
        .attr("class", "dot")
        .attr("r", 3.5)
        .attr("cx", function(d) { return x(d.negative); })
        .attr("cy", function(d) { return y(d.positive); })
	.on("mouseup", function(d) { window.open("detail/"+d.fname.replace(".txt", ".html"))  })
        .style("fill", function(d) { return color(d.type); })
        .append("title")
        .text(function(d) {return d.fname;})

    var legend = svg.selectAll(".legend")
        .data(color.domain())
        .enter().append("g")
        .attr("class", "legend")
        .attr("transform", function(d, i) { return "translate(0," + i * 20 + ")"; });

    legend.append("rect")
        .attr("x", 500 - 18)
        .attr("width", 18)
        .attr("height", 18)
        .style("fill", color);

    legend.append("text")
        .attr("x", 500 - 24)
        .attr("y", 9)
        .attr("dy", ".35em")
        .style("text-anchor", "end")
        .text(function(d) { return d; });

    var spark_width = 500,
    margin = 50;



});


var svg2 = d3.select("#graph2").append("svg")
    .attr("width", 200 + margin.left + margin.right)
    .attr("height", height + margin.top + margin.bottom)
    .append("g")
    .attr("transform", "translate(" + margin.left + "," + margin.top + ")")
    .attr("id", "sparklines");

d3.tsv("data.tsv", function(error, data) {
    data.forEach(function(d) {
        if(d.type && d.type.indexOf("ex") != -1) {
    	    d.type = "additional exhibit";
        }
	d.year = +d.year;
	d.month = +d.month;
	d.day = +d.day;
	d.positive = +d.positive;
	d.negative = +d.negative;
    });

    var x2=d3.scale.linear().range([0,200]);
    x2.domain(d3.extent(data, function(d) { return d.year*365+d.month*31+d.day; })).nice();
    var y2_pos=d3.scale.linear().range([50,0]);
    var y2_neg=d3.scale.linear().range([50,100]);
    y2_pos.domain(d3.extent(data, function(d) { return Math.max(d.positive, d.negative) * 1.1 })).nice();
    y2_neg.domain(d3.extent(data, function(d) { return Math.max(d.positive, d.negative) * 1.1 })).nice();
    var cwidth=200,cheight=100,cmargin=0,maxr=5;

    var data2=d3.nest()
        .key(function(d) {return d.type;})
	.sortValues(function(a,b) {
	    var lhs = a.year*365+a.month*31+a.day;
	    var rhs = b.year*365+b.month*31+b.day;
	    return  rhs < lhs ? -1 : rhs > lhs ? 1 : 0;
	})
        .entries(data);

    var g = svg2.selectAll("g").data(data2).enter()
        .append("g")
        .attr("transform",function(d,i) {return "translate(0, " + (120*i) + ")";});


    g.append("rect")
        .attr("x",0)
        .attr("y",0)
        .attr("width",cwidth)
        .attr("height",cheight-2*cmargin)
        .attr("fill", "none")
        .attr("stroke", "black")
        .append("title")
        .text(function(d) {return d.key;});


    var pline = d3.svg.line()
        .x(function(d,i){
	    return x2(d.year*365+d.month*31+d.day);
        })
        .y(function(d,i){
	    return y2_pos(d.positive);
        });

    var nline = d3.svg.line()
        .x(function(d,i){
	    return x2(d.year*365+d.month*31+d.day);
        })
        .y(function(d,i){
	    return y2_neg(d.negative);
        });

    g.append("path")
	.attr("d", function(d) { return pline(d.values); })
	.style("stroke", "blue");

    g.append("path")
	.attr("d", function(d) { return nline(d.values); })
	.style("stroke", "red");

    // we also write its name below.
    g
	.append("text")
        .attr("y",cheight+10)
        .attr("x",cmargin)
        .text(function(d) {return d.key;});


});
