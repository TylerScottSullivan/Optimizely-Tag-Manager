var React = require('react');

import AceEditor from 'react-ace';
var react = require('react-ace');
var Modal = require('react-modal');

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

  closeModal: function() {

  },

  addCustomTag: function() {

  },

  onChange: function(e) {

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
      this.setState({modalIsOpen: true});
  },

  // changes code editor code 
  onChangeSnippet: function(newVal) {
      this.setState({
        template: newVal
      });
  },

  render: function () {
	return <div> Hello </div>
  } 

})

module.exports = CustomTag;
