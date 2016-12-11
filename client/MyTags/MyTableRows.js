var React = require('react');


var MyTableRows = React.createClass({

	// displays accurate call option in the table row
	// if a tag was called on another tag, page, or event, but said tag/page/event was deleted or said tag no longer recognizes tag in the callback,
	// then informs user to Update Call
	_displayTrigger: function(addedTag, callBackCheck) {
		var displayNames = { "GA": "Google Universal Analytics",
							 "GC": "Google Classic Analytics",
							 "segment": "Segment",
							 "facebook": "Facebook Tracking Pixel",
							 "amplitude": "Amplitude" }

		var split = addedTag.trackingTrigger.split(',');
		
		if (split[0] === "inHeader" ) { return "In Header"}
		else if (split[0] === "onDocumentReady") {return "On Document Ready"} 
		else if (addedTag.trackingTriggerType === "onPageLoad") {
			if (this.props.options[0][1].includes(addedTag.trackingTrigger)) {
				return "On Page Load - " + addedTag.trackingTrigger
			} else {
				return "Please Update Call"
			}
		} 
		else if (addedTag.trackingTriggerType  === "onEvent") {
			if (this.props.options[1][1].includes(addedTag.trackingTrigger)) {
				return "On Event - " + addedTag.trackingTrigger
			} else {
				return "Please Update Call"
			}
		}
		else if (addedTag.trackingTriggerType === "onTrigger") {
			if (Object.keys(callBackCheck).length < 1) {
				return "Please Update Call"
			} else if (!(addedTag.trackingTrigger in callBackCheck)) {
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
					return "Please Update Call"
				} else {
					return "On Callback - " + displayNames[addedTag.trackingTrigger]
				}
			} 
		}
		else {return "error"}
	},

	// renders tag rows on the My Tags tab
	render: function() {
		var trigger = this._displayTrigger(this.props.addedTag, this.props.callBackCheck);
		return (
	 		<tr onClick = {this.props.handleRowClick}>
	        <td id="row-centered"> <img src={this.props.addedTag.logo}/>< /td>
	        <td id="row-centered">{this.props.addedTag.displayName}</td>
	        <td id="row-centered">{this.props.addedTag.category} </td>
	        <td id="row-centered"> {trigger} </td>
	        <td id="row-centered">
          {this.props.addedTag.active ?
            <div> Enabled </div> : <div> Disabled </div>
          }
	        </td>
	     </tr>
		 )		
	}

})

module.exports = MyTableRows;