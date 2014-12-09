function stackChart() {

  var margin = {top: 10, right: 10, bottom: 20, left: 40},
      outerWidth = 400,
      outerHeight = 300,
      width = outerWidth - margin.left - margin.right,
      height = outerHeight - margin.top - margin.bottom,
      refSize = 10;

  var my = function(selection, d0, rd0) {

    var color = d3.scale.category20();

    var container = selection
        .attr('class', 'stackAreaChart');

    var chart = container.append("g");

    var areas = chart.append("g")
        .attr("class", "data");

    var lines = chart.append("g")
        .attr("class", "reference-data");

    var axisX = chart.append("g")
          .attr("class", "x axis");

    var axisY = chart.append("g")
          .attr("class", "y axis");

    var cursor = chart.append("line")
          .attr("class", "cursor")
          .attr("visibility", "hidden");

    container.on("mouseout", function(d,i) {
      cursor.attr("visibility", "hidden");
      references.selectAll(".value").attr("visibility", "hidden");
    })

    container.on("mousemove", function(d,i) {
      var format = d3.format(",");
      var position = d3.mouse(container.node())[0] - margin.left;
      var ticks = scaleX.ticks();
      var mouseDate = scaleX.invert(position);
      var visibility = 0 < position && position < width? "visible" : "hidden";
      var nearestDate;
      cursor.attr("visibility", visibility);
      references.selectAll(".value").attr("visibility", visibility);
      ticks.forEach(function(d) {
        if(nearestDate == null) {
          nearestDate = d;
        } else {
          if(Math.abs(d - mouseDate) < Math.abs(nearestDate - mouseDate)) {
            nearestDate = d;
          }
        }
      })
      var columns = Object.keys(my.data[0]).splice(1);
      var row = my.data[ticks.indexOf(nearestDate)];
      references.selectAll(".value").text(function(d,i) {
        var key = columns[i];
        return format(row[key]);
      })
      cursor.attr("transform", "translate("+ scaleX(nearestDate) + ",0)");
    });

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

    var references = container.append("g");

    var label = chart.append("g")
        .attr("transform", "translate(10,0)")
      .append("text")
        .attr("class", "label")
        .attr("transform", "rotate(-90)")
        .style("text-anchor", "end")
        .style("dominant-baseline", "hanging")

    var prefix = function (d) {
      var prefix = d3.formatPrefix(scaleY.domain()[1], 0);
      return prefix.scale(d);
    }

    var drawPath = function(data, container, pathGenerator) {
      var path = container.selectAll("path").data(data);

      path.enter().append("path")
          .attr("fill", function (d,i) { return color(i);})
          .attr("class", "layer");

      path.transition()
        .attr("d", pathGenerator);
    };

    var drawReferences = function(data, referenceData) {
      var columns = Object.keys(data[0]).splice(1);
      
      var reference = references.selectAll("g").data(columns);
      
      var enterReference = reference.enter()
        .append("g")

      enterReference.append("circle")
          .attr("r", refSize / 2)
          .attr("cx", refSize / 2)
          .attr("fill", function(d,i) { return color(i)});

      enterReference.append("text")
          .attr("class", "label")
          .attr("x", refSize + 4)
          .text(function (d) { return d});

      enterReference.append("text")
          .attr("class", "value")
          .attr("x", refSize + 4)
          .attr("y", refSize + 2);

      var x = margin.left,
          y = refSize;

      enterReference
        .attr("transform", function (d,i) {
            var translate = "translate(" + x + "," + y + ")";
            x += this.getBBox().width + refSize * 3;
            if(x > margin.left + width) {
              x =  margin.left;
              y += refSize * 3;
            } 
            return translate;
          })        
    }

    my.redraw = function(d, rd) {

      // Store data in selection if set
      if (arguments.length) my.data = d;
      var data = my.data || d0;

      if (arguments.length > 1) my.referenceData = rd;
      var referenceData = my.referenceData || rd0;

      // Draw based on height and width


      drawReferences(data, referenceData);

      var referencesHeight = references.node().getBBox().height + refSize;

      chart
        .attr("transform", "translate(" + margin.left + "," + (margin.top + referencesHeight) + ")");

      container
        .attr("width", width + margin.left + margin.right)
        .attr("height", height + margin.top + margin.bottom);

      axisX
          .attr("transform", "translate(0," + (height - referencesHeight) + ")");

      scaleX.range([0, width]);
      scaleY.range([height - referencesHeight, 0]);
      cursor.attr("y2", height - referencesHeight);

      // Draw based on data

      var columns = Object.keys(data[0]).splice(1);

      var dataLayers = stack(d3.range(columns.length).map(function(i) {
        var key = columns[i];
        return data.map(function (d) {
          return {x:d.date, y:d[key]}});
      }));

      var lastPeriodLayers = stack(d3.range(columns.length).map(function(i) {
        var key = columns[i];
        return referenceData.map(function (d) {
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

    my.redraw(d0, rd0);

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
