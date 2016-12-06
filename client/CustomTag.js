var React = require('react');

import AceEditor from 'react-ace';
var react = require('react-ace');
var Modal = require('react-modal');

var DisplayName = require('./DisplayName');
var CustomDescription = require('./CustomDescription');
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

  _reloadOptions: function() {

  },

  componentWillReceiveProps: function() {

  },

  addCustomTag: function() {

  },

  onChange: function(e) {

  },

  changeToggleButton: function(newToggle) {
  	this.setState({
  		active: newToggle
  	})
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

  getInitialState: function() {
	return {
      modalIsOpen: false,
      name: 'custom',
      displayName: '',
      tagDescription: '',
      template: '',
      trackingTrigger: 'inHeader',
      active: true,
      errors: {},
      triggerOptions: {'inHeader': [], 'onDocumentReady': [], 'onPageLoad': [], 'onEvent': [], 'onTrigger': []},
      specificTrigger: null,
      customId: null
    };
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
  	  name: 'custom',
  	  displayName: '',
  	  tagDescription: '',
 	  template: '',
  	  trackingTrigger: 'inHeader',
      active: true,
  	  errors: {},
      customId: null
    });
  },

  // changes code editor code 
  onChangeSnippet: function(newVal) {
      this.setState({
        template: newVal
      });
  },

  render: function () {
  	console.log("modal state", this.state)
	return (
	  <li className="anchor--right">
		<button className="button button--highlight" onClick={this.openModal}>Create Custom Tag</button>
	      {/*shows a modal to input custom code*/}
		  <Modal isOpen={this.state.modalIsOpen} onRequestClose={this.closeModal} style={customStyles} >
            <h2 ref="subtitle">Create Custom Tag</h2>
            <DisplayName onChange={this.changeDisplayName} displayName={this.state.displayName}/>
            <CustomDescription onChange={this.changeCustomDescription} tagDescription={this.state.tagDescription}/>
            <ToggleButton onChange={this.changeToggleButton} active={this.state.active}/>
  			
  			<div className='flex pushed-right'>
  			  <button className="button right-margin" onClick={this.closeModal}> Cancel </button>
              <button className="button button--highlight" onClick={this.addCustomTag}>Add Tag</button>
  		    </div>
          </Modal>
	  </li>
	)
  } 

})

module.exports = CustomTag;
