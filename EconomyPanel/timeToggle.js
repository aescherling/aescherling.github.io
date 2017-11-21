function make_timeToggle(elemId, numId, data_json, timeFilter, updateColor, updateMap, width=200, height=20, textwidth=55, margin=5) {

    var x = d3.scaleLinear().range([0, width - 2*margin]);

    // change the y range depending on the input (if it sums to zero, make the range constant)
    ySum = d3.sum(data_json.map(function (d) {return d.value}))
    if (ySum==0) {
      var y = d3.scaleLinear().range([height/2, height/2]);
    } else {
      var y = d3.scaleLinear().range([height - margin, margin]);
    }

    var line = d3.line()
               .x(function(d, i) { return x(i); })
               .y(function(d) { return y(d.value); });

    x.domain(d3.extent(data_json, function(d, i) { return i; }));
    y.domain(d3.extent(data_json, function(d) { return +d.value; }));

    var max_index = d3.extent(data_json, function(d, i) { return i; })[1];

    var svg = d3.select(elemId)
      .append('svg')
      .attr('id', 'timeToggleSVG')
      .attr('width', width)
      .attr('height', height)
      .append('g')
      .attr('class', 'timeToggle')
      .attr('transform', 'translate(' + margin + ',0)');

    var path = svg.append('path')
      .datum(data_json)
      .attr('d', line);

    var focus = svg.append("g")
        .attr("class", "focus");

    var dot = focus.append("circle")
        .attr('cx', x(data_json.length - 1))
        .attr('cy', y(data_json[data_json.length - 1].value))
        .attr("r", 5);

  timeToggle = function() {
    svg.append("rect")
        .attr("class", "overlay")
        .attr("width", width)
        .attr("height", height)
        .on("mousemove", mousemove);

    function mousemove() {
      var i = Math.min(Math.round(x.invert(d3.mouse(this)[0])), max_index);
      focus.select('circle').attr('cx', x(i)).attr('cy', y(data_json[i].value));
      d3.select(numId).select("text").text(data_json[i].time);

      // using crossfilter, filter the data on the chosen time period
      timeFilter.filter(data_json[i].time);

      // update the map
      updateMap();
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
      .text(data_json[data_json.length - 1].time);

     // filter using the last date in the time period and update the map
     timeFilter.filter(data_json[data_json.length - 1].time);
     updateColor();
     updateMap();
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