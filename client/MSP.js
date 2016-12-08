var React = require('react');

import AceEditor from 'react-ace';
var react = require('react-ace');
var Modal = require('react-modal');

var ToggleButton = require('./ToggleButton');
var MIF = require('./MIF');

// styles for modal
const customStyles = {
  content : {
    top                   : '50%',
    left                  : '50%',
    right                 : 'auto',
    bottom                : 'auto',
    marginRight           : '-50%',
    transform             : 'translate(-50%, -50%)',
    height                : '280px',
    width                 : '700px'
  }
};

var MSP = React.createClass({
	getInitialState: function() {
		return {
			optionsReady: false,
			updated: false,
			deleted: false,

			template: '',
			changesToSnippet: '',
			fields: {},
			active: false,

			errors: {}
	  }
	},

	componentWillReceiveProps: function(nextProps) {

		if (Object.keys(nextProps.tag).length > 0) {
	    // nextProps.tag.fields = nextProps.tag.fields.map((field) => {
	    //   return Object.assign({}, field)
	    // })

			this.setState({
				active: nextProps.tag.active,
				changesToSnippet: nextProps.tag.template,
				fields: nextProps.tag.fields,
				optionsReady: true,

				errors: {}
			})
		}
		      
	},

	_getCallBackOptions: function() {

	},

	_setCallBackOptions: function() {

	},

	_validate: function() {

	},

	onUpdate: function() {

	},

	_updateTag: function() {

	},

	onDelete: function() {

	},

	_deleteTag: function() {

	},

	changeTokenValue: function(index, newValue) {
		console.log("reaching here")
		console.log("this state fields", this.state.fields)
		console.log("this state fields index", this.state.fields[index]);
		console.log("this state fields value", this.state.fields[index].value)
		var fields = this.state.fields;
		fields[index].value = newValue;
		this.setState({
			fields: fields
		})
	},

	changeSnippet: function(newSnippet) {
	    this.setState({
	      changesToSnippet: newSnippet
	    });
	},

	updateCustom: function() {
    this.setState({
      template: this.state.changesToSnippet,
      modalIsOpen: false
    })
  },

  changeToggleButton: function(newToggle) {
  	this.setState({
  		active: newToggle
  	})
  },

  changeTrigger: function(newTrigger) {
  	this.setState({
  		trigger: newTrigger
  	})
  },

  changeOption: function(newOption) {
  	this.setState({
  		option: newOption
  	})
  },

	openModal: function() {
	  this.setState({modalIsOpen: true});
	},

	closeModal: function() {
	  this.setState({modalIsOpen: false});
	},

	_mergeTagTokensAndFields: function(tokens, fields) {
    var completeTokens = [];
    var mergedObj = {};
    for (var j = 0; j < fields.length; j++) {
      for (var i = 0; i < tokens.length; i++) {
        if (tokens[i].tokenName === fields[j].name) {
          mergedObj = $.extend({}, fields[j], tokens[i])
          completeTokens.push(mergedObj);
        }
      }
    };

		return completeTokens;
	},

	render: function() {
    if (this.state.deleted) {
      return (
        <div className="sidepanel background--faint">
          <h2 className="push-double--bottom sp-headbig">TAG DETAILS</h2>
          <div className="redbox">
            <p> This tag has now been deleted. This change may take a couple of minutes before it is updated within your Optimizely tag. </p>
            <p> To Re-Add this tag, go to your "Available Tags" tab. </p>
          </div>
        </div>
        )
    }

    if (!this.state.optionsReady) {
      return(
        <div className="sidepanel background--faint">
          <h2 className="push-double--bottom sp-headbig">TAG DETAILS</h2>
          <div> Loading... </div>
        </div>
			 )
    }

    if (this.state.optionsReady) {
		  var completeTokens;

		  if (this.props.tag.tokens && this.props.tag.fields) {
		  	completeTokens = this._mergeTagTokensAndFields(this.props.tag.tokens, this.props.tag.fields)
		  }
			// console.log("This MSP Props", this.props);
			console.log("This MSP State", this.state);
			console.log("This completeTokens", completeTokens)
		  return (
        <div className="sidepanel background--faint">

          <h2 className="push-double--bottom sp-headbig">TAG DETAILS</h2>
          <div className="flex">
             <div> <img className='sidepanel-logo' src={this.props.tag.logo}/> </div>
            <div className='flex flex-v-center'> <div className = 'sidepanel-displayname'> {this.props.tag.displayName} </div> </div>
          </div>
          <div className='sd-headsmall deschead'> DESCRIPTION </div>
          <div className='tagdesc'>{this.props.tag.tagDescription}</div>
          <label className="label label--rule"></label>

          {this.props.tag.name === "custom" ?
          <div>
            <button className="btn-uniform-add button button--highlight" onClick={this.openModal}> Edit Custom Code</button>
            <Modal isOpen={this.state.modalIsOpen} onRequestClose={this.closeModal} style={customStyles}>
              <h2 ref="subtitle">Update Custom Tag</h2>
              <div className='modaltext'>
                <div> Please update your Javascript code here. </div>
                <div className="editor">
                  <AceEditor className="editablecustom" mode="javascript" theme="tomorrow" name="editablecustom" height="120px" width="620px" editorProps={{$blockScrolling: true}} value={this.state.changesToSnippet} onChange={this.changeSnippet}/>
                </div>
              </div>
              <div className='flex pushed-right'>
                <button className="button right-margin" onClick={this.closeModal}> Cancel </button>
                <button className="button button--highlight" onClick={this.updateCustom}> Update Custom Tag </button>
              </div>
            </Modal>
          </div>
          :
        	null
          }

          {completeTokens.map(function(token, i) { return <MIF key={i} index={i} token={token} value={this.state.fields[i].value} onTokenValueChange={this.changeTokenValue} errors={this.state.errors}/>}.bind(this))}

        	<ToggleButton onChange={this.changeToggleButton} active={this.state.active}/>

          <div> <button className="btn-uniform-add button button--highlight">Update Tag</button> </div>
          <div> <button className="btn-uniform-del button button--highlight">Delete</button> </div>

          {this.state.clickUpdate ?
          <div className="yellowbox"> This tag has now been updated. This change may take a couple of minutes before it is updated within your Optimizely tag. </div>
          :
 					 null
          }

       	</div>
	  	)
    }

		return (
	      <div className="sidepanel background--faint">
	        <h2 className="push-double--bottom sp-headbig">TAG DETAILS</h2>
	        <div> Select a Tag to view Details. </div>
	      </div>
	    )
	}
})

module.exports = MSP;


            // <div className="flex">
            //    <div className="flex--1 sd-headsmall"> Called On: </div>
            // </div>

            // {/*this renders trigger options, makes selected trigger the initial trigger option rendered*/}
            // <select className="form-control" name='trackingTrigger' onChange={this.onChange}>
            //   {
            //     ['inHeader', 'onDocumentReady', 'onTrigger', 'onEvent', 'onPageLoad'].map((item) => {
            //       var selected = (item === this.state.trackingTrigger);
            //       return <option value={item} selected={selected}> {item} </option>
            //     })
            //   }
            // </select>



            // {/* Renders each trigger option */}
            // {
            //   (this.state.trackingTrigger === 'onTrigger' || this.state.trackingTrigger === 'onEvent' || this.state.trackingTrigger === 'onPageLoad') ? (
            //     <div>
            //     <div className="flex">
            //       <div className="flex--1 sd-headsmall"> Please Select a Specific Trigger: </div>
            //     </div>

            //     <select className="form-control" name='specificTrigger' value={this.state.specificTrigger} onChange={this.onChange}>
            //       <option selected>Select a trigger</option>
            //     {this.state.triggerOptions[this.state.trackingTrigger].map((trigger) => {
            //       return (trigger === this.state.specificTrigger) ? <option selected value={trigger}>{trigger}</option> : <option value={trigger}>{trigger}</option>
            //       })
            //     }
            //   </select>
            //   </div>
            //   ) : null
            // }


