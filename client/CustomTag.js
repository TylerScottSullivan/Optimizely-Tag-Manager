var React = require('react');

import AceEditor from 'react-ace';
var react = require('react-ace');
var Modal = require('react-modal');

var DisplayName = require('./DisplayName');
var CustomDescription = require('./CustomDescription');
var TriggerOptions = require('./TriggerOptions');
var ToggleButton = require('./ToggleButton');

// styles for modal
const customStyles = {
  content : {
    top                   : '50%',
    left                  : '50%',
    right                 : 'auto',
    bottom                : 'auto',
    marginRight           : '-50%',
    transform             : 'translate(-50%, -50%)',
    height                : '550px',
    width                 : '700px'
  }
};

var CustomTag = React.createClass({

  getInitialState: function() {
		return {
		  modalIsOpen: false,

		  projectDoneLoading: false,

		 	template: '',
		  displayName: '',
		  tagDescription: '',
		  trigger: 'Please Select a Trigger:',
		  option: 'Trigger Options:',
		  active: true,

		  errors: {}

		};
  },

  componentWillReceiveProps: function(nextProps) {
		console.log("HIT WILL RECEIVE PROPS")
		this.setState({
			projectDoneLoading: true
		})
	},

  validate: function() {
  	var errors = {};

    if (!this.state.template) { errors['template'] = 'Javascript is required.'; }
    if (!this.state.displayName) { errors['displayName'] = 'Name is required.'; }
    if (!this.state.tagDescription) { errors['tagDescription'] = 'Tag description is required.'; }
		if (this.state.trigger === 'Please Select a Trigger:') { errors['trigger'] = 'Trigger selection is required.'}
    if ((this.state.trigger === 'onPageLoad' || this.state.trigger === 'onEvent' || this.state.trigger === 'onTrigger') && (this.state.option === 'Trigger Options:')) {
    	errors['option'] = 'Option selection is required.'
    }

    if (Object.keys(errors).length === 0) {
    	this.setState({ errors: {} })
    	this._addCustomTag();
    } else {
    	this.setState({ errors: errors })
    }

  },

  _addCustomTag: function() {
  	console.log("VALIDATED")
  	var data = {};
    var index = Math.floor(Math.random()*10000000000);

    data.customId = index;
    data.fields = [];
    data.name = 'custom';
    data.template = this.state.template;
    data.displayName = this.state.displayName;
    data.tagDescription = this.state.tagDescription;
    if (this.state.trigger === 'onDocumentReady'|| this.state.trigger === 'inHeader') {
       data.trackingTrigger = this.state.trigger + ',' + this.state.trigger;
    } else if (this.state.trigger === 'onPageLoad' || this.state.trigger === 'onEvent' || this.state.trigger === 'onTrigger') {
      data.trackingTrigger = this.state.trigger + ',' + this.state.option;
    }
    data.active = this.state.active;
    
    console.log("state", this.state)
    console.log("data", data)
    return $.ajax({
      url: '/tag' + window.location.search,
      type: 'POST',
      data: data,
      success: function(newCustomTagFromDB) {
      	//response back is new DB custom tag
      	console.log("response", newCustomTagFromDB)
      	this.closeModal();
      	this.props.addTagToProjectTags(newCustomTagFromDB)
      }.bind(this),
      error: function(err) {
        console.error("Err posting", err.toString());
      }
    })
  },

  // changes code editor code 
  changeSnippet: function(newSnippet) {
      this.setState({
        template: newSnippet
      });
  },

  changeDisplayName: function(newName) {
  	this.setState({
  		displayName: newName
  	})
  },

  changeCustomDescription: function(newDescription) {
  	this.setState({
  		tagDescription: newDescription
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

  // opens modal
  openModal: function() {
    this.setState({
      modalIsOpen: true
    });
  },

  closeModal: function() {
    this.setState({
      modalIsOpen: false,

  	  template: '',
  	  displayName: '',
  	  tagDescription: '',
		  trigger: 'Please Select a Trigger:',
		  option: 'Trigger Options:',
      active: true,

      errors: {}

    });
  },

  render: function () {
  	console.log("modal state", this.state)

	  if (!this.state.projectDoneLoading) {
	  	return (
		  	<li className="anchor--right">
				<button className="button button--highlight" onClick={this.openModal}>Create Custom Tag</button>
			      {/*shows a modal to input custom code*/}
				  <Modal isOpen={this.state.modalIsOpen} onRequestClose={this.closeModal} style={customStyles}>
		          <h2 ref="subtitle">Create Custom Tag</h2>
		          <div className='welcome'> Loading... </div> 
		          </Modal>
			  </li>
	  		)
	  }

		return (
		  <li className="anchor--right">
				<button className="button button--highlight" onClick={this.openModal}>Create Custom Tag</button>

			  <Modal isOpen={this.state.modalIsOpen} onRequestClose={this.closeModal} style={customStyles}>
	        <h2 ref="subtitle">Create Custom Tag</h2>

        	<div className='modaltext'>
        		<div> Please create your own tag by inserting Javascript.</div>
			    	<div className="editor">
  				    <AceEditor className={`editor`} mode="javascript" theme="tomorrow" name="template" height="120px" width="620px" editorProps={{$blockScrolling: true}} value={this.state.template} onChange={this.changeSnippet} />
  				    <div className='warning'>
                {this.state.errors['template']}
              </div>
  				  </div>
            <DisplayName onChange={this.changeDisplayName} displayName={this.state.displayName} errors={this.state.errors}/>
            <CustomDescription onChange={this.changeCustomDescription} tagDescription={this.state.tagDescription} errors={this.state.errors}/>
            <TriggerOptions options={this.props.options} onTriggerChange={this.changeTrigger} onOptionChange={this.changeOption} currentTrigger={this.state.trigger} currentOption={this.state.option} errors={this.state.errors}/>
            <ToggleButton onChange={this.changeToggleButton} active={this.state.active}/>
		  		</div>	

		  		<div className='flex pushed-right'>
		  			<button className="button right-margin" onClick={this.closeModal}> Cancel </button>
		        <button className="button button--highlight" onClick={this.validate}>Add Tag</button>
		  		</div>
	     </Modal>

		  </li>
		)
  } 

})

module.exports = CustomTag;
