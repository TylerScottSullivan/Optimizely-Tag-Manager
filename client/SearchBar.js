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

var SearchBar = React.createClass({

  // gets trigger options with ajax call when component is first rendered
  getInitialState: function() {
    var triggerOptions;

    $.ajax({
      url: '/options' + window.location.search,
      type: 'GET',
      success: function(data) {
        var options = {'inHeader': [], 'onDocumentReady': [], 'onPageLoad': [], 'onEvent': [], 'onTrigger': []};
        for (var i = 0; i < data.length; i ++) {
          var d = data[i].split(',');
          if (d[0] === 'inHeader') {
            options['inHeader'].push(d[1])
          } else if (d[0] === 'onDocumentReady') {
            options['onDocumentReady'].push(d[1])
          } else if (d[0] === 'onTrigger') {
            options['onTrigger'].push(d[1])
          } else if (d[0] === 'onEvent') {
            options['onEvent'].push(d[1])
          } else if (d[0] === 'onPageLoad') {
            options['onPageLoad'].push(d[1])
          }
        }
        console.log('optionssss', options)
        this.setState({triggerOptions: options, trackingTrigger: 'inHeader', specificTrigger: options[data[0].split(',')[0]]})
      }.bind(this),
      error: function(err) {
        console.error("Err posting", err.toString());
      }
    });

	  return {
      modalIsOpen: false,
      name: 'custom',
      displayName: '',
      tagDescription: '',
      template: '',
      trackingTrigger: 'inHeader',
      active: true,
      errors: {},
      triggerOptions: [],
      specificTrigger: null
    };
  },

  // opens modal
  openModal: function() {
      this.setState({modalIsOpen: true});
  },

  // not used?
  afterOpenModal: function() {
    // references are now sync'd and can be accessed.
    this.refs.subtitle.style.color = '#0081BA';
  },

  // closes modal
  // gets trigger options with ajax call each time after modal is closed
  closeModal: function() {
	  var triggerOptions;

    $.ajax({
      url: '/options' + window.location.search,
      type: 'GET',
      success: function(triggers) {
        this.setState({triggerOptions: triggers})
      }.bind(this),
      error: function(err) {
        console.error("Err posting", err.toString());
      }
    });

    this.setState({
      modalIsOpen: false,
  		name: 'custom',
  		displayName: '',
  		tagDescription: '',
 			template: '',
  		trackingTrigger: 'inHeader',
  		active: true,
  		errors: {}
    });
  },

  //adds new custom tag, rendering on front end and sending ajax call to backend
  addCustomTag: function() {
    var data = {};
    var errors = {}

    //sets up info correctly to be handled on backend
    data.active = this.state.active;
    var index = Math.floor(Math.random()*1000);
    this.setState({
  		name: 'custom',
  		displayName: '',
  		tagDescription: '',
  		template: '',
  		trackingTrigger: 'inHeader',
  		active: true,
  		errors: {},
  		triggerOptions: []
    });

    data.name = this.state.name;

    data.fields = [];

    // form validation handling
    if (! this.state.displayName) {
      errors['displayName'] = 'name is required';
    } else {
      data.displayName = this.state.displayName;
    }

    if (! this.state.tagDescription) {
      errors['tagDescription'] = 'tag description is required';
    } else {
      data.tagDescription = this.state.tagDescription;
    }

    if (! this.state.template) {
      errors['template'] = 'please add a custom tag';
    } else {
      data.template = this.state.template;
    }
    var trigger;
    if (this.state.trackingTrigger === 'onDocumentReady'||this.state.trackingTrigger === 'inHeader') {
      trigger = this.state.trackingTrigger + ',' + this.state.trackingTrigger;
    } else if (this.state.trackingTrigger === 'onPageLoad' || this.state.trackingTrigger === 'onEvent' || this.state.trackingTrigger === 'onTrigger') {
      trigger = this.state.trackingTrigger + ',' + this.state.specificTrigger;
    }
    data.trackingTrigger = trigger;

    //ajax call to add tag to backend
    if (Object.keys(errors).length === 0) {
      return $.ajax({
        url: '/' + window.location.search,
        type: 'POST',
        data: data,
        success: function(response) {
          // this function rerenders table and sidepanel with newly added tag, separate from ajax call but using the ajax data sent over
        	this.props.onDownload(this.props.downloadedProject.concat(data))
            // gets trigger options with ajax call when component is re-rendered
            $.ajax({
		          url: '/options' + window.location.search,
		          type: 'GET',
		          success: function(triggers) {
		            this.setState({
                  triggerOptions: triggers,
                  modalIsOpen: false
                })
		          }.bind(this),
		          error: function(err) {
		            console.error("Err posting", err.toString());
		          }
		        });
		      }.bind(this),
          error: function(err) {
            console.error("Err posting", err.toString());
          }
      });
    } else {
      // sets errors in state??? IDK. Mojia?
      this.setState({
        errors: errors,
        displayName: this.state.displayName,
        tagDescription: this.state.tagDescription,
        template: this.state.template,
        trackingTrigger: this.state.trackingTrigger,
        active: this.state.active
      });
    }
  },

  //error handling and changes state for enable/disable and triggers
  onChange: function(e) {
    //prevents enable/disable buttons from screwing shit up
    e.preventDefault();

    // verbose way of changing enabled/disabled state
    if (e.target.name === "active") {
      if (this.state.active === false) {
        this.setState({
          active: true
        })
      } else if (this.state.active === true) {
        this.setState({
          active: false
        })
      }
    } else {
      //changes trigger value
      var newState = Object.assign({}, this.state);
      newState[e.target.name] = e.target.value;
      this.setState(newState);
    }
  },

  // changes code editor code (i think) // Mojia?
  onChangeSnippet: function(newVal) {
      this.setState({
        template: newVal
      });
  },

  render: function() {
    // form validation handling
    var errorName = (this.state.errors['displayName']) ? 'validation' : '';
    var errorTagDescription = (this.state.errors['tagDescription']) ? 'validation' : '';
    var errorCustom = (this.state.errors['template']) ? 'validation' : '';

    return (
    	<div>
        <ul className="flex push-double--ends">
          <li className="push-triple--right">
            <div className="button-group">
              <div className="search">
                <input type="text" className="text-input text-input--search width--200" placeholder="Filter by Name"/>
              </div>
              <button className="button" type="button">Search</button>
            </div>
          </li>
          <li className="anchor--right">
            <button className="button button--highlight" onClick={this.openModal}>Create Custom Tag</button>

            {/*shows a modal to input custom code*/}
  			    <Modal
  			      isOpen={this.state.modalIsOpen}
  			      onAfterOpen={this.afterOpenModal}
  			      onRequestClose={this.closeModal}
  			      style={customStyles}
              >

  			      <h2 ref="subtitle">Create Custom Tag</h2>
  		      	<div className='modaltext'>
  				      <div> Please create your own tag by inserting Javascript </div>
  				      <div className="editor">
  				        <AceEditor
  				        	className={`editor ${errorCustom}`}
  							    mode="javascript"
  							    theme="tomorrow"
  							    name="template"
  							    height="120px"
  							    width="620px"
  							    editorProps={{$blockScrolling: true}}
  				          value={this.state.template}
  				          onChange={this.onChangeSnippet}
  				        />
            			{(errorCustom) ? <div className='warning'>{this.state.errors['template']}</div> : null }
  					    </div>

        			  <div className="flex">
               		<div className="flex--1 sd-headsmall"> Name</div>
          		  </div>
         			  <div className="flex--1"> Please add the name of your snippet. </div>
          		  <input name='displayName' className={`${errorName}`} value={this.state.displayName} onChange={this.onChange}/>
          		  {(errorName) ?
                  <div className='warning'>
                    {this.state.errors['displayName']}
                  </div>
                :
                  null
                }

          		  <div className="flex">
  		             <div className="flex--1 sd-headsmall"> Description</div>
  		          </div>
  		          <div className="flex--1">
                  Please add the description of your tag below.
                </div>
  		          <input name='tagDescription' className={`$(errorTagDescription)`} value={this.state.tagDescription} onChange={this.onChange}/>
          		  {(errorTagDescription) ?
                  <div className='warning'>
                    {this.state.errors['tagDescription']}
                  </div>
                :
                  null
                }
              	<div className="flex">
  		          	<div className="flex--1 sd-headsmall"> Called On: </div>
  		          </div>

                {/*this renders the possible trigger options*/}
                <select className="form-control" name='trackingTrigger' onChange={this.onChange}>
                  <option value='inHeader' selected> In Header </option>
                  <option value='onDocumentReady'> On Document Ready</option>
                  <option value='onTrigger'> On Trigger </option>
                  <option value='onEvent'> On Event </option>
                  <option value='onPageLoad'> On Page Load </option>
                </select>



                {/* Renders each trigger option */}
                {
                  (this.state.trackingTrigger === 'onTrigger' || this.state.trackingTrigger === 'onEvent' || this.state.trackingTrigger === 'onPageLoad') ? (
                    <div>
                    <div className="flex">
                      <div className="flex--1 sd-headsmall"> Please Select a Specific Trigger: </div>
                    </div>
                    <select className="form-control" name='specificTrigger' value={this.state.specificTrigger} onChange={this.onChange}>
                      <option value="onDocumentReady" selected disabled>Select a trigger</option>
                    {this.state.triggerOptions[this.state.trackingTrigger].map((trigger) => {
                      return <option value={trigger}>{trigger}</option>
                      })
                    }
                  </select>
                  </div>
                  ) : null
                }

                {/* togglels between enabled and disabled buttons */}
  	    		    <div className="flex togglebutton">
                  {this.state.active === true ?
                    <div>
                      <button className="button button--highlight" name='active' onClick={this.onChange}>Enabled</button>
                      <button className="button" name='active' onClick={this.onChange}>Disabled</button>
                    </div>
  	       				:
                  <div>
                    <button className="button" name='active' onClick={this.onChange}>Enabled</button>
                    <button className="button button--highlight" name='active' onClick={this.onChange}>Disabled</button>
                  </div>
  	        		  }
  	    		    </div>
  	    		  </div>

  			      <div className='flex pushed-right'>
  			        <button className="button right-margin" onClick={this.closeModal}> Cancel </button>
                <button className="button button--highlight" onClick={this.addCustomTag}> Add Custom Tag </button>
  		        </div>
            </Modal>
          </li>
        </ul>
      </div>
    )
  }
});

module.exports = SearchBar;
