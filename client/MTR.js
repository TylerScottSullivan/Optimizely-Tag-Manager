var React = require('react');

function MTR(props) {
	var trackingTrigger = props.addedTag.trackingTrigger.split(',')[1] || props.addedTag.trackingTrigger;

	return (
   		<tr onClick = {props.handleRowClick}>
	        <td id="row-centered"> <img src={props.addedTag.logo}/>< /td>
	        <td id="row-centered">{props.addedTag.displayName}</td>
	        <td id="row-centered">{props.addedTag.category} </td>
	        <td id="row-centered"> {trackingTrigger} </td>
	        <td id="row-centered">
	          {/*statement checks for if addedTag is enabled or not*/}
	          {props.addedTag.active ?
	            <div> Enabled </div> : <div> Disabled </div>
	          }
	        </td>
       </tr>
   )
}

module.exports = MTR;