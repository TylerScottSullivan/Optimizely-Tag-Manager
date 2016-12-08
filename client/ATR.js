var React = require('react');

function ATR(props) {
    return (
      <tr onClick={props.handleRowClick}>
        <td id="row-centered"> <img src={props.nonCustomTag.logo}/></td>
        <td id="row-centered">{props.nonCustomTag.displayName}</td>
        <td id="row-centered">{props.nonCustomTag.category} </td>
        {/*&nbsp: forces space next to Added, statement checks for if tag has been added or not*/}
        {props.nonCustomTag.added ? 
          <td id="row-centered"> Added </td>
        :
          <td id="row-centered"> Unadded </td>
        }
      </tr>
    )
}
module.exports = ATR;