var React = require('react');

// renders tag rows on Available Tags tab
function AvailableTableRows(props) {
  return (
    <tr onClick={props.handleRowClick}>
      <td id="row-centered"> <img src={props.nonCustomTag.logo}/></td>
      <td id="row-centered">{props.nonCustomTag.displayName}</td>
      <td id="row-centered">{props.nonCustomTag.category} </td>
      {props.nonCustomTag.added ? 
        <td id="row-centered"> Added </td>
      :
        <td id="row-centered"> Unadded </td>
      }
    </tr>
  )
}
module.exports = AvailableTableRows;