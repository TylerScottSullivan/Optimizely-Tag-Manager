var React = require('react');

var DisplayNameInput = React.createClass({
	render: function () {
		return (
			<div>
	  		<li className="form-field__item">
	    		<label className="label">
	      			Display Name
	    		</label>
	    		<input type="text" className="text-input" name='displayName'/>
	    		<div className="form-note">This will be the display name for your tag. (Ex. Google Universal Analytics)</div>
	  		</li>
      </div>
			)
	}
})

module.exports = DisplayNameInput;