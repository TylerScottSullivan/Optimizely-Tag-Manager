var React = require('react');

var TriggerOptions = React.createClass({


	_setTrackingTriggersAndOptions: function(options) {
		var trackingTriggers = [];
		var trackingOptions = {};

		trackingTriggers.push(['inHeader', 'In Header']);
		trackingTriggers.push(['onDocumentReady', 'On Document Ready']);

		if (options[0][1].length) {
			trackingTriggers.push(options[0][0]);
			trackingOptions[options[0][0][0]] = options[0][1];
		}
		if (options[1][1].length) {
			trackingTriggers.push(options[1][0]);
			trackingOptions[options[1][0][0]] = options[1][1];
		}
		if (options[2][1].length) {
			trackingTriggers.push(options[2][0])
			trackingOptions[options[2][0][0]] = options[2][1];
		}

		return [trackingTriggers, trackingOptions];
	},

	handleTriggerChange: function(e) {
		var newTrigger = e.target.value;
		this.props.onTriggerChange(newTrigger)
		this.props.onOptionChange("Trigger Options:")
	},

	handleOptionChange: function(e) {
		var newOption = e.target.value;
		this.props.onOptionChange(newOption)
	},

	render: function() {
		var tracks = this._setTrackingTriggersAndOptions(this.props.options);
		var trackingTriggers = tracks[0];
		var trackingOptions = tracks[1];

		return (
				<div className="bottom-margin flex-wide">
					<div> 
						<div className="flex">
		        	<div className="flex--1 sd-headsmall"> Called On: </div>
		        </div>


		        <select className="form-control" name='trackingTrigger' value={this.props.currentTrigger} onChange={this.handleTriggerChange}>

		        	<option selected> Please Select a Trigger: </option> 
		        	{trackingTriggers.map((trigger, i) => {
		        		return <option key={i} value={trigger[0]}> {trigger[1]} </option>
		        	})}

		        </select>

        	  <div className='warning'>
            	{this.props.errors['trigger']}
          	</div>
	        </div> 

	        { (this.props.currentTrigger === 'onPageLoad' || this.props.currentTrigger === 'onEvent') ?
	           <div className="margin-width">
	            <div className="flex">
	              <div className="flex--1 sd-headsmall"> Please Select a Trigger Option: </div>
	            </div>

	            <select className="form-control" name='specificTrigger' value={this.props.currentOption} onChange={this.handleOptionChange}>
	              
	              <option selected> Trigger Options: </option>
	            	{trackingOptions[this.props.currentTrigger].map((option, i) => {
	              	return <option key={i} value={option}>{option}</option>
	              })}
	          	</select>

	        	  <div className='warning'>
	            	{this.props.errors['option']}
	          	</div>
	          </div>
	        : null

	      	}

	      	{(this.props.currentTrigger === 'onTrigger') ?
	           <div className="margin-width">
	            <div className="flex">
	              <div className="flex--1 sd-headsmall"> Please Select a Trigger Option: </div>
	            </div>

	            <select className="form-control" name='specificTrigger' value={this.props.currentOption} onChange={this.handleOptionChange}>
	              
	              <option selected> Trigger Options: </option>
	            	{trackingOptions[this.props.currentTrigger].map((option, i) => {
	              	return <option key={i} value={option[0]}>{option[1]}</option>
	              })}

	          	</select>
	          	
	        	  <div className='warning'>
	            	{this.props.errors['option']}
	          	</div>
	          </div>
	        : null
	      	}

        </div>
		)
	}

})

module.exports = TriggerOptions;