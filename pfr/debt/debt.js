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
  y.domain([0, 0.16]);

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

  // total debt (although only approved debt will be visible)
  // on mouseover, outlines whole bar.
  graph.selectAll('tBar')
    .data(data)
    .enter().append('rect')
    .attr('class', 'bar tBar')
    .attr('x', function(d) {return x(d.year)})
    .attr('y', function(d) {return y(d.totalDebtPct)})
    .attr('width', x.bandwidth())
    .attr('height', function(d) {return graphHeight - y(d.totalDebtPct); })
    .attr('fill', 'skyblue')
    .on('mouseenter', showFloatingTooltip)
    .on('mouseleave', function() {
      graph.select('.outline').remove();
      floating_tooltip.hideTooltip();
    });

  // bar for unapproved debt. on mouseover, outlines whole bar.
  graph.selectAll(".uBar")
    .data(data)
    .enter().append("rect")
      .attr("class", "bar uBar")
      .attr("x", function(d) { return x(d.year); })
      .attr("y", function(d) { return y(d.unapprovedDebtPct); })
      .attr("width", x.bandwidth())
      .attr("height", function(d) { return graphHeight - y(d.unapprovedDebtPct); })
      .attr('fill', 'steelblue')
      .on('mouseenter', showFloatingTooltip)
      .on('mouseleave', function() {
        graph.select('.outline').remove();
        floating_tooltip.hideTooltip();
      });

  /* draw debt caps */

  // non-voter approved debt cap
  graph.append('line')
    .attr('class', 'uLine')
    .attr('x1', x(2008))
    .attr('x2', x(2017) + x.bandwidth())
    .attr('y1', y(0.06))
    .attr('y2', y(0.06))
    .attr('stroke-dasharray', '5, 5')
    .attr('stroke', 'black');

  // text for non-voter approved debt cap.
  // extra work to find the bounding box and make it lighter
  drawLabel2 = function() {
    d3.selectAll('#label2').remove();

    myText = graph.append('text')
      .attr('id', 'label2')
      .attr('x', x(2017) + x.bandwidth())
      .attr('y', y(0.063))
      .attr('text-anchor', 'end')
      .attr('fill', 'white')
      .attr('font-size', axisTextSize)
      .text('Non-voter approved debt cap');

    var bbox = myText.node().getBBox();

    myRect = graph.append("rect")
      .attr('id', 'label2')
      .attr("x", bbox.x)
      .attr("y", bbox.y)
      .attr("width", bbox.width)
      .attr("height", bbox.height)
      .style("fill", "white")
      .style("opacity", ".5");

    myText.remove();
    myText = graph.append('text')
      .attr('id', 'label2')
      .attr('x', x(2017) + x.bandwidth())
      .attr('y', y(0.063))
      .attr('text-anchor', 'end')
      .attr('font-size', axisTextSize)
      .text('Non-voter approved debt cap');
  }
  drawLabel2();

  // voter approved debt cap
  graph.append('line')
    .attr('class', 'tLine')
    .attr('x1', x(2008))
    .attr('x2', x(2017) + x.bandwidth())
    .attr('y1', y(0.15))
    .attr('y2', y(0.15))
    .attr('stroke-dasharray', '2, 2')
    .attr('stroke', 'black');

  graph.append('text')
    .attr('x', x(2017) + x.bandwidth())
    .attr('y', y(0.152))
    .attr('text-anchor', 'end')
    .attr('font-size', axisTextSize)
    .text('Total debt cap');

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
    .text('Voter approved debt');

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
    .text('Non-voter approved debt');

  /* tooltip for displaying data on each item */
  var floating_tooltip = floatingTooltip('floatingTooltip', "315px");

  function showFloatingTooltip(d) {

    // outline the bar for that year
    graph.append('rect')
      .attr('class', 'outline')
      .attr('x', x(d.year))
      .attr('y', y(d.totalDebtPct))
      .attr('width', x.bandwidth())
      .attr('height', graphHeight - y(d.totalDebtPct))
      .attr('fill', 'none')
      .attr('stroke', 'black')
      .attr('stroke-width', 2);

    // redraw the label for the non-voter approved debt cap
    drawLabel2();

    var content = '<span class="heading"><p style="text-align: center">Fiscal Year ' + d.year + '</p></span>' +
                  '<table><tr><td style="font-style: italic">Debt service requirements</td><td></td></tr>' + 
                  '<tr><td style="padding: 0px 10px 0px 20px">Voter approved debt</td><td style="text-align: center">' + formatAmount(d.approvedDebt) + '</td></tr>' +
                  '<tr><td style="padding: 0px 10px 0px 20px">Non-voter approved debt</td><td style="text-align: center">' + formatAmount(d.unapprovedDebt) + '</td></tr>' + 
                  '<tr><td style="padding: 0px 10px 0px 20px">Total</td><td style="text-align: center">' + formatAmount(d.totalDebt) + '</td></tr>' + 
                  '<tr><td style="font-style: italic">General fund receipts</td><td style="text-align: center">' + formatAmount(d.receipts) + '</td></table>';
    // display tooltip
    floating_tooltip.revealTooltip(content, d3.event);
  }


}

d3.csv("debt.csv", function(d) {
  d.year = +d.Fiscal_Year;
  d.unapprovedDebt = +d.Non_Voter_Approved_Debt;
  d.approvedDebt = +d.Voter_Approved_Debt;
  d.totalDebt = +d.Total_Debt;
  d.receipts = +d.General_Fund_Receipts;
  d.unapprovedDebtPct = +d.Non_Voter_Approved_Debt_Percent;
  d.approvedDebtPct = +d.Voter_Approved_Debt_Percent;
  d.totalDebtPct = +d.Total_Debt_Percent;
  d.unapprovedDebtCap = +d.Non_Voter_Approved_Debt_Cap;
  d.approvedDebtCap = +d.Voter_Approved_Debt_Cap;
  d.totalDebtCap = +d.Total_Debt_Cap;
  return d;
}, plotData);

