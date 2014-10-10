function populationPyramid() {

  var margin = {top: 0, right: 20, bottom: 35, left: 20, gutter:50},
      outerWidth = 400,
      outerHeight = 300,
      width = (outerWidth - margin.left - margin.right - margin.gutter) / 2,
      height = outerHeight - margin.top - margin.bottom,
      data,
      lastData,
      lastScaleY;

  var my = function(selection) {

    var scaleX = d3.scale.linear();

    var scaleY = d3.scale.ordinal();

    var container = selection
        .attr("class", "populationPyramid");

    var groups = container.append("g");

    var maleAxisX = container.append("g")
        .attr("class", "axis x");

    var maleGuidesX = container.append("g")
          .attr("class", "guides")
          .attr("transform", "translate(" + margin.left + "," + margin.top + ")");

    var maleLabel = container.append("text")
        .attr("class", "male label")
        .attr("dy", "-0.35em")

    var femaleAxisX = container.append("g")
        .attr("class", "axis x");

    var femaleGuidesX = container.append("g")
          .attr("class", "guides");

    var femaleLabel = container.append("text")
        .attr("class", "female label")
        .attr("dy", "-0.35em");

    var prefix = function(d) {
      var prefix = d3.formatPrefix(scaleX.domain()[1], 0);
      return d3.round(prefix.scale(d), 1);
    }

    my.redraw = function(d, rd) {

      // Store data in selection if set
      if (arguments.length) selection.datum(d);
      var data = d || selection.datum();

      if (arguments.length > 1) my.referenceData = rd;
      var referenceData = my.referenceData;

      // Set attributes based on height/width
      scaleX.range([0, width]);
      scaleY.rangeRoundBands([height, 0], .2, 0);

      container
          .attr("width", width * 2 + margin.left + margin.right + margin.gutter)
          .attr("height", height + margin.top + margin.bottom);

      maleAxisX.attr("transform", "translate(" + margin.left + "," + (height + margin.top) + ")");

      maleLabel
          .attr("y", height + margin.top + margin.bottom)
          .attr("x", margin.left + width);

      femaleAxisX.attr("transform", "translate(" + (margin.left + width + margin.gutter) + "," + (height + margin.top) + ")");
      femaleGuidesX.attr("transform", "translate(" + (margin.left + width + margin.gutter) + "," + margin.top + ")");

      femaleLabel
          .attr("x", margin.left + width + margin.gutter)
          .attr("y", height + margin.top + margin.bottom);


      // Bind data and draw
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
          .attr("y", referenceBarHeight + barHeight / 2)
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
          .attr("y", referenceBarHeight + barHeight / 2)
          .attr("dx", "-5")
          .text(function (d) { return prefix(d.female)});


      if (referenceData) {
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
    };

    my.redraw();
  };

  my.width = function(_) {
    if (!arguments.length) return outerWidth;
    outerWidth = _;
    width = (outerWidth - margin.left - margin.right - margin.gutter) / 2;
    return my;
  };

  my.height = function(_) {
    if (!arguments.length) return outerHeight;
    outerHeight = _;
    height = outerHeight - margin.top - margin.bottom;
    return my;
  };

  return my;
};
