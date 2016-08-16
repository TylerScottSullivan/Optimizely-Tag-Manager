var React = require('react');
import AceEditor from 'react-ace';
var react = require('react-ace');


var NewTemplate = React.createClass({
  getInitialState: function() {
    return {
      type: '',
      displayName: '',
      discription: '',
      fields: [],
      template: '',
      hasCallback: 'true',
      email: '',
      checkForType: 'function',
      checkFor: '',
      usesOurCallback: 'false',
      errors: {}
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
    console.log('on change fields', this.state.fields)
  },

  //this change the enable and triggers
  onChange: function(e) {
    var newState = Object.assign({}, this.state);
    newState[e.target.name] = e.target.value;
    this.setState(newState);
    console.log('newState', newState)
  },

  onChangeSnippet: function(newVal) {
      this.setState({
        template: newVal
      });
      console.log('onchangeSnippet', this.state.template)
  },

  onSubmit: function() {
    e.preventDefault()
    var data = {};
    var errors = {}
    data.fields = JSON.stringify(this.state.fields.map(function(field, i){
      // var err = [];
      if (!field.tokenName.length) {
        errors[i] = {};
        errors[i]['tokenName'] = `Token name is required`;
      }
      if (!field.tokenDescription.length) {
        errors[i] = errors[i] || {};
        errors[i]['tokenDescription'] = `Token description is required`;
      }
      console.log('err is herereerere', errors)
      // if (err.length) {
      //   errors.fields.push(err)
      // } else {
        var f = {};
        f['tokenName'] = field.tokenName;
        f['tokenDescription'] = field.tokenDescription;
        f['token'] = field.tokenName.replace(/ /g, '_');
        f['tokenExample'] = field.tokenExample;

        return f;
      // }
    }));
    console.log('err222 is herereerere', errors)

    console.log('here are the fields', data.fields)
    data.type = this.state.type;
    data.email = this.state.email;
    data.description = this.state.description;
    data.displayName = this.state.displayName;
    console.log('callback', this.state.usesOurCallback)

    if (this.state.usesOurCallback === 'true') {
      data.hasCallback = true;
    } else {
      data.hasCallback = this.state.hasCallback;
    }
    data.usesOurCallback = this.state.usesOurCallback;
    data.template = this.state.template;
    data.checkForType = this.state.checkForType;
    data.checkFor = this.state.checkFor;

    console.log('this is the full data', data)
    if (Object.keys(errors).length === 0) {
      return $.ajax({
        url: '/template' + window.location.search,
        type: 'POST',
        data: data,
        success: function(data) {
          console.log('Add new template successful');
        },
        error: function(err) {
          console.error("Err posting", err.toString());
        }
      })
    } else {
      console.log('there is an error omg');
      this.setState({
        errors: errors
      });
    }
  },

  onAddField: function() {
    var fields = this.state.fields.concat({
      tokenName: '',
      tokenDescription: '',
      token: ''
    });
    this.setState({
      fields: fields
    })
  },

  onDeleteField: function(i) {
    this.state.fields.splice(i, 1);
    this.setState({
      fields: this.state.fields
    })
  },

  //change the language later
	render: function () {
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
							        		<input type="text" className="text-input" name='displayName' onChange={this.onChange}/>
							        		<div className="form-note">This will be the display name for your tag. (Ex. Google Universal Analytics)</div>
							      		</li>
							      		<li className="form-field__item">
							        		<label className="label">
							          			Database Name
						        			</label>
							        		<input type="text" className="text-input" name='type' onChange={this.onChange}/>
							        		<div className="form-note">This will be the name of your tag in our database. Please do not include spaces. (Ex. Google_Analytics)</div>
							      		</li>
							      		<li className="form-field__item">
							        		<label className="label">
							          			Description
							        		</label>
							        		<input type="text" className="text-input" name='description' onChange={this.onChange}/>
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
     							          			<option value={true}>Yes</option>
     							          			<option value={false}>No</option>
     							        		</select>
     							      		</li>
                          ) : null
                        }

                      {(this.state.usesOurCallback === 'true') ?
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
								             		onChange={this.onChangeSnippet}
								           		/>
						        			</div>
					       	  			</li>
							      		<li className="form-field__item">
							        		<label className="label">
							          			Example
							          			<span className="label__optional" >(Optional) example</span>
							        		</label>
							        		<input type="text" className="text-input" name='codeExample'/>
							        		<div className="form-note">Form Note</div>
							      		</li>
							      		<li className="form-field__item">
							        		<label className="label">Please add all tokens (Access Keys, IDs, etc.) needed for your tag.</label>
							        		<table className="table table--add-row width--1-1">
							          			<tbody>
							          				<tr>
                                    {
                                     this.state.fields.map((item, index) => {
                                        var tokenHere;
                                        var token = '{{' + item.tokenName.replace(/ /g, '_') + '}}';
                                        if (item.tokenName) {
                                          tokenHere = <div name='token' value={token} onChange={this.onChangeFields}>Your field token name is <code>{token}</code></div>
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
          						            					</td>
                                            {tokenHere}
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
							        			</tbody>
						        			</table>
							      		</li>
							    	</ol>
							  	</div>

                  <li className="form-field__item">
                    <label className="label">
                        What is an email that we can reach you?
                    </label>
                    <input type="text" className="text-input" name='email' value={this.state.email} onChange={this.onChange}/>
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
		)
	}
});

module.exports = NewTemplate;
