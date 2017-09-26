// inspiration from https://bl.ocks.org/mbostock/3885304

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


plotData = function(error, data, dataType) {
  if (error) throw error;

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
      .call(d3.axisLeft(y).ticks(10, "%"));

  /* draw bars */

  // year-beginning reserves as % of budgeted general fund receipts
  graph.selectAll('.bar')
    .data(data)
    .enter().append('rect')
    .attr('class', 'bar')
    .attr('x', function(d) {return x(d.year)})
    .attr('y', function(d) {return y(d.reserve_pct)})
    .attr('width', x.bandwidth())
    .attr('height', function(d) {return graphHeight - y(d.reserve_pct); })
    .on('mouseenter', showFloatingTooltip)
    .on('mouseleave', function() {
      graph.select('.outline').remove();
      floating_tooltip.hideTooltip();
    });

  /* draw reserve fund policy line */
  graph.append('line')
    .attr('class', 'tLine')
    .attr('x1', x(2009))
    .attr('x2', x(2018) + x.bandwidth())
    .attr('y1', y(0.05))
    .attr('y2', y(0.05))
    .attr('stroke-dasharray', '5, 5')
    .attr('stroke', 'black');

  graph.append('text')
    .attr('x', x(2009))
    .attr('y', y(0.052))
    .attr('font-size', axisTextSize)
    .text('5% Reserve Fund policy');

  /* tooltip for displaying data on each item */
  var floating_tooltip = floatingTooltip('floatingTooltip', "350px");

  function showFloatingTooltip(d) {

    // outline the bar for that year
    graph.append('rect')
      .attr('class', 'outline')
      .attr('x', x(d.year))
      .attr('y', y(d.reserve_pct))
      .attr('width', x.bandwidth())
      .attr('height', graphHeight - y(d.reserve_pct))
      .attr('fill', 'none')
      .attr('stroke', 'black')
      .attr('stroke-width', 2);

    var content = '<span class="heading"><p style="text-align: center">Fiscal Year ' + d.year + '</p></span>' +
                  '<table><tr><td>Beginning of year reserves</td><td style="text-align: center">' + formatAmount(d.reserves) + '</td></tr>' +
                  '<tr><td>Budgeted General Fund receipts</td><td style="text-align: center">' + formatAmount(d.general) + '</td></tr></table>';

    // display tooltip
    floating_tooltip.revealTooltip(content, d3.event);
  }

}

d3.csv("reserves.csv", function(d) {
  d.year = +d.fiscal_year;
  d.reserve_pct = +d.reserve_pct;
  d.reserves = +d.begin_reserves;
  d.general = +d.budget_general;
  return d;
}, plotData);

