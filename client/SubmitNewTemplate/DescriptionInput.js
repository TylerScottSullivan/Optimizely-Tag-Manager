var React = require('react');

var DescriptionInput = React.createClass({
  handleChange: function(e) {
    var newValue = e.target.value;
    this.props.onChange(newValue)
  },
  
  // renders description field
	render: function () {
		return (
			<div>
        <li className="form-field__item">
          <label className="label"> Description </label>
          <input type="text" className="text-input" name='description' onChange={this.handleChange}/>
          <div className='warning'>
            {this.props.errors['description']}
          </div>
          <div className="form-note">
            <p> This will be the description of your tag that will be displayed in the side panel of this application. </p>
            <p> (Ex. Use this tag to insert the Google Universal Analytics tracking code into your website through Optimizely.) </p>
          </div>
        </li>
      </div>
			)
	}
})

module.exports = DescriptionInput;