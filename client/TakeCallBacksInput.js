var React = require('react');

var TakeCallBacksInput = React.createClass({
	render: function () {
		return (

				      		<li className="form-field__item">
	        					<label className="label">
				          			Does your tag template natively take callbacks?
				        		</label>
				        		<select name='hasCallback' onChange={this.onChange} className="lego-select">
				          			<option value={true}>Yes</option>
				          			<option value={false}>No</option>
				        		</select>
                    <div>{(this.state.hasCallback === true) ? <div className="form-note">Please put <code>{"{{{...}}}"}</code> around your callback</div> : null}</div>
				      		</li>

                  {(this.state.hasCallback === false) ?
                     (
                       <li className="form-field__item">
				        					<label className="label">
							          			Would you like us to make your code callback-able?
							        		</label>
							        		<select className="lego-select" name='usesOurCallback' onChange={this.onChange}>
                          <option value={false}>No</option>
							          		<option value={true}>Yes</option>
							        		</select>
							      		</li>
                    ) : null
                  }

                {
                  (this.state.usesOurCallback === true) ?
                  (
                    <div>
                    <li className="form-field__item">
                     <label className="label">
                         What is the name of your tag we should be checking for？
                     </label>
                     <input type="text" className="text-input" name='checkFor' onChange={this.onChange} />
                   </li>
                   <li className="form-field__item">
                    <label className="label">
                        What type is your tag when it is ready?
                    </label>
                    <select className="form-control" name='checkForType' onChange={this.onChange}>
                        <option value={'function'}>function</option>
                        <option value={'object'}>object</option>
                    </select>
                  </li>
                  </div>
                  ) : null
                }
			)
	}
})

module.exports = TakeCallBacksInput;
















