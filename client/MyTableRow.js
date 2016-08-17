var React = require('react');

var MyTableRow = React.createClass({

  render: function() {
		var trackingTrigger = this.props.rowinfo.trackingTrigger.split(',')[1] || this.props.rowinfo.trackingTrigger;
		return (
   		<tr onClick={this.props.onSelect}>
        <td id="row-centered"><img src={this.props.rowinfo.logo}/></td>
        <td id="row-centered">{this.props.rowinfo.displayName}</td>
        <td id="row-centered">{this.props.rowinfo.category} </td>
        <td id="row-centered">{trackingTrigger} </td>
        <td id="row-centered">
          {/*statement checks for if tag is enabled or not*/}
          {this.props.rowinfo.active ?
            <div> Enabled </div>
          :
            <div> Disabled </div>
          }
        </td>
       </tr>
    )
	}
})

module.exports = MyTableRow;
