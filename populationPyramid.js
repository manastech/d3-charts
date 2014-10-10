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

var maleAxisX = container.append("g")
    .attr("class", "axis x")
    .attr("transform", "translate(" + margin.left + "," + (height + margin.top) + ")");

var maleGuidesX = container.append("g")
      .attr("class", "guides")
      .attr("transform", "translate(" + margin.left + "," + margin.top + ")");

var maleLabel = container.append("text")
    .attr("class", "male label")
    .attr("x", margin.left + width)
    .attr("y", height + margin.top + margin.bottom)
    .attr("dy", "-0.35em")

var femaleAxisX = container.append("g")
    .attr("class", "axis x")
    .attr("transform", "translate(" + (margin.left + width + margin.gutter) + "," + (height + margin.top) + ")");

var femaleGuidesX = container.append("g")
      .attr("class", "guides")
      .attr("transform", "translate(" + (margin.left + width + margin.gutter) + "," + margin.top + ")");

var femaleLabel = container.append("text")
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

function populate(data, referenceData) {

  scaleX.domain([0, d3.max(data.concat(referenceData || []), function(d) { return Math.max(d.male, d.female); })]);
  scaleY.domain(data.map(function(d) { return d.age; }));
  invertedScaleX = scaleX.copy().range([width, 0]);

  var offset = height - d3.extent(scaleY.range())[1] - scaleY.rangeBand(),
      symbol = d3.formatPrefix(scaleX.domain()[1], 0).symbol,
      barHeight = scaleY.rangeBand() * (referenceData? .8 : 1);
      referenceBarHeight = scaleY.rangeBand() * (referenceData? .2 : 0);
  
  groups.transition()
      .attr("transform", "translate(0," + offset + ")");

  var group = groups.selectAll(".group")
      .data(data);

  var groupEnter = group.enter().append("g")
      .attr("class", "group")
      .attr("transform", function(d) {  var offset = lastData? (lastData.length - data.length) * lastScaleY.rangeBand() : scaleY(d.age);  return "translate(0," + offset + ")";});

  group.transition()
      .attr("transform", function(d) {  var offset = scaleY(d.age);  return "translate(0," + offset + ")";});

  group.exit().transition()
      .attr("transform", function(d) { var offset = (data.length - lastData.length) * scaleY.rangeBand();  return "translate(0," + offset + ")" })
      .remove();

  groupEnter.append("text")
      .attr("class", "label")

  group.select(".label").transition()
      .attr("x", margin.left + width + margin.gutter / 2)
      .attr("y", scaleY.rangeBand() / 2)
      .text(function(d) { return d.age});

  var maleEnter = groupEnter.append("g")
      .attr("class", "male")
      .attr("transform", "translate(" + margin.left +  ",0)");

  maleEnter.append("rect")
      .attr("class", "bar")
      .attr("height", lastScaleY? lastScaleY.rangeBand() : scaleY.rangeBand());
  
  maleEnter.append("rect")
      .attr("class", "reference");
  
  maleEnter.append("text")
      .attr("class", "value");
  
  var male = group.select(".male")
      .attr("transform", "translate(" + (margin.left) + ",0)");;
  
  male.select(".bar").transition()
      .attr("x", function (d) { return width - scaleX(d.male);})
      .attr("y", referenceBarHeight)
      .attr("height", barHeight)
      .attr("width", function (d) { return scaleX(d.male)});

  male.select(".value").transition()
      .attr("x", function (d) { return width - scaleX(d.male);})
      .attr("y", scaleY.rangeBand() / 2)
      .attr("dx", "5")
      .text(function (d) { return prefix(d.male)});

  if(referenceData) {
    male.select(".reference").transition()
        .attr("x", function (d,i) { return width - scaleX(referenceData[i].male);})
        .attr("height", referenceBarHeight)
        .attr("width", function (d,i) { return scaleX(referenceData[i].male)});
  } else {
    male.select(".reference").transition()
        .attr("x", width)
        .attr("height", 0)
        .attr("width", 0);
  }

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

  maleLabel.text("Male" + (symbol.length? " (" + symbol + ")" : ""));

  var femaleEnter = groupEnter.append("g")
      .attr("class", "female")
      .attr("transform", "translate(" + (margin.left + width + margin.gutter) +  ",0)");

  femaleEnter.append("rect")
      .attr("class", "bar")
      .attr("height", lastScaleY? lastScaleY.rangeBand() : scaleY.rangeBand());
  
  femaleEnter.append("rect")
      .attr("class", "reference");
  
  femaleEnter.append("text")
      .attr("class", "value");
  
  var female = group.select(".female")
      .attr("transform", "translate(" + (margin.left + width + margin.gutter) + ",0)");;
  
  female.select(".bar").transition()
      .attr("y", referenceBarHeight)
      .attr("height", barHeight)
      .attr("width", function (d) { return scaleX(d.female)});

  female.select(".value").transition()
      .attr("x", function (d) { return scaleX(d.female);})
      .attr("y", scaleY.rangeBand() / 2)
      .attr("dx", "-5")
      .text(function (d) { return prefix(d.female)});


  if(referenceData) {
    female.select(".reference").transition()
        .attr("height", referenceBarHeight)
        .attr("width", function (d,i) { return scaleX(referenceData[i].female)});
  } else {
    female.select(".reference").transition()
        .attr("height", 0)
        .attr("width", 0);
  }

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

  femaleLabel.text("Female" + (symbol.length? " (" + symbol + ")" : ""));

  lastData = data;
  lastScaleY = scaleY;
}

document.addEventListener("mouseup", function (e) {
  var exponent = Math.round(Math.max(1, Math.random() * 10));
  var referenceRandomData = [];
  var randomData = data.filter(function (item) { return Math.random() > 0.5;});
  randomData.forEach(function (item) {
    item.male = Math.round(Math.random() * Math.pow(10, exponent));
    item.female = Math.round(Math.random() * Math.pow(10, exponent));
    var reference = {};
    reference.age = item.age;
    reference.male = Math.round(Math.random() * Math.pow(10, exponent));
    reference.female = Math.round(Math.random() * Math.pow(10, exponent));
    referenceRandomData.push(reference);
  });

  if(Math.random() > .5) {
    populate(randomData);
  } else {
    populate(randomData, referenceRandomData);
  }
});