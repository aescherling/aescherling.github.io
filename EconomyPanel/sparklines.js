
//var sparkline_svg = d3.select('#sparkline_header')
//                      .append('svg')
//                      .attr('width', 500)
//                      .attr('height', 100);
//
//var border = sparkline_svg.append('rect')
//                          .attr('height', 100)
//                          .attr('width', 500)
//                          .attr('fill', 'none')
//                          .attr('stroke', 'black');

var data1 = [{"x":2012,"y":1},{"x":2013,"y":4},{"x":2014,"y":-10},{"x":2015,"y":16},{"x":2016,"y":-25}];
var data2 = [{"x":2012,"y":7},{"x":2013,"y":50},{"x":2014,"y":-20},{"x":2015,"y":16},{"x":2016,"y":-2}];

// Population estimates from https://www2.census.gov/programs-surveys/popest/datasets/2010-2016/cities/totals/sub-est2016_6.csv
var cityPop = [{"x":2010, "y":3796292}, {"x":2011, "y":3825393}, {"x":2012, "y":3858137}, {"x":2013, "y":3890436}, {"x":2014, "y":3920173}, {"x":2015, "y":3949149}, {"x":2016, "y":3976322}]; 
//var cityPop = [{"x":2012,"y":3857786},{"x":2013,"y":3884340},{"x":2014,"y":3928827},{"x":2015,"y":3971896}];

// unemployment estimates from BLS, series id LAUCT064400000000003 (I calculated the annual average)
var cityUnemp = [{"x":2007, "y":5.7}, {"x":2008, "y":8.4}, {"x":2009, "y":12.8}, {"x":2010, "y":13.2}, {"x":2011, "y":12.9}, {"x":2012, "y":11.5}, {"x":2013, "y":10.3}, {"x":2014, "y":8.7}, {"x":2015, "y":7.0}, {"x":2016, "y":5.6}];
// var cityUnemp = [{"x":2012,"y":12.2},{"x":2013,"y":10.7},{"x":2014,"y":9},{"x":2015,"y":7.2}];
var cityIncome = [{"x":2012,"y":46803},{"x":2013,"y":48466},{"x":2014,"y":50544},{"x":2015,"y":52024}];

var msaPop = [{"x":2001, "y":12511444}, {"x":2002, "y":12614174}, {"x":2003, "y":12696619}, {"x":2004, "y":12734894}, {"x":2005, "y":12726363}, {"x":2006, "y":12670299}, {"x":2007, "y":12631943}, {"x":2008, "y":12692728}, {"x":2009, "y":12774670}, {"x":2010, "y":12845264}, {"x":2011, "y":12954534}, {"x":2012, "y":13064671}, {"x":2013, "y":13175920}, {"x":2014, "y":13262192}, {"x":2015, "y":13340034}];
var msaCpi = [{"x":"2000Q1", "y":169.2}, {"x":"2000Q2", "y":170.6}, {"x":"2000Q3", "y":172.3}, {"x":"2000Q4", "y":174.1}, {"x":"2001Q1", "y":175.2}, {"x":"2001Q2", "y":177.2}, {"x":"2001Q3", "y":178.4}, {"x":"2001Q4", "y":178.4}, {"x":"2002Q1", "y":180}, {"x":"2002Q2", "y":181.7}, {"x":"2002Q3", "y":182.8}, {"x":"2002Q4", "y":184.5}, {"x":"2003Q1", "y":186.7}, {"x":"2003Q2", "y":186.1}, {"x":"2003Q3", "y":187}, {"x":"2003Q4", "y":188}, {"x":"2004Q1", "y":190.2}, {"x":"2004Q2", "y":192.2}, {"x":"2004Q3", "y":193.5}, {"x":"2004Q4", "y":196.9}, {"x":"2005Q1", "y":197.6}, {"x":"2005Q2", "y":200.2}, {"x":"2005Q3", "y":203.2}, {"x":"2005Q4", "y":206.3}, {"x":"2006Q1", "y":207.8}, {"x":"2006Q2", "y":210.4}, {"x":"2006Q3", "y":211.6}, {"x":"2006Q4", "y":212}, {"x":"2007Q1", "y":215.2}, {"x":"2007Q2", "y":216.9}, {"x":"2007Q3", "y":216.9}, {"x":"2007Q4", "y":220.4}, {"x":"2008Q1", "y":222.6}, {"x":"2008Q2", "y":225.8}, {"x":"2008Q3", "y":227.9}, {"x":"2008Q4", "y":223.8}, {"x":"2009Q1", "y":221.7}, {"x":"2009Q2", "y":221.8}, {"x":"2009Q3", "y":224}, {"x":"2009Q4", "y":225.5}, {"x":"2010Q1", "y":225.3}, {"x":"2010Q2", "y":225.2}, {"x":"2010Q3", "y":225.6}, {"x":"2010Q4", "y":227.5}, {"x":"2011Q1", "y":230.5}, {"x":"2011Q2", "y":232.2}, {"x":"2011Q3", "y":231.6}, {"x":"2011Q4", "y":233.4}, {"x":"2012Q1", "y":235.2}, {"x":"2012Q2", "y":235.9}, {"x":"2012Q3", "y":236.7}, {"x":"2012Q4", "y":238.9}, {"x":"2013Q1", "y":239.4}, {"x":"2013Q2", "y":238.5}, {"x":"2013Q3", "y":238.9}, {"x":"2013Q4", "y":240}, {"x":"2014Q1", "y":241.4}, {"x":"2014Q2", "y":242.4}, {"x":"2014Q3", "y":243.2}, {"x":"2014Q4", "y":242.7}, {"x":"2015Q1", "y":241.9}, {"x":"2015Q2", "y":244.3}, {"x":"2015Q3", "y":245.8}, {"x":"2015Q4", "y":246.5}, {"x":"2016Q1", "y":247.7}, {"x":"2016Q2", "y":248.5}, {"x":"2016Q3", "y":249.4}, {"x":"2016Q4", "y":251.4}]; 
var msaGdpPer = [{"x":2001, "y":51466}, {"x":2002, "y":52490}, {"x":2003, "y":54219}, {"x":2004, "y":56566}, {"x":2005, "y":58077}, {"x":2006, "y":60561}, {"x":2007, "y":61898}, {"x":2008, "y":62583}, {"x":2009, "y":58927}, {"x":2010, "y":58642}, {"x":2011, "y":58439}, {"x":2012, "y":58666}, {"x":2013, "y":59851}, {"x":2014, "y":60837}, {"x":2015, "y":62826}]; 


// inspired by http://www.tnoda.com/blog/2013-12-19
// and https://bl.ocks.org/mbostock/3902569
function make_sparkline(elemId, numId, data, format, width=60, height=20, textwidth=110, margin=5) {

    // var width = 60;
    // var height = 20;
    // var textwidth = 110;
    // var margin = 5;
    var x = d3.scaleLinear().range([0, width - 2*margin]);
    var y = d3.scaleLinear().range([height - 2*margin, 0]);

    var line = d3.line()
               .x(function(d, i) { return x(i); })
               .y(function(d) { return y(d.y); });

    x.domain(d3.extent(data, function(d, i) { return i; }));
    y.domain(d3.extent(data, function(d) { return d.y; }));

    var max_index = d3.extent(data, function(d, i) { return i; })[1];

    var svg = d3.select(elemId)
      .append('svg')
      .attr('width', width)
      .attr('height', height)
      .append('g')
      .attr('class', 'sparkline')
      .attr('transform', 'translate(' + margin + ',' + margin + ')');

    var path = svg.append('path')
      .datum(data)
      .attr('d', line);

    var focus = svg.append("g")
        .attr("class", "focus");

    var dot = focus.append("circle")
        .attr('cx', x(data.length - 1))
        .attr('cy', y(data[data.length - 1].y))
        .attr("r", 3);

    var myFormat;
    if (format=="amount") {
      myFormat = formatAmount;
    } else if (format=="dollar") {
      myFormat = formatDollarAmount;
    } else if (format=="percent") {
      myFormat = formatPercent;
    }

  sparkline = function() {
    svg.append("rect")
        .attr("class", "overlay")
        .attr("width", width)
        .attr("height", height)
        .on("mousemove", mousemove);

    function mousemove() {
      var i = Math.min(Math.round(x.invert(d3.mouse(this)[0])), max_index);
      focus.select('circle').attr('cx', x(i)).attr('cy', y(data[i].y));
      d3.select(numId).select("text").text(data[i].x + ': ' + myFormat(data[i].y));
      //sparkline_test.changeSelection(i);
      //sparkline_test2.changeSelection(i);
      //sparkline_test3.changeSelection(i);
      //sparkline_test4.changeSelection(i);
      //sparkline_test5.changeSelection(i);
      //sparkline_test6.changeSelection(i);
    }

    d3.select(numId)
      .append('svg')
      .attr('width', textwidth)
      .attr('height', height)
      .append('text')
      .attr('x', 0)
      .attr('y', height)
      .attr('text-anchor', 'left')
      .attr('style', 'font-size:13px')
      .attr('fill', 'steelblue')
      .text(data[data.length - 1].x + ': ' + myFormat(data[data.length - 1].y));
  }

  // append properties of the graph to the function for later use
  sparkline.dot = dot;
  sparkline.x = x;
  sparkline.y = y;
  sparkline.data = data;

  // this currently isn't connected to anything, but it works. the 
  // idea is to make an external function for changing the info.
  // try to sync all the sparkline dates?
  sparkline.changeSelection = function(index){
    dot.attr('cx', x(data[index].x)).attr('cy', y(data[index].y));
  	d3.selectAll(numId).select('text').text(index + 1 + ': ' + myFormat(data[index].y));
  }

  return sparkline;
}

var cityPopSparkline = make_sparkline('#cityPopSparkline', '#cityPopNum', cityPop, 'amount');
cityPopSparkline();

var cityUnempSparkline = make_sparkline('#cityUnempSparkline', '#cityUnempNum', cityUnemp, 'amount', 60, 20, 70, 5);
cityUnempSparkline();

var cityIncomeSparkline = make_sparkline('#cityIncomeSparkline', '#cityIncomeNum', cityIncome, 'dollar');
cityIncomeSparkline();

var msaPopSparkline = make_sparkline('#msaPopSparkline', '#msaPopNum', msaPop, 'amount');
msaPopSparkline();

var msaCpiSparkline = make_sparkline('#msaCpiSparkline', '#msaCpiNum', msaCpi, 'amount');
msaCpiSparkline();

var msaGdpPerSparkline = make_sparkline('#msaGdpPerSparkline', '#msaGdpPerNum', msaGdpPer, 'dollar');
msaGdpPerSparkline();


