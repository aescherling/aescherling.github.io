// some inspiration drawn from https://bl.ocks.org/john-guerra/43c7656821069d00dcbc
// and https://bl.ocks.org/mbostock/4060606

// also of some interest: square mileage of each CD.
// some variables (e.g. population) should be mapped per square mile 
// http://documents.lahsa.org/planning/homelesscount/2009/CityofLA-CouncilDistricts.pdf

// set some variables
var map_svg_width=450,
	map_svg_height=450,
  map_zoom = 8.5,
  map_long = -118.25,
  map_lat = 34.02;

// make the SVG canvas
map_svg = d3.select('#map_div')
	.append('svg')
	.attr('width', map_svg_width)
	.attr('height', map_svg_height);


//d3.selectAll("svg").append("svg:image")
//      .attr("xlink:href", "http://www.e-pint.com/epint.jpg")
//      .attr("width", 150)
//      .attr("height", 200);

// https://api.mapbox.com/v4/mapbox.light/-118.35,34.02,10/600x450.png?access_token=pk.eyJ1IjoiYWVzY2hlcmxpbmciLCJhIjoiY2o4cTRsdXdhMGVvbzJ4b3gwb3lmMDR6bCJ9.BpnZvVcHTuDFiTo9ngzQiw
// https://api.mapbox.com/styles/v1/mapbox/light-v9/static/-118.35,34.02,9.5,0,0/600x600?access_token=pk.eyJ1IjoiYWVzY2hlcmxpbmciLCJhIjoiY2o4cTRsdXdhMGVvbzJ4b3gwb3lmMDR6bCJ9.BpnZvVcHTuDFiTo9ngzQiw
//d3.select("#map_div").select('svg')
//  .append("svg:image")
//  .attr("xlink:href", "https://api.mapbox.com/styles/v1/mapbox/light-v9/static/" + map_long + "," + map_lat + "," + map_zoom + ",0,0/300x450?access_token=pk.eyJ1IjoiYWVzY2hlcmxpbmciLCJhIjoiY2o4cTRsdXdhMGVvbzJ4b3gwb3lmMDR6bCJ9.BpnZvVcHTuDFiTo9ngzQiw")
//  .attr("width", map_svg_width)
//  .attr("height", map_svg_height);

// draw the box around the SVG
//bb = map_svg.append('rect')
//  .attr('x', 0)
//  .attr('y', 0)
//  .attr('width', map_svg_width)
//  .attr('height', map_svg_height)
//  .attr('stroke', 'black')
//  .attr('fill', 'none');

// tooltip for displaying data on each district
//var floating_tooltip = floatingTooltip('floatingTooltip', "250px");

// make a group for holding map elements
var mapLayer = map_svg.append('g')
  .classed('map-layer', true);

// projection for the map
var projection = d3.geoMercator()
  .scale((512) * 0.5 / Math.PI * Math.pow(2, +map_zoom))
  .center([+map_long, +map_lat])
  .translate([map_svg_width / 2, map_svg_height / 2]);

// path function for drawing council districts
var path = d3.geoPath()
  .projection(projection);

// wait until all the data is loaded before proceeding
queue()
  .defer(d3.json, 'geodata/council_districts.geojson')
  .defer(d3.csv, 'data/2017.04_Population2015.csv')
  .await(map_ready)

function map_ready(error, geodata, econdata) {
  if (error) throw error;

  // mapbox stuff
  //mapboxgl.accessToken = 'pk.eyJ1IjoiYWVzY2hlcmxpbmciLCJhIjoiY2o4cTRsdXdhMGVvbzJ4b3gwb3lmMDR6bCJ9.BpnZvVcHTuDFiTo9ngzQiw';
  //var map = new mapboxgl.Map({
  //container: 'map',
  //style: 'mapbox://styles/mapbox/light-v9',
  //center: [-118.2, 34],
  //zoom: 8
  //}).resize();
  //

  var features = geodata.features;

  //var popByDistrict = {};
  //econdata.forEach(function(d) { popByDistrict[+d.council_district] = +d.value; });

  var popByDistrict = {};
  econdata.forEach(function(d) { popByDistrict[+d.council_district] = +d.density; });

  //var color = d3.scaleLinear()
  //  //.domain([d3.min(Object.values(popByDistrict)), d3.max(Object.values(popByDistrict))])
  //  .domain([200000, 300000])
  //  .range(['white', 'steelblue']);

  var color = d3.scalePow()
    .exponent(0.5)
    .domain([0, 20000])
    .range(['white', 'steelblue']);

  getColor = function (d) {
    myColor = color(popByDistrict[d.properties.Council_District]);
    return myColor;
  }

  // Draw each district as a path
  //var container = map.getCanvasContainer();
  //var svg = d3.select(container).append("svg").attr('id', 'mapbox_svg');
  //svg.selectAll('path')
  //  .data(features)
  //  .enter().append('path')
  //  .attr('d', path)
  //  .attr('id', function (d) {return "District" + d.properties.Council_District;})
  //  .classed('district', true)
  //  .attr('vector-effect', 'non-scaling-stroke')
  //  .style('fill', function (d) {return color(popByDistrict[d.properties.Council_District]);})
  //  .style('stroke', 'white')
  //  .on('click', mouseclick)
  //  .on('mouseover', mouseover)
  //  .on('mouseout', mouseout);

  mapLayer.selectAll('path')
      .data(features)
      .enter().append('path')
      .attr('d', path)
      .attr('id', function (d) {return "District" + d.properties.Council_District;})
      .attr('label', function (d) {return "Council District " + d.properties.Council_District;})
      .attr('councilmember', function (d) {return d.properties.Councilmember;})
      .classed('selected', false)
      .classed('frozen', false)
      .classed('district', true)
      .attr('vector-effect', 'non-scaling-stroke')
      .style('fill', function (d) {return color(popByDistrict[d.properties.Council_District]);})
      .style('stroke', 'white')
      .style('cursor', 'pointer')
      .on('click', mouseclick)
      .on('mouseover', mouseover)
      .on('mouseout', mouseout)
      .attr('opacity', 0.8);

  // function for making legends
  function makeLegend(x, y, size, colors, labels) {
    // make the legend object
    legend = map_svg.append('g')
      .classed('legend', true);

    // # of items in the legend
    var n = colors.length;

    var yTmp = y - (n * size * 0.5);

    // legend title
    legend.append('text')
      .attr('x', x)
      .attr('y', yTmp - size)
      .text('Population per');
    legend.append('text')
      .attr('x', x)
      .attr('y', yTmp - size * 0.4)
      .text('sq. mile');

    // loop to place the items
    for (var i=0; i<n; i++){
      legend.append('rect')
        .attr('x', x)
        .attr('y', yTmp + size * i)
        .attr('width', size)
        .attr('height', size)
        .attr('fill', d3.rgb(colors[i]))
        .attr('stroke', d3.rgb(colors[i]));
      legend.append('text')
        .attr('x', x + 1.5 * size)
        .attr('y', 4 + size/2 + yTmp + size * i)
        .attr('text-anchor', 'center')
        .attr('style', "font-size: " + d3.min([d3.max([10, (size / 2)]), 16]) + "px")
        .text(labels[i]);
    }
  }

  //makeLegend(map_svg_width * 0.7, map_svg_height * 0.5, 30, 
  //      [color(3e5), color(2.9e5), color(2.8e5), color(2.7e5), color(2.6e5),
  //       color(2.5e5), color(2.4e5), color(2.3e5), color(2.2e5), color(2.1e5)], 
  //      ['300,000', '290,000', '280,000', '270,000', '260,000', '250,000', '240,000', '230,000', '220,000', '210,000']);

  makeLegend(map_svg_width * 0.7, map_svg_height * 0.5, 30, 
        [color(2e4), color(1e4), color(0.5e4), color(0.25e4), color(0.125e4), color(0.0625e4)],
        ['20,000', '10,000','5,000','2,500', '1,250', '625']);

}

// label council districts
cd_label = map_svg.append('text')
  .attr('x', map_svg_width - 220)
  .attr('y', 20)
  .attr('text-anchor','left')
  .attr('style', 'font-size: 16px; font-weight: bold')
  .text('');
cd_councilmember = map_svg.append('text')
  .attr('x', map_svg_width - 220)
  .attr('y', 40)
  .attr('text-anchor','left')
  .attr('style', 'font-size: 16px')
  .text('');

  // label council districts
//  mapLayer.append("g")
//    .attr("class", "label")
//    .selectAll("text")
//    .data(features)
//    .enter()
//    .append("text")
//  	.attr('id', function (d) {return "label" + d.properties.Council_District;})
//    .text(function(d){
//      return d.properties.Council_District;
//    })
//    .attr("x", function(d){
//        return path.centroid(d)[0];
//    })
//    .attr("y", function(d){
//        return  path.centroid(d)[1];
//    })
//    .attr("text-anchor","middle")
//    .attr('fill', 'black');


/* 
Helper functions
*/

// Get council district
function getDistrict(d){
  return d.properties.Council_District;
}

// Get district color
function fillFn(d){
  return color(getDistrict(d));
}

mouseclick = function() {
  isSelected = d3.select(this).classed('selected');
  if (isSelected) {
    d3.select(this).classed('selected', false);
    d3.selectAll('.district').classed('frozen', false);
  } else {
    d3.selectAll('.district').classed('selected', false);
    d3.select(this).classed('selected', true);
    d3.selectAll('.district').style('stroke', 'white');
    district = d3.select(this);
    district.moveToFront().style('stroke', 'black');
    district_text = d3.select(this).attr('label');
    councilmember_text = d3.select(this).attr('councilmember');
    cd_label.text(district_text);
    cd_councilmember.text(councilmember_text);
    d3.selectAll('.district').classed('frozen', true);
  }
}

mouseover = function() {
  isFrozen = d3.select(this).classed('frozen');
  if (!isFrozen) {
	  district = d3.select(this);
	  //d3.select('#label' + districtNo(districtTmp)).remove();
	  district.moveToFront().style('stroke', 'black');
    district_text = d3.select(this).attr('label');
    councilmember_text = d3.select(this).attr('councilmember');
    cd_label.text(district_text);
    cd_councilmember.text(councilmember_text);
  }
}

mouseout = function() {
  isFrozen = d3.select(this).classed('frozen');
  if (!isFrozen) {
	  d3.select(this).style('stroke', 'white');
    cd_label.text('');
    cd_councilmember.text('');
  }
}

// http://bl.ocks.org/eesur/4e0a69d57d3bfc8a82c2
d3.selection.prototype.moveToFront = function() {  
  return this.each(function(){
    this.parentNode.appendChild(this);
  });
};


