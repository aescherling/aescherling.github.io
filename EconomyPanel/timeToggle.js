function make_timeToggle(elemId, numId, data, format, width=60, height=20, textwidth=110, margin=5) {

    var x = d3.scaleLinear().range([0, width - 2*margin]);
    var y = d3.scaleLinear().range([height - 2*margin, 0]);

    var line = d3.line()
               .x(function(d, i) { return x(i); })
               .y(function(d) { return y(d.y); });

    x.domain(d3.extent(data));
    y.domain([0,0]);

    var max_index = d3.extent(data)[1];

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

  timeToggle = function() {
    svg.append("rect")
        .attr("class", "overlay")
        .attr("width", width)
        .attr("height", height)
        .on("mousemove", mousemove);

    function mousemove() {
      var i = Math.min(Math.round(x.invert(d3.mouse(this)[0])), max_index);
      focus.select('circle').attr('cx', x(i)).attr('cy', y(0));
      d3.select(numId).select("text").text(data[i]);
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
      .text(data[data.length - 1]);
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
    dot.attr('cx', x(index)).attr('cy', y(data[index]));
  	d3.selectAll(numId).select('text').text(data[index]);
  }

  return timeToggle;
}