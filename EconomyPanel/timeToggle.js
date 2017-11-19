function make_timeToggle(elemId, numId, data, timeFilter, update, width=100, height=20, textwidth=40, margin=5) {

	data_json = data.map(function(d,i) {return {'x':i, 'y':d}});

    var x = d3.scaleLinear().range([0, width - 2*margin]);
    // var y = d3.scaleLinear().range([height - 2*margin, 0]);
    var y = d3.scaleLinear().range([height/2, height/2]);

    var line = d3.line()
               .x(function(d, i) { return x(i); })
               .y(function(d) { return y(d.y); });

    x.domain(d3.extent(data_json, function(d, i) { return i; }));
    y.domain(d3.extent(data_json, function(d) { return d.y; }));

    var max_index = d3.extent(data_json, function(d, i) { return i; })[1];

    var svg = d3.select(elemId)
      .append('svg')
      .attr('id', 'timeToggleSVG')
      .attr('width', width)
      .attr('height', height)
      .append('g')
      .attr('class', 'timeToggle')
      .attr('transform', 'translate(' + margin + ',' + margin + ')');

    var path = svg.append('path')
      .datum(data_json)
      .attr('d', line);

    var focus = svg.append("g")
        .attr("class", "focus");

    var dot = focus.append("circle")
        .attr('cx', x(data_json.length - 1))
        .attr('cy', y(data_json[data_json.length - 1].y))
        .attr("r", 3);

  timeToggle = function() {
    svg.append("rect")
        .attr("class", "overlay")
        .attr("width", width)
        .attr("height", height)
        .on("mousemove", mousemove);

    function mousemove() {
      var i = Math.min(Math.round(x.invert(d3.mouse(this)[0])), max_index);
      focus.select('circle').attr('cx', x(i)).attr('cy', y(data_json[i].y));
      d3.select(numId).select("text").text(data_json[i].y);

      // using crossfilter, filter the data on the chosen time period
      timeFilter.filter(data_json[i].y);

      // update the map
      update();
    }

    d3.select(numId)
      .append('svg')
      .attr('id', 'timeToggleLabel')
      .attr('width', textwidth)
      .attr('height', height)
      .append('text')
      .attr('x', 0)
      .attr('y', height)
      .attr('text-anchor', 'left')
      .attr('style', 'font-size:13px')
      .attr('fill', 'steelblue')
      .text(data_json[data_json.length - 1].y);

     update();
  }

  // append properties of the graph to the function for later use
  timeToggle.dot = dot;
  timeToggle.x = x;
  timeToggle.y = y;
  timeToggle.data = data_json;

  // this currently isn't connected to anything, but it works. the 
  // idea is to make an external function for changing the info.
  // try to sync all the timeToggle dates?
  // timeToggle.changeSelection = function(index){
  //   dot.attr('cx', x(index)).attr('cy', y(data[index]));
  // 	d3.selectAll(numId).select('text').text(data[index]);
  // }

  return timeToggle;
}