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
  _reloadOptions: function() {
    console.warn("Reloading options from SearchBar. This is probably being called too often!");
    $.ajax({
      url: '/options/0' + window.location.search,
      type: 'GET',
      success: function(data) {
        console.log('get options successful', data);
        var options = {'inHeader': [], 'onDocumentReady': [], 'onPageLoad': [], 'onEvent': [], 'onTrigger': []};
        for (var i = 0; i < data.length; i++) {
          var d = data[i].split(',');
          for (var option in options) {
            if (d[0] === option) {
              options[option].push(d[1]);
            }
          }
        }
        console.log('optionssss', options)
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
      customId: null
    };
  },

  componentWillReceiveProps: function(nextProps) {
    console.warn("Now receiving props into SearchBar", nextProps);
    this.setState({trackingTrigger: 'inHeader'})
    // gets trigger options with ajax call ONLY IF
    // downloadedProject array changes length (in which case we may have new options)
    // AND the component is not receiving initial downloadedProject array (from length 0 -> x)
    if (this.props.downloadedProject.length !== nextProps.downloadedProject.length
        && this.props.downloadedProject.length > 0) {
      this._reloadOptions();
    }
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

    // $.ajax({
    //   url: '/options' + window.location.search,
    //   type: 'GET',
    //   success: function(triggers) {
    //     this.setState({triggerOptions: triggers})
    //   }.bind(this),
    //   error: function(err) {
    //     console.error("Err posting", err.toString());
    //   }
    // });

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

  //adds new custom tag, rendering on front end and sending ajax call to backend
  addCustomTag: function() {
    var data = {};
    var errors = {}

    //sets up info correctly to be handled on backend
    data.active = this.state.active;
    var index = Math.floor(Math.random()*10000000000);
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
    data.customId = index;
    console.log('data.name', data.customId)
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
    //ajax call to add tag to backend
    if (Object.keys(errors).length === 0) {
      return $.ajax({
        url: '/tag' + window.location.search,
        type: 'POST',
        data: data,
        success: function(response) {
          console.log("data", data)
          console.log("this.props", this.props)
          // this function rerenders table and sidepanel with newly added tag, separate from ajax call but using the ajax data sent over
        	this.props.onDownload(this.props.downloadedProject.concat(response))
          console.log("[anything]")
            // gets trigger options with ajax call when component is re-rendered
            $.ajax({
		          url: '/options' + window.location.search,
		          type: 'GET',
		          success: function(triggers) {
                console.log('hi i am here checking modal')
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



    //prevents enable/disable buttons from refreshing the page
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

    //setting the state got messy here--this is how we fixed it
    const expandTriggers = ['onTrigger', 'onEvent', 'onPageLoad'];
    const notExpandTriggers = ['inHeader', 'onDocumentReady'];

    //checking for which way we are moving -- from an expandTrigger -> notExpandTrigger, or other way
    var changingCalledOn = e.target.name === "trackingTrigger";
    var movingToNotExpand = notExpandTriggers.indexOf(e.target.value) > -1;
    var movingToExpand = expandTriggers.indexOf(e.target.value) > -1;

    //if moving to not expand, sets state as the name of trigger we are moving to (inHeader or onDocumentReady)
    //otherwise sets the state to "Select a trigger", which will deactivate the add a tag button (see render)
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

  // changes code editor code 
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
          <li className="anchor--right" style={{marginTop: '-5px'}}>
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
                      <option selected>Select a trigger</option>
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
                <div>
                  {this.state.specificTrigger !== "Select a trigger" ?
                   <button className="btn-uniform-add button button--highlight" onClick={this.addCustomTag}>Add Tag</button> :
                   <button className="btn-uniform-add button button--highlight" disabled onClick={this.addCustomTag}>Add Tag</button>}
                </div>
  		        </div>
            </Modal>
          </li>
    )
  }
});

module.exports = SearchBar;
