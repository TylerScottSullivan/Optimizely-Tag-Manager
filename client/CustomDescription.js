var React = require('react');

var CustomDescription = React.createClass({

	handleCustomDescriptionChange: function(e) {
		var newDescription = e.target.value;
		this.props.onChange(newDescription);
	},

	render: function() {
		return (
			<div> 
	  		  	<div className="flex">
		            <div className="flex--1 sd-headsmall"> Description</div>
		        </div>
	  		    <div className="flex--1">
	            	Please add the description of your tag below.
	            </div>
	  		    <input name='tagDescription' value={this.props.tagDescription} onChange={this.handleCustomDescriptionChange}/>
  		    </div>
		)
	}

})

module.exports = CustomDescription;