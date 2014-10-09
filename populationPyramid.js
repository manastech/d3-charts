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

var groups = container.append("g");

var male_axis_x = container.append("g")
    .attr("class", "axis x")
    .attr("transform", "translate(" + margin.left + "," + (height + margin.top) + ")");

var male_guides_x = container.append("g")
      .attr("class", "guides")
      .attr("transform", "translate(" + margin.left + "," + margin.top + ")");

var male_label = container.append("text")
    .attr("class", "male label")
    .attr("x", margin.left + width)
    .attr("y", height + margin.top + margin.bottom)
    .attr("dy", "-0.35em")

var female_axis_x = container.append("g")
    .attr("class", "axis x")
    .attr("transform", "translate(" + (margin.left + width + margin.gutter) + "," + (height + margin.top) + ")");

var female_guides_x = container.append("g")
      .attr("class", "guides")
      .attr("transform", "translate(" + (margin.left + width + margin.gutter) + "," + margin.top + ")");

var female_label = container.append("text")
    .attr("class", "female label")
    .attr("x", margin.left + width + margin.gutter)
    .attr("y", height + margin.top + margin.bottom)
    .attr("dy", "-0.35em")

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
  var symbol = d3.formatPrefix(scaleX.domain()[1], 0).symbol;
  
  groups.transition()
      .attr("transform", "translate(0," + offset + ")");

  var group = groups.selectAll(".group")
      .data(data);

  var group_enter = group.enter().append("g")
      .attr("class", "group")
      .attr("transform", function(d) {  var offset = lastData? (lastData.length - data.length) * lastScaleY.rangeBand() : scaleY(d.age);  return "translate(0," + offset + ")";});

  group.transition()
      .attr("transform", function(d) {  var offset = scaleY(d.age);  return "translate(0," + offset + ")";});

  group.exit().transition()
      .attr("transform", function(d) { var offset = (data.length - lastData.length) * scaleY.rangeBand();  return "translate(0," + offset + ")" })
      .remove();

  group_enter.append("text")
      .attr("class", "label")

  group.select(".label").transition()
      .attr("x", margin.left + width + margin.gutter / 2)
      .attr("y", scaleY.rangeBand() / 2)
      .text(function(d) { return d.age});

  var male_enter = group_enter.append("g")
      .attr("class", "male")
      .attr("transform", "translate(" + margin.left +  ",0)");

  male_enter.append("rect")
      .attr("class", "bar")
      .attr("height", lastScaleY? lastScaleY.rangeBand() : scaleY.rangeBand());
  
  male_enter.append("rect")
      .attr("class", "ref");
  
  male_enter.append("text")
      .attr("class", "value");
  
  var male = group.select(".male")
      .attr("transform", "translate(" + (margin.left) + ",0)");;
  
  male.select(".bar").transition()
      .attr("x", function (d) { return width - scaleX(d.male);})
      .attr("height", scaleY.rangeBand())
      .attr("width", function (d) { return scaleX(d.male)});

  male.select(".value").transition()
      .attr("x", function (d) { return width - scaleX(d.male);})
      .attr("y", scaleY.rangeBand() / 2)
      .attr("dx", "5")
      .text(function (d) { return prefix(d.male)});

  male_axis_x.transition()
      .call(d3.svg.axis()
              .scale(invertedScaleX)
              .ticks(5)
              .tickFormat(prefix)
              .outerTickSize(0)
              .innerTickSize(4)
              .tickPadding(5)
              .orient("bottom"));

  male_guides_x.transition()
      .call(d3.svg.axis()
              .scale(invertedScaleX)
              .ticks(5)
              .outerTickSize(0)
              .innerTickSize(height));

  male_label.text("Male" + (symbol.length? " (" + symbol + ")" : ""));

  var female_enter = group_enter.append("g")
      .attr("class", "female")
      .attr("transform", "translate(" + (margin.left + width + margin.gutter) +  ",0)");

  female_enter.append("rect")
      .attr("class", "bar")
      .attr("height", lastScaleY? lastScaleY.rangeBand() : scaleY.rangeBand());
  
  female_enter.append("rect")
      .attr("class", "ref");
  
  female_enter.append("text")
      .attr("class", "value");
  
  var female = group.select(".female")
      .attr("transform", "translate(" + (margin.left + width + margin.gutter) + ",0)");;
  
  female.select(".bar").transition()
      .attr("height", scaleY.rangeBand())
      .attr("width", function (d) { return scaleX(d.female)});

  female.select(".value").transition()
      .attr("x", function (d) { return scaleX(d.female);})
      .attr("y", scaleY.rangeBand() / 2)
      .attr("dx", "-5")
      .text(function (d) { return prefix(d.female)});

  female_axis_x.transition()
      .call(d3.svg.axis()
              .scale(scaleX)
              .ticks(5)
              .tickFormat(prefix)
              .outerTickSize(0)
              .innerTickSize(4)
              .tickPadding(5)
              .orient("bottom"));

  female_guides_x.transition()
      .call(d3.svg.axis()
              .scale(scaleX)
              .ticks(5)
              .outerTickSize(0)
              .innerTickSize(height));

  female_label.text("Female" + (symbol.length? " (" + symbol + ")" : ""));

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