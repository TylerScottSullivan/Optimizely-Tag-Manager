var React = require('react');

var EmailInput = React.createClass({
	render: function () {
		return (
			<div>
	      <li className="form-field__item">
	        <label className="label">
	            What is an email that we can reach you?
	        </label>
	        <input type="text" className="text-input" name='email'/>
	        <div className="form-note">
	          <p> We will update you upon the approval of your template. </p>
	        </div>
	      </li>
      </div>
			)
	}
})

module.exports = EmailInput;