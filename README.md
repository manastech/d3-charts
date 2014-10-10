d3-charts
=========

Experiments on charts with D3.
[View demo](http://manastech.github.io/d3-charts/).

Usage
-----

All charts are in the `src` folder. Add the HTML+CSS of the chart you want to use in your project, and add the chart as:

```javascript
  // Initialise chart object and call from selection
  var chart = stackChart().width(500).height(200);
  d3.select('#example').datum(myData).call(chart);

  // Redraw when data changes by calling redraw
  chart.redraw(newData);

  // Or change data in selection and then redraw
  d3.select('#example').datum(newData);
  chart.redraw();
```
