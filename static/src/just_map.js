'use strict';

const mapboxgl = require('mapbox-gl');
const request = require('superagent');

mapboxgl.accessToken = 'pk.eyJ1Ijoic3Bpa2UtbWFkZGVuIiwiYSI6ImNqNnM0cnRrcDBqNDAzMnBid3dtem1wcXgifQ.2advMY_wpO8eu24eg6OeOQ';

const map = new mapboxgl.Map({
    container: 'map',
    style: 'mapbox://styles/mapbox/light-v9',
    center: [-122.656425, 45.520153],
    zoom: 13
});

let results = [];
let query = 'mexican';
request
  .get('/search?q=' +  query)
  .end(function(err, res) {
    if (err) {
      alert("error in fetching response");
    }
    else {
      results = res.body;
      let geo = build_geojson(results["carts"]);
      map.on('load', () => {
        map.addSource("carts", {
          "type": "geojson",
          "data": geo
        }).addLayer({
            "id": "carts",
            "type": "circle",
            "interactive": true,
            "source": "carts",
            "paint": {
              'circle-radius': 4,
              'circle-color': '#ff8484'
            },
        });
      });
    }
  });

function build_geojson(carts) {
  return {
    "type": "FeatureCollection",
    "features": carts.map(function(c) {
      return {
        "type": "Feature",
        "properties": {
          "name": c.name,
          "address": c.address,
          "description": "<h3>"+c.name.toLowerCase()+"</h3><span>"+c.address.toLowerCase()+"</span>"
        },
        "geometry": {
          "type": "Point",
          "coordinates": [parseFloat(c.longitude),
                          parseFloat(c.latitude)]
        }
      }
    })
  }
}

map.on('click', 'carts', function(e) {
  new mapboxgl.Popup()
    .setLngLat(e.features[0].geometry.coordinates)
    .setHTML(e.features[0].properties.description)
    .addTo(map);
});

// Change the cursor to a pointer when the mouse is over the carts layer.
map.on('mouseenter', 'carts', function () {
   map.getCanvas().style.cursor = 'pointer';
});

// Change it back to a pointer when it leaves.
map.on('mouseleave', 'carts', function () {
   map.getCanvas().style.cursor = '';
});
