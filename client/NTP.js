var React = require('react');

import AceEditor from 'react-ace';
var react = require('react-ace');

var DisplayNameInput = require('./DisplayNameInput');
var DataBaseNameInput = require('./DataBaseNameInput');
var DescriptionInput = require('./DescriptionInput');
var TakeCallBacksInput = require('./TakeCallBacksInput');
var AddFieldInputs = require('./AddFieldInputs');
var EmailInput = require('./EmailInput');


var NTP = React.createClass({
	getInitialState: function () {
	    return {
	      displayName: '',
	      dataBaseName: '',
	      description: '',
		 		template: '',
		 		fields: [],
      	email: '',

      	hasCallBack: true,
      	usesOurCallBack: false,
      	type: 'function',

	    	submitted: false,
	    	errors: {}
	    };
	},

	validate: function() {
		console.log("Hits validate and what happens")
		var errors = this.state.errors;

    if (!this.state.displayName.length) {
      errors['displayName'] = ` A display name is required`;
    } else {
      errors['displayName'] = ``;
    }

    if (!this.state.dataBaseName.length || this.state.dataBaseName.includes(' ')) {
      errors['dataBaseName'] = `A valid database name is required.`;
    }  else {
      errors['dataBaseName'] = ``;
    }

    if (!this.state.description.length) {
      errors['description'] = `A description is required.`;
    } else {
      errors['description'] = ``;
    }

    if (!this.state.template.length) {
      errors['template'] = `Valid Javascript code is required.`;
    } else {
   		errors['template'] = ``;
    }

		this.state.fields.map(function(field, i){
      if (!field.tokenName.length || field.tokenName.includes(' ')) {
        errors[i]['tokenName'] = `A valid token name is required.`;
      } else {
        errors[i]['tokenName'] = ''
      }

      if (!field.tokenDisplayName.length) {
        errors[i]['tokenDisplayName'] = `A token Display Name is required.`;
      } else {
        errors[i]['tokenDisplayName'] = ''
      }

      if (!field.tokenExample.length) {
        errors[i]['tokenExample'] = `A token example is required.`;    	
      } else {
        errors[i]['tokenExample'] = ''
      }
    })

    console.log("reaches past the amp function?")

    if (!this.state.email.length || !this.state.email.includes('@') || !this.state.email.includes('.') || this.state.dataBaseName.includes(' ')) {
      errors['email'] = `A Valid email address is required.`;
    } else {
      errors['email'] = ``;
    }

    if (Object.keys(errors).length === 0) {
    	this.setState({ errors: errors })
			this._submitTemplate();
    } else {
    	this.setState({ errors: errors })
    }

		var counter = 0;
		for (var key in errors) {
		  if (errors.hasOwnProperty(key)) {
		  	if (errors[key].length) {
		  		counter++;
		  	}
		  }
		}

		if (counter > 0) {
		  this.setState({ errors: errors })	
		} else {
			this.setState({ errors: errors })
			this._submitTemplate();	
		}
	},

	_submitTemplate: function() {
		console.log("Validated")
		var data = {};

    data.displayName = this.state.displayName;
    data.type = this.state.dataBaseName;
    data.description = this.state.description;
    data.template = this.state.template;
    data.hasCallback = this.state.hasCallBack;
    data.usesOurCallback = this.state.usesOurCallBack;
    data.checkFor = this.state.dataBaseName;
    data.checkForType = this.state.type;
	  data.fields = JSON.stringify(this.state.fields.map(function(field, i){

        var f = {};
        f['tokenName'] = field.tokenName;
        f['tokenDescription'] = field.tokenDisplayName;
        f['token'] = field.tokenName;
        f['tokenExample'] = field.tokenExample;

      return f;
    }));
    data.email = this.state.email;
  	data.codeExample = '';
    data.logo = "/images/Optimizely-logo.png"

    console.log("this data", data);
    return $.ajax({
      url: '/template' + window.location.search,
      type: 'POST',
      data: data,
      success: function(data) {
        console.log('Add new template successful');
        this.setState({submitted: true});
      }.bind(this),
      error: function(err) {
        console.error("Err posting", err.toString());
      }
    })
	},

  changeTemplate: function(newTemplate) {
    this.setState({
      template: newTemplate
    });
  },

  changeDisplayName: function(newDisplayName) {
    this.setState({
      displayName: newDisplayName
    });
  },

  changeDataBaseName: function(newDataBaseName) {
    this.setState({
      dataBaseName: newDataBaseName
    });
  },

  changeDescription: function(newDescription) {
    this.setState({
      description: newDescription
    });
  },

  changeEmail: function(newEmail) {
    this.setState({
      email: newEmail
    });
  },

  changeHasCallBack: function(newHasCallBack) {
  	console.log("changehasCallback")
    this.setState({
      hasCallBack: newHasCallBack
    });
  },

  changeUsesOurCallBack: function(newUsesOurCallBack) {
    this.setState({
      usesOurCallBack: newUsesOurCallBack
    });
  },

  changeType: function(newType) {
    this.setState({
      type: newType
    });
  },

  addField: function() {
  	var newErrors = this.state.errors;
    var newFields = this.state.fields.concat(
																			    { 
																			    	tokenName: '',
																			      tokenDisplayName: '',
																			      tokenExample: ''
																			    }
																		    );

    for (var i = 0; i < newFields.length; i++) {
    	newErrors[i] = {};
    }

    this.setState({
      fields: newFields,
      errors: newErrors
    })
  },

  deleteField: function(index) {
  	console.log("reaching delete");
  	console.log("index", index);
  	console.log("fields", this.state.fields)
  	var newErrors = this.state.errors;
  	var newFields = this.state.fields;
  	newFields.splice(index, 1)
  	newErrors[index] = {};
  	console.log("newFields", newFields)
    this.setState({
      fields: newFields,
      errors: newErrors
    })
  },

	changeFieldName: function(newName, index) {
		console.log("reaches to change field function")
		var newFields = this.state.fields;
		newFields[index]["tokenName"] = newName;
    this.setState({
      fields: newFields
    })
	},

  changeFieldDisplayName: function(newDisplayName, index) {
		var newFields = this.state.fields;
		newFields[index]["tokenDisplayName"] = newDisplayName;
    this.setState({
      fields: newFields
    })
  },

  changeFieldExample: function(newExample, index) {
		var newFields = this.state.fields;
		newFields[index]["tokenExample"] = newExample;
    this.setState({
      fields: newFields
    })
  },


	render: function () {

		if (this.state.submitted) {
	    return (
	      <div className="height--1-1">
	          <div className="flex height--1-1">
	            <div className="flex--1 soft-double--sides">
	              <div className="flex--1 sd-headsmall">You have successfully submitted a new template. We will be in touch shortly.</div>
	            </div>
	          </div>
	        </div>
	    )
	  } else {
	  	return (
        <div className="height--1-1">
  			  	<div className="flex height--1-1">
  			    	<div className="flex--1 soft-double--sides">
  				      	<ul className="flex push-double--ends">
	  								<div className="width-600">  
	  							  	<div className="form__header">
	  							    	<div className="form__title"> Submit New Custom Template</div>
	  							    	<p className='justified'> If you do not see a tag you wish to add to your website within our Available Tags tab, please configure and submit a tag below. Your submission will be reviewed and we will get back to you shortly. </p>
	  							  	</div>
	  							  	<div>
												<ol className="form-fields">
	  							  			<DisplayNameInput onChange={this.changeDisplayName} errors={this.state.errors}/>
	  							  			<DataBaseNameInput onChange={this.changeDataBaseName} errors={this.state.errors}/>
	  							  			<DescriptionInput onChange={this.changeDescription} errors={this.state.errors}/>
	  							  			<TakeCallBacksInput hasCallBack={this.state.hasCallBack} usesOurCallBack={this.state.usesOurCallBack} type={this.state.type}
	  							  													onChangeHasCallBack={this.changeHasCallBack} onChangeUsesOurCallBack={this.changeUsesOurCallBack} onChangeType={this.changeType}/>
				                  <li className="form-field__item">
					        					<label className="label">
								          			Please enter your code here:
								        		</label>
							         			<div className="editor">
									           		<AceEditor
									             		className="editor text-input text-input-styled"
									             		mode="javascript"
									             		theme="tomorrow"
									             		height="100px"
									             		width="600px"
									             		id="comment"
									             		editorProps={{$blockScrolling: true}}
									             		value={this.state.template}
									             		onChange={this.changeTemplate}
									           		/>
							        			</div>
							              <div className='warning'>
							                {this.state.errors['template']}
							              </div>
					       	  			</li>
					       	  			<AddFieldInputs fields={this.state.fields} errors={this.state.errors}
					       	  											onAddField={this.addField} onDeleteField={this.deleteField}
					       	  											onChangeFieldName={this.changeFieldName} onChangeFieldDisplayName={this.changeFieldDisplayName} 
					       	  											onChangeFieldExample={this.changeFieldExample}/>
												</ol>
	  							  	</div>
	  							  	<EmailInput onChange={this.changeEmail} errors={this.state.errors}/>
	  							  	<div className="form__footer button-row button-row--right">
	  							    	<button className="button">Cancel</button>
	  							    	<button className="button button--highlight" onClick={this.validate}>Submit</button>
	  							  	</div>
	  								</div>				      		
  				      	</ul>
  	    			</div>
  	  			</div>
  			</div>
	  		)
	  }
	}
})

module.exports = NTP;

