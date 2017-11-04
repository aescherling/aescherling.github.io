// variable_selection.js
// code for selecting variables to show in the map and sidebar

// reference: https://stackoverflow.com/questions/1801499/how-to-change-options-of-select-with-jquery

removeOptions = function(selectId) {
  $(selectId + ' option:gt(0)').remove();
}

addOptions = function(selectId, options) {
	for (i=0; i<options.length; i++) {
		option = $('<option></option>').attr("value", "option value").text(options[i]);
		$(selectId).append(option);
	}
}

// example code
// removeOptions('#selectCategory');
// addOptions('#selectCategory', ['a','b','c','d','e']);

// change options of indicator selector based on category selector
updateIndicator = function(category) {
	if (category=="Construction, housing, and hotels") {
		options = ["Mix-use alteration permit values","Mix-use permit values","Mix-use permits","Multi-family permit values","Multi-family permits","New commercial permit values","Non-residential alteration permit values","Non-residential permit values","Single-family permit values","Single-family permits","Housing units","Housing units built before 2000","Share of households that moved in before 2000","Housing vacancy rate","Owner-occupied housing","Hotel daily rate","Hotel occupancy"];
	} else if (category=="Demographics") {
		options = ["Educational attainment","Educational attainment by gender","Median age","Median age by gender","Population","Population by age by gender","Population by age group","Population by gender","Population by income bracket by gender","Population by race","Population by race by gender","Population under 18 years of age"];
	} else if (category=="Employment") {
		options = ["Employment by establishment size","Employment by establishment wage","Establishment change by industry","Private employment by industry","Total employment","Total private employment","Unemployment rate","Unemployment rate by gender","Employed workers","Employed workers by occupation","Employment by occupation by gender"];
	} else if (category=="Taxes") {
		options = ["Taxable sales","Taxable sales by sector","Taxable sales receipts","Gross receipts tax payments"];
	} else if (category=="Output, income, and prices"){
		options = ["Average annual wage","Households by income bracket","Households in snap","Households with public assistance","Average public assistance","Mean earnings","Median household income","Real gdp per capita","Total real gdp","Consumer price index (total all items)"];
	} else if (category=="Transit") {
		options = ["Average commute time","Commuters using public transit"];
	} else {
		options = null;
	}
	removeOptions('#selectIndicator');
	addOptions('#selectIndicator', options);
}
//$('#selectCategory').attr('onchange', null)
//$('#selectCategory').attr('onchange', "alert('sup bro');")
$('#selectCategory').attr('onchange', "updateIndicator(this.value);")


//var option = $('<option></option>').attr("value", "option value").text("Text");
//$("#selectId").empty().append(option);

