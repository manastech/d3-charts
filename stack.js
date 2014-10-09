var margin = {top: 10, right: 20, bottom: 40, left: 50},
    width = 400 - margin.left - margin.right,
    height = 300 - margin.top - margin.bottom;

var container = d3.select(".chart")
    .attr("width", width + margin.left + margin.right)
    .attr("height", height + margin.top + margin.bottom);

var chart = container.append("g")
    .attr("transform", "translate(" + margin.left + "," + margin.top + ")");

var areas = chart.append("g");

var axisX = chart.append("g")
      .attr("class", "x axis")
      .attr("transform", "translate(0," + height + ")");

var axisY = chart.append("g")
      .attr("class", "y axis");

var scaleX = d3.time.scale()
      .range([0, width]);

var scaleY = d3.scale.linear()
      .range([height, 0]);

var stack = d3.layout.stack().offset("baseline");

var format = d3.time.format("%Y-%m");
    
var area = d3.svg.area()
    .x(function(d) { return scaleX(d.x);})
    .y0(function(d) { return scaleY(d.y0);})
    .y1(function(d) { return scaleY(d.y0 + d.y);})
    .interpolate("basis");

var color = ["#ff1e00", "#f89302", "#a3d215", "#31bfb0", "#6a50b2", "#e4ec05"];

var set = 0;

var refSize = 10;

var maleRef = chart.append("g")
    .attr("transform", "translate(0," + (height + margin.bottom) + ")");

maleRef.append("circle")
    .attr("class", "bar")
    .attr("cy", -refSize / 2)
    .attr("r", refSize / 2)
    .attr("fill", color[0])
    .attr("opacity", 0.5)

maleRef.append("text")
    .attr("class", "label")
    .attr("x", "8")
    .attr("dy", "-0.35em")
    .text("Male");

var femaleRef = chart.append("g")
    .attr("transform", "translate(50," + (height + margin.bottom) + ")");

femaleRef.append("circle")
    .attr("class", "bar")
    .attr("cy", -refSize / 2)
    .attr("r", refSize / 2)
    .attr("fill", color[1])
    .attr("opacity", 0.5)

femaleRef.append("text")
    .attr("class", "label")
    .attr("x", "8")
    .attr("dy", "-0.35em")
    .text("Female");

var unknownRef = chart.append("g")
    .attr("transform", "translate(110," + (height + margin.bottom) + ")");

unknownRef.append("circle")
    .attr("class", "bar")
    .attr("cy", -refSize / 2)
    .attr("r", refSize / 2)
    .attr("fill", color[2])
    .attr("opacity", 0.5)

unknownRef.append("text")
    .attr("class", "label")
    .attr("x", "8")
    .attr("dy", "-0.35em")
    .text("Unknown");

var label = chart.append("g")
    .attr("transform", "translate(10,0)")
  .append("text")
    .attr("class", "label")
    .attr("transform", "rotate(-90)")
    .style("text-anchor", "end")
    .style("dominant-baseline", "hanging")


var data, columns, layers;


function type(d) {
  //d.date = format.parse(d.date);
  d.date = new Date(+d.date);
  d.male = +d.male;
  d.female = +d.female;
  d.unknown = +d.unknown;
  return d;
}

function prefix(d) {
  var prefix = d3.formatPrefix(scaleY.domain()[1], 0);
  return prefix.scale(d);
}

function toggle() {
  set = set? 0 : 1;
  d3.csv("data" + set + ".csv", type, populate);
}

function populate(error, d) {
  data = d;
  columns = Object.keys(data[0]).splice(1);
  layers = stack(d3.range(columns.length).map(function(i) {
    var key = columns[i];
    return data.map(function (d) {
      return {x:d.date, y:d[key]}});
  }));
  scaleX.domain(d3.extent(data.map(function (d) {return d.date;})));
  scaleY.domain([0, d3.max(layers, function(layer) { return d3.max(layer, function(d) { return d.y0 + d.y; });})])
  var path = areas.selectAll("path").data(layers);

  path.enter().append("path")
      .style("fill", function(d, i) { return color[i];})
      .style("opacity", 0.5);
    
  path.transition()
    .attr("d", area);

  axisX.transition()
      .call(d3.svg.axis()
              .scale(scaleX)
              .outerTickSize(0)
              .innerTickSize(4)
              .tickPadding(5)
              .orient("bottom"));

  axisY.transition()
      .call(d3.svg.axis()
              .scale(scaleY)
              .tickFormat(prefix)
              .outerTickSize(0)
              .innerTickSize(4)
              .tickPadding(5)
              .orient("left"));

  var symbol = d3.formatPrefix(scaleY.domain()[1], 0).symbol;
  label.text("Quantity" + (symbol.length? " (" + symbol + ")" : ""))

}

document.addEventListener("mouseup", function (e) {
  toggle();
});

toggle();