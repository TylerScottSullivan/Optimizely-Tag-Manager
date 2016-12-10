var React = require('react');

var TakeCallBacksInput = React.createClass({

  handleHasCallBackChange: function(e) {
    var newValue;
    var value = e.target.value;
    if (value === "true") {
      newValue = true
    } else {
      newValue = false
    }
    this.props.onChangeHasCallBack(newValue)
  },

  handleUsesOurCallBackChange: function(e) {
    var newValue;
    var value = e.target.value;
    if (value === "true") {
      newValue = true
    } else {
      newValue = false
    }
    this.props.onChangeUsesOurCallBack(newValue)
  },

  handleTypeChange: function(e) {
    var newValue = e.target.value;
    this.props.onChangeType(newValue) 
  },

  // renders has callback input, uses our callback input, and type options
	render: function () {
		return (
      <div>
    		<li className="form-field__item">
  				<label className="label">
        			Does your tag template natively take callbacks?
      		</label>
      		<select name='hasCallBack' onChange={this.handleHasCallBackChange} className="lego-select">
        			<option value={true}>Yes</option>
        			<option value={false}>No</option>
      		</select>
          <div>{(this.props.hasCallBack === true) ? <div className="form-note">Please put <code>{"{{{...}}}"}</code> around your callback.</div> : null}</div>
    		</li>

        {(this.props.hasCallBack === false) ?
           (
             <li className="form-field__item">
      					<label className="label">
  	          			Would you like us to make your code callback-able?
  	        		</label>
  	        		<select className="lego-select" name='usesOurCallback' onChange={this.handleUsesOurCallBackChange}>
                <option value={false}>No</option>
  	          		<option value={true}>Yes</option>
  	        		</select>
  	      		</li>
          ) : null
        }

      {
        (this.props.usesOurCallBack === true) ?
        (
          <div>
            <li className="form-field__item">
              <label className="label">
                  What type is your tag when it is ready?
              </label>
              <select className="form-control" name='checkForType' onChange={this.handleTypeChange}>
                  <option value={'function'}>Function</option>
                  <option value={'object'}>Object</option>
              </select>
            </li>
          </div>
        ) : null
      }
      </div>
			)
	}
})

module.exports = TakeCallBacksInput;
















