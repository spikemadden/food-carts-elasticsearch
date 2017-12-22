let React = require('react');

class Intro extends React.Component {
    render() {
        return (
        <div className="intro">
            <h3>About</h3>
            <p>
              This application is a personal project that served as an introduction to React and fullstack development in general.
            </p>
            <p>
              This application is built with Flask and Elasticsearch on the backend. The frontend is built with React and Mapbox.
            </p>
            <p>
              Thank you to <a href="https://www.yelp.com/developers/documentation/v3/business_search">Yelp Fusion</a> - Business Search API for food cart information and <a href="https://github.com/prakhar1989/FoodTrucks">prakhar1989</a> on GitHub for inspiration on this project.
            </p>
        </div>
      )
    }
}

module.exports = Intro;
