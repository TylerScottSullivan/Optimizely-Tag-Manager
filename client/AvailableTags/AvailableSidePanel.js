var React = require('react');

var AvailableInputFields = require('./AvailableInputFields');
var ToggleButton = require('../ToggleButton');
var TriggerOptions = require('../TriggerOptions');

var AvailableSidePanel = React.createClass({
	getInitialState: function() {
	    return {
	    	tokens: {},
			  trigger: 'Select a Trigger:',
			  option: 'Trigger Options:',
			  active: true,

			  errors: {}
	    };
	},

	componentWillReceiveProps:function (nextProps) {
    // if nextProps is a tag, resets State
		if (Object.keys(nextProps.tag).length > 0) {

      // sets value field for each token
	    nextProps.tag.tokens = nextProps.tag.tokens.map((token) => {
	      return Object.assign({}, token, {value: ''})
	    })
			this.setState({
				tokens: nextProps.tag.tokens,
				trigger: 'Select a Trigger:',
			  option: 'Trigger Options:',
			  active: true,

			  errors: {}
			})
		}
	},

  // validates form on Add Tag button click - if form has errors, displays them
	validate: function() {
		var errors = {};

    this.state.tokens.map((token) => {
      if (!token.value) {
        errors[token.tokenDisplayName] = "Value is required";
      }
    })

		if (this.state.trigger === 'Select a Trigger:') { errors['trigger'] = 'Trigger selection is required.' }
    if ((this.state.trigger === 'onPageLoad' || this.state.trigger === 'onEvent' || this.state.trigger === 'onTrigger') && (this.state.option === 'Trigger Options:')) {
    	errors['option'] = 'Option selection is required.'
    }

    // if no errors, calls _addTag
    if (Object.keys(errors).length === 0) {
    	this.setState({ errors: {} });
    	this._addTag();
    } else {
    	this.setState({ errors: errors });
    }
	},

  // adds tag to DB
	_addTag: function() {
		var data = {};

    // sets data for add tag ajax call
    data.name = this.props.tag.name;
    data.tagDescription = this.props.tag.tagDescription;
    data.template = this.props.tag.template;
    data.hasCallback = this.props.tag.hasCallback;
    data.callBacks = this.props.tag.callBacks; // undefined
    this.state.tokens.map((token) => {
      data[token.tokenName] = token.value;
    })
    if (this.state.trigger === 'onDocumentReady'|| this.state.trigger === 'inHeader') {
       data.trackingTrigger = this.state.trigger + ',' + this.state.trigger;
    } else if (this.state.trigger === 'onPageLoad' || this.state.trigger === 'onEvent' || this.state.trigger === 'onTrigger') {
      data.trackingTrigger = this.state.trigger + ',' + this.state.option;
    }
    data.active = this.state.active

    return $.ajax({
      url: '/tag' + window.location.search,
      type: 'POST',
      data: data,
      success: function(newTagFromDB) {
      	//displays added notification, rerenders panels
        this.props.tag.added = true
      	this.props.addTagToProjectTags(newTagFromDB)
      }.bind(this),
      error: function(err) {
        console.error("Err posting", err.toString());
      }
    })
	},

	changeTokenValue: function(index, newValue) {
		var tokens = this.state.tokens;
		tokens[index].value = newValue;
		this.setState({
			tokens: tokens
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

  // renders side panel on Available Tags tab, displays tag if clicked from table row
	render: function() {
		if (Object.keys(this.props.tag).length !== 0) {
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

        	{this.props.tag.tokens.map((token, i) => { return <AvailableInputFields key={i} index={i} token={token} onTokenValueChange={this.changeTokenValue} errors={this.state.errors}/> })}
        	<TriggerOptions options={this.props.options} onTriggerChange={this.changeTrigger} onOptionChange={this.changeOption} currentTrigger={this.state.trigger} currentOption={this.state.option} errors={this.state.errors}/>
        	<ToggleButton onChange={this.changeToggleButton} active={this.state.active}/>

          {this.props.tag.added ?
          <div>
            <div> <button className="btn-uniform-add button button--highlight" disabled>Add Tag</button> </div>
            <div className="greenbox">
              <p> This tag has now been added to 'My Tags.' This change may take a couple of minutes to update. </p>
              <p> Go to 'My Tags' to Update, Delete, or Disable this tag. </p>
            </div>
          </div>
          :
          <div>
             <button className="btn-uniform-add button button--highlight" onClick={this.validate}>Add Tag</button>
          </div>
          }
        </div>
      )

    } else {
      // if no tag has been selected
      return (
        <div>
          <div className="sidepanel background--faint">
            <h2 className="push-double--bottom sp-headbig">TAG DETAILS</h2>
            <div> Select a Tag to add to My Tags. </div>
          </div>
        </div>
      )

    }

  }
})

module.exports = AvailableSidePanel;

