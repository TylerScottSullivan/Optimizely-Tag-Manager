var React = require('react');
import AceEditor from 'react-ace';
var react = require('react-ace');
var Modal = require('react-modal');

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

var SearchBar = React.createClass({
	  getInitialState: function() {
	    return {
        modalIsOpen: false,
        name: '',
        tagDescription: '',
        fields: '',
        custom: '',
        trackingTrigger: 'inHeader',
        projectId: "6668600890",
        active: false
      };
	  },

	  openModal: function() {
	  	// console.log('opened modal')
	    this.setState({modalIsOpen: true});
	  },

	  afterOpenModal: function() {
	    // references are now sync'd and can be accessed.
	    this.refs.subtitle.style.color = '#0081BA';
	  },

	  closeModal: function() {
	    this.setState({modalIsOpen: false});
	  },

    addCustomTag: function() {
      var data = {};
      data.active = this.state.active;
      data.trackingTrigger = this.state.trackingTrigger;
      data.projectId = this.state.projectId;
      data.name = this.state.name;
      data.tagDescription = this.state.tagDescription;
      data.custom = this.state.custom;
      this.setState({modalIsOpen: false});

      return $.ajax({
        url: '/',
        type: 'POST',
        data: data,
        success: function(data) {
          console.log('Add custom tag successful')
        },
        error: function(err) {
          console.error("Err posting", err.toString());
        }
      });
    },

    onChange: function(e) {
      var newState = Object.assign({}, this.state);
      newState[e.target.name] = e.target.value;
      this.setState(newState);
    },

    onChangeSnippet: function(newVal) {
        this.setState({
          custom: newVal
        });
    },

	  render: function() {
	    return (
	    	<div>
	        <ul className="flex push-double--ends">
	          <li className="push-triple--right">
	            <div className="button-group">
	              <div> </div>
	              <div className="search">
	                <input type="text" className="text-input text-input--search width--200" placeholder="Filter by Name"/>
	              </div>
	              <button className="button" type="button">Search</button>
	            </div>
	          </li>
	          <li className="anchor--right">
	            <button className="button button--highlight" onClick={this.openModal}>Create Custom Tag</button>
				    <Modal
				      isOpen={this.state.modalIsOpen}
				      onAfterOpen={this.afterOpenModal}
				      onRequestClose={this.closeModal}
				      style={customStyles} >

				      <h2 ref="subtitle">Create Custom Tag</h2>
				      	<div className='modaltext'>
					      <div> Please create your own tag by inserting Javascript </div>
					      <div className="editor">
					        <AceEditor
					        	className="editor"
  							    mode="javascript"
  							    theme="tomorrow"
  							    name="custom"
  							    height="120px"
  							    width="620px"
  							    editorProps={{$blockScrolling: true}}
                    value={this.state.custom}
                    onChange={this.onChangeSnippet}
                  />
						  </div>
              <div className="flex">
                     <div className="flex--1 sd-headsmall"> Name</div>
                </div>
                <div className="flex--1"> Please add the name of your snippet. </div>
                <input required name='name' value={this.state.name} onChange={this.onChange}/>
				   		  <div className="flex">
				               <div className="flex--1 sd-headsmall"> Description</div>
				          </div>
				          <div className="flex--1"> Please add the description of your tag below. </div>
				          <input name='tagDescription' value={this.state.tagDescription} onChange={this.onChange}/>
						    <div className="flex">
				               <div className="flex--1 sd-headsmall"> Called On: </div>
				            </div>
							    <select className="form-control" name='trackingTrigger' value={this.state.trackingTrigger} onChange={this.onChange}>
							      <option value='inHeader'>In header</option>
							      <option value='onPageLoad'>On page load</option>
							    </select>
				            <div className="flex">
				               <div className="flex--1 sd-headsmall"> Enabled or Disabled: </div>
				            </div>
						    <select className="form-control" name='active' value={this.state.active} onChange={this.onChange}>
						      <option value='inHeader'>Enabled</option>
						      <option value='onPageLoad'>Disabled</option>
						    </select>
						  </div>
						  <div className='flex space-between'>
							  <button className="button button--highlight" onClick={this.addCustomTag}> Add Custom Tag </button>
						    <button className="button button--highlight" onClick={this.closeModal}> Close </button>
					    </div>
				    </Modal>
	          </li>
	        </ul>
	      </div>
	    )
	  }
});

module.exports = SearchBar;
