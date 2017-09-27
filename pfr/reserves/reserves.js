// inspiration from https://bl.ocks.org/mbostock/3885304

// function to call on the data
plotData = function(error, data, dataType) {
  if (error) throw error;

  // Constants for sizing
  var w = window,
      d = document,
      e = d.documentElement,
      g = d.getElementsByTagName('body')[0],
      x = w.innerWidth || e.clientWidth || g.clientWidth,
      y = w.innerHeight|| e.clientHeight|| g.clientHeight;

  // maintain a ratio of 2.5 width to 1 height, but scale to window. Max width of 1000.
  var width = d3.min([1000, y * 1.2, x * 0.75]);
  var height = width / 2.5;

  // scale the toolbars
  var label_size = d3.min([d3.max([12, (height / 15)]), 18]) + "px",
      entry_size = d3.min([d3.max([10, (height / 20)]), 16]) + "px",
      heading_size = d3.min([d3.max([16, (height / 10)]), 46]) + "px";
  d3.selectAll('#heading').style('font-size', heading_size);
  d3.selectAll('.toolbar_label').attr('style', "padding:0px 0px 0px 10px; font-weight: bold; font-size: " + label_size);
  d3.selectAll('.btn-group').selectAll('.btn').attr('style', "font-size: " + entry_size);

  var svg = d3.select("#vis")
    .append("svg")
    .attr('height', height)
    .attr('width', width);

  var graphMargin = {top: height * 0.1, right: width * 0.2, bottom: 20, left: width * 0.05},
    graphWidth = width - graphMargin.left - graphMargin.right,
    graphHeight = height - graphMargin.top - graphMargin.bottom;

  var x = d3.scaleBand().rangeRound([0, graphWidth]).padding(0.1),
      y = d3.scaleLinear().rangeRound([graphHeight, 0]);

  var axisTextSize = d3.min([d3.max([8, (graphHeight / 20)]), 15]) + "px"

  var graph = svg.append("g")
      .attr("transform", "translate(" + graphMargin.left + "," + graphMargin.top + ")");

  x.domain(data.map(function(d) { return d.year; }));
  y.domain([0, 0.10]);

  // draw x axis
  graph.append("g")
      .style('font-size', axisTextSize)
      .attr("class", "axis axis--x")
      .attr("transform", "translate(0," + graphHeight + ")")
      .call(d3.axisBottom(x));

  // draw y axis
  graph.append("g")
      .style('font-size', axisTextSize)
      .attr("class", "axis axis--y")
      .call(d3.axisLeft(y).ticks(10, "%"))
      .append("text")
      .classed('yAxisText', true)
      .attr('x', 10)
      .attr('y', -30)
      .attr("dy", "0.71em")
      .attr("fill", "#000")
      .text("");

  /* draw bars */

  // year-beginning reserves as % of budgeted general fund receipts
  graph.selectAll('.bar')
    .data(data)
    .enter().append('rect')
    .attr('class', 'bar')
    .attr('x', function(d) {return x(d.year)})
    .attr('y', graphHeight)
    .attr('width', x.bandwidth())
    .attr('height', 0)
    .on('mouseenter', showFloatingTooltip)
    .on('mouseleave', function() {
      graph.select('.outline').remove();
      floating_tooltip.hideTooltip();
    });

  /* draw reserve fund policy line */
  var pLine = d3.line()
      .x(function(d) { return x(d.year) + (0.5 * x.bandwidth()); })
      .y(function(d) { return y(0.05); });

  graph.append('path')
    .data([data])
    .attr('class', 'line pLine')
    .attr('d', pLine)
    .attr('stroke-dasharray', '5, 5')
    .attr('stroke', 'black')
    .attr('fill', 'none');

  graph.append('text')
    .attr('class', 'policyText')
    .attr('x', x(2009))
    .attr('y', y(0.052))
    .attr('font-size', axisTextSize)
    .text('5% Reserve Fund policy');

  function drawPercent() {
    // set scale
    var y = d3.scaleLinear().rangeRound([graphHeight, 0]).domain([0,0.10]);

    // change the axis
    d3.selectAll('.axis--y').call(d3.axisLeft(y).ticks(10, "%"));
    d3.selectAll('.yAxisText').text('');

    // draw bars
    d3.selectAll('.bar')
      .transition()
      .duration(500)
      .attr('y', function(d) {return y(d.reserve_pct)})
      .attr('height', function(d) {return graphHeight - y(d.reserve_pct); });

    // draw line
    var pLine = d3.line()
      .x(function(d) { return x(d.year) + (0.5 * x.bandwidth()); })
      .y(function(d) { return y(0.05); });
    d3.selectAll('.pLine')
      .transition()
      .duration(500)
      .attr('d', pLine);

    // place the label
    d3.selectAll('.policyText')
      .transition()
      .duration(500)
      .attr('y', y(0.052))

  };

  function drawValues() {
    // set scale
    var y = d3.scaleLinear().rangeRound([graphHeight, 0]).domain([0,500]);

    // change the axis
    d3.selectAll('.axis--y').call(d3.axisLeft(y).ticks(5));
    d3.selectAll('.yAxisText').text('$ (Millions)');

    // draw bars
    d3.selectAll('.bar')
      .transition()
      .duration(500)
      .attr('y', function(d) {return y(d.reserves / 1e6)})
      .attr('height', function(d) {return graphHeight - y(d.reserves / 1e6); });

    // draw line
    var pLine = d3.line()
      .x(function(d) { return x(d.year) + (0.5 * x.bandwidth()); })
      .y(function(d) { return y(0.05 * d.general / 1e6); });
    d3.selectAll('.pLine')
      .transition()
      .duration(500)
      .attr('d', pLine);

    // place the label
    d3.selectAll('.policyText')
      .transition()
      .duration(500)
      .attr('y', y(240))
  };

  // default to drawing percentages
  drawPercent();

  /* tooltip for displaying data on each item */
  var floating_tooltip = floatingTooltip('floatingTooltip', "350px");

  function showFloatingTooltip(d) {
    // get the active view
    view = d3.select('#view_toolbar').selectAll('.btn').filter('.active').attr('id');

    // set the height
    if (view=='percentages') {
      var y = d3.scaleLinear().rangeRound([graphHeight, 0]).domain([0, 0.10]);
      var h = y(d.reserve_pct);
    } else if (view=='values') {
      var y = d3.scaleLinear().rangeRound([graphHeight, 0]).domain([0, 500]);
      var h = y(d.reserves / 1e6);
    }

    // outline the bar for that year
    graph.append('rect')
      .attr('class', 'outline')
      .attr('x', x(d.year))
      .attr('y', h)
      .attr('width', x.bandwidth())
      .attr('height', graphHeight - h)
      .attr('fill', 'none')
      .attr('stroke', 'black')
      .attr('stroke-width', 2);

    var content = '<span class="heading"><p style="text-align: center">Fiscal Year ' + d.year + '</p></span>' +
                  '<table><tr><td>Beginning of year reserves</td><td style="text-align: center">' + formatAmount(d.reserves) + '</td></tr>' +
                  '<tr><td>Budgeted General Fund receipts</td><td style="text-align: center">' + formatAmount(d.general) + '</td></tr></table>';

    // display tooltip
    floating_tooltip.revealTooltip(content, d3.event);
  }

  // Sets up the buttons to allow for toggling between modes
  d3.selectAll('.btn-group')
    .selectAll('.btn')
    .on('click', function() {
        // set all buttons on the clicked toolbar as inactive, then activate the clicked button
        var p = d3.select(this.parentNode);
        p.selectAll('.btn').classed('active', false);
        d3.select(this).classed('active', true);
  
        // toggle
        if (d3.select(this).attr('id')=='percentages') {
          drawPercent();
        } else if (d3.select(this).attr('id')=='values') {
          drawValues();
        }
      });

}

d3.csv("reserves.csv", function(d) {
  d.year = +d.fiscal_year;
  d.reserve_pct = +d.reserve_pct;
  d.reserves = +d.begin_reserves;
  d.general = +d.budget_general;
  return d;
}, plotData);

