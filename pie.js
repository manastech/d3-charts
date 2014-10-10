var width = 960,
    height = 500,
    radius = Math.min(width, height) / 2;

var color = d3.scale.category20();

var pie = d3.layout.pie()
    .value(function(d) { return d.value; })
    .sort(null);

var arc = d3.svg.arc()
    .innerRadius(radius - 100)
    .outerRadius(radius - 20);

var container = d3.select("#chart")
    .attr("width", width)
    .attr("height", height)
  .append("g")
    .attr("transform", "translate(" + width / 2 + "," + height / 2 + ")");


function draw(data) {



  var exitArc = {startAngle: Math.PI * 2, endAngle: Math.PI * 2};
  var path = container.datum(data).selectAll("path")
      .data(pie);
  if(container.selectAll("path").empty()) {
    enterPath = path.enter().append("path")
      .attr("fill", function(d, i) { return color(i); })
      .attr("d", arc)
      .each(function(d) { this._current = d;});
  } else {
    enterPath = path.enter().append("path")
      .attr("fill", function(d, i) { return color(i); })
      .attr("d", function(d,i) {return arc(exitArc ,i)})
      .each(function(d) { this._current = exitArc});
  }

  path.transition().attrTween("d", arcTween);
  path.exit().transition().attrTween("d", function(d,i) {return arcTween(exitArc, this)}).remove();
  lastData = data;
};


document.addEventListener("mouseup", function(e) {
  draw(randomData());
});

function randomData() {
  var data = [];
  var letter = "ABCDEFGHI".split("");
  var exponent = Math.round(Math.max(1, Math.random() * 10));
  d3.range(2, 3 + Math.round(Math.random() * 7)).forEach(function(d) {
    data.push({key:letter[d - 2], value:Math.round(Math.random() * Math.pow(10, exponent))})
  });
  return data;
}

draw(randomData());

function arcTween(a, path) {
  path = this._current? this : path;
  var i = d3.interpolate(path._current, a);
  path._current = i(0);
  return function(t) {
    return arc(i(t));
  };
}
















