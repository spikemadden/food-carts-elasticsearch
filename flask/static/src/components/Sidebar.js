let React = require('react');
let request = require('superagent');
let Intro = require('./Intro');
let Vendor = require('./Vendor');

import { addPopupToMap } from './../app';

class Sidebar extends React.Component {

  constructor(props) {
    super(props);
    this.state = {
      results: [],
      markers: [],
      popUps: [],
      query: "",
      firstLoad: true
    };
    this.fetchResults();
  }

  fetchResults = () => {
    this.state.popUps.forEach(popup => {
      popup.remove();
    });

    let results = []
    let query = this.state.query;
    request
      .get('/search?q=' + query)
      .end(function (err, res) {
        if (err) {
          alert("error in fetching response");
        }
        else {
          this.setState({
            results: res.body,
          });
          this.plotOnMap();
        }
      }.bind(this));
  };

  build_geojson = (carts) => {
    return {
      "type": "FeatureCollection",
      "features": carts.map(c => {
        return {
          "type": "Feature",
          "properties": {
            "name": c.name,
            "address": c.address,
            "url": c.url
          },
          "geometry": {
            "type": "Point",
            "coordinates": [parseFloat(c.longitude),
            parseFloat(c.latitude)]
          }
        }
      })
    }
  };

  plotOnMap = (vendor) => {
    let map = this.props.map;
    let results = this.state.results;

    this.markers = [].concat.apply([], results.carts.map(c => {
      return {
        name: c.name,
        address: c.address,
        longitude: c.longitude,
        latitude: c.latitude
      }
    }));

    let usualMarkers = this.markers;
    let usualgeoJSON = this.build_geojson(usualMarkers);

    if (this.state.firstLoad) {
      map.addSource("carts", {
        "type": "geojson",
        "data": usualgeoJSON
      }).addLayer({
        "id": "carts",
        "type": "circle",
        "interactive": true,
        "source": "carts",
        "paint": {
          'circle-radius': 8,
          'circle-color': '#072844'
        },
      });

      this.setState({
        firstLoad: false,
      });
    } else {
      let empty = {
        "type": "FeatureCollection",
        "features": []
      }
      map.getSource("carts").setData(usualgeoJSON);
      // reset highlighted carts
      map.getSource("carts-highlight").setData(empty);
    }
  };

  handleSearch = (e) => {
    e.preventDefault();
    this.fetchResults();
  };

  onChange = (e) => {
    this.setState({ query: e.target.value });
  };

  handleHover = (vendor) => {
    let map = this.props.map;

    let highlightMarkers = this.markers.filter(m => m.name.toLowerCase() === vendor.toString().toLowerCase());
    let usualMarkers = this.markers.filter(m => m.name.toLowerCase() !== vendor.toString().toLowerCase());

    let usualgeoJSON = this.build_geojson(usualMarkers);
    let highlightgeoJSON = this.build_geojson(highlightMarkers);

    if (highlightMarkers) {
      if (map.getSource('carts-highlight')) {
        map.getSource('carts-highlight').setData(highlightgeoJSON);
        map.getSource('carts').setData(usualgeoJSON);
      } else {
        map.addSource("carts-highlight", {
          "type": "geojson",
          "data": highlightgeoJSON
        }).addLayer({
          "id": "carts-highlight",
          "type": "circle",
          "interactive": true,
          "source": "carts-highlight",
          "paint": {
            'circle-radius': 8,
            'circle-color': '#FAD8DE'
          },
        });
      }
    }
  };

  selectVendor = (vendorName) => {
    let map = this.props.map;
    let vendorMarker = map.getSource('carts-highlight')._data.features[0];

    this.state.popUps.forEach(popup => {
      popup.remove();
    });

    // why doesn't setState work here
    this.state.popUps = [];
    this.state.popUps.push(addPopupToMap(vendorMarker));

    map.panTo(vendorMarker.geometry.coordinates);
  }

  render() {
    let query = this.state.query;
    let resultsCount = this.state.results.hits || 0;
    let results = this.state.results.carts || [];
    let renderedResults = results.map((r, i) =>
      <Vendor key={i} data={r} handleHover={this.handleHover} onClick={this.selectVendor.bind(r.name)} />
    );

    return (
      <div>
        <div id="search-area">
          <form onSubmit={this.handleSearch}>
            <input type="text" value={query} onChange={this.onChange}
              placeholder="What do you want to eat?" />
            <button>Search!</button>
          </form>
        </div>
        {resultsCount >= 0 ?
          <div id="results-area">
            <h5>Found <span className="highlight">{resultsCount}</span> vendors!
              </h5>
            <ul> {renderedResults} </ul>
          </div>
          : null}
      </div>
    );
  }
}

module.exports = Sidebar;
