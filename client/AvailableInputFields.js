var React = require('react');

var AvailableInputFields = React.createClass({
	render: function () {
    	var error = (this.props.error) ? 'validation' : '';

		return (
			<div>
	         	<div className="flex">
	         		<div className="flex--1 sd-headsmall">{this.props.token.tokenDisplayName}</div>
	            </div>
		        <div>
		        	{this.props.token.tokenDescription} <a href={this.props.token.learnmorelink} target="_blank"> Learn More. </a> 
	        	</div>
		        <input
		        	name= {this.props.token.tokenDisplayName}
		        	className={`text-input width--200 text-input-styled ${error}`}
		        	placeholder={this.props.token.placeholder} value={this.props.token.value}
		        	onChange={this.props.onChange}
	        	/>
            	{(this.props.error !== false) ?
					<div className='warning'>{this.props.error}</div>
				:
					null
				}
			</div>
		)
	}
})

module.exports = AvailableInputFields;
