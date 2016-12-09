var React = require('react');

import AceEditor from 'react-ace';
var react = require('react-ace');

var DisplayNameInput = require('./DisplayNameInput');
var DataBaseNameInput = require('./DataBaseNameInput');
var DescriptionInput = require('./DescriptionInput');
// var TakeCallBacksInput = require('./TakeCallBacksInput');
// var AddFieldsInput = require('./AddFieldsInput');
var EmailInput = require('./EmailInput');


var NTP = React.createClass({
	getInitialState: function () {
	    return {
	      displayName: '',
	      dataBaseName: '',
	      description: '',
		 		template: '',
      	email: '',

	    	submitted: false,
	    	errors: {}
	    };
	},

	validate: function() {
		var errors = {};

    if (!this.state.displayName.length) {
      errors['displayName'] = ` A display name is required`;
    } 

    if (!this.state.dataBaseName.length || this.state.dataBaseName.includes(' ')) {
      errors['dataBaseName'] = `A valid database name is required.`;
    } 

    if (!this.state.description.length) {
      errors['description'] = `A description is required.`;
    } 

    if (!this.state.template.length) {
      errors['template'] = `Valid Javascript code is required.`;
    } 

    if (!this.state.email.length || !this.state.email.includes('@') || !this.state.email.includes('.') || this.state.dataBaseName.includes(' ')) {
      errors['email'] = `A Valid email address is required.`;
    } 

    if (Object.keys(errors).length === 0) {
    	this.setState({ errors: {} })
			this._submitTemplate();
    } else {
    	this.setState({ errors: errors })
    }
	},

	_submitTemplate: function() {
		console.log("Validated")
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
	  							  			{/*TakeCallBacksInput*/}
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
					       	  			{/*AddFieldsInput*/}
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

