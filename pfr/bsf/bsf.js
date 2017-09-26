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

var graphMargin = {top: 20, right: width * 0.4, bottom: 20, left: 50},
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
  y.domain([0, 0.12]);

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
      .call(d3.axisLeft(y).ticks(6, "%"));

  /* draw bars */

  // total funds (although only Reserve Fund will be visible)
  // on mouseover, outlines whole bar.
  graph.selectAll('tBar')
    .data(data)
    .enter().append('rect')
    .attr('class', 'bar tBar')
    .attr('x', function(d) {return x(d.year)})
    .attr('y', function(d) {return y(d.total_pct)})
    .attr('width', x.bandwidth())
    .attr('height', function(d) {return graphHeight - y(d.total_pct); })
    .attr('fill', 'skyblue')
    .on('mouseenter', showFloatingTooltip)
    .on('mouseleave', function() {
      graph.select('.outline').remove();
      floating_tooltip.hideTooltip();
    });

  // bar for BSF. on mouseover, outlines whole bar.
  graph.selectAll(".bsfBar")
    .data(data)
    .enter().append("rect")
      .attr("class", "bar bsfBar")
      .attr("x", function(d) { return x(d.year); })
      .attr("y", function(d) { return y(d.bsf_pct); })
      .attr("width", x.bandwidth())
      .attr("height", function(d) { return graphHeight - y(d.bsf_pct); })
      .attr('fill', 'steelblue')
      .on('mouseenter', showFloatingTooltip)
      .on('mouseleave', function() {
        graph.select('.outline').remove();
        floating_tooltip.hideTooltip();
      });

  // make legend
  legend = graph.append('g');
  legendX = width * 0.6;
  legendY = graphHeight * 0.25
  legendSize = 0.8 * x.bandwidth();

  // voter-approved debt
  legend.append('rect')
    .attr('x', legendX)
    .attr('y', legendY + legendSize)
    .attr('width', legendSize)
    .attr('height', legendSize)
    .attr('fill', 'skyblue');

  legend.append('text')
    .attr('x', legendX + 1.5 * legendSize)
    .attr('y', legendY + 1.6 * legendSize)
    .attr('font-size', axisTextSize)
    .text('Reserve Fund');

  // non-voter-approved debt
  legend.append('rect')
    .attr('x', legendX)
    .attr('y', legendY + 2.5 * legendSize)
    .attr('width', legendSize)
    .attr('height', legendSize)
    .attr('fill', 'steelblue');

  legend.append('text')
    .attr('x', legendX + 1.5 * legendSize)
    .attr('y', legendY + 3.1 * legendSize)
    .attr('font-size', axisTextSize)
    .text('Budget Stabilization Fund');

  /* tooltip for displaying data on each item */
  var floating_tooltip = floatingTooltip('floatingTooltip', "375px");

  function showFloatingTooltip(d) {

    // outline the bar for that year
    graph.append('rect')
      .attr('class', 'outline')
      .attr('x', x(d.year))
      .attr('y', y(d.total_pct))
      .attr('width', x.bandwidth())
      .attr('height', graphHeight - y(d.total_pct))
      .attr('fill', 'none')
      .attr('stroke', 'black')
      .attr('stroke-width', 2);

    var content = '<span class="heading"><p style="text-align: center">Fiscal Year ' + d.year + '</p></span>' +
                  '<table><tr><td style="font-style: italic">Beginning of year funds:</td><td style="text-align: center">Value</td><td style="text-align: center">Percent</td></</tr>' + 
                  '<tr><td style="padding: 0px 10px 0px 20px">Budget Stabilization Fund</td><td style="text-align: center">' + formatAmount(d.bsf) + '</td><td style="text-align: center">' + formatPercent(100 * d.bsf_pct) + '</td></tr>' +
                  '<tr><td style="padding: 0px 10px 0px 20px">Reserve Fund</td><td style="text-align: center">' + formatAmount(d.reserve) + '</td><td style="text-align: center">' + formatPercent(100 * d.reserve_pct) + '</td></tr>' + 
                  '<tr><td style="padding: 0px 10px 0px 20px">Total</td><td style="text-align: center">' + formatAmount(d.total) + '</td><td style="text-align: center">' + formatPercent(100 * d.total_pct) + '</td></tr>' + 
                  '<tr><td style="font-style: italic">General fund receipts</td><td style="text-align: center; font-style:italic">' + formatAmount(d.budget) + '</td><td style="text-align: center;font-style:italic">100%</td></table>';
    // display tooltip
    floating_tooltip.revealTooltip(content, d3.event);
  }


}

d3.csv("bsf.csv", function(d) {
  d.year = +d.fiscal_year;
  d.bsf = +d.begin_bsf;
  d.reserve = +d.begin_reserve;
  d.total = +d.begin_total;
  d.budget = +d.budget_general;
  d.bsf_pct = +d.bsf_pct;
  d.reserve_pct = +d.reserve_pct;
  d.total_pct = +d.total_pct;
  return d;
}, plotData);

