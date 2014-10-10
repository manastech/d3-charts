function stackChart() {

  var margin = {top: 10, right: 20, bottom: 40, left: 50},
      outerWidth = 400,
      outerHeight = 300,
      width = outerWidth - margin.left - margin.right,
      height = outerHeight - margin.top - margin.bottom,
      refSize = 10;

  var my = function(selection, d0, rd0) {

    var container = selection
        .attr('class', 'stackAreaChart');

    var chart = container.append("g")
        .attr("transform", "translate(" + margin.left + "," + margin.top + ")");

    var areas = chart.append("g")
        .attr("class", "data");

    var lines = chart.append("g")
        .attr("class", "last-period");

    var axisX = chart.append("g")
          .attr("class", "x axis");

    var axisY = chart.append("g")
          .attr("class", "y axis");

    var scaleX = d3.time.scale();

    var scaleY = d3.scale.linear();

    var stack = d3.layout.stack().offset("baseline");

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

    var references = chart.append("g");

    var dataReferences = references.append("g")
        .attr("class", "data")

    var maleRef = dataReferences.append("g")
        .attr("class", "layer");

    maleRef.append("circle")
        .attr("cy", -refSize / 2)
        .attr("r", refSize / 2)

    maleRef.append("text")
        .attr("class", "label")
        .attr("x", "8")
        .attr("dy", "-0.35em")
        .text("Male");

    var femaleRef = dataReferences.append("g")
        .attr("class", "layer");

    femaleRef.append("circle")
        .attr("cy", -refSize / 2)
        .attr("r", refSize / 2)

    femaleRef.append("text")
        .attr("class", "label")
        .attr("x", "8")
        .attr("dy", "-0.35em")
        .text("Female");

    var unknownRef = dataReferences.append("g")
        .attr("class", "layer");

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
        .attr("class", "layer");

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

    var prefix = function (d) {
      var prefix = d3.formatPrefix(scaleY.domain()[1], 0);
      return prefix.scale(d);
    }

    var drawPath = function(data, container, pathGenerator) {
      var path = container.selectAll("path").data(data);

      path.enter().append("path")
          .attr("class", "layer");

      path.transition()
        .attr("d", pathGenerator);
    };


    my.redraw = function(d, rd) {

      // Store data in selection if set
      if (arguments.length) my.data = d;
      var data = my.data || d0;

      if (arguments.length > 1) my.referenceData = rd;
      var lastPeriodData = my.referenceData || rd0;


      // Draw based on height and width

      container
        .attr("width", width + margin.left + margin.right)
        .attr("height", height + margin.top + margin.bottom);

      axisX
          .attr("transform", "translate(0," + height + ")");

      scaleX.range([0, width]);
      scaleY.range([height, 0]);

      maleRef.attr("transform", "translate(0," + (height + margin.bottom) + ")");
      femaleRef.attr("transform", "translate(50," + (height + margin.bottom) + ")");
      unknownRef.attr("transform", "translate(110," + (height + margin.bottom) + ")");
      totalRef.attr("transform", "translate(175," + (height + margin.bottom) + ")");


      // Draw based on data

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

      drawPath(dataLayers, areas, areaGenerator);
      drawPath([lastPeriodLayers[columns.length - 1]], lines, lineGenerator);

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

    };

    my.redraw();

  };

  my.width = function(_) {
    if (!arguments.length) return outerWidth;
    outerWidth = _;
    width = outerWidth - margin.left - margin.right;
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
