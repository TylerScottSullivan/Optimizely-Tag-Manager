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
	      var triggerOptions;
	      $.ajax({
	        url: '/options' + window.location.search,
	        type: 'GET',
	        success: function(triggers) {
	          console.log('get options successful');
	          this.setState({triggerOptions: triggers})
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
	        active: false,
	        errors: {},
	        triggerOptions: []
	      };
	  },

	  openModal: function() {
	      this.setState({modalIsOpen: true});
	  },

	  afterOpenModal: function() {
	    // references are now sync'd and can be accessed.
	    this.refs.subtitle.style.color = '#0081BA';
	  },

	  closeModal: function() {
	  	  var triggerOptions;
	      $.ajax({
	        url: '/options' + window.location.search,
	        type: 'GET',
	        success: function(triggers) {
	          console.log('get options successful');
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
        		active: false,
        		errors: {}
            });
	  },

    addCustomTag: function() {
      var data = {};
      var errors = {}

      data.active = this.state.active;
      data.trackingTrigger = this.state.trackingTrigger;
      this.setState({
      	modalIsOpen: false,
		name: 'custom',
		displayName: '',
		tagDescription: '',
		template: '',
		trackingTrigger: 'inHeader',
		active: false,
		errors: {},
		triggerOptions: []
      });
      data.name = this.state.name;
      data.fields = [];

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
      if (Object.keys(errors).length === 0) {
        return $.ajax({
          url: '/' + window.location.search,
          type: 'POST',
          data: data,
          success: function(response) {
          	this.props.onDownload(this.props.downloadedProject.concat(data))
            console.log('Add custom tag successful');
          }.bind(this),
          error: function(err) {
            console.error("Err posting", err.toString());
          }
        });
      } else {
        this.setState({
          errors: errors
        });
      }
    },

  onChange: function(e) {
    e.preventDefault();
    console.log(e, "e")
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
      var newState = Object.assign({}, this.state);
      newState[e.target.name] = e.target.value;
      this.setState(newState);
    }
  },

    onChangeSnippet: function(newVal) {
        this.setState({
          template: newVal
        });
    },

	  render: function() {
      var errorName = (this.state.errors['displayName']) ? 'validation' : '';
      var errorTagDescription = (this.state.errors['tagDescription']) ? 'validation' : '';
      var errorCustom = (this.state.errors['template']) ? 'validation' : '';

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
                		  {(errorName) ? <div className='warning'>{this.state.errors['displayName']}</div> : null }
                		  <div className="flex">
				             <div className="flex--1 sd-headsmall"> Description</div>
				          </div>
				          <div className="flex--1"> Please add the description of your tag below. </div>
				          <input name='tagDescription' className={`$(errorTagDescription)`} value={this.state.tagDescription} onChange={this.onChange}/>
                  		  {(errorTagDescription) ? <div className='warning'>{this.state.errors['tagDescription']}</div> : null }
                		  <div className="flex">
				          	<div className="flex--1 sd-headsmall"> Called On: </div>
				          </div>
                		  <select className="form-control" name='trackingTrigger' value={this.state.trackingTrigger} onChange={this.onChange}>
                  			{this.state.triggerOptions.map((trigger) => {
                    			return <option value={trigger}>{trigger}</option>
                    			})
                  			}
    				      </select>
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
