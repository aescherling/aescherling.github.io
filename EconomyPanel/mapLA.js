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

// draw the box around the SVG
// bb = map_svg.append('rect')
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

// create a global version of the crossfilter, just for debugging purposes
//var cf;
var myVar;

// wait until all the data is loaded before proceeding
queue()
  .defer(d3.json, 'geodata/council_districts.geojson')
  .defer(d3.csv, 'data/2017.10_city_data.csv')
  .await(map_ready)

function map_ready(error, geodata, econdata) {
  if (error) throw error;

  // geodata //
  var geofeatures = geodata.features;

  // set up crossfilter on the econdata //
  var data = crossfilter(econdata); //cf=data;
  var locality = data.dimension(function (d) {
    return d["locality"];
  });

  var category = data.dimension(function(d) {
    return d["category"];
  })

  var indicator = data.dimension(function (d) {
    return d["indicator"];
  });

  var gender = data.dimension(function (d) {
    return d["gender"];
  });

  var subindicator = data.dimension(function (d) {
    return d["sub_indicator"];
  });

  var year = data.dimension(function (d) {
    return d["calendar_year"];
  });

  var value = data.dimension(function (d) {
  	return +d["value"];
  });


  // initial settings for the map //
  mapLayer.selectAll('path')
      .data(geofeatures)
      .enter().append('path')
      .attr('d', path)
      .attr('id', function (d) {return d.properties.Council_District.replace(/\s/g, '');})
      .attr('label', function (d) {return d.properties.Council_District;})
      .attr('councilmember', function (d) {return d.properties.Councilmember;})
      .attr('value', '')
      .attr('valueLabel', '')
      .classed('selected', false)
      .classed('frozen', false)
      .classed('district', true)
      .attr('vector-effect', 'non-scaling-stroke')
      .style('fill', 'white')
      .style('stroke', 'gray')
      .style('cursor', 'pointer')
      .on('click', mouseclick)
      .on('mouseover', mouseover)
      .on('mouseout', mouseout)
      .attr('opacity', 0.8);


  // color scale
  var color = d3.scalePow().exponent(0.5).range(['white', 'steelblue']);

  // function for updating the color scale
  // assumes that the data have been filtered to a single variable and a particular time period
  // use all available time periods for the selected indicator/subindicator
  // use Council District values only (not the city total)
  var updateColor = function() {
    // get time filter
    time_setting = d3.select('#timeToggleLabel').text();
    // undo the time filter
    year.filterAll();
    // filter out the City data
    locality.filter(function (d) {return d!= "City of Los Angeles"});
    // get the min and max values
    minValue = value.bottom(1)[0].value;
    maxValue = value.top(1)[0].value;
    // set the color domain
    color.domain([minValue, maxValue]);
    // undo the locality filter
    locality.filterAll();
    // redo the time filter
    year.filter(time_setting);
  }

  // function for updating the map.
  // assumes that the data have been filtered to a single variable and a particular time period
  // assumes that a color scale has already been set (and is available as "color" in the map_ready namespace)
  var updateMap = function() {
    var values = locality.group().reduceSum(function (d) {
      return +d["value"];
    });
    var valueArray = values.all();
    var kk = [];
    var valuesByDistrict = [];
    valueArray.forEach(function (d, i) {kk[i] = d.key; valuesByDistrict[i] = d.value});
    if (kk.length != 16) {
      alert(kk.length);
    }

    var cityIndex = kk.indexOf('City of Los Angeles');
    var cdOnly = valuesByDistrict.slice();
    cdOnly.splice(cityIndex, 1);

    // In the future I may need to make this more complex to do proper rounding, formatting
    getValue = function(d) {
      myValue = valuesByDistrict[kk.indexOf(d.properties.Council_District)];
      return myValue;
    }

    getColor = function (d) {
      myColor = color(valuesByDistrict[kk.indexOf(d.properties.Council_District)]);
      return myColor;
    }

    // // pick out all units with more than one observation using the current filters
    // getUnits = function(d) {

    //   // set up a units filter
    //   var units = data.dimension(function (d) {
    //     return d["unit_of_measure"];
    //   });

    //   unitCounts = units.group().reduceCount().all().filter(function (d) {return d.value > 0});
    //   units_tmp = unitCounts.map(function (d) {return d.key});

    //   // remove the units filter
    //   units.dispose();

    //   return(units_tmp[0])
    // }

    // // pick out all descriptions with more than one observation using the current filters
    // getDesc = function(d) {
    //   // set up a description filter
    //   var desc = data.dimension(function (d) {
    //     return d["unit_text"];
    //   });

    //   descCounts = desc.group().reduceCount().all().filter(function (d) {return d.value > 0});
    //   descs_tmp = descCounts.map(function (d) {return d.key});

    //   // remove the description filter
    //   desc.dispose();

    //   return(descs_tmp[0])
    // }

    mapLayer.selectAll('path')
      .attr('value', getValue)
      .attr('valueLabel', "I should probably get rid of this...")
      .style('fill', getColor);
  }

  // function for updating the time scale
  // assumes that the data have been filtered to a single variable
  var updateTimescale = function() {
    // pick out all time periods with more than one observation using the current filters
    timePeriodCounts = year.group().reduceCount().all().filter(function (d) {return d.value > 0});
    timePeriods = timePeriodCounts.map(function (d) {return d.key});

    // remove timeToggle if it exists, then add a new one
    d3.select('#timeToggleSVG').remove();
    d3.select('#timeToggleLabel').remove();
    var timeToggleSetup = make_timeToggle('#timeSparkline', '#timeLabel', timePeriods, year, updateColor, updateMap);
    timeToggleSetup();
  }



  // set up variable selectors //
  // NOTE: I HAVE TO SET UP A TIME PERIOD SELECTOR AS WELL

  // helper functions
  // reference: https://stackoverflow.com/questions/1801499/how-to-change-options-of-select-with-jquery
  removeOptions = function(selectId) {
    $(selectId + ' option:gt(0)').remove();
  }

  addOptions = function(selectId, options) {
    for (i=0; i<options.length; i++) {
      option = $('<option></option>').attr("value", options[i]).text(options[i].toLowerCase());
      $(selectId).append(option);
    }
  }



  // functionality for category selection //
  categories = category.group().all().map(function (d) {return d.key});
  addOptions('#selectCategory', categories);

  selectCategory = function(cat) {
    // remove indicator, subindicator, gender, and time filters
    year.filterAll();
    indicator.filterAll();
    subindicator.filterAll();
    gender.filterAll();
    
    
    // If they choose "-", remove the filter; otherwise filter using given category
    if (cat=="-") {
      category.filterAll();
      d3.select('#indicatorDiv').attr('style','display:none');
    } else {
      category.filter(cat);
      d3.select('#indicatorDiv').attr('style','display:inline-block');
    }

    // show the indicator selector (this was done above) and hide the other selectors
    d3.select('#subindicatorDiv').attr('style','display:none');
    d3.select('#genderDiv').attr('style','display:none');
    d3.select('#periodDiv').attr('style','display:none');

    // pick out all indicators with more than one observation using the current filters
    indicatorCounts = indicator.group().reduceCount().all().filter(function (d) {return d.value > 0});
    indicators = indicatorCounts.map(function (d) {return d.key});

    // change the options of the other selectors
    removeOptions('#selectIndicator');
    addOptions('#selectIndicator', indicators);

    // change the map to white
    mapLayer.selectAll('path')
      .style('fill', 'white');

    // delete legend
    d3.selectAll('.legend').remove();
  }

  $('#selectCategory').attr('onchange', "selectCategory(this.value);")



  // functionality for indicator selection // 
  indicators = indicator.group().all().map(function (d) {return d.key});
  addOptions('#selectIndicator', indicators);

  selectIndicator = function(ind) {
    // remove the filters that depend on this selection
    year.filterAll();
    subindicator.filterAll();
    gender.filterAll();
    
    // If they chose "-", remove the indicator filter.
    // Otherwise filter using given indicator.
    if (ind=="-") {
      indicator.filterAll();
    } else {
      indicator.filter(ind);
    }

    // check whether gender is an option
    genderCounts = gender.group().reduceCount().all().filter(function (d) {return d.value > 0});
    genders = genderCounts.map(function (d) {return d.key});
    hasGender = genders.length > 1;

    // check whether subindicator is an option
    subindicatorCounts = subindicator.group().reduceCount().all().filter(function (d) {return d.value > 0});
    subindicators = subindicatorCounts.map(function (d) {return d.key});
    hasSubindicator = subindicators.length > 1;

    // If they chose "-", hide gender and subindicator.
    // Otherwise proceed using the given filter.
    if (ind=="-") {
      d3.select('#genderDiv').attr('style','display:none');
      d3.select('#subindicatorDiv').attr('style','display:none');
    } else {
      // if gender is an option, show gender selector and update categories
      if (hasGender) {
        d3.select('#genderDiv').attr('style','display:inline-block');
        removeOptions('#selectGender');
        addOptions('#selectGender', genders);
      } else {
        d3.select('#genderDiv').attr('style','display:none');
      }

      // if subindicator is an option, show selector and update categories
      if (hasSubindicator) {
        d3.select('#subindicatorDiv').attr('style','display:inline-block');
        removeOptions('#selectSubindicator');
        addOptions('#selectSubindicator', subindicators);
      } else {
        d3.select('#subindicatorDiv').attr('style','display:none');
      }

      // if neither gender nor subindicator are options, update the map.
      // otherwise, make it white
      if (!hasGender & !hasSubindicator) {
        updateTimescale();
        updateColor();
        d3.selectAll('.legend').remove();
        makeLegend(map_svg_width * 0.7, map_svg_height * 0.5, 30, 5, color);
        // updateMap();
      } else {
        mapLayer.selectAll('path').style('fill', 'white');
      }
    }

  }

  $('#selectIndicator').attr('onchange', "selectIndicator(this.value);")


  // functionality for subindicator selection //
    selectSubindicator = function(sub) {
    // remove gender and year filters
    year.filterAll();
    gender.filterAll();

    // if there are less than two genders, update the map (depending on selection).
    // otherwise, make each district white
    genderCounts = gender.group().reduceCount().all().filter(function (d) {return d.value > 0});
    genders = genderCounts.map(function (d) {return d.key});

    if (genders.length < 2) {
      // If they choose "-", simply remove the filter and make the map white.
      // Otherwise filter using given subindicator and plot
      if (sub=="-") {
        subindicator.filterAll();
        mapLayer.selectAll('path').style('fill', 'white');
        d3.selectAll('.legend').remove();
      } else {
        subindicator.filter(sub);
        updateTimescale();
        updateColor();
        d3.selectAll('.legend').remove();
        makeLegend(map_svg_width * 0.7, map_svg_height * 0.5, 30, 5, color);
        // updateMap();
      }
    } else {
      mapLayer.selectAll('path').style('fill', 'white');
    }

    
  }

  $('#selectSubindicator').attr('onchange', "selectSubindicator(this.value);")



  // functionality for gender selection //
    selectGender = function(sub) {
    // If they choose "-", simply remove the filter and make the map white.
    // Otherwise filter using given gender and plot.
    if (sub=="-") {
      gender.filterAll();
      mapLayer.selectAll('path')
        .style('fill', 'white');
      d3.selectAll('.legend').remove();
    } else {
      gender.filter(sub);
      updateTimescale();
      updateColor();
      d3.selectAll('.legend').remove();
      makeLegend(map_svg_width * 0.7, map_svg_height * 0.5, 30, 5, color);
      // updateMap();
    }
  }
  
  $('#selectGender').attr('onchange', "selectGender(this.value);")



  // function for making legends
  function makeLegend(x, y, size, n, scale) {
    // make the legend object
    legend = map_svg.append('g')
      .classed('legend', true);

    var yTmp = y - (n * size * 0.5);

    var legendValues = [];
    var scaleMin = scale.domain()[0];
    var scaleMax = scale.domain()[1];
    var delta = (scaleMax - scaleMin) / n;
    for (i=1; i<(n+1); i++) {
      legendValues[i-1] = Math.round(scaleMin + delta * i);
    }
    var legendColors = legendValues.map(function (d) {return scale(d)});

    // loop to place the items
    for (var i=0; i<n; i++){
      legend.append('rect')
        .attr('x', x)
        .attr('y', yTmp + size * i)
        .attr('width', size)
        .attr('height', size)
        .attr('fill', d3.rgb(legendColors[i]))
        .attr('stroke', d3.rgb(legendColors[i]));
      legend.append('text')
        .attr('x', x + 1.5 * size)
        .attr('y', 4 + size/2 + yTmp + size * i)
        .attr('text-anchor', 'center')
        .attr('style', "font-size: " + d3.min([d3.max([10, (size / 2)]), 16]) + "px")
        .text(legendValues[i]);
    }
  }

}


// label council districts (appears upon mouseover)
cd_label = map_svg.append('text')
  .attr('x', map_svg_width - 200)
  .attr('y', 20)
  .attr('text-anchor','left')
  .attr('style', 'font-size: 16px; font-weight: bold')
  .text('');

cd_councilmember = map_svg.append('text')
  .attr('x', map_svg_width - 200)
  .attr('y', 40)
  .attr('text-anchor','left')
  .attr('style', 'font-size: 16px')
  .text('');

cd_value = map_svg.append('text')
  .attr('x', map_svg_width - 200)
  .attr('y', 60)
  .attr('text-anchor','left')
  .attr('style', 'font-size: 16px')
  .text('');

cd_value_label = map_svg.append('text')
  .attr('x', map_svg_width - 200)
  .attr('y', 80)
  .attr('text-anchor','left')
  .attr('style', 'font-size: 12px')
  .text('');

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
    d3.selectAll('.district').style('stroke', 'gray');
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
    value_tmp = +d3.select(this).attr('value')
    value_text = "value: " + Math.round(value_tmp);
    cd_label.text(district_text);
    cd_councilmember.text(councilmember_text);
    cd_value.text(value_text);
    cd_value_label.text(d3.select(this).attr('valueLabel'));
  }
}

mouseout = function() {
  isFrozen = d3.select(this).classed('frozen');
  if (!isFrozen) {
	  d3.select(this).style('stroke', 'gray');
    cd_label.text('');
    cd_councilmember.text('');
    cd_value.text('');
    cd_value_label.text('');
  }
}

// http://bl.ocks.org/eesur/4e0a69d57d3bfc8a82c2
d3.selection.prototype.moveToFront = function() {  
  return this.each(function(){
    this.parentNode.appendChild(this);
  });
};



