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

    var maleChart = container.append("g")
        .attr("transform", "translate(" + margin.left + "," + margin.top + ")")
        .attr("class", "male");

    var maleLabel = maleChart.append("text")
        .attr("class", "label")
        .attr("dy", "-0.35em");

    var maleBars = maleChart.append("g");

    var maleAxisX = maleChart.append("g")
        .attr("class", "x axis");

    var maleGuidesX = maleChart.append("g")
          .attr("class", "guides");

    var femaleChart = container.append("g")
        .attr("class", "female");

    var femaleLabel = femaleChart.append("text")
        .attr("class", "label")
        .attr("dy", "-0.35em");

    var femaleBars = femaleChart.append("g");

    var femaleAxisX = femaleChart.append("g")
        .attr("class", "x axis");

    var femaleGuidesX = femaleChart.append("g")
          .attr("class", "guides");

    var ageGroups = container.append("g")
        .attr("class", "y axis");

    var prefix = function(d) {
      var prefix = d3.formatPrefix(scaleX.domain()[1], 0);
      return d3.round(prefix.scale(d), 1);
    }

    my.redraw = function(d) {

      // Store data in selection if set
      if (arguments.length) selection.datum(d);
      var data = d || selection.datum();


      // Set up scales

      scaleX.range([0, width])
        .domain([0, d3.max(data, function(d) { return Math.max(d.male, d.female); })]);

      scaleY.rangeRoundBands([height, 0], .2, 0)
        .domain(data.map(function(d) { return d.age; }));

      var invertedScaleX = scaleX.copy().range([width, 0]);


      // Set properties based on size

      container
        .attr("width", width * 2 + margin.left + margin.right + margin.gutter)
        .attr("height", height + margin.top + margin.bottom);

      maleLabel
        .attr("x", width)
        .attr("y", height + margin.top + margin.bottom)

      maleAxisX
        .attr("transform", "translate(0," + height + ")");

      femaleChart
        .attr("transform", "translate(" + (margin.left + width + margin.gutter) + "," + margin.top + ")")

      femaleLabel
        .attr("y", height + margin.top + margin.bottom);

      femaleAxisX
        .attr("transform", "translate(0," + height + ")");

      var offset = height - d3.extent(scaleY.range())[1] - scaleY.rangeBand();
      maleBars.transition().attr("transform", "translate(0," + offset + ")");
      femaleBars.transition().attr("transform", "translate(0," + offset + ")");
      ageGroups.transition().attr("transform", "translate(" + (margin.left + width + margin.gutter / 2) + ", " + (offset + margin.top) + ")");


      // Male data processing

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


      // Female data processing

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


      // Age groups processing

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
