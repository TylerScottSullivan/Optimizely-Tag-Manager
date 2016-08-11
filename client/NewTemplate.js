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
      approved: false,
      checkForType: '',
      checkFor: ''
    };
  },

  onChangeFields: function(index, e) {
    var fields = this.state.fields;
    fields[index][e.target.name] = e.target.value;
    this.setState({
      fields: fields
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
    var data = {};
    data.fields = []
    this.state.fields.map(function(field, i){
      data.fields.push({})
      data.fields[i]['tokenName'] = field.tokenName;
      data.fields[i]['tokenDescription'] = field.tokenDescription;
      var token = field.tokenName.replace(/ /g, '_');
      data.fields[i]['token'] = token;
    })
    data.type = this.state.type;
    data.email = this.state.email;
    data.description = this.state.description;
    data.displayName = this.state.displayName;
    data.hasCallback = this.state.hasCallback;
    data.template = this.state.template;
    data.approved = this.state.approved;
    data.checkForType = this.state.checkForType;
    data.checkFor = this.state.checkFor;

    console.log('this is the full data', data)
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
      <form method='post'>
       <div className="form-group">
         <div className="flex--1 sd-headsmall">Enter a name for snippet (please do not include spaces):</div>
         <input type="text" className="text-input width--200 text-input-styled" name='type' onChange={this.onChange}/>
       </div>
       <div className="form-group">
         <div className="flex--1 sd-headsmall">Enter display name for snippet:</div>
         <input type="text" className="text-input width--200 text-input-styled" name='displayName' onChange={this.onChange}/>
       </div>
       <div className="form-group">
         <div className="flex--1 sd-headsmall">Enter description for snippet:</div>
         <input type="text" className="text-input width--200 text-input-styled" name='description' onChange={this.onChange}/>
       </div>
       <button onClick={this.onAddField} className="btn-uniform-add button button--highlight">Add field</button>

       <div>
         {
          this.state.fields.map((item, index) => {

             var tokenHere;
             var token = '{{' + item.tokenName.replace(/ /g, '_') + '}}';
             if (item.tokenName) {
               tokenHere = <div name='token' value={token} onChange={this.onChangeFields}>Your field token name is <code>{token}</code></div>
             } else {
               tokenHere = null;
             }
             return (
               <div>
                 <div className="form-group">
                   <div className="flex--1 sd-headsmall">Enter a field name:</div>
                   <input type="text" value={item.tokenName} onChange={this.onChangeFields.bind(this, index)} className="text-input width--200 text-input-styled" name='tokenName'/>
                 </div>
                 {tokenHere}
                 <div className="form-group">
                   <div className="flex--1 sd-headsmall">Enter a field display description:</div>
                   <input  type="text" value={item.tokenDescription} onChange={this.onChangeFields.bind(this, index)} className="text-input width--200 text-input-styled" name='tokenDescription' />
                 </div>
                 <button onClick={this.onDeleteField.bind(this, index)} className="btn-uniform-add button button--highlight">Delete</button>
               </div>
            )
          })
         }
       </div>

       <div className="form-group">
         <div className="flex--1 sd-headsmall">Does your snippet take any callback?</div>
         <select className="form-control" name='hasCallback' onChange={this.onChange}>
           <option value={true}>Yes</option>
           <option value={false}>No</option>
         </select>
         <div>{(this.state.hasCallback === 'true') ? <div>Please put <code>{"{{{...}}}"}</code> around your callback</div> : null}</div>
       </div>
       <div className="form-group">
         <div className="flex--1 sd-headsmall">Would you like us to make your code callbackable?</div>
         <select className="form-control" name='hasCallback' onChange={this.onChange}>
           <option value={true}>Yes</option>
           <option value={false}>No</option>
         </select>
         <div>{(this.state.hasCallback === 'true') ? <div>Please put <code>{"{{{...}}}"}</code> around your callback</div> : null}</div>
       </div>
       <div class="form-group">
         <label className="flex--1 sd-headsmall">What is the name of your tag when should be checking for:</label>
         <input type="text" className="text-input width--200 text-input-styled" name='checkFor' value={this.state.checkFor} onChange={this.onChange} />
       </div>
       <label className="flex--1 sd-headsmall">What type is your tag when it's ready?</label>
       <select class="form-control" name='checkForType' onChange={this.onChange}>
         <option value='function'>function</option>
         <option value='object'>object</option>
       </select>
       <div className="form-group">
         <div className="flex--1 sd-headsmall">Enter your code</div>
         <div className="editor">
           <AceEditor
             className="editor text-input width--200 text-input-styled"
             mode="javascript"
             theme="tomorrow"
             height="100px"
             width="1000px"
             id="comment"
             editorProps={{$blockScrolling: true}}
             value={this.state.template}
             onChange={this.onChangeSnippet}
           />
        </div>
       </div>
       <div className="form-group">
         <div className="flex--1 sd-headsmall">Enter your email:</div>
         <input type="text" className="text-input width--200 text-input-styled" name='email' value={this.state.email} onChange={this.onChange}/>
       </div>
       <button type="submit" onClick={this.onSubmit} className="btn-uniform-add button button--highlight">Submit</button>
      </form>
		)
	}
});

module.exports = NewTemplate;
