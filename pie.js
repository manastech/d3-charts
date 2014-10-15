function pieChart() {

  var margin = {top: 10, right: 10, bottom: 10, left: 10, gutter:20},
      innerArcGenerator = d3.svg.arc(),
      outerArcGenerator = d3.svg.arc(),
      refSize = 10,
      prefix;

  var calculateRadius = function() {
    radius = Math.min(width, height) / 2;

    innerArcGenerator
        .innerRadius(radius * 0.5)
        .outerRadius(radius * .9);

    outerArcGenerator
        .innerRadius(radius)
        .outerRadius(radius * .92);
  }

  var my = function(selection, d0, rd0) {

    var container = selection
        .attr('class', 'pieChart');

    var innerArcs = container.append("g")
        .attr("class", "data");

    var outerArcs = container.append("g")
        .attr("class", "comparison");


    var references = container.append("g");

    var enterArc = {startAngle: 0, endAngle: 0};
    
    var exitArc = {startAngle: Math.PI * 2, endAngle: Math.PI * 2};
    
    var color = d3.scale.category20();

    var pie = d3.layout.pie()
        .value(function(d) { return d.value; })
        .sort(null);

    var drawPath = function(data, container, generator) {
      var path = container.datum(data||[]).selectAll("path")
        .data(pie);

      if(container.selectAll("path").empty()) {
        path.enter().append("path")
          .attr("fill", function(d, i) { return color(i); })
          .attr("d", function (d,i) { return generator(enterArc, i)})
          .each(function(d) { this._current = enterArc;});
      } else {
        path.enter().append("path")
          .attr("fill", function(d, i) { return color(i); })
          .attr("d", function(d,i) {return generator(exitArc ,i)})
          .each(function(d) { this._current = exitArc});
      }
      path.transition().attrTween("d", function (d){ return arcTween(d, this, generator)});
      path.exit().transition().attrTween("d", function(d,i) {return arcTween(exitArc, this, generator)}).remove();
    };

    var drawReferences = function(data, referenceData, container) {
      var reference = references.selectAll("g").data(data);
      var enterReference = reference.enter()
        .append("g")
          .attr("class", "reference")
          .attr("transform", function (d,i) { return "translate(" + (margin.left + width + margin.gutter) + "," + (margin.top + refSize * 2 * (i + 1)) + ")";})
      
      enterReference.attr("opacity", 0).transition().attr("opacity", 1);

      enterReference
        .append("circle")
          .attr("cy", -refSize / 2)
          .attr("r", refSize / 2)
          .attr("fill", function(d, i) { return color(i); })

      enterReference
        .append("text")
          .attr("class", "label")
          .attr("x", refSize)
          .attr("dy", "-0.35em")

      reference.select("text")
          .text(function (d,i) { return d.key + ": " + d3.round(prefix.scale(d.value), 1) + prefix.symbol + (referenceData? " (" + d3.round(prefix.scale(referenceData[i].value), 1) + prefix.symbol + ")" : "");});

      reference.exit().transition().attr("opacity", 0).remove();

      /*
      if(container.selectAll("path").empty()) {
        path.enter().append("path")
          .attr("d", function (d,i) { return generator(d, i)})
          .each(function(d) { this._current = d;});
      } else {
        path.enter().append("path")
          .attr("fill", function(d, i) { return color(i); })
          .attr("d", function(d,i) {return generator(exitArc ,i)})
          .each(function(d) { this._current = exitArc});
      }

      path.transition().attrTween("d", function (d){ return arcTween(d, this, generator)});
      path.exit().transition().attrTween("d", function(d,i) {return arcTween(exitArc, this, generator)}).remove();*/
    };

    my.redraw = function(d, rd) {

      // Store data in selection if set
      if (arguments.length) my.data = d;
      var data = my.data;

      my.referenceData = rd;
      var referenceData = my.referenceData;

      // Draw based on height and width

      calculateRadius();
      
      prefix = d3.formatPrefix(d3.max(d.concat(rd || []), function(d) {return d.value}));
      
      container
        .attr("width", width * 2 + margin.left + margin.right + margin.gutter)
        .attr("height", height + margin.top + margin.bottom);

      innerArcs.attr("transform", "translate(" + (margin.left + radius) + "," + (margin.top + radius) + ")");
      outerArcs.attr("transform", "translate(" + (margin.left + radius) + "," + (margin.top + radius) + ")");

      // Draw based on data
      drawPath(data, innerArcs, innerArcGenerator);
      drawPath(referenceData, outerArcs, outerArcGenerator);
      drawReferences(data, referenceData);
    };

    calculateRadius();
    my.redraw(d0, rd0);
  }

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

  var arcTween = function(a, path, generator) {
    path = this._current? this : path;
    var i = d3.interpolate(path._current, a);
    path._current = i(0);
    return function(t) {
      return generator(i(t));
    };
  }

  my.width(400);
  my.height(200);
  return my;
};

/*Loop references
   

        
        


//remove set = 0 from stack
    /*var prefix = function (d) {
      
      return prefix.scale(d);
    }*/
