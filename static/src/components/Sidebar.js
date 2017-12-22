let React = require('react');
let request = require('superagent');
let Intro = require('./Intro');
let Vendor = require('./Vendor');

class Sidebar extends React.Component {
  state = {
    results: [],
    query: "",
    firstLoad: true
  };

  fetchResults = () => {
    let results = []
    let query = this.state.query;
    request
      .get('/search?q=' +  query)
      .end(function(err, res) {
        if (err) {
          alert("error in fetching response");
        }
        else {
          this.setState({
            results: res.body,
            firstLoad: false
          });
          this.plotOnMap();
        }
      }.bind(this));
  };

  build_geojson = (carts) => {
    return {
      "type": "FeatureCollection",
      "features": carts.map(function(c) {
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
    let markers = [].concat.apply([], results.carts.map(function(c) {
                        return {
                          name: c.name,
                          address: c.address,
                          longitude: c.longitude,
                          latitude: c.latitude
                        }
                      }));

    let highlightMarkers, usualMarkers, usualgeoJSON, highlightgeoJSON;

    if (vendor) {
      highlightMarkers = markers.filter(m => m.name.toLowerCase() === vendor.toLowerCase());
      usualMarkers = markers.filter(m => m.name.toLowerCase() !== vendor.toLowerCase());
    } else {
      usualMarkers = markers;
    }

    usualgeoJSON = this.build_geojson(usualMarkers);
    if (highlightMarkers) {
      highlightgeoJSON = this.build_geojson(highlightMarkers);
    }

    // clearing layers
    if (map.getLayer("carts")) {
        map.removeLayer("carts");
    }
    if (map.getSource("carts")) {
        map.removeSource("carts");
    }
    if (map.getLayer("carts-highlight")) {
        map.removeLayer("carts-highlight");
    }
    if (map.getSource("carts-highlight")) {
        map.removeSource("carts-highlight");
    }

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

    if (highlightMarkers) {
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
            'circle-color': '#D2B48C'
          },
      });
    }
  };

  handleSearch = (e) => {
      e.preventDefault();
      this.fetchResults();
  };

  onChange = (e) => {
      this.setState({query: e.target.value});
  };

  handleHover = (vendorName) => {
      this.plotOnMap(vendorName);
  };

  render() {
    if (this.state.firstLoad) {
      return (
        <div>
          <div id="search-area">
            <form onSubmit={this.handleSearch}>
              <input type="text" value={query} onChange={this.onChange}
                      placeholder="What do you want to eat?"/>
              <button>Search!</button>
            </form>
          </div>
          <Intro />
        </div>
      );
    }

    let query = this.state.query;
    let resultsCount = this.state.results.hits || 0;
    let results = this.state.results.carts || [];
    let renderedResults = results.map((r, i) =>
      <Vendor key={i} data={r} handleHover={this.handleHover} />
    );

    return (
      <div>
        <div id="search-area">
          <form onSubmit={this.handleSearch}>
            <input type="text" value={query} onChange={this.onChange}
                    placeholder="What do you want to eat?"/>
            <button>Search!</button>
          </form>
        </div>
        { resultsCount > 0 ?
          <div id="results-area">
            <h5>Found <span className="highlight">{ resultsCount }</span> vendors!
            </h5>
            <ul> { renderedResults } </ul>
          </div>
        : null}
      </div>
    );
  }
}

module.exports = Sidebar;
