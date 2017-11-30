// some inspiration drawn from https://bl.ocks.org/john-guerra/43c7656821069d00dcbc
// and https://bl.ocks.org/mbostock/4060606

// also of some interest: square mileage of each CD.
// some variables (e.g. population) should be mapped per square mile 
// http://documents.lahsa.org/planning/homelesscount/2009/CityofLA-CouncilDistricts.pdf

// set some variables
var map_svg_width=700,
	map_svg_height=450,
  map_zoom = 8.5,
  map_long = -118,
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

// create some global variables for debugging purposes
// var cf;
var myVar;

// wait until all the data is loaded before proceeding
queue()
  .defer(d3.json, 'geodata/council_districts.geojson')
  .defer(d3.csv, 'data/EconomyPanel.csv')
  .await(map_ready)

function map_ready(error, geodata, econdata) {
  if (error) throw error;

  // geodata //
  var geofeatures = geodata.features;

  // set up crossfilter on the economic data
  var data = crossfilter(econdata);

  var category = data.dimension(function(d) {return d["category"];});
  var indicator = data.dimension(function (d) {return d["indicator"];});
  var gender = data.dimension(function (d) {return d["gender"];});
  var subindicator = data.dimension(function (d) {return d["sub_indicator"];});
  var time = data.dimension(function (d) {return d["calendar_year"];});
  var value = data.dimension(function (d) {return +d["value"];});

  var current_indicator = '';
  var current_subindicator = '';
  var selection_complete = false;
  var has_gender = false;
  var gender_selected = false;
  var subind_selected = false;

  // cf = data;

  rmCityOnly = function() {
    // Remove indicators which are city-level only.
    // to do so I keep only the indicators available for Council District 1
    var locality = data.dimension(function(d) {return d.locality});
    locality.filter('Council District 1');
    // pick out all indicators with more than one observation using the current filters
    CDindicatorCounts = indicator.group().reduceCount().all().filter(function (d) {return d.value > 0});
    CDindicators = CDindicatorCounts.map(function (d) {return d.key});
  
    // remove locality filter
    locality.filterAll();
    locality.dispose();
  
    // select indicators not in the list
    indicator.filter(function (d) {return CDindicators.indexOf(d)==-1});
    // remove them!
    data.remove();
    // undo the filter
    indicator.filterAll();
  }
  rmCityOnly();

  // map title variable
  mapTitle = d3.select('#mapTitle');
  mapTitle.text('NO VARIABLE SELECTED');


  mouseclick = function() {
    district = d3.select(this);
    // determine the prior state of the district (selected or not)
    isSelected = district.classed('selected');
    // if it's selected, unselect it
    if (isSelected) {
      district.classed('selected', false);
      d3.selectAll('.district').classed('frozen', false);
      d3.select('#table').selectAll('text').attr('style', 'font-weight:normal');
    } else {
      // unselect all districts then select the chosen district
      d3.selectAll('.district').classed('selected', false);
      d3.selectAll('.district').classed('highlighted', false);
      district.moveToFront().classed('selected', true);
      d3.select('#table').selectAll('text').attr('style', 'font-weight:normal');

      // update the display text
      district = district;
      district_text = district.attr('label');
      councilmember_text = district.attr('councilmember');
      cd_label.text(district_text);
      cd_councilmember.text(councilmember_text);

      // highlight the district in the table
      var locations = [{"long":"City of Los Angeles", "short":"City"},{"long": "Council District 1", "short":"CD1"},{"long": "Council District 2", "short":"CD2"},{"long": "Council District 3", "short":"CD3"},{"long": "Council District 4", "short":"CD4"},{"long": "Council District 5", "short":"CD5"},{"long": "Council District 6", "short":"CD6"},{"long": "Council District 7", "short":"CD7"},{"long": "Council District 8", "short":"CD8"},{"long": "Council District 9", "short":"CD9"},{"long": "Council District 10", "short":"CD10"},{"long": "Council District 11", "short":"CD11"},{"long": "Council District 12", "short":"CD12"},{"long": "Council District 13", "short":"CD13"},{"long": "Council District 14", "short":"CD14"},{"long": "Council District 15", "short":"CD15"}];
      var locations_long = locations.map(function (d) {return d.long});
      var locations_short = locations.map(function (d) {return d.short});
      var index_tmp = locations_long.indexOf(district_text);
      var id_tmp = '#' + locations_short[index_tmp];
      d3.select(id_tmp).selectAll('text').attr('style', 'font-weight:bold');

      // "Freeze" all districts to disable mouseover
      d3.selectAll('.district').classed('frozen', true);
    }
    // update the time toggle
    updateTimescale();
  }

  mouseover = function() {
    // if the district is not frozen, highlight and update the display text
    district = d3.select(this);
    isFrozen = district.classed('frozen');
    if (!isFrozen) {
  	  district.moveToFront().classed('highlighted', true);
      district_text = district.attr('label');
      councilmember_text = district.attr('councilmember');
      value_tmp = +district.attr('value')
      value_text = "Value: " + formatAmount(value_tmp);
      cd_label.text(district_text);
      cd_councilmember.text(councilmember_text);
      // only show the value if it's not blank
      if (district.attr('value')!="") {
      	// cd_value.text(value_text);
      	cd_value.text('(Click to select/unselect)');
      }
      // highlight the district in the table
      var locations = [{"long":"City of Los Angeles", "short":"City"},{"long": "Council District 1", "short":"CD1"},{"long": "Council District 2", "short":"CD2"},{"long": "Council District 3", "short":"CD3"},{"long": "Council District 4", "short":"CD4"},{"long": "Council District 5", "short":"CD5"},{"long": "Council District 6", "short":"CD6"},{"long": "Council District 7", "short":"CD7"},{"long": "Council District 8", "short":"CD8"},{"long": "Council District 9", "short":"CD9"},{"long": "Council District 10", "short":"CD10"},{"long": "Council District 11", "short":"CD11"},{"long": "Council District 12", "short":"CD12"},{"long": "Council District 13", "short":"CD13"},{"long": "Council District 14", "short":"CD14"},{"long": "Council District 15", "short":"CD15"}];
      var locations_long = locations.map(function (d) {return d.long});
      var locations_short = locations.map(function (d) {return d.short});
      var index_tmp = locations_long.indexOf(district_text);
      var id_tmp = '#' + locations_short[index_tmp];
      d3.select(id_tmp).selectAll('text').attr('style', 'font-weight:bold');
    }
  }

  mouseout = function() {
    district = d3.select(this);
    isFrozen = district.classed('frozen');
    if (!isFrozen) {
  	  district.classed('highlighted', false);
      cd_label.text('');
      cd_councilmember.text('');
      cd_value.text('');
      // unhighlight the district in the table
      var locations = [{"long":"City of Los Angeles", "short":"City"},{"long": "Council District 1", "short":"CD1"},{"long": "Council District 2", "short":"CD2"},{"long": "Council District 3", "short":"CD3"},{"long": "Council District 4", "short":"CD4"},{"long": "Council District 5", "short":"CD5"},{"long": "Council District 6", "short":"CD6"},{"long": "Council District 7", "short":"CD7"},{"long": "Council District 8", "short":"CD8"},{"long": "Council District 9", "short":"CD9"},{"long": "Council District 10", "short":"CD10"},{"long": "Council District 11", "short":"CD11"},{"long": "Council District 12", "short":"CD12"},{"long": "Council District 13", "short":"CD13"},{"long": "Council District 14", "short":"CD14"},{"long": "Council District 15", "short":"CD15"}];
      var locations_long = locations.map(function (d) {return d.long});
      var locations_short = locations.map(function (d) {return d.short});
      var index_tmp = locations_long.indexOf(district_text);
      var id_tmp = '#' + locations_short[index_tmp];
      d3.select(id_tmp).selectAll('text').attr('style', 'font-weight:normal');
    }
  }

  // initial settings for the map //
  mapLayer.selectAll('path')
      .data(geofeatures)
      .enter().append('path')
      .attr('d', path)
      .attr('id', function (d) {return d.properties.Council_District.replace(/\s/g, '');})
      .attr('label', function (d) {return d.properties.Council_District;})
      .attr('councilmember', function (d) {return d.properties.Councilmember;})
      .attr('value', '')
      .classed('selected', false)
      .classed('frozen', false)
      .classed('district', true)
      .attr('vector-effect', 'non-scaling-stroke')
      .on('click', mouseclick)
      .on('mouseover', mouseover)
      .on('mouseout', mouseout);

  // data table on the right
  var tableGroup = mapLayer.append('g').attr('id', 'table');

  // create a group for each row
  // var locations = ["City of Los Angeles","Council District 1","Council District 2","Council District 3","Council District 4","Council District 5","Council District 6","Council District 7","Council District 8","Council District 9","Council District 10","Council District 11","Council District 12","Council District 13","Council District 14","Council District 15"];
  var locations = [{"long":"City of Los Angeles", "short":"City"},{"long": "Council District 1", "short":"CD1"},{"long": "Council District 2", "short":"CD2"},{"long": "Council District 3", "short":"CD3"},{"long": "Council District 4", "short":"CD4"},{"long": "Council District 5", "short":"CD5"},{"long": "Council District 6", "short":"CD6"},{"long": "Council District 7", "short":"CD7"},{"long": "Council District 8", "short":"CD8"},{"long": "Council District 9", "short":"CD9"},{"long": "Council District 10", "short":"CD10"},{"long": "Council District 11", "short":"CD11"},{"long": "Council District 12", "short":"CD12"},{"long": "Council District 13", "short":"CD13"},{"long": "Council District 14", "short":"CD14"},{"long": "Council District 15", "short":"CD15"}]

  // add the location column
  tableGroup.selectAll('g')
    .data(locations).enter()
    .append('g')
    .attr('id', function (d) {return d.short})
    .append('text')
    .attr('x', 0)
    .attr('y', 0)
    .attr('fill', 'black')
    .attr('font-size', '14px')
    .text(function(d) {return d.long});

  // add the value column
  locations.forEach(function(d) {
  	var id_tmp = '#' + d.short;
  	d3.select(id_tmp)
  	  .append('text')
  	  .attr('id', d.short + 'Value')
      .attr('x', 140)
      .attr('y', 0)
      .attr('fill', 'black')
      .attr('font-size', '14px')
      .text('value goes here');
  })

  // create a group for the titles and append text
  var titleGroup = tableGroup.append('g').attr('id', 'titleGroup');
  titleGroup.append('text').attr('x', 0).attr('y', 0).attr('fill', 'black').attr('style', 'font-size: 14px; font-weight: bold').text('Location');
  titleGroup.append('text').attr('x', 140).attr('y', 0).attr('fill', 'black').attr('style', 'font-size: 14px; font-weight: bold').text('Value');

  // place all the text on the right hand side
  tableGroup.attr('transform', 'translate(460,70)');

  // make the table invisible
  d3.select('#table').selectAll('text').attr('fill', 'white');


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
    time.filterAll();
    // create locality filter
    var locality = data.dimension(function (d) {
      return d["locality"];
    });
    // filter out the City data
    locality.filter(function (d) {return d!= "City of Los Angeles"});
    // get the min and max values
    minValue = value.bottom(1)[0].value;
    maxValue = value.top(1)[0].value;

    // set the color domain
    color.domain([minValue, maxValue]);
    // undo the locality filter
    locality.filterAll();
    // remove the locality filter
    locality.dispose();
    // redo the time filter
    time.filter(time_setting);
  }

  // function for updating the map.
  // assumes that the data have been filtered to a single variable and a particular time period
  // assumes that a color scale has already been set (and is available as "color" in the map_ready namespace)
  var updateMap = function() {
  	// create locality filter
    var locality = data.dimension(function (d) {
      return d["locality"];
    });
    var values = locality.group().reduceSum(function (d) {
      return +d["value"];
    });
    var valueArray = values.all();
    var kk = [];
    var valuesByDistrict = [];
    valueArray.forEach(function (d, i) {kk[i] = d.key; valuesByDistrict[i] = d.value});
    if (kk.length != 16) {
      alert("We've got problems: I expected 16 values (one for each district plus the city as a whole) but I only got " + kk.length + ".");
    }

    var cityIndex = kk.indexOf('City of Los Angeles');
    var cdOnly = valuesByDistrict.slice();
    cdOnly.splice(cityIndex, 1);

    // undo the locality filter
    locality.filterAll();
    // remove the locality filter
    locality.dispose();

    // In the future I may need to make this more complex to do proper rounding, formatting
    getValue = function(d) {
      myValue = valuesByDistrict[kk.indexOf(d.properties.Council_District)];
      return myValue;
    }

    getColor = function (d) {
      myColor = color(valuesByDistrict[kk.indexOf(d.properties.Council_District)]);
      return myColor;
    }

    mapLayer.selectAll('path')
      .attr('value', getValue)
      .style('fill', getColor);

    // if a district is selected, update the displayed value 
    selected_district = d3.selectAll('.district').filter('.selected')
    if (selected_district._groups[0].length==1) {
      value_tmp = selected_district.attr('value')
      // only show the value if it's not blank
      if (value_tmp!="") {
      	// cd_value.text('Value: ' + formatAmount(+value_tmp));
      	cd_value.text('(Click to select/unselect)');
      } else {
    	cd_value.text("");
      }
    } else {
      cd_value.text("");
    }

    // update the source
    varSource = value.top(1)[0].source;
    d3.select('#sourceSpan').html(varSource);
    d3.select('#source').attr('style', 'display:inline-block');

    // update the table
    // first, make the table invisible
    d3.select('#table').selectAll('text').attr('fill', 'black');
    // update the values and sort
    var locations = [{"long":"City of Los Angeles", "short":"City"},{"long": "Council District 1", "short":"CD1"},{"long": "Council District 2", "short":"CD2"},{"long": "Council District 3", "short":"CD3"},{"long": "Council District 4", "short":"CD4"},{"long": "Council District 5", "short":"CD5"},{"long": "Council District 6", "short":"CD6"},{"long": "Council District 7", "short":"CD7"},{"long": "Council District 8", "short":"CD8"},{"long": "Council District 9", "short":"CD9"},{"long": "Council District 10", "short":"CD10"},{"long": "Council District 11", "short":"CD11"},{"long": "Council District 12", "short":"CD12"},{"long": "Council District 13", "short":"CD13"},{"long": "Council District 14", "short":"CD14"},{"long": "Council District 15", "short":"CD15"}];
    locations.forEach(function (d) {
    	// get the group id for the table row for this location
    	id_tmp = '#' + d.short;
    	// get the new value to put in the table
    	text_tmp = valueArray.filter(function (dd) {return dd.key==d.long})[0].value;
    	d3.select(id_tmp + 'Value').text(formatAmount(+text_tmp));
    	// find the rank of the value and move the group accordingly
    	values = valueArray.map(function (dd) {return dd.value}).sort(function(a, b) {return b - a;});
    	rank = values.indexOf(text_tmp) + 1;
    	d3.select(id_tmp).transition().duration(100).attr('transform','translate(0,' + (rank * 20) + ')');

    })


  } // end of updateMap


  var clearMap = function() {
  	// change the map to white
    mapLayer.selectAll('path').style('fill', 'white');

    // delete legend
    d3.selectAll('.legend').remove();

    // delete title
    mapTitle.text('NO VARIABLE SELECTED');

    // remove timeToggle if it exists
    d3.select('#timeToggleSVG').remove();
    d3.select('#timeToggleLabel').remove();
    d3.select('#timePrelabel').text('');

    // remove source
    d3.select('#source').attr('style', 'display:none');

    // make the table invisible
    d3.select('#table').selectAll('text').attr('fill', 'white');
  }


  // function for updating the time scale
  // assumes that the data have been filtered to a single variable
  var updateTimescale = function() {
    // if a district is selected and the selection is complete, add the time series for that district
    selected_district = d3.selectAll('.district').filter('.selected');
    if (selected_district._groups[0].length==1 & selection_complete) {
      // create locality filter
      var locality = data.dimension(function (d) {
        return d["locality"];
      });
      // select only the data for the selected district
      locality.filter(selected_district.attr('label'));

      // remove any time filters
      time.filterAll();

      // return the entries sorted by time, from earliest to latest
      dd = time.bottom(1e7);

      // pull the values
      annual = time.top(1)[0].cy_qtr=="";
      if (annual) {
      	timePeriods = dd.map(function (d) {return d["calendar_year"]})
      } else {
      	timePeriods = dd.map(function (d) {return d["cy_qtr"]})
      }
      valuesTS = dd.map(function (d) {return d["value"]});

      // undo the time filter
      time.filterAll();
      // undo the locality filter
      locality.filterAll();
      // remove the locality filter
      locality.dispose();

      // create the data to pass to the toggle
      timeData = timePeriods.map(function(d,i) {return {'time':d, 'value':valuesTS[i]}});
    } else {
      // pick out all time periods with more than one observation using the current filters
      timePeriodCounts = time.group().reduceCount().all().filter(function (d) {return d.value > 0});
      timePeriods = timePeriodCounts.map(function (d) {return d.key});

      timeData = timePeriods.map(function(d,i) {return {'time':d, 'value':0}});
    }
	
	if (selection_complete) {
      // remove timeToggle if it exists, then add a new one
      d3.select('#timeToggleSVG').remove();
      d3.select('#timeToggleLabel').remove();
      var timeToggleSetup = make_timeToggle('#timeSparkline', '#timeLabel', timeData, time, updateColor, updateMap);
      timeToggleSetup();
      d3.select('#timePrelabel').text('Time period (hover to select): ');
    } else {
      // remove timeToggle if it exists
      d3.select('#timeToggleSVG').remove();
      d3.select('#timeToggleLabel').remove();
      d3.select('#timePrelabel').text('');
    }
  }

  // function for updating the map title
  // assume the plotting variable has been chosen, and the mapTitle object
  // is available in the map_ready namespace
  updateTitle = function(maintext) {

  	if (maintext!='') {
  	  // find the units
  	  unitsFilter = data.dimension(function (d) {return d.unit_of_measure});
  	  unitCounts = unitsFilter.group().reduceCount().all().filter(function (d) {return d.value > 0});
      units = unitCounts.map(function (d) {return d.key})[0];
      unitsFilter.dispose();

      if (units!='') {
      	units = ', ' + units;
      }

      // find the unit text
  	  unitTextFilter = data.dimension(function (d) {return d.unit_text});
  	  unitTextCounts = unitTextFilter.group().reduceCount().all().filter(function (d) {return d.value > 0});
      unitText = unitTextCounts.map(function (d) {return d.key})[0];
      unitTextFilter.dispose();

      if (unitText!='') {
      	unitText = ', ' + unitText;
      }

      mapTitle.text(maintext + units + unitText);
    } else {
      mapTitle.text('NO VARIABLE SELECTED');
    }
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
    time.filterAll();
    indicator.filterAll();
    subindicator.filterAll();
    current_subindicator = '';
    gender.filterAll();

    // mark the selection as incomplete
    selection_complete = false;
    gender_selected = false;
    subind_selected = false;
    
    // remove time toggle
    d3.select('#timeToggleSVG').remove();
    d3.select('#timeToggleLabel').remove();
    
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

    // pick out all indicators with more than one observation using the current filters
    indicatorCounts = indicator.group().reduceCount().all().filter(function (d) {return d.value > 0});
    indicators = indicatorCounts.map(function (d) {return d.key});

    // change the options of the other selectors
    removeOptions('#selectIndicator');
    addOptions('#selectIndicator', indicators);

    // clear the map
    clearMap();
  }

  $('#selectCategory').attr('onchange', "selectCategory(this.value);")



  // functionality for indicator selection // 
  indicators = indicator.group().all().map(function (d) {return d.key});
  addOptions('#selectIndicator', indicators);

  selectIndicator = function(ind) {
    // remove the filters that depend on this selection
    time.filterAll();
    subindicator.filterAll();
    current_subindicator = '';
    gender.filterAll();

    // mark the selection as incomplete (will assess later whether it is complete)
    selection_complete = false;
    gender_selected = false;
    subind_selected = false;

    // dispose of the time filter
    time.dispose();

    // remove time toggle
    d3.select('#timeToggleSVG').remove();
    d3.select('#timeToggleLabel').remove();
    
    // If they chose "-", remove the indicator filter.
    // Otherwise filter using given indicator.
    if (ind=="-") {
      indicator.filterAll();
      current_indicator = '';
    } else {
      indicator.filter(ind);
      current_indicator = ind;
    }

    // check whether gender is an option
    genderCounts = gender.group().reduceCount().all().filter(function (d) {return d.value > 0});
    genders = genderCounts.map(function (d) {return d.key});
    has_gender = genders.length > 1;

    // check whether subindicator is an option
    subindicatorCounts = subindicator.group().reduceCount().all().filter(function (d) {return d.value > 0});
    subindicators = subindicatorCounts.map(function (d) {return d.key});
    hasSubindicator = subindicators.length > 1;

    // check whether quarterly data are available
    var quarter = data.dimension(function (d) {
    	return d["cy_qtr"];
    });
    quarterCounts = quarter.group().reduceCount().all().filter(function (d) {return d.value > 0});
    quarters = quarterCounts.map(function (d) {return d.key});
    hasQuarters = quarters.length > 1;
    quarter.dispose();

    // If they chose "-", hide gender and subindicator.
    // Otherwise proceed using the given filter.
    if (ind=="-") {
      d3.select('#genderDiv').attr('style','display:none');
      d3.select('#subindicatorDiv').attr('style','display:none');
      clearMap();
    } else {
      // create a new time filter depending on the choice
      if (hasQuarters) {
        time = data.dimension(function (d) {
          return d["cy_qtr"];
        });
      } else {
      	time = data.dimension(function (d) {
          return d["calendar_year"];
        });
      }

      // if gender is an option, show gender selector and update categories
      if (has_gender) {
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
      if (!has_gender & !hasSubindicator) {
      	selection_complete = true;
        updateTimescale();
        d3.selectAll('.legend').remove();
        makeLegend(map_svg_width * 0.42, map_svg_height * 0.5, 30, 5, color);
        updateTitle(ind);
      } else {
        clearMap();
      }
    }

  }

  $('#selectIndicator').attr('onchange', "selectIndicator(this.value);")


  // functionality for subindicator selection //
    selectSubindicator = function(sub) {
    // remove gender and time filters
    time.filterAll();
    // gender.filterAll();

    // update current subindicator
    current_subindicator = sub;

    // set selection as incomplete (will assess later whether to mark as complete)
    selection_complete = false;

    // if there are less than two genders, update the map (depending on selection).
    // otherwise, make each district white
    genderCounts = gender.group().reduceCount().all().filter(function (d) {return d.value > 0});
    genders = genderCounts.map(function (d) {return d.key});

    // filter as necessary
    if (sub=="-") {
      subindicator.filterAll();
    } else {
      subindicator.filter(sub);
    }

    // check that gender either isn't an option or has been selected already
    if (genders.length < 2 | gender_selected) {
      // If they choose "-", simply remove the filter and make the map white.
      // Otherwise filter using given subindicator and plot
      if (sub=="-") {
        clearMap();
      } else {
        subindicator.filter(sub);
        selection_complete = true;
        updateTimescale();
        d3.selectAll('.legend').remove();
        makeLegend(map_svg_width * 0.42, map_svg_height * 0.5, 30, 5, color);

        // get indicator for title
        indicatorCounts = indicator.group().reduceCount().all().filter(function (d) {return d.value > 0});
        indicators = indicatorCounts.map(function (d) {return d.key});

        // get gender for title
        if (gender_selected) {
          gen = ", " + value.top(1)[0].gender;
        } else {
          gen = "";
        }

        updateTitle(current_indicator + ': ' + sub + gen);
      }
    } else {
      clearMap();
    }

    
  }

  $('#selectSubindicator').attr('onchange', "selectSubindicator(this.value);")



  // functionality for gender selection //
    selectGender = function(gen) {
    // If they choose "-", simply remove the filter and make the map white.
    // Otherwise filter using given gender and plot.
    if (gen=="-") {
      gender.filterAll();
      gender_selected = false;
      selection_complete = false;
      clearMap();
    } else {
      gender.filter(gen);
      gender_selected = true;
      selection_complete = true;
      updateTimescale();
      d3.selectAll('.legend').remove();
      makeLegend(map_svg_width * 0.42, map_svg_height * 0.5, 30, 5, color);
      
      // update the title
      if (current_subindicator=='') {
      	var subind = '';
      } else {
      	var subind = ': ' + current_subindicator ;
      }

      updateTitle(current_indicator + subind + ', ' + gen);
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
        .text(formatAmount(legendValues[i]));
    }

    // units and unit text for legend
    // units = value.top(1)[0].
  }


} // end of map_ready


// label council districts (appears upon mouseover)
cd_label = map_svg.append('text')
  .attr('x', map_svg_width * 0.37)
  .attr('y', 50)
  .attr('text-anchor','left')
  .attr('style', 'font-size: 16px; font-weight: bold')
  .text('');

cd_councilmember = map_svg.append('text')
  .attr('x', map_svg_width * 0.37)
  .attr('y', 70)
  .attr('text-anchor','left')
  .attr('style', 'font-size: 16px')
  .text('');

cd_value = map_svg.append('text')
  .attr('x', map_svg_width * 0.37)
  .attr('y', 90)
  .attr('text-anchor','left')
  .attr('style', 'font-size: 16px')
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

// http://bl.ocks.org/eesur/4e0a69d57d3bfc8a82c2
d3.selection.prototype.moveToFront = function() {  
  return this.each(function(){
    this.parentNode.appendChild(this);
  });
};



