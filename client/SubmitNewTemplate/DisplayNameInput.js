var React = require('react');

var DisplayNameInput = React.createClass({

	handleChange: function(e) {
		var newValue = e.target.value;
		this.props.onChange(newValue)
	},
	
	// renders display name field
	render: function () {
		return (
			<div>
	  		<li className="form-field__item">
	    		<label className="label"> Display Name </label>
	    		<input type="text" className="text-input" name='displayName' onChange={this.handleChange}/>
          <div className='warning'>
            {this.props.errors['displayName']}
          </div>
	    		<div className="form-note">This will be the display name for your tag. (Ex. Google Universal Analytics)</div>
	  		</li>
      </div>
			)
	}
})

module.exports = DisplayNameInput;