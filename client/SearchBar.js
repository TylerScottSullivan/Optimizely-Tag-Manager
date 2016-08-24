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
    height                : '580px',
    width                 : '700px'
  }
};

var SearchBar = React.createClass({
  //gets all the options
  //this is called at getInitialState, in the success callback of onAddTag, closeModal, componentWillReceiveProps
  _reloadOptions: function() {
    $.ajax({
      url: '/options' + window.location.search,
      type: 'GET',
      success: function(data) {
        var options = {'inHeader': [], 'onDocumentReady': [], 'onPageLoad': [], 'onEvent': [], 'onTrigger': []};
        for (var i = 0; i < data.length; i++) {
          var d = data[i].split(',');
          for (var option in options) {
            if (d[0] === option) {
              options[option].push(d[1]);
            }
          }
        }
        this.setState({triggerOptions: options, specificTrigger: options[data[0].split(',')[0]]})
      }.bind(this),
      error: function(err) {
        console.error("Err posting", err.toString());
      }
    });
  },
  // gets trigger options with ajax call when component is first rendered
  getInitialState: function() {
    this._reloadOptions();
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
      customId: null,
      clicked: false
    };
  },

  componentWillReceiveProps: function(nextProps) {
    this.setState({trackingTrigger: 'inHeader'})
    // gets trigger options with ajax call when component is first rendered
    this._reloadOptions();
  },

  // opens modal
  openModal: function() {
      this.setState({modalIsOpen: true});
  },

  // closes modal
  closeModal: function() {
    //resets the model to default, so all fields are empty the next time the user opens
    this.setState({
      modalIsOpen: false,
  		name: 'custom',
  		displayName: '',
  		tagDescription: '',
 			template: '',
  		trackingTrigger: 'inHeader',
  		active: true,
  		errors: {},
      customId: null,
      clicked: false
    });
  },

  //adds new custom tag, rendering on front end and sending ajax call to backend
  addCustomTag: function() {
    //set clicked to true indicating the user has clicked on add. The button will be immediately disabled.
    //prevent from double clicking
    this.setState({clicked: true})
    var data = {};
    var errors = {};

    //sets up info correctly to be handled on backend
    data.active = this.state.active;
    var index = Math.floor(Math.random()*10000000000);

    data.name = this.state.name;
    data.customId = index;
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
    console.log('here is the full data', data)
    //this resets the states after sending
    this.setState({
      name: 'custom',
      displayName: '',
      tagDescription: '',
      template: '',
      trackingTrigger: 'inHeader',
      active: true,
      errors: {},
      triggerOptions: {'inHeader': [], 'onDocumentReady': [], 'onPageLoad': [], 'onEvent': [], 'onTrigger': []},
    });
    //ajax call to add tag to backend
    if (Object.keys(errors).length === 0) {
      return $.ajax({
        url: '/' + window.location.search,
        type: 'POST',
        data: data,
        success: function(response) {
          // this function rerenders table and sidepanel with newly added tag, separate from ajax call but using the ajax data sent over
        	this.props.onDownload(this.props.downloadedProject.concat(response))
          this._reloadOptions();
          this.setState({
            modalIsOpen: false,
            clicked: false
          })
		      }.bind(this),
          error: function(err) {
            console.error("Err posting", err.toString());
          }
      });
    } else {
      // sets errors in state when there are errors, so the error notification appear
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
    const expandTriggers = ['onTrigger', 'onEvent', 'onPageLoad'];
    const notExpandTriggers = ['inHeader', 'onDocumentReady'];
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

    var changingCalledOn = e.target.name === "trackingTrigger";
    var movingToNotExpand = notExpandTriggers.indexOf(e.target.value) > -1;
    var movingToExpand = expandTriggers.indexOf(e.target.value) > -1;

    if (changingCalledOn) {
      if (movingToNotExpand) {
        this.setState({
          specificTrigger: e.target.value
        })
      }
      else if (movingToExpand) {
        this.setState({
          specificTrigger: "Select a trigger"
        })
      }
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
    //this is the search bar
    // <div className="button-group">
    //   <div className="search">
    //     <input type="text" className="text-input text-input--search width--200" placeholder="Filter by Name"/>
    //   </div>
    //   <button className="button" type="button">Search</button>
    // </div>
    return (
    	<div>
        <ul className="flex push-double--ends">
          <li className="push-triple--right">
          </li>
          <li className="anchor--right">
            <button className="button button--highlight" onClick={this.openModal}>Create Custom Tag</button>

            {/*shows a modal to input custom code*/}
  			    <Modal
  			      isOpen={this.state.modalIsOpen}
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


                {
                  (this.state.trackingTrigger === 'onTrigger' || this.state.trackingTrigger === 'onEvent' || this.state.trackingTrigger === 'onPageLoad') ? (
                    <div>
                    <div className="flex">
                      <div className="flex--1 sd-headsmall"> Please Select a Specific Trigger: </div>
                    </div>
                    <select className="form-control" name='specificTrigger' value={this.state.specificTrigger} onChange={this.onChange}>
                      <option selected >Select a trigger</option>
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
  			        <div><button className="button right-margin" onClick={this.closeModal}> Cancel </button></div>

                <div>{this.state.specificTrigger !== "Select a trigger" && !this.state.clicked ?
                 <button className="button button--highlight" onClick={this.addCustomTag}>Add Custom Tag</button> :
                 <button className="button button--highlight" disabled onClick={this.addCustomTag}>Add Custom Tag</button>}
                 </div>

  		        </div>
            </Modal>
          </li>
        </ul>
      </div>
    )
  }
});

module.exports = SearchBar;
