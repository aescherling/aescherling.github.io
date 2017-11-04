// some inspiration drawn from https://bl.ocks.org/john-guerra/43c7656821069d00dcbc
// and https://bl.ocks.org/mbostock/4060606

// also of some interest: square mileage of each CD.
// some variables (e.g. population) should be mapped per square mile 
// http://documents.lahsa.org/planning/homelesscount/2009/CityofLA-CouncilDistricts.pdf

// d3 with mapbox gl
// http://bl.ocks.org/enjalot/0d87f32a1ccb9a720d29ba74142ba365
// https://bl.ocks.org/shimizu/5f4cee0fddc7a64b55a9

// add path directly to map:
// https://stackoverflow.com/questions/37928238/making-a-path-with-coordinates-using-d3-and-mapbox

// set some variables
var map_svg_width=600,
	map_svg_height=450;

mapboxgl.accessToken = 'pk.eyJ1IjoiYWVzY2hlcmxpbmciLCJhIjoiY2o4cTRsdXdhMGVvbzJ4b3gwb3lmMDR6bCJ9.BpnZvVcHTuDFiTo9ngzQiw';

var map = new mapboxgl.Map({
container: 'map',
style: 'mapbox://styles/mapbox/light-v9',
center: [-118.35, 34.02],
zoom: 8.6
})


map.on('load', function() {

  map.resize();

  d3.json('geodata/council_districts.geojson', function(err, geodata) {
    // adding objects directly to map, not using d3

    map.addSource('council_districts', {
      'type': 'geojson',
      'data': geodata
    });

    map.addLayer({
      'id': 'council_districts',
      'type': 'fill',
      'source': 'council_districts',
      'paint': {
        'fill-color': 'steelblue',
        'fill-opacity': 0.5
      }
    });

    // to remove a layer:
    // map.removeLayer('council_districts');

  })

})


