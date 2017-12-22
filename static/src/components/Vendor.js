let React = require('react');

class Vendor extends React.Component {
    render() {
        let r = this.props.data;
        return (
          <li onMouseEnter={this.props.handleHover.bind(null, r.name)}>
            <p className="cart-name">{r.name}</p>

            <div className="row">
              <div className="icons"> <i className="ion-android-pin"></i> </div>
              <div className="content">{r.address}</div>
            </div>
            <div className="row">
              <div className="icons"> <i className="ion-search"></i> </div>
              <div className="content"><a href={r.url} target='yelp'>Yelp</a></div>
            </div>
          </li>
       )
    }
}

module.exports = Vendor;
