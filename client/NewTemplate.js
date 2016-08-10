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
      hasCallback: false,
      projectId: "6668600890",
      email: ''
    };
  },

  onChangeFields: function(index, e) {
    var fields = this.state.fields;
    fields[index][e.target.name] = e.target.value;

    this.setState({
      fields: fields
    });
  },

  //this change the enable and triggers
  onChange: function(e) {
    var newState = Object.assign({}, this.state);
    newState[e.target.name] = e.target.value;
    this.setState(newState);
  },

  onChangeSnippet: function(newVal) {
      this.setState({
        template: newVal
      });
  },

  onSubmit: function() {
    var data = {};

    this.state.fields.map(function(field, i){
      data.fields[i]['tokenName'] = field.tokenName;
      data.fields[i]['token'] = field.token;
      data.fields[i]['tokenDescription'] = field.tokenDescription;
    })

    data.type = this.state.type;
    data.email = this.state.email;
    data.description = this.state.description;
    data.displayName = this.state.displayName;
    data.hasCallback = this.state.hasCallback;
    data.template = this.state.template;

    return $.ajax({
      url: '/template',
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
    var hasCallback = (this.state.hasCallback === true) ? <div>{"Please put {{{...}}} around your callback"}</div> : null;
		return (
      <form method='post'>
       <div className="form-group">
         <div className="flex--1 sd-headsmall">Enter a name for snippet (please do not include spaces):</div>
         <input type="text" className="text-input width--200 text-input-styled" name='type' />
       </div>
       <div className="form-group">
         <div className="flex--1 sd-headsmall">Enter display name for snippet:</div>
         <input type="text" className="text-input width--200 text-input-styled" name='displayName'/>
       </div>
       <div className="form-group">
         <div className="flex--1 sd-headsmall">Enter description for snippet:</div>
         <input type="text" className="text-input width--200 text-input-styled" name='description'/>
       </div>
       <button onClick={this.onAddField} className="btn-uniform-add button button--highlight">Add field</button>

       <div>
         {
          this.state.fields.map((item, index) => {
             var token;
             var tokenHere;
            //  console.log('item here', item)
             if (item.tokenName.indexOf(' ') > 1) {
               token = '{{' + item.tokenName.replace(/ /g, '_') + '}}';
             } else {
               token = `{{${item.tokenName}}}`;
             }
             if (item.tokenName) {
               tokenHere = <div value={token}>{`Your field token name is ${token}`}</div>
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
         <select className="form-control" name='hasCallback' value={this.state.hasCallback} onChange={this.onChange}>
           <option value={true}>Yes</option>
           <option value={false}>No</option>
         </select>
         {hasCallback}
       </div>
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
         <input type="text" className="text-input width--200 text-input-styled" name='email'/>
       </div>
       <button type="submit" onClick={this.onSubmit} className="btn-uniform-add button button--highlight">Submit</button>
      </form>
		)
	}
});

module.exports = NewTemplate;
