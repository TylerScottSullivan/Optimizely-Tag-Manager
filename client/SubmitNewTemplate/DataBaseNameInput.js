var React = require('react');

var DataBaseNameInput = React.createClass({

	handleChange: function(e) {
		var newValue = e.target.value;
		this.props.onChange(newValue)
	},
	
	// renders database name input field
	render: function () {
		return (
			<div>
	  		<li className="form-field__item">
	    		<label className="label">
	      			Database Name
	  			</label>
	    		<input type="text" className="text-input" name='type' onChange={this.handleChange}/>
	        <div className='warning'>
	       	  {this.props.errors['dataBaseName']}
	        </div>
	    		<div className="form-note">This will be the name of your tag in our database. Please do not include spaces. (Ex. Google_Analytics)</div>
	  		</li>
	    </div>
			)
	}
})

module.exports = DataBaseNameInput;