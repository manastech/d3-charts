
var margin = {top: 0, right: 20, bottom: 30, left: 50},
    width = 400 - margin.left - margin.right,
    height = 300 - margin.top - margin.bottom,
    refSize = 10,
    data, lastData, lastScaleY;

var scaleX = d3.scale.linear()
    .range([0, width]);

var scaleY = d3.scale.ordinal()
    .rangeRoundBands([height, 0], .2, 0);

var container = d3.select(".chart")
    .attr("width", width + margin.left + margin.right)
    .attr("height", height + margin.top + margin.bottom);

var chart = container.append("g")
    .attr("transform", "translate(" + margin.left + "," + margin.top + ")");

var maleBars = chart.append("g")
    .attr("class", "male");

var femaleBars = chart.append("g")
    .attr("class", "female");

var axisX = chart.append("g")
      .attr("class", "x axis")
      .attr("transform", "translate(0," + height + ")");

var axisY = chart.append("g")
      .attr("class", "y axis")

var guidesX = chart.append("g")
      .attr("class", "guides");

var maleRef = chart.append("g")
    .attr("class", "male")
    .attr("transform", "translate(0," + (height + margin.bottom) + ")");

maleRef.append("circle")
    .attr("class", "bar")
    .attr("cy", -refSize / 2)
    .attr("r", refSize / 2)
    .text("Male");

maleRef.append("text")
    .attr("class", "label")
    .attr("x", "8")
    .text("Male");

var femaleRef = chart.append("g")
    .attr("class", "female")
    .attr("transform", "translate(50," + (height + margin.bottom) + ")");

femaleRef.append("circle")
    .attr("class", "bar")
    .attr("cy", -refSize / 2)
    .attr("r", refSize / 2)
    .text("Female");

femaleRef.append("text")
    .attr("class", "label")
    .attr("x", "8")
    .text("Female");

d3.tsv("data.tsv", type, function (error, d) {
  data = d;
  populate(data);
});

function prefix(d) {
  var prefix = d3.formatPrefix(d, 0);
  return prefix.scale(d) + prefix.symbol;
}

function type(d) {
  d.male = +d.male;
  d.female = +d.female;
  return d;
}

function populate(data) {
  scaleX.domain([0, d3.max(data, function(d) { return Math.max(d.male, d.female); })]);
  scaleY.domain(data.map(function(d) { return d.age; }));

  var offset = height - d3.extent(scaleY.range())[1] - scaleY.rangeBand();
  maleBars.transition().attr("transform", "translate(0," + offset + ")");
  femaleBars.transition().attr("transform", "translate(0," + offset + ")");
  axisY.transition().attr("transform", "translate(0, " + (offset + margin.top) + ")");

  var maleBar = maleBars.selectAll(".bar")
    .data(data);

  maleBar.enter().append("rect")
      .attr("class", "bar")
      .attr("y", function(d) { return lastData? (lastData.length - data.length) * lastScaleY.rangeBand() : scaleY(d.age);})
      .attr("width", 0)
      .attr("height", lastScaleY? lastScaleY.rangeBand() : scaleY.rangeBand());

  maleBar.transition()
      .attr("y", function(d) { return scaleY(d.age); })
      .attr("width", function(d) { return scaleX(d.male);})
      .attr("height", scaleY.rangeBand());

  maleBar.exit().transition()
      .attr("y", function(d) { return (data.length - lastData.length) * scaleY.rangeBand(); })
      .attr("width", 0)
      .attr("height", scaleY.rangeBand())
      .remove();

  var femaleBar = femaleBars.selectAll(".bar")
     .data(data);

  femaleBar.enter().append("rect")
      .attr("class", "bar")
      .attr("y", function(d) { return lastData? (lastData.length - data.length) * lastScaleY.rangeBand() : scaleY(d.age);})
      .attr("width", 0)
      .attr("height", lastScaleY? lastScaleY.rangeBand() : scaleY.rangeBand());

  femaleBar.transition()
      .attr("y", function(d) { return scaleY(d.age); })
      .attr("width", function(d) { return scaleX(d.female);})
      .attr("height", scaleY.rangeBand());

  femaleBar.exit().transition()
      .attr("y", function(d) { return (data.length - lastData.length) * scaleY.rangeBand(); })
      .attr("width", 0)
      .attr("height", scaleY.rangeBand())
      .remove();

  axisX.transition()
      .call(d3.svg.axis()
              .scale(scaleX)
              .ticks(5)
              .tickFormat(prefix)
              .outerTickSize(0)
              .innerTickSize(4)
              .tickPadding(5)
              .orient("bottom"));

  axisY.transition()
      .call(d3.svg.axis()
              .scale(scaleY)
              .orient("left"));

  guidesX.transition()
      .call(d3.svg.axis()
              .scale(scaleX)
              .ticks(5)
              .outerTickSize(0)
              .innerTickSize(height));

  lastData = data;
  lastScaleY = scaleY;
}

document.addEventListener("mouseup", function (e) {
  var exponent = Math.round(Math.max(1, Math.random() * 10));
  var randomData = data.filter(function (item) { return Math.random() > 0.5;});
  randomData.forEach(function (item) {
    item.male = Math.round(Math.random() * Math.pow(10, exponent));
    item.female = Math.round(Math.random() * Math.pow(10, exponent));
  });
  populate(randomData);
});