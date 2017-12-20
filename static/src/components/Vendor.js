var React = require('react');

class Vendor extends React.Component {
    state = { isExpanded: false };

    toggleExpand = () => {
        this.setState({
            isExpanded: !this.state.isExpanded
        });
    };

    render() {
        let r = this.props.data;
        return (
          <li onMouseEnter={this.props.handleHover.bind(null, r.name)} onClick={this.toggleExpand}>
            <p className="cart-name">{ r.name }</p>

            <div className="row">
              <div className="icons"> <i className="ion-android-pin"></i> </div>
              <div className="content">{r.address}</div>
            </div>
          </li>
       )
    }
}

module.exports = Vendor;
