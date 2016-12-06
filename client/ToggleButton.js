var React = require('react');

var ToggleButton = React.createClass({
	handleToggleChange: function() {
		this.props.onChange(!this.props.active)
	},

	render: function() {
	  	if (this.props.active) {
	  		return (
  			    <div>
                	<button className="button button--highlight" name='active' onClick={this.handleToggleChange}>Enabled</button>
                	<button className="button" name='active' onClick={this.handleToggleChange}>Disabled</button>
                </div>
	  			)
	  	} else {
	  		return (
              <div>
                <button className="button" name='active' onClick={this.handleToggleChange}>Enabled</button>
                <button className="button button--highlight" name='active' onClick={this.handleToggleChange}>Disabled</button>
              </div>
            )
	  	}
	}

})

module.exports = ToggleButton;