var React = require('react');
import AceEditor from 'react-ace';
var react = require('react-ace');

var NewTemplate = React.createClass({
  getInitialState: function() {
    return {
      type: '',
      displayName: '',
      description: '',
      fields: [],
      template: '',
      hasCallback: 'true',
      email: '',
      checkForType: 'function',
      checkFor: '',
      usesOurCallback: 'false',
      errors: {'displayName': null, 'type': null, 'email': null},
      logo: null,
      codeExample: '',
      submitted: false
    };
  },

  onChangeFields: function(index, e) {
    var fields = this.state.fields;
    var errors = this.state.errors;
    errors[e.target.name] = false;
    fields[index][e.target.name] = e.target.value;
    this.setState({
      fields: fields,
      errors: errors
    });
  },

  //this change the enable and triggers
  onChange: function(e) {
    var errors = this.state.errors;
    errors[e.target.name] = false;
    //detect empty fields and set errors for the notifications to show
    this.setState({
      errors: this.state.errors
    });
    var newState = Object.assign({}, this.state);
    newState[e.target.name] = e.target.value;
    this.setState(newState);
  },

//set changed for editor
  onChangeSnippet: function(newVal) {
    var errors = this.state.errors;
    errors.template = false;
    this.setState({
      template: newVal,
      errors: this.state.errors
    });
  },

  onSubmit: function(e) {
    e.preventDefault()
    var data = {};
    var errors = {}
    data.fields = JSON.stringify(this.state.fields.map(function(field, i){
      if (!field.tokenName.length) {
        errors[i] = {};
        errors[i]['tokenName'] = `Token name is required`;
      }
      if (!field.tokenDescription.length) {
        errors[i] = errors[i] || {};
        errors[i]['tokenDescription'] = `Token description is required`;
      }

      var f = {};
      f['tokenName'] = field.tokenName;
      f['tokenDescription'] = field.tokenDescription;
      f['token'] = field.tokenName.replace(/ /g, '_');
      f['tokenExample'] = field.tokenExample;
      return f;
    }));

    if (!this.state.displayName.length) {
      errors['displayName'] = `Display name is required`;
    } else {
      data.displayName = this.state.displayName;
      //type is the name we store in the database. We need to remove all the spaces
      var type = this.state.displayName.split(' ').join('_');
      //we have set type default to start with '*' and the backend checks for '*'.
      //therefore if the real type the user input starts with '*', we will remove it
      if (type[0] === '*') {
        data.type = type.slice(1, data.type.length);
      } else {
        data.type = type;
      }
    }
    if (!this.state.email.length) {
      errors['email'] = `Email is required`;
    } else {
      data.email = this.state.email;
    }
    if (!this.state.description.length) {
      errors['description'] = `Description is required`;
    } else {
      data.description = this.state.description;
    }
    if (!this.state.template.length) {
      errors['template'] = `Template is required`;
    } else {
      data.template = this.state.template;
    }

    data.codeExample = this.state.codeExample;

    if (this.state.usesOurCallback === 'true') {
      data.hasCallback = true;
    } else {
      data.hasCallback = this.state.hasCallback;
    }
    data.usesOurCallback = this.state.usesOurCallback;
    data.checkForType = this.state.checkForType;
    data.checkFor = this.state.checkFor;
    data.logo = "/images/Optimizely-logo.png"

    console.log('this is the full data', data)
    if (Object.keys(errors).length === 0) {
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
    } else {
      this.setState({
        errors: errors
      });
    }
  },

  onAddField: function(e) {
    e.preventDefault()
    var fields = this.state.fields.concat({
      tokenName: '',
      tokenDescription: '',
      token: ''
    });
    this.setState({
      fields: fields
    })
  },

  onDeleteField: function(i, e) {
    this.state.fields.splice(i, 1);
    this.setState({
      fields: this.state.fields
    })
  },

  //change the language later
	render: function () {
    //these are error handling for the input field to turn red when there is an error
    var errorDisplayName = (this.state.errors.displayName) ? 'validation' : '';
    var errorType = (this.state.errors.type) ? 'validation' : '';
    var errorEmail = (this.state.errors.email) ? 'validation' : '';
    var errorTemplate = (this.state.errors.template) ? 'validation' : '';
    var errorDescription = (this.state.errors.description) ? 'validation' : '';
    if (!this.state.submitted){
		return (
      <div className="height--1-1">
			  	<div className="flex height--1-1">
			    	<div className="flex--1 soft-double--sides">
				      	<ul className="flex push-double--ends">
							<form className="width-600">
							  	<div className="form__header">
							    	<div className="form__title"> Submit New Custom Template</div>
							    	<p className='justified'> If you do not see a tag you wish to add to your website within our Available Tags tab, please configure and submit a tag below. Your submission will be reviewed and we will get back to you shortly. </p>
							  	</div>
							  	<div>
							    	<ol className="form-fields">
							      		<li className="form-field__item">
							        		<label className="label">
							          			Display Name
							        		</label>
							        		<input type="text" className={`text-input ${errorDisplayName}`} name='displayName' onChange={this.onChange}/>
                          {(this.state.errors.displayName !== false) ? <div className='warning'>{this.state.errors.displayName}</div> : null}
							        		<div className="form-note">This will be the display name for your tag. (Ex. Google Universal Analytics)</div>
							      		</li>
							      		<li className="form-field__item">
							        		<label className="label">
							          			Description
							        		</label>
							        		<input type="text" className={`text-input ${errorDescription}`} name='description' onChange={this.onChange}/>
                          {(this.state.errors.description !== false) ? <div className='warning'>{this.state.errors.description}</div> : null}
							        		<div className="form-note">
							        			<p> This will be the description of your tag that will be displayed in the side panel of this application. </p>
							        			<p> (Ex. Use this tag to insert the Google Universal Analytics tracking code into your website through Optimizely.) </p>
							        		</div>
							      		</li>
							      		<li className="form-field__item">
				        					<label className="label">
							          			Does your tag template natively take callbacks?
							        		</label>
							        		<select name='hasCallback' onChange={this.onChange} className="lego-select">
							          			<option value={true}>Yes</option>
							          			<option value={false}>No</option>
							        		</select>
                          <div>{(this.state.hasCallback === 'true') ? <div className="form-note">Please put <code>{"{{{...}}}"}</code> around your callback</div> : null}</div>
							      		</li>

                        {(this.state.hasCallback === 'false') ?
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
                        (this.state.usesOurCallback === 'true') ?
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

                        <li className="form-field__item">
				        					<label className="label">
							          			Please enter your code here:
							        		</label>
						         			<div className={`editor ${errorTemplate}`}>
								           		<AceEditor
								             		className="editor text-input text-input-styled"
								             		mode="javascript"
								             		theme="tomorrow"
								             		height="100px"
								             		width="600px"
								             		id="comment"
								             		editorProps={{$blockScrolling: true}}
								             		value={this.state.template}
								             		onChange={this.onChangeSnippet}
								           		/>
						        			</div>
                          {(this.state.errors.template !== false) ? <div className='warning'>{this.state.errors.template}</div> : null}
                          <div className="form-note">
							        			<p> Your code will be wrapped in a <code>&lt;script&gt;</code> tag. </p>
							        		</div>
                          </li>
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
                                        var token = '"{{' + item.tokenName.replace(/ /g, '_') + '}}"';
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
							    	</ol>
							  	</div>

                  <li className="form-field__item">
                    <label className="label">
                        What is an email that we can reach you?
                    </label>
                    <input type="text" className={`text-input ${errorEmail}`} name='email' value={this.state.email} onChange={this.onChange}/>
                      {(this.state.errors.email !== false) ? <div className='warning'>{this.state.errors.email}</div> : null}
                    <div className="form-note">
                      <p> We will update you upon the approval of your template. </p>
                    </div>
                  </li>
							  	<div className="form__footer button-row button-row--right">
							    	<button className="button">Cancel</button>
							    	<button className="button button--highlight" onClick={this.onSubmit} >Submit</button>
							  	</div>
							</form>
						</ul>
	    			</div>
	  			</div>
			</div>
		)} else {
      //this tells the user the template is submitted successfully
      return (
        <div className="height--1-1">
  			  	<div className="flex height--1-1">
  			    	<div className="flex--1 soft-double--sides">
                <div className="flex--1 sd-headsmall">You have successfully submitted a new template. We will be in touch shortly.</div>
              </div>
            </div>
          </div>
      )
	}
}
});

module.exports = NewTemplate;
