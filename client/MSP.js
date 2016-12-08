var React = require('react');

import AceEditor from 'react-ace';
var react = require('react-ace');
var Modal = require('react-modal');

var ToggleButton = require('./ToggleButton');
var TriggerOptions = require('./TriggerOptions');
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
			options: [],
			trigger: 'Select a Trigger:',
		  option: 'Trigger Options:',
			active: false,

			errors: {},
			customError: {}
	  }
	},

	componentWillReceiveProps: function(nextProps) {

    if(!nextProps.tag._id) {
      this.setState({optionsReady: true})
    }

    var newOptions;
		if (Object.keys(nextProps.tag).length > 0) {
			fetch('/callbacks/' + nextProps.tag._id + window.location.search)
		  .then((response) => response.json())
		  .then((callBackObjects) => this._setTagOptions(callBackObjects, this.props.options))
		  .then((newOptions) => 
				this.setState({
					changesToSnippet: nextProps.tag.template,
					fields: nextProps.tag.fields,
					optionsReady: true,
					options: newOptions,
					trigger: 'Select a Trigger:',
				  option: 'Trigger Options:',
					active: nextProps.tag.active,
					errors: {},
					customError: {}
				})
			)
		}
		      
	},

	_setTagOptions: function(callBackObjects, options) {
		var newOptions;
		console.log("Options", options);
		console.log("callBackObjects", callBackObjects)
		var callBackArray = [];
		for(var i=0; i < callBackObjects.length; i++) {
			callBackArray.push([callBackObjects[i].name, callBackObjects[i].displayName])
		}

		options[2][1] = callBackArray;
		newOptions = options;

		console.log("new Options", newOptions)

		return newOptions
	},

	// _displayCurrentTrigger: function(tag) {
	// 	var displayNames = { "GA": "Google Universal Analytics",
	// 											 "GC": "Google Classic Analytics",
	// 											 "segment": "Segment",
	// 											 "facebook": "Facebook Tracking Pixel",
	// 											 "amplitude": "Amplitude" }

	// 	var split = tag.trackingTrigger.split(',');
		
	// 	if (split[0] === "inHeader" ) { return ["In Header", 'Trigger Options:']}
	// 	else if (split[0] === "onDocumentReady") {return ["On Document Ready", 'Trigger Options:']} 
	// 	else if (tag.trackingTriggerType === "onPageLoad") {return ["On Page Load", tag.trackingTrigger]} 
	// 	else if (tag.trackingTriggerType  === "onEvent") {return ["On Event", tag.trackingTrigger]}
	// 	else if (tag.trackingTriggerType === "onTrigger") {return ["On Callback", displayNames[tag.trackingTrigger]]}
	// 	else {return ["error", "error"]}
	// },

	validate: function() {
		var errors = {};

    this.state.fields.map((field) => {
      if (!field.value) {
        errors[field.name] = "Value is required";
      }
    })

		if (this.state.trigger === 'Select a Trigger:') { errors['trigger'] = 'Trigger selection is required.' }
    if ((this.state.trigger === 'onPageLoad' || this.state.trigger === 'onEvent' || this.state.trigger === 'onTrigger') && (this.state.option === 'Trigger Options:')) {
    	errors['option'] = 'Option selection is required.'
    }

    if (Object.keys(errors).length === 0) {
    	this.setState({ errors: {} });
    	this._updateTag();
    } else {
    	this.setState({ errors: errors });
    }

	},

	_updateTag: function() {
		console.log("VALIDATED");

	},


	deleteTag: function() {

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

	validateCustom: function() {
		var customError = {};

		if (this.props.tag.name === "custom") {
			if (!this.state.changesToSnippet) {
				customError['changesToSnippet'] = 'Javascript is required.'
			}
		}

    if (Object.keys(customError).length === 0) {
    	this.setState({ customError: {} });
    	this._updateCustom();
    } else {
    	this.setState({ customError: customError });
    }

	},

	_updateCustom: function() {
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

    if (this.state.optionsReady && Object.keys(this.props.tag).length !== 0) {
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
	              <div className='warning'>
	                {this.state.customError['changesToSnippet']}
	              </div>
              </div>
              <div className='flex pushed-right'>
                <button className="button right-margin" onClick={this.closeModal}> Cancel </button>
                <button className="button button--highlight" onClick={this.validateCustom}> Update Custom Tag </button>
              </div>
            </Modal>
          </div>
          :
        	null
          }

          {completeTokens.map(function(token, i) { return <MIF key={i} index={i} token={token} value={this.state.fields[i].value} onTokenValueChange={this.changeTokenValue} errors={this.state.errors}/>}.bind(this))}
          <TriggerOptions options={this.state.options} onTriggerChange={this.changeTrigger} onOptionChange={this.changeOption} currentTrigger={this.state.trigger} currentOption={this.state.option} errors={this.state.errors}/>
        	<ToggleButton onChange={this.changeToggleButton} active={this.state.active}/>

          <div> <button className="btn-uniform-add button button--highlight" onClick={this.validate}>Update Tag</button> </div>
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


