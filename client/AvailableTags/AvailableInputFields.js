var React = require('react');

var AvailableInputFields = React.createClass({

	handleTokenValueChange: function(e) {
		var newValue = e.target.value; 
		this.props.onTokenValueChange(this.props.index, newValue)
	},

	// renders each Input Field/Token within the side panel for the selected tag in Available Tags tab
	render: function() {
		return (
			<div>
	      <div className="flex"> <div className="flex--1 sd-headsmall">{this.props.token.tokenDisplayName}</div> </div>
		    <div> {this.props.token.tokenDescription} <a href={this.props.token.learnmorelink} target="_blank"> Learn More. </a> </div>
        <input name= {this.props.token.tokenDisplayName} className="text-input width--200 text-input-styled" 
        				placeholder={this.props.token.placeholder} value={this.props.token.value} onChange={this.handleTokenValueChange}/>
	      <div className='warning'>
      		{this.props.errors[this.props.token.tokenDisplayName]}
    	  </div>
			</div>
			)
	}
})

module.exports = AvailableInputFields;
