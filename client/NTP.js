var React = require('react');


var DisplayNameInput = require('./DisplayNameInput');
var EmailInput = require('./EmailInput');


var NTP = React.createClass({
	getInitialState: function () {
	    return {
	    	submitted: false
	    };
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
	  								<form className="width-600">  
	  							  	<div className="form__header">
	  							    	<div className="form__title"> Submit New Custom Template</div>
	  							    	<p className='justified'> If you do not see a tag you wish to add to your website within our Available Tags tab, please configure and submit a tag below. Your submission will be reviewed and we will get back to you shortly. </p>
	  							  	</div>
	  							  	<div>
												<ol className="form-fields">
	  							  			<DisplayNameInput/>
												</ol>
	  							  	</div>
	  							  	<EmailInput/>
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
	}
})

module.exports = NTP;



				// <form className="width-600">
				//   	<div>
				//     	<ol className="form-fields">

				//       		<li className="form-field__item">
				//         		<label className="label">
				//           			Database Name
			 //        			</label>
				//         		<input type="text" className={`text-input ${errorType}`} name='type' onChange={this.onChange}/>
    //                 {(this.state.errors.type !== false) ? <div className='warning'>{this.state.errors.type}</div> : null}
				//         		<div className="form-note">This will be the name of your tag in our database. Please do not include spaces. (Ex. Google_Analytics)</div>
				//       		</li>
				//       		<li className="form-field__item">
				//         		<label className="label">
				//           			Description
				//         		</label>
				//         		<input type="text" className={`text-input ${errorDescription}`} name='description' onChange={this.onChange}/>
    //                 {(this.state.errors.description !== false) ? <div className='warning'>{this.state.errors.description}</div> : null}
				//         		<div className="form-note">
				//         			<p> This will be the description of your tag that will be displayed in the side panel of this application. </p>
				//         			<p> (Ex. Use this tag to insert the Google Universal Analytics tracking code into your website through Optimizely.) </p>
				//         		</div>
				//       		</li>
				//       		<li className="form-field__item">
	   //      					<label className="label">
				//           			Does your tag template natively take callbacks?
				//         		</label>
				//         		<select name='hasCallback' onChange={this.onChange} className="lego-select">
				//           			<option value={true}>Yes</option>
				//           			<option value={false}>No</option>
				//         		</select>
    //                 <div>{(this.state.hasCallback === true) ? <div className="form-note">Please put <code>{"{{{...}}}"}</code> around your callback</div> : null}</div>
				//       		</li>

    //               {(this.state.hasCallback === false) ?
    //                  (
    //                    <li className="form-field__item">
				//         					<label className="label">
				// 			          			Would you like us to make your code callback-able?
				// 			        		</label>
				// 			        		<select className="lego-select" name='usesOurCallback' onChange={this.onChange}>
    //                       <option value={false}>No</option>
				// 			          		<option value={true}>Yes</option>
				// 			        		</select>
				// 			      		</li>
    //                 ) : null
    //               }

    //             {
    //               (this.state.usesOurCallback === true) ?
    //               (
    //                 <div>
    //                 <li className="form-field__item">
    //                  <label className="label">
    //                      What is the name of your tag we should be checking for？
    //                  </label>
    //                  <input type="text" className="text-input" name='checkFor' onChange={this.onChange} />
    //                </li>
    //                <li className="form-field__item">
    //                 <label className="label">
    //                     What type is your tag when it is ready?
    //                 </label>
    //                 <select className="form-control" name='checkForType' onChange={this.onChange}>
    //                     <option value={'function'}>function</option>
    //                     <option value={'object'}>object</option>
    //                 </select>
    //               </li>
    //               </div>
    //               ) : null
    //             }

    //               <li className="form-field__item">
	   //      					<label className="label">
				//           			Please enter your code here:
				//         		</label>
			 //         			<div className={`editor ${errorTemplate}`}>
				// 	           		<AceEditor
				// 	             		className="editor text-input text-input-styled"
				// 	             		mode="javascript"
				// 	             		theme="tomorrow"
				// 	             		height="100px"
				// 	             		width="600px"
				// 	             		id="comment"
				// 	             		editorProps={{$blockScrolling: true}}
				// 	             		value={this.state.template}
				// 	             		onChange={this.onChangeSnippet}
				// 	           		/>
			 //        			</div>
    //                 {(this.state.errors.template !== false) ? <div className='warning'>{this.state.errors.template}</div> : null}
	   //     	  			</li>
				//       		<li className="form-field__item">
				//         		<label className="label">Please add all tokens (Access Keys, IDs, etc.) needed for your tag.</label>
				//         		<table className="table table--add-row width--1-1">
				//           			<tbody>
				//           				<tr>
    //                           {(!this.state.fields.length) ?
    //                             (<button className="button push--right" onClick={this.onAddField} >
    //                                 <div className="icon pixels">
    //                                   <img src="/images/add.png"/>
    //                                 </div>
    //                             </button>) :
    //                            this.state.fields.map((item, index) => {
    //                               var tokenHere;
    //                               var token = '{{' + item.tokenName.replace(/ /g, '_') + '}}';
    //                               if (item.tokenName) {
    //                                 tokenHere = <div name='token' value={token} onChange={this.onChangeFields}>Your token name is <code>{token}</code></div>
    //                               } else {
    //                                 tokenHere = null;
    //                               }
    //                               if (this.state.errors[index]) {
    //                                 var errName = this.state.errors[index]['tokenName'] || null;
    //                                 var errDescription = this.state.errors[index]['tokenDescription'] || null;
    //                               }
    //                               return (
    //                                 <div>
    // 							            				<td>
    // 							            					<label className="label">
    // 							          							Token Name:
    // 							        						</label>
    // 							            					<input type="text" name='tokenName' className="text-input" value={item.tokenName} onChange={this.onChangeFields.bind(this, index)}/>
    // 							        						<div className="form-note">(Ex. ACCESS_TOKEN)</div>
    //                                     {tokenHere}
    // 						            					</td>
    // 							            				<td>
    // 							            					<label className="label">
    // 							          							Token Display Name:
    // 							        						</label>
    // 							            					<input type="text" className="text-input" value={item.tokenDescription} onChange={this.onChangeFields.bind(this, index)} name='tokenDescription' />
    // 							        						<div className="form-note">(Ex. Access Token)</div>
    // 						            					</td>
    // 							       						<td>
    // 							            					<label className="label">
    // 							          							Token Example:
    // 							        						</label>
    // 							            					<input type="text" className="text-input" value={item.tokenExample} onChange={this.onChangeFields.bind(this, index)} name='tokenExample'/>
    // 							        						<div className="form-note">(Ex. UA-123456-7)</div>
    // 						       							</td>
    // 						            				<td className="table--add-row__control">
    // 						            					<label className="label white-font">
    // 						          							Add & Remove
    // 						        						</label>
    // 						              					<div className="flex">
    // 						                					<button className="button push--right" onClick={this.onAddField} >
    // 						                  						<div className="icon pixels">
    // 						                  							<img src="/images/add.png"/>
    // 						                  						</div>
    // 						                					</button>
    // 						                					<button className="button" onClick={this.onDeleteField.bind(this, index)}>
    // 						                  						<div className="icon pixels">
    // 						                  							<img src="/images/remove.png"/>
    // 						                  						</div>
    // 						                					</button>
    // 						              					</div>
    // 						            				</td>
    //                               </div>
    //                              )
    //                            })
    //                           }
				//           				</tr>
    //                       <tr></tr>
				//         			</tbody>
			 //        			</table>
				//       		</li>
				//     	</ol>
				//   	</div>

				// </form>
