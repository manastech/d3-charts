function stackChart() {

  var margin = {top: 10, right: 20, bottom: 40, left: 50},
      outerWidth = 400,
      outerHeight = 300,
      width = outerWidth - margin.left - margin.right,
      height = outerHeight - margin.top - margin.bottom,
      format = d3.time.format("%Y-%m"),
      color = ["#ff1e00", "#f89302", "#a3d215", "#31bfb0", "#6a50b2", "#e4ec05"],
      refSize = 10

  var my = function(selection) {

    var container = selection.attr('class', 'stackChart'),
        chart = container.append("g"),
        areas = chart.append("g"),
        axisX = chart.append("g").attr("class", "x axis"),
        axisY = chart.append("g").attr("class", "y axis"),
        scaleX = d3.time.scale(),
        scaleY = d3.scale.linear(),
        stack = d3.layout.stack().offset("baseline");

    var prefix = function(d) {
      var p = d3.formatPrefix(scaleY.domain()[1], 0);
      return p.scale(d);
    }

    var area = d3.svg.area()
      .x(function(d) { return scaleX(d.x);})
      .y0(function(d) { return scaleY(d.y0);})
      .y1(function(d) { return scaleY(d.y0 + d.y);})
      .interpolate("basis");

    var maleRef = chart.append("g");

    maleRef.append("circle")
        .attr("class", "bar")
        .attr("cy", -refSize / 2)
        .attr("r", refSize / 2)
        .attr("fill", color[0])
        .attr("opacity", 0.5);

    maleRef.append("text")
        .attr("class", "label")
        .attr("x", "8")
        .attr("dy", "-0.35em")
        .text("Male");

    var femaleRef = chart.append("g");

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

    var unknownRef = chart.append("g");

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
        .style("dominant-baseline", "hanging");

    my.redraw = function(d) {

      // Store data in selection if set
      if (arguments.length) selection.datum(d);
      var data = d || selection.datum();

      // Set sizes
      container
        .attr("width", width + margin.left + margin.right)
        .attr("height", height + margin.top + margin.bottom);

      chart.attr("transform", "translate(" + margin.left + "," + margin.top + ")");

      axisX.attr("transform", "translate(0," + height + ")");

      scaleX.range([0, width]);
      scaleY.range([height, 0]);

      maleRef.attr("transform", "translate(0," + (height + margin.bottom) + ")");
      femaleRef.attr("transform", "translate(50," + (height + margin.bottom) + ")");
      unknownRef.attr("transform", "translate(110," + (height + margin.bottom) + ")");

      // Redraw
      var data, columns, layers;
      columns = Object.keys(data[0]).splice(1);
      layers = stack(d3.range(columns.length).map(function(i) { var key = columns[i];return data.map(function (d) { return {x:d.date, y:d[key]}});}));
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
      label.text("Quantity" + (symbol.length? " (" + symbol + ")" : ""));

      return my;
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
