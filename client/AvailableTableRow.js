var React = require('react');

var AvailableTableRow = React.createClass({

  render: function() {
    return (
     <tr onClick={this.props.onSelect}>
        <td id="row-centered"> <img src={this.props.rowinfo.logo}/></td>
        <td id="row-centered">{this.props.rowinfo.displayName}</td>
        <td id="row-centered">{this.props.rowinfo.category} </td>

        {/*&nbsp: forces space next to Added, statement checks for if tag has been added or not*/}
        {this.props.rowinfo.added ? 
          <td id="row-centered"> &nbsp; Added </td>
        :
          <td id="row-centered"> Unadded </td>
        }
     </tr>
    )
  }
  
})

module.exports = AvailableTableRow;
