var React = require('react');
import AceEditor from 'react-ace';
var react = require('react-ace');


var SubmitNew = React.createClass({

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

	render: function() {
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
							        		<input type="text" className="text-input"/>
							        		<div className="form-note">This will be the display name for your tag. (Ex. Google Universal Analytics)</div>
							      		</li>
							      		<li className="form-field__item">
							        		<label className="label">
							          			Database Name
						        			</label>
							        		<input type="text" className="text-input"/>
							        		<div className="form-note">This will be the name of your tag in our database. Please do not include spaces. (Ex. Google_Analytics)</div>
							      		</li> 
							      		<li className="form-field__item">
							        		<label className="label">
							          			Description
							        		</label>
							        		<input type="text" className="text-input"/>
							        		<div className="form-note">
							        			<p> This will be the description of your tag that will be displayed in the side panel of this application. </p>
							        			<p> (Ex. Use this tag to insert the Google Universal Analytics tracking code into your website through Optimizely.) </p>
							        		</div>
							      		</li> 
							      		<li className="form-field__item">
				        					<label className="label">
							          			Does your tag template natively take callbacks?
							        		</label>
							        		<select name="zoo" id="zoo" className="lego-select">
							          			<option value={true}>Yes</option>
							          			<option value={false}>No</option>
							        		</select>
							      		</li>
							      		<li className="form-field__item">
				        					<label className="label">
							          			Would you like us to make your code callback-able?
							        		</label>
							        		<select name="zoo" id="zoo" className="lego-select">
							          			<option value={true}>Yes</option>
							          			<option value={false}>No</option>
							        		</select>
							      		</li>
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
							          			<span className="label__optional">(Optional) example</span>
							        		</label>
							        		<input type="text" className="text-input"/>
							        		<div className="form-note">Form Note</div>
							      		</li>
							      		<li className="form-field__item">
							        		<label className="label">Diabled Input</label>
							        		<input type="text" className="text-input" disabled=""/>
							      		</li>
							      		<li className="form-field__item">
							        		<label className="label">Please add all tokens (Access Keys, IDs, etc.) needed for your tag.</label>
							        		<table className="table table--add-row width--1-1">
							          			<tbody>
							          				<tr>
							            				<td>
							            					<label className="label">
							          							Token Name: 
							        						</label>
							            					<input type="text" className="text-input"/>
							        						<div className="form-note">(Ex. ACCESS_TOKEN)</div>
						            					</td>
							            				<td>
							            					<label className="label">
							          							Token Display Name: 
							        						</label>
							            					<input type="text" className="text-input"/>
							        						<div className="form-note">(Ex. Access Token)</div>
						            					</td>
							       						<td>
							            					<label className="label">
							          							Token Example: 
							        						</label>
							            					<input type="text" className="text-input"/>
							        						<div className="form-note">(Ex. UA-123456-7)</div>
						       							</td>
							            				<td className="table--add-row__control">
							            					<label className="label white-font">
							          							Add & Remove
							        						</label>
							              					<div className="flex">
							                					<button className="button push--right">
							                  						<div className="icon pixels">
							                  							<img src="/images/add.png"/>
							                  						</div>
							                					</button>
							                					<button className="button">
							                  						<div className="icon pixels">
							                  							<img src="/images/remove.png"/>
							                  						</div>
							                					</button>
							              					</div>
							            				</td>
							          				</tr>
							        			</tbody>
						        			</table>
							      		</li>
							    	</ol>
							  	</div>
							  	<div className="form__footer button-row button-row--right">
							    	<button className="button">Cancel</button>
							    	<button className="button button--highlight">Submit</button>
							  	</div>
							</form>
						</ul>
	    			</div>
	  			</div>
			</div>
		)
	}
})

module.exports = SubmitNew;

