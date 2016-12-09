var React = require('react');


var MTR = React.createClass({

	_displayTrigger: function(addedTag, callBackCheck) {
		console.log("callBackCheck", callBackCheck)
		console.log("addedTag", addedTag)
		console.log("addedTag.trackingTrigger", addedTag.trackingTrigger)
		console.log("this.props.addedTag.name", this.props.addedTag.name)
		// console.log("callBackCheck[addedTag.trackingTrigger][0]", callBackCheck[addedTag.trackingTrigger][0])
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
		else if (addedTag.trackingTriggerType === "onTrigger") {
			if (Object.keys(callBackCheck).length < 1) {
				return "Please Update Call"
			} else if (!(addedTag.trackingTrigger in callBackCheck)) {
				console.log("Gets to second if")
				return "Please Update Call"				
			} else if (addedTag.trackingTrigger in callBackCheck) {
				var count = 0;
				if(addedTag.name==="custom") {
					for (var i = 0; i < callBackCheck[addedTag.trackingTrigger].length; i++) {
						if (callBackCheck[addedTag.trackingTrigger][i] === this.props.addedTag.customId) {
							count++;
						}
					}
				} else {
					for (var i = 0; i < callBackCheck[addedTag.trackingTrigger].length; i++) {
						if (callBackCheck[addedTag.trackingTrigger][i] === this.props.addedTag.name) {
							count++;
						}
					}
				}
				if (count === 0) {
					console.log("Gets to third if")
					return "Please Update Call"
				} else {
					return "On Callback - " + displayNames[addedTag.trackingTrigger]
				}
			} 
			// else {
			// 	console.log("getting here")
			// 	return "On Callback - " + displayNames[addedTag.trackingTrigger]
			// }
		}
		else {return "error"}
	},

	render: function() {
		// console.log("callbackCheckk passed", this.props.callBackCheck)
		var trigger = this._displayTrigger(this.props.addedTag, this.props.callBackCheck);
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