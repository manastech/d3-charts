//text overlap
//  
function initialize() {
  
  calendar
    .append("g")
      .attr("id", "days")
      .selectAll(".day").data(d3.range(TOTAL_DAYS)).enter()
    .append("rect")
      .attr("class", "cell");

  calendar.append("path")
    .attr("id", "dim");

  calendar.append("g")
    .attr("id", "grid")
    .attr("transform", "translate(-0.5, -0.5)");

  d3.select("#grid").selectAll(".week").data(d3.range(TOTAL_WEEKS + 1)).enter()
        .append("line")
        .attr("class", "week");

  d3.select("#grid").selectAll(".day").data(d3.range(DAY_LABELS.length + 1)).enter()
        .append("line")
        .attr("class", "day");

  d3.select("#grid").selectAll(".header").data(DAY_LABELS).enter()
    .append("text")
      .attr("class", "header")
      .text(function(d) {return d});

  area = calendar.append("g")
    .attr("class", "brush");

var drag = d3.behavior.drag()
    .on("drag", function (d, i) {
      var week = Math.max(0, Math.min(TOTAL_WEEKS, Math.round(d3.event.x/size)));
      switch(i) {
        case 0:
          brush.extent([new Date(start.getTime() + week * MILLISECONDS_PER_WEEK), brush.extent()[1]])
          break;
        case 1:
          brush.extent([brush.extent()[0], new Date(start.getTime() + week * MILLISECONDS_PER_WEEK)])
          break;
      }
      brush(area);
      brush.event(area);
    });

  calendar.selectAll(".handle").data(d3.range(2)).enter()
    .append("g")
    .attr("class", "handle")
    .each(function() {
      d3.select(this)
        .append("text")
        .attr("x", 0)
        .attr("y", 20);
      d3.select(this)
        .append("circle")
          .attr("r", 6);
    }).call(drag);

  d3.selectAll(".icon").on("click", function() {
    mode(d3.select(this).attr("id"));
    paintCells();
  });

  d3.select("#update").on("click", function () {
    update();
  });

  mode("ramp");

  update();
}

function brushed() {
  var extent = brush.extent(),
      snap;
  if (d3.event.mode === "move") {
    var d0 = d3.time.week.round(extent[0]),
        d1 = d3.time.week.offset(d0, Math.round((extent[1] - extent[0]) / MILLISECONDS_PER_WEEK));
    snap = [d0, d1];
  }
  else {
    snap = extent.map(d3.time.week.round);
    if (snap[0] >= snap[1]) {
      snap[0] = d3.time.week.floor(extent[0]);
      snap[1] = d3.time.week.ceil(extent[1]);
    }
  }
  d3.select(this).call(brush.extent(snap));
  paintBrush();
}

function paintBrush() {
  var extent = brush.extent();
  var min = Math.min(extent[0], extent[1]);
  var max = Math.max(extent[0], extent[1]);
  var data = "M0,0H" + (size * TOTAL_WEEKS) + "V" + (size * 7) + "H0V0z"
           + "M" + scaleX(min) + ",0H" + scaleX(max) + "V" + (size * 7) + "H" + scaleX(min) + "V0z";
  d3.select("#dim")
    .attr("d", data)
    .attr("fill-rule", "evenodd");
  d3.selectAll(".cell")
    .attr("class", function (d,i) {
      return "cell" + (i < (min - start) / MILLISECONDS_PER_DAY || (max - start) / MILLISECONDS_PER_DAY <= i? " cutout" : "")
    })

  d3.selectAll(".handle").data(extent)
    .attr("transform", function(d,i) { return "translate("+ scaleX(extent[i]) + ", " + size * 7 + ")"})
    .select("text")
    .text(function(d, i) { return format(d)})

  
  var handles = d3.selectAll(".handle"),
      labels = handles.select("text"),
      positions = [d3.transform(d3.select(handles[0][0]).attr("transform")).translate[0], d3.transform(d3.select(handles[0][1]).attr("transform")).translate[0]],
      widths = [labels[0][0].getBoundingClientRect().width, labels[0][1].getBoundingClientRect().width],
      gutter = 10,
      overlap = Math.max(0, (widths[0] / 2 + widths[1] / 2 + gutter) - Math.abs(positions[0] - positions[1])),
      reverse = extent[0] > extent[1];
      
      labels.attr("x", function(d, i) { return overlap? overlap / 2 * (i? 1 : -1) * (reverse? -1 : 1) : 0});
}

function format(date) {
  return MONTH_LABELS[date.getMonth()] + " " + date.getDate() + ", " + date.getFullYear();
}

function paintCells() {
  d3.selectAll(".cell").transition().duration(initialized? 1000 : 0)
      .attr("width", size - 1)
      .attr("height", size - 1)
      .attr("transform", function(d, i) {
        var x = Math.floor(i / 7) * size;
        var y = (6 - i % 7) * size;
        return "translate(" + x + "," + y + ")";
      })
      .attr("fill", function (d) {
        var fill;
        if(continuous) {
          fill = color(d || 0);
        } else {
          for (var i = domain.length - 1; i >= 0; i--) {
            if((d || 0) >= domain[i]) {
              fill = range[i];
              break;
            }
          };
        }
        return fill;
      });
}

function mode(value) {
  switch(value) {
    case "ramp":
      continuous = true;
      ramp.classList.add("selected");
      steps.classList.remove("selected");
      break;
    case "steps":
      continuous = false;
      steps.classList.add("selected");
      ramp.classList.remove("selected");
      break;
  }
}

function update() {
  start = createDate(),
  data = createData();
  end = new Date(start.getTime() + MILLISECONDS_PER_WEEK * TOTAL_WEEKS);
  populate();
}

function createDate() {
  var date = new Date();
  date.setHours(0);
  date.setMinutes(0);
  date.setSeconds(0);
  date.setMilliseconds(0);
  return new Date(date - MILLISECONDS_PER_DAY * Math.round(Math.random() * 365));
}

function createData() {
  var data = [];
  for (var i= Math.random() * 1000; i >= 0; i--){
    data.push(Math.random() * Math.random() * Math.random() * 100);
  };
  var leading = new Array(start.getDay());
  start.setDate(start.getDate() - leading.length);
  var trailing = new Array(Math.max(0, TOTAL_DAYS - data.length - leading.length));
  data = leading.concat(data).concat(trailing).splice(0, TOTAL_DAYS);
  return data;
}

function getFirstDays() {
  var monthStart = new Date(start.getFullYear(), start.getMonth() + 1, 1);
  var startPoints = [];
  while(monthStart < end) {
    startPoints.push(Math.floor((monthStart.getTime() - start.getTime())/MILLISECONDS_PER_DAY));
    monthStart.setMonth(monthStart.getMonth() + 1);
  }
  return startPoints;
}

function populate() {
  var margin = {top: 1, right: 30, bottom: 25, left: 30},
      width = container.attr("width");
  size = (width - margin.left - margin.right) / 78;
  container.attr("height", size * 7 + margin.top + margin.bottom);
  calendar.attr("transform", "translate("+ margin.left +","+ margin.top +")");
  
  var months = d3.selectAll("#grid .month").data(getFirstDays());

  months.enter()
    .append("polyline")
      .attr("class", "month")
      .attr("points", function(d) {
        var x = Math.floor(d / 7) * size;
        var y = (6 - d % 7) * size;
        var points = [];
        switch(d % 7) {
          case 0:
            break;
          default:
            points.push([x + size, size * 7].join(","));
            points.push([x + size, y + size].join(","));
            break;
        }
        points.push([x, y + size].join(","));
        points.push([x, 0].join(","));
        return points.join(" ");
      })
      .style("opacity", 0).transition().style("opacity", 1);

  months.exit().remove();

  d3.selectAll("#grid .week")
    .each(function (d, i) {
      d3.select(this)
        .attr("x1", i * size)
        .attr("x2", i * size)
        .attr("y1", 0)
        .attr("y2", size * 7)
    });

  d3.selectAll("#grid .day")
  .each(function (d, i) {
    d3.select(this)
      .attr("x1", 0)
      .attr("x2", TOTAL_WEEKS * size)
      .attr("y1", i * size)
      .attr("y2", i * size)
  });

  d3.selectAll("#grid .header")
  .each(function (d, i) {
    var y = i * size + size/2;
    d3.select(this)
      .attr("x", -6)
      .attr("y", y)
      .attr("transform", "rotate(-90, -6, " + y + ")")
  });

  scaleX = d3.time.scale()
    .domain([start, end])
    .range([0, size * TOTAL_WEEKS]);

  brush = d3.svg.brush()
      .x(scaleX)
      .extent([new Date(start.getTime() + MILLISECONDS_PER_WEEK * 26), end])
      .on("brush", brushed);

  area.call(brush);

  area.selectAll("rect")
    .attr("height", size * 7);

  var cells = calendar.selectAll(".cell")
    .data(data);

  paintCells();

  paintBrush();
  
  initialized = true;
}

var MILLISECONDS_PER_DAY = 86400000,
    MILLISECONDS_PER_WEEK = MILLISECONDS_PER_DAY * 7,
    TOTAL_WEEKS = 78,
    TOTAL_DAYS = TOTAL_WEEKS * 7,
    DAY_LABELS = ["S", "M", "T", "W", "T", "F", "S"],
    MONTH_LABELS = ["Jan", "Feb", "Mar", "Apr", "May", "Jun", "Jul", "Aug", "Sep", "Oct", "Nov", "Dec"],
    domain = [0, 25, 50, 100],
    range = ["#ffffff", "#ffc400", "#d23f31", "#d23f31"],
    color = d3.scale.linear()
     .domain(domain)
     .range(range)
     .interpolate(d3.interpolateHcl),
    container = d3.select(".chart"),
    calendar = container.append("g"),
    ramp = document.querySelector("#ramp"),
    steps = document.querySelector("#steps"),
    initialized = false,
    continuous, start, end, area, brush, scaleX, size, left, right;

initialize();



/*
.axis text {
  font: 11px sans-serif;
}

.axis path {
  display: none;
}

.axis line {
  fill: none;
  stroke: #000;
  shape-rendering: crispEdges;
}

.grid-background {
  fill: #ddd;
}

.grid line,
.grid path {
  fill: none;
  stroke: #fff;
  shape-rendering: crispEdges;
}

.grid .minor.tick line {
  stroke-opacity: .5;
}




svg.append("g")
    .attr("class", "x axis")
    .attr("transform", "translate(0," + height + ")")
    .call(d3.svg.axis()
      .scale(x)
      .orient("bottom")
      .ticks(d3.time.days)
      .tickPadding(0))
  .selectAll("text")
    .attr("x", 6)
    .style("text-anchor", null);

*/