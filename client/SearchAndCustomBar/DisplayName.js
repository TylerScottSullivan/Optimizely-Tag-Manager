var React = require('react');

var DisplayName = React.createClass({

	handleDisplayNameChange: function(e) {
		var name = e.target.value;
		this.props.onChange(name);
	},

	// renders display name in Custom Tag
	render: function() {
		return (
			<div>
      	<div className="flex">
        	<div className="flex--1 sd-headsmall">Name</div>
      	</div>
	     	<div className="flex--1"> Please add the name of your snippet. </div>
	      	<input name='displayName' value={this.props.displayName} onChange={this.handleDisplayNameChange}/>
	  	    <div className='warning'>
        	{this.props.errors['displayName']}
      	</div>
    	</div>
		)
	}

})

module.exports = DisplayName;