var margin = {top: 0, right: 20, bottom: 35, left: 20, gutter:50},
    width = (400 - margin.left - margin.right - margin.gutter) / 2,
    height = 300 - margin.top - margin.bottom,
    data, last_data, last_scale_y;

var scale_x = d3.scale.linear()
    .range([0, width]);

var scale_y = d3.scale.ordinal()
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
  var prefix = d3.formatPrefix(scale_x.domain()[1], 0);
  return d3.round(prefix.scale(d), 1);
}

function type(d) {
  d.male = +d.male;
  d.female = +d.female;
  return d;
}

function populate(data, referenceData) {

  scale_x.domain([0, d3.max(data, function(d) { return Math.max(d.male, d.female); })]);
  scale_y.domain(data.map(function(d) { return d.age; }));
  inverted_scale_x = scale_x.copy().range([width, 0]);

  var offset = height - d3.extent(scale_y.range())[1] - scale_y.rangeBand(),
      symbol = d3.formatPrefix(scale_x.domain()[1], 0).symbol,
      bar_height = scale_y.rangeBand() * (referenceData? .8 : 1);
      reference_bar_height = scale_y.rangeBand() * (referenceData? .2 : 0);
  
  groups.transition()
      .attr("transform", "translate(0," + offset + ")");

  var group = groups.selectAll(".group")
      .data(data);

  var group_enter = group.enter().append("g")
      .attr("class", "group")
      .attr("transform", function(d) {  var offset = last_data? (last_data.length - data.length) * last_scale_y.rangeBand() : scale_y(d.age);  return "translate(0," + offset + ")";});

  group.transition()
      .attr("transform", function(d) {  var offset = scale_y(d.age);  return "translate(0," + offset + ")";});

  group.exit().transition()
      .attr("transform", function(d) { var offset = (data.length - last_data.length) * scale_y.rangeBand();  return "translate(0," + offset + ")" })
      .remove();

  group_enter.append("text")
      .attr("class", "label")

  group.select(".label").transition()
      .attr("x", margin.left + width + margin.gutter / 2)
      .attr("y", scale_y.rangeBand() / 2)
      .text(function(d) { return d.age});

  var male_enter = group_enter.append("g")
      .attr("class", "male")
      .attr("transform", "translate(" + margin.left +  ",0)");

  male_enter.append("rect")
      .attr("class", "bar")
      .attr("height", last_scale_y? last_scale_y.rangeBand() : scale_y.rangeBand());
  
  male_enter.append("rect")
      .attr("class", "reference");
  
  male_enter.append("text")
      .attr("class", "value");
  
  var male = group.select(".male")
      .attr("transform", "translate(" + (margin.left) + ",0)");;
  
  male.select(".bar").transition()
      .attr("x", function (d) { return width - scale_x(d.male);})
      .attr("y", reference_bar_height)
      .attr("height", bar_height)
      .attr("width", function (d) { return scale_x(d.male)});

  male.select(".value").transition()
      .attr("x", function (d) { return width - scale_x(d.male);})
      .attr("y", scale_y.rangeBand() / 2)
      .attr("dx", "5")
      .text(function (d) { return prefix(d.male)});

  if(referenceData) {
    male.select(".reference").transition()
        .attr("x", function (d,i) { return width - scale_x(referenceData[i].male);})
        .attr("height", reference_bar_height)
        .attr("width", function (d,i) { return scale_x(referenceData[i].male)});
  } else {
    male.select(".reference").transition()
        .attr("x", width)
        .attr("height", 0)
        .attr("width", 0);
  }

  male_axis_x.transition()
      .call(d3.svg.axis()
              .scale(inverted_scale_x)
              .ticks(5)
              .tickFormat(prefix)
              .outerTickSize(0)
              .innerTickSize(4)
              .tickPadding(5)
              .orient("bottom"));

  male_guides_x.transition()
      .call(d3.svg.axis()
              .scale(inverted_scale_x)
              .ticks(5)
              .outerTickSize(0)
              .innerTickSize(height));

  male_label.text("Male" + (symbol.length? " (" + symbol + ")" : ""));

  var female_enter = group_enter.append("g")
      .attr("class", "female")
      .attr("transform", "translate(" + (margin.left + width + margin.gutter) +  ",0)");

  female_enter.append("rect")
      .attr("class", "bar")
      .attr("height", last_scale_y? last_scale_y.rangeBand() : scale_y.rangeBand());
  
  female_enter.append("rect")
      .attr("class", "reference");
  
  female_enter.append("text")
      .attr("class", "value");
  
  var female = group.select(".female")
      .attr("transform", "translate(" + (margin.left + width + margin.gutter) + ",0)");;
  
  female.select(".bar").transition()
      .attr("y", reference_bar_height)
      .attr("height", bar_height)
      .attr("width", function (d) { return scale_x(d.female)});

  female.select(".value").transition()
      .attr("x", function (d) { return scale_x(d.female);})
      .attr("y", scale_y.rangeBand() / 2)
      .attr("dx", "-5")
      .text(function (d) { return prefix(d.female)});


  if(referenceData) {
    female.select(".reference").transition()
        .attr("height", reference_bar_height)
        .attr("width", function (d,i) { return scale_x(referenceData[i].female)});
  } else {
    female.select(".reference").transition()
        .attr("height", 0)
        .attr("width", 0);
  }

  female_axis_x.transition()
      .call(d3.svg.axis()
              .scale(scale_x)
              .ticks(5)
              .tickFormat(prefix)
              .outerTickSize(0)
              .innerTickSize(4)
              .tickPadding(5)
              .orient("bottom"));

  female_guides_x.transition()
      .call(d3.svg.axis()
              .scale(scale_x)
              .ticks(5)
              .outerTickSize(0)
              .innerTickSize(height));

  female_label.text("Female" + (symbol.length? " (" + symbol + ")" : ""));

  last_data = data;
  last_scale_y = scale_y;
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