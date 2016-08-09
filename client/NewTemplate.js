var React = require('react');
import AceEditor from 'react-ace';
var react = require('react-ace');


var NewTemplate = React.createClass({
  getInitialState: function() {
    return {
      active: null,
      type: null,
      displayName: null,
      discription: null,
      tokenName: null,
      tokenDisplayName: null,
      tokenDescription: null,
      custom: null,
      hascallback: null,
      projectId: "6668600890",
    };
  },

  onChangeTokens: function(index, e) {
    var tokens = this.state.tokens;
    tokens[index].value = e.target.value;
    this.setState({
      tokens: tokens
    });
  },

//this change the enable and triggers
  onChange: function(e) {
    var newState = Object.assign({}, this.state);
    newState[e.target.name] = e.target.value;
    this.setState(newState);
  },

  onSubmit: function() {
    var data = {};

    this.state.tokens.map(function(token){
      data[token.tokenName] = token.value
    })
    data.active = this.state.active;
    data.trackingTrigger = this.state.trackingTrigger;
    data.projectId = this.state.projectId;
    data.type = this.props.info.name;
    data.tagDescription = this.props.info.tagDescription;
    data.custom = this.props.info.custom;
    data.hasCallback = this.props.info.hasCallback;
    data.callBacks = this.props.info.callBacks;

    return $.ajax({
      url: '/' + window.location.search,
      type: 'POST',
      data: data,
      success: function(data) {
        console.log('Add tag successful');

      },
      error: function(err) {
        console.error("Err posting", err.toString());
      }
    })
  },

  //change the language later
	render: function () {
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
       <div className="form-group">
         <div className="flex--1 sd-headsmall">Enter a field name, code 123456789:</div>
         <input type="text" className="text-input width--200 text-input-styled" name='tokenName'/>
       </div>
       <div className="form-group">
         <div className="flex--1 sd-headsmall">Enter a field display name, code 123456789:</div>
         <input type="text" className="text-input width--200 text-input-styled" name='tokenDisplayName' />
       </div>
       <div className="form-group">
         <div className="flex--1 sd-headsmall">Enter a field description, code 123456789:</div>
         <input type="text" className="text-input width--200 text-input-styled" name='tokenDescription'/>
       </div>
       <div className="form-group">
         <div className="flex--1 sd-headsmall">Does your snippet take any callback?</div>
         <select className="form-control" name='hasCallback' value={this.state.hasCallback} onChange={this.onChange}>
           <option value='yes'>Yes</option>
           <option value='no'>No</option>
         </select>
       </div>
       <div className="form-group">
         <div className="flex--1 sd-headsmall">Your callback code is abcdefg:</div>
       </div>
       <div className="form-group">
       <div for="comment" className="flex--1 sd-headsmall">Enter your code</div>
         <div className="editor">
           <AceEditor
             className="editor text-input width--200 text-input-styled"
             mode="javascript"
             theme="tomorrow"
             name="custom"
             height="1000px"
             width="600px"
             editorProps={{$blockScrolling: true}}
             id="comment"
           />
        </div>
       </div>
       <button type="submit" onClick={this.onSubmit} className="btn-uniform-add button button--highlight">Submit</button>
      </form>
		)
	}
});

module.exports = NewTemplate;
