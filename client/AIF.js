var React = require('react');

var AIF = React.createClass({

	handleTokenValueChange: function(e) {
		console.log("TOKEN VALUE", e.target.value)
		var newValue = e.target.value; 
		this.props.onTokenValueChange(this.props.index, newValue)
	},

	render: function() {
		console.log("AIF PROPS", this.props)
		return (
			<div>
	      <div className="flex"> <div className="flex--1 sd-headsmall">{this.props.token.tokenDisplayName}</div> </div>
		    <div> {this.props.token.tokenDescription} <a href={this.props.token.learnmorelink} target="_blank"> Learn More. </a> </div>
        <input 
        	name= {this.props.token.tokenDisplayName} 
        	className="text-input width--200 text-input-styled"
        	placeholder={this.props.token.placeholder} value={this.props.token.value} 
        	onChange={this.handleTokenValueChange}
      	/>
	      <div className='warning'>
      		{this.props.errors[this.props.token.tokenDisplayName]}
    	  </div>
			</div>
			)
	}
})

module.exports = AIF;
