var margin = {top: 0, right: 20, bottom: 35, left: 20, gutter:50},
    width = (400 - margin.left - margin.right - margin.gutter) / 2,
    height = 300 - margin.top - margin.bottom,
    data, lastData, lastScaleY;

var scaleX = d3.scale.linear()
    .range([0, width]);

var scaleY = d3.scale.ordinal()
    .rangeRoundBands([height, 0], .2, 0);

var container = d3.select(".chart")
    .attr("width", width * 2 + margin.left + margin.right + margin.gutter)
    .attr("height", height + margin.top + margin.bottom);

var maleChart = container.append("g")
    .attr("transform", "translate(" + margin.left + "," + margin.top + ")")
    .attr("class", "male");

var maleLabel = maleChart.append("text")
    .attr("class", "label")
    .attr("x", width)
    .attr("y", height + margin.top + margin.bottom)
    .attr("dy", "-0.35em");

var maleBars = maleChart.append("g");

var maleAxisX = maleChart.append("g")
    .attr("class", "x axis")
    .attr("transform", "translate(0," + height + ")");

var maleGuidesX = maleChart.append("g")
      .attr("class", "guides");

var femaleChart = container.append("g")
    .attr("transform", "translate(" + (margin.left + width + margin.gutter) + "," + margin.top + ")")
    .attr("class", "female");

var femaleLabel = femaleChart.append("text")
    .attr("class", "label")
    .attr("y", height + margin.top + margin.bottom)
    .attr("dy", "-0.35em");

var femaleBars = femaleChart.append("g");

var femaleAxisX = femaleChart.append("g")
    .attr("class", "x axis")
    .attr("transform", "translate(0," + height + ")");

var femaleGuidesX = femaleChart.append("g")
      .attr("class", "guides");

var ageGroups = container.append("g")
    .attr("class", "y axis");

d3.tsv("data.tsv", type, function (error, d) {
  data = d;
  populate(data);
});

function prefix(d) {
  var prefix = d3.formatPrefix(scaleX.domain()[1], 0);
  return d3.round(prefix.scale(d), 1);
}

function type(d) {
  d.male = +d.male;
  d.female = +d.female;
  return d;
}

function populate(data) {
  scaleX.domain([0, d3.max(data, function(d) { return Math.max(d.male, d.female); })]);
  scaleY.domain(data.map(function(d) { return d.age; }));
  invertedScaleX = scaleX.copy().range([width, 0]);

  var offset = height - d3.extent(scaleY.range())[1] - scaleY.rangeBand();
  maleBars.transition().attr("transform", "translate(0," + offset + ")");
  femaleBars.transition().attr("transform", "translate(0," + offset + ")");
  ageGroups.transition().attr("transform", "translate(" + (margin.left + width + margin.gutter / 2) + ", " + (offset + margin.top) + ")");

  var maleBar = maleBars.selectAll(".bar")
      .data(data);

  maleBar.enter().append("rect")
      .attr("class", "bar")
      .attr("x", width)
      .attr("y", function(d) { return lastData? (lastData.length - data.length) * lastScaleY.rangeBand() : scaleY(d.age);})
      .attr("width", 0)
      .attr("height", lastScaleY? lastScaleY.rangeBand() : scaleY.rangeBand());

  maleBar.transition()
      .attr("x", function(d) { return width - scaleX(d.male); })
      .attr("y", function(d) { return scaleY(d.age); })
      .attr("width", function(d) { return scaleX(d.male);})
      .attr("height", scaleY.rangeBand());

  maleBar.exit().transition()
      .attr("x", width)
      .attr("y", function(d) { return (data.length - lastData.length) * scaleY.rangeBand(); })
      .attr("width", 0)
      .attr("height", scaleY.rangeBand())
      .remove();
   
  var maleValue = maleBars.selectAll(".value")
      .data(data);
  
  maleValue.enter().append("text")
      .attr("class", "value")
      .attr("x", width)
      .attr("y", function(d) { return lastData? (lastData.length - data.length) * lastScaleY.rangeBand() + lastScaleY.rangeBand() / 2 : scaleY(d.age) + scaleY.rangeBand() / 2;})
      .attr("dx", "5");

  maleValue.transition()
      .attr("x", function(d) { return  width - scaleX(d.male); })
      .attr("y", function(d) { return scaleY(d.age) + scaleY.rangeBand() / 2;})
      .text(function(d) { return prefix(d.male); });

  maleValue.exit().transition()
      .attr("x", width)
      .attr("y", function(d) { return (data.length - lastData.length) * scaleY.rangeBand();})
      .remove();

  maleAxisX.transition()
      .call(d3.svg.axis()
              .scale(invertedScaleX)
              .ticks(5)
              .tickFormat(prefix)
              .outerTickSize(0)
              .innerTickSize(4)
              .tickPadding(5)
              .orient("bottom"));

  maleGuidesX.transition()
      .call(d3.svg.axis()
              .scale(invertedScaleX)
              .ticks(5)
              .outerTickSize(0)
              .innerTickSize(height));

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
      .attr("x", 0)
      .attr("y", function(d) { return (data.length - lastData.length) * scaleY.rangeBand(); })
      .attr("width", 0)
      .attr("height", scaleY.rangeBand())
      .remove();
   
  var femaleValue = femaleBars.selectAll(".value")
      .data(data);
  
  femaleValue.enter().append("text")
      .attr("class", "value")
      .attr("y", function(d) { return lastData? (lastData.length - data.length) * lastScaleY.rangeBand() + lastScaleY.rangeBand() / 2 : scaleY(d.age) + scaleY.rangeBand() / 2;})
      .attr("dx", "-5");

  femaleValue.transition()
      .attr("x", function(d) { return  scaleX(d.female); })
      .attr("y", function(d) { return scaleY(d.age) + scaleY.rangeBand() / 2;})
      .text(function(d) { return prefix(d.female); });

  femaleValue.exit().transition()
      .attr("x", 0)
      .attr("y", function(d) { return (data.length - lastData.length) * scaleY.rangeBand();})
      .remove();

  femaleAxisX.transition()
      .call(d3.svg.axis()
              .scale(scaleX)
              .ticks(5)
              .tickFormat(prefix)
              .outerTickSize(0)
              .innerTickSize(4)
              .tickPadding(5)
              .orient("bottom"));

  femaleGuidesX.transition()
      .call(d3.svg.axis()
              .scale(scaleX)
              .ticks(5)
              .outerTickSize(0)
              .innerTickSize(height));

  var ageGroup = ageGroups.selectAll("text")
      .data(data);


  ageGroup.enter().append("text")
      .attr("class", "y axis")
      .attr("y", function(d) { return lastData? (lastData.length - data.length) * lastScaleY.rangeBand() + lastScaleY.rangeBand() / 2 : scaleY(d.age) + scaleY.rangeBand() / 2;});

  ageGroup.transition()
      .attr("y", function(d) { return scaleY(d.age) + scaleY.rangeBand() / 2; })
      .text(function(d) { return d.age; });

  ageGroup.exit().transition()
      .attr("y", function(d) { return (data.length - lastData.length) * scaleY.rangeBand(); })
      .remove();
  var symbol = d3.formatPrefix(scaleX.domain()[1], 0).symbol;
  femaleLabel.text("Female" + (symbol.length? " (" + symbol + ")" : ""));
  maleLabel.text("Male" + (symbol.length? " (" + symbol + ")" : ""));

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