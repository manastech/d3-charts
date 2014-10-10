var margin = {top: 10, right: 20, bottom: 40, left: 50},
    width = 400 - margin.left - margin.right,
    height = 300 - margin.top - margin.bottom;

var container = d3.select(".chart")
    .attr("width", width + margin.left + margin.right)
    .attr("height", height + margin.top + margin.bottom);

var chart = container.append("g")
    .attr("transform", "translate(" + margin.left + "," + margin.top + ")");

var areas = chart.append("g")
    .attr("class", "data");

var lines = chart.append("g")
    .attr("class", "last-period");

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
    
var areaGenerator = d3.svg.area()
    .x(function(d) { return scaleX(d.x);})
    .y0(function(d) { return scaleY(d.y0);})
    .y1(function(d) { return scaleY(d.y0 + d.y);})
    .interpolate("basis");

var lineGenerator = d3.svg.line()
    .x(function(d) { return scaleX(d.x);})
    .y(function(d) { return scaleY(d.y0 + d.y);})
    .interpolate("basis");

var set = 0;

var refSize = 10;

var references = chart.append("g");

var dataReferences = references.append("g")
    .attr("class", "data")

var maleRef = dataReferences.append("g")
    .attr("class", "layer")
    .attr("transform", "translate(0," + (height + margin.bottom) + ")");

maleRef.append("circle")
    .attr("cy", -refSize / 2)
    .attr("r", refSize / 2)

maleRef.append("text")
    .attr("class", "label")
    .attr("x", "8")
    .attr("dy", "-0.35em")
    .text("Male");

var femaleRef = dataReferences.append("g")
    .attr("class", "layer")
    .attr("transform", "translate(50," + (height + margin.bottom) + ")");

femaleRef.append("circle")
    .attr("cy", -refSize / 2)
    .attr("r", refSize / 2)

femaleRef.append("text")
    .attr("class", "label")
    .attr("x", "8")
    .attr("dy", "-0.35em")
    .text("Female");

var unknownRef = dataReferences.append("g")
    .attr("class", "layer")
    .attr("transform", "translate(110," + (height + margin.bottom) + ")");

unknownRef.append("circle")
    .attr("cy", -refSize / 2)
    .attr("r", refSize / 2)

unknownRef.append("text")
    .attr("class", "label")
    .attr("x", "8")
    .attr("dy", "-0.35em")
    .text("Unknown");

var lastPeriodReferences = references.append("g")
    .attr("class", "last-period");

var totalRef = lastPeriodReferences.append("g")
    .attr("class", "layer")
    .attr("transform", "translate(175," + (height + margin.bottom) + ")");

totalRef.append("circle")
    .attr("cy", -refSize / 2)
    .attr("r", refSize / 2)

totalRef.append("text")
    .attr("class", "label")
    .attr("x", "8")
    .attr("dy", "-0.35em")
    .text("Last Period");

var label = chart.append("g")
    .attr("transform", "translate(10,0)")
  .append("text")
    .attr("class", "label")
    .attr("transform", "rotate(-90)")
    .style("text-anchor", "end")
    .style("dominant-baseline", "hanging")


var data, lastPeriodData;


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
  set = !set;
  d3.csv("stack" + (set? 1:0) + ".csv", type, function (d) {
    data = d;
    d3.csv("stack" + (set? 0:1) + ".csv", type, function (d) {
      lastPeriodData = d.map(function(d, i) {
        d.date = data[i].date;
        return d;
      })
      populate(data, lastPeriodData);
    });
  });
}

function populate(data, lastPeriodData) {
  
  var columns = Object.keys(data[0]).splice(1);

  var dataLayers = stack(d3.range(columns.length).map(function(i) {
    var key = columns[i];
    return data.map(function (d) {
      return {x:d.date, y:d[key]}});
  }));

  var lastPeriodLayers = stack(d3.range(columns.length).map(function(i) {
    var key = columns[i];
    return lastPeriodData.map(function (d) {
      return {x:d.date, y:d[key]}});
  }));

  scaleX.domain(d3.extent(data.map(function (d) {return d.date;})));
  scaleY.domain([0, d3.max(dataLayers.concat(lastPeriodLayers || []), function(layer) { return d3.max(layer, function(d) { return d.y0 + d.y; });})])

  draw(dataLayers, areas, areaGenerator);
  draw([lastPeriodLayers[columns.length - 1]], lines, lineGenerator);

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

function draw(data, container, pathGenerator) {
  var path = container.selectAll("path").data(data);
  
  path.enter().append("path")
      .attr("class", "layer");
    
  path.transition()
    .attr("d", pathGenerator);
}

document.addEventListener("mouseup", function (e) {
  toggle();
});

toggle();