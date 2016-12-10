var React = require('react');

var FieldInputs = require('./FieldInputs');

var AddFieldInputs = React.createClass({
	render: function () {
    console.log("this props AddFieldInputs", this.props)
		return (
			<div>
        <li className="form-field__item">
          <label className="label">Please add all tokens (Access Keys, IDs, etc.) needed for your tag.</label>
          <table className="table table--add-row width--1-1">
              <tbody>
                <tr>
                    {(!this.props.fields.length) ?
                      (<button className="button push--right" onClick={this.props.onAddField}>
                          <div className="icon pixels"> <img src="/images/add.png"/> </div>
                      </button>) 
                    :
                     this.props.fields.map((field, index) => {
                        var tokenHere;
                        var token = '{{' + field.tokenName.replace(/ /g, '_') + '}}';
                        if (field.tokenName) {
                          tokenHere = <div name='token'>Your token name is <code>{token}</code> Please insert this into your Javascript code as seen.</div>
                        }
                        return (
                          <FieldInputs key={index} index={index} tokenHere={tokenHere} field={field} errors={this.props.errors}
                                      onAddField={this.props.onAddField} onDeleteField={this.props.onDeleteField}
                                      onChangeFieldName={this.props.onChangeFieldName} onChangeFieldDisplayName={this.props.onChangeFieldDisplayName} 
                                      onChangeFieldExample={this.props.onChangeFieldExample}/>
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

module.exports = AddFieldInputs;

