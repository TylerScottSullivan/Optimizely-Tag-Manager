var React = require('react');


var MTR = React.createClass({

	_displayTrigger: function(addedTag) {
		var displayNames = { "GA": "Google Universal Analytics",
												 "GC": "Google Classic Analytics",
												 "segment": "Segment",
												 "facebook": "Facebook Tracking Pixel",
												 "amplitude": "Amplitude" }

		var split = addedTag.trackingTrigger.split(',');
		
		if (split[0] === "inHeader" ) { return "In Header"}
		else if (split[0] === "onDocumentReady") {return "On Document Ready"} 
		else if (addedTag.trackingTriggerType === "onPageLoad") {return "On Page Load - " + addedTag.trackingTrigger} 
		else if (addedTag.trackingTriggerType  === "onEvent") {return "On Event - " + addedTag.trackingTrigger}
		else if (addedTag.trackingTriggerType === "onTrigger") {return "On Callback - " + displayNames[addedTag.trackingTrigger]}
		else {return "error"}
	},

	render: function() {
		var trigger = this._displayTrigger(this.props.addedTag);
		return (
		 		<tr onClick = {this.props.handleRowClick}>
		        <td id="row-centered"> <img src={this.props.addedTag.logo}/>< /td>
		        <td id="row-centered">{this.props.addedTag.displayName}</td>
		        <td id="row-centered">{this.props.addedTag.category} </td>
		        <td id="row-centered"> {trigger} </td>
		        <td id="row-centered">
		          {/*statement checks for if addedTag is enabled or not*/}
		          {this.props.addedTag.active ?
		            <div> Enabled </div> : <div> Disabled </div>
		          }
		        </td>
		     </tr>
		 )		
	}


})

module.exports = MTR;