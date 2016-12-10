var React = require('react');

var FieldInputs = React.createClass({
  handleFieldNameChange: function(e) {
    var newValue = e.target.value;
    this.props.onChangeFieldName(newValue, this.props.index)
  },
  
  handleFieldDisplayNameChange: function(e) {
    var newValue = e.target.value;
    this.props.onChangeFieldDisplayName(newValue, this.props.index)
  },

  handleFieldExampleChange: function(e) {
    var newValue = e.target.value;
    this.props.onChangeFieldExample(newValue, this.props.index)
  },
  
  handleDeleteField: function() {
    this.props.onDeleteField(this.props.index)
  },

	render: function () {
    console.log("FieldInput Props", this.props)
    console.log("field", this.props.field)
    console.log("tokenName", this.props.field.tokenName)
    console.log("displayName", this.props.field.tokenDisplayName)
    console.log("example", this.props.field.tokenExample)
		return (
      <div>
        <div className="form-note">{this.props.tokenHere}</div>
        <td>
          <label className="label">
            Token Name:
          </label>
          <input type="text" name='tokenName' className="text-input" value={this.props.field.tokenName} onChange={this.handleFieldNameChange}/>
          <div className='warning'>
            {this.props.errors[this.props.index]['tokenName']}
          </div>
          <div className="form-note">(Ex. ACCESS_TOKEN)</div>
        </td>
        <td>
          <label className="label">
            Token Display Name:
          </label>
          <input type="text" className="text-input" value={this.props.field.tokenDisplayName} onChange={this.handleFieldDisplayNameChange} name='tokenDisplayName' />
          <div className='warning'>
            {this.props.errors[this.props.index]['tokenDisplayName']}
          </div>
          <div className="form-note">(Ex. Access Token)</div>
        </td>
        <td>
          <label className="label">
            Token Example:
          </label>
          <input type="text" className="text-input" value={this.props.field.tokenExample} onChange={this.handleFieldExampleChange} name='tokenExample'/>
         <div className='warning'>
            {this.props.errors[this.props.index]['tokenExample']}
          </div>
          <div className="form-note">(Ex. UA-123456-7)</div>
      </td>
      <td className="table--add-row__control">
        <label className="label white-font">
          Add & Remove
        </label>
        <div className="flex">
          <button className="button push--right" onClick={this.props.onAddField} >
              <div className="icon pixels">
                <img src="/images/add.png"/>
              </div>
          </button>
          <button className="button" onClick={this.handleDeleteField}>
              <div className="icon pixels">
                <img src="/images/remove.png"/>
              </div>
          </button>
        </div>
      </td>
    </div>
			)
	}
})

module.exports = FieldInputs;
