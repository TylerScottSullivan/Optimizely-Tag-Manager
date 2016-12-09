var React = require('react');

var AddFieldsInput = React.createClass({
	render: function () {
		return (
			<div>
        <li className="form-field__item">
          <label className="label">Please add all tokens (Access Keys, IDs, etc.) needed for your tag.</label>
          <table className="table table--add-row width--1-1">
              <tbody>
                <tr>
                    {(!this.state.fields.length) ?
                      (<button className="button push--right" onClick={this.onAddField} >
                          <div className="icon pixels">
                            <img src="/images/add.png"/>
                          </div>
                      </button>) :
                     this.state.fields.map((item, index) => {
                        var tokenHere;
                        var token = '{{' + item.tokenName.replace(/ /g, '_') + '}}';
                        if (item.tokenName) {
                          tokenHere = <div name='token' value={token} onChange={this.onChangeFields}>Your token name is <code>{token}</code></div>
                        } else {
                          tokenHere = null;
                        }
                        if (this.state.errors[index]) {
                          var errName = this.state.errors[index]['tokenName'] || null;
                          var errDescription = this.state.errors[index]['tokenDescription'] || null;
                        }
                        return (
                          <div>
                            <td>
                              <label className="label">
                                Token Name:
                            </label>
                              <input type="text" name='tokenName' className="text-input" value={item.tokenName} onChange={this.onChangeFields.bind(this, index)}/>
                            <div className="form-note">(Ex. ACCESS_TOKEN)</div>
                              {tokenHere}
                            </td>
                            <td>
                              <label className="label">
                                Token Display Name:
                            </label>
                              <input type="text" className="text-input" value={item.tokenDescription} onChange={this.onChangeFields.bind(this, index)} name='tokenDescription' />
                            <div className="form-note">(Ex. Access Token)</div>
                            </td>
                          <td>
                              <label className="label">
                                Token Example:
                            </label>
                              <input type="text" className="text-input" value={item.tokenExample} onChange={this.onChangeFields.bind(this, index)} name='tokenExample'/>
                            <div className="form-note">(Ex. UA-123456-7)</div>
                          </td>
                          <td className="table--add-row__control">
                            <label className="label white-font">
                              Add & Remove
                          </label>
                              <div className="flex">
                                <button className="button push--right" onClick={this.onAddField} >
                                    <div className="icon pixels">
                                      <img src="/images/add.png"/>
                                    </div>
                                </button>
                                <button className="button" onClick={this.onDeleteField.bind(this, index)}>
                                    <div className="icon pixels">
                                      <img src="/images/remove.png"/>
                                    </div>
                                </button>
                              </div>
                          </td>
                        </div>
                       )
                     })
                    }
                </tr>
                <tr></tr>
            </tbody>
          </table>
        </li>
      </div>
			)
	}
})

module.exports = AddFieldsInput;

