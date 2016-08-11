var React = require('react');

var MyInputFields = React.createClass({
	render: function () {
    var error = (this.props.error) ? 'validation' : '';
		return (
			<div>
          <div className="flex">
             <div className="flex--1 sd-headsmall" name='tokenName'>{this.props.field.tokenName}</div>
          </div>
	        <div name='description'> {this.props.field.description} <a href={this.props.field.learnmorelink} target="_blank"> Learn More. </a> </div>
	        <input name='value' className={`text-input width--200 text-input-styled ${error}`} value={this.props.value} onChange={this.props.onChange}/>
					{(this.props.error !== false) ? <div className='warning'>{this.props.error}</div> : null }
			</div>
		)
	}
})

module.exports = MyInputFields;
