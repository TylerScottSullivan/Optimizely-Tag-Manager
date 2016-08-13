var React = require('react');
var MyInputFields = require('./MyInputFields');
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
    height                : '280px',
    width                 : '700px'
  }
};

var MySidePanel = React.createClass({

  getInitialState: function() {
    // gets trigger options with ajax call when component is first rendered
    var triggerOptions;

    $.ajax({
      url: '/options' + window.location.search,
      type: 'GET',
      success: function(data) {
        this.setState({triggerOptions: data})
      }.bind(this),
      error: function(err) {
        console.error("Err posting", err.toString());
      }
    });

    return {
      modalIsOpen: false,
      info: this.props.info,
      fields: this.props.info.fields,
      trackingTrigger: this.props.info.trackingTrigger,
      active: this.props.info.active,
      tagId: this.props.info._id,
      errors: {},
      triggerOptions: null,
      changes: '',
      template: ''
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
  closeModal: function() {
    this.setState({modalIsOpen: false});
  },

  componentWillReceiveProps: function(nextProps) {
    // resets information on sidepanel when new row is clicked
    if (nextProps.info) {
      this.setState({
        info: nextProps.info,
        fields: nextProps.info.fields,
        changes: nextProps.info.template,
        clickUpdate: false
      })
    }
  },

  // sends updated tag info to backend and re-renders row and sidepanel properly
  onUpdate: function() {

    var data = {};
    var errors = {}
    data.fields = [];

    //sets tokens correctly to be handled on backend
    this.state.fields.map(function(field){
      if (! field.value) {
        errors[field.name] = `${field.name} is required`;
      } else {
    	   data[field.name] = field.value;
         data.fields.push({"name": field.name, "value": field.value})
      }
    })

    //sets up all other info correctly to be handled on backend
    data.active = this.state.info.active;
    data.trackingTrigger = this.state.trackingTrigger;
    data.template = this.state.template;

    //ajax call to update tag on backend
    if (Object.keys(errors).length === 0) {
      return $.ajax({
        url: '/updatetag/' + this.props.info._id + window.location.search,
        type: 'POST',
        data: data,
        success: function(response) {
          //updates front end row and sidepanel with newly updated tag
          this.props.onDownload(this.props.splicedArray.slice(0, this.props.index).concat(
              Object.assign({}, this.props.splicedArray[this.props.index], data), this.props.splicedArray.slice(this.props.index + 1)))

          //sets condition to show updated message
          this.setState({
            clickUpdate: true
          })
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

  // sends delete call to backend for a tag and re-renders rows and sidepanel properly
  onDelete: function() {

    return $.ajax({
      url: '/deletetag/' + this.props.info._id + window.location.search,
      type: 'POST',
      success: function(data) {
        //  sets deleted state up to MyTagsPage to re-render sidepanel properly
        this.props.onDelete();
        //  re-renders rows
        this.props.onDownload(this.props.downloaded.slice(0, this.props.index).concat(this.props.downloaded.slice(this.props.index + 1)));
      }.bind(this),

      error: function(err) {
        console.error("Err posting", err.toString());
      }
    });
  },

  onChangeTokens: function(field, e) {
    //error handling and changing state for token input values
    var newState = Object.assign({}, this.state);
    newState.errors[e.target.name] = false;
    newState.fields[field].value = e.target.value;
    this.setState(newState);
  },

  //error handling and changes state for enable/disable and triggers
  onChange: function(e) {
    //prevents enable/disable buttons from screwing shit up
    e.preventDefault();

    // changes enabled/disabled state
    if (e.target.name === "active") {
      this.setState({info: Object.assign({}, this.state.info, {active: !this.state.info.active})})
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
        changes: newVal
      });
  },

  // changes code editor code in modal once set (i think) // Mojia?
  updateCustom: function() {
    this.setState({
      template: this.state.changes,
      modalIsOpen: false
    })
  },

	render: function() {
    if (this.props.info.fields) {

      var newTokenField = [];
      var newObj = {};
      for (var j = 0; j < this.props.info.fields.length; j++) {
        for (var i = 0; i < this.props.info.tokens.length; i++) {
          if (this.props.info.tokens[i].tokenName === this.props.info.fields[j].name) {
            newObj = $.extend({}, this.props.info.fields[j], this.props.info.tokens[i])
            newTokenField.push(newObj);
            console.log(newObj.name, "splicedtokenField pushed")
          }
        }
      };
      console.log(newTokenField, 'newtokenfield')
      var splicedTokenField = newTokenField;
      console.log(splicedTokenField, 'splicedTokenField');
    }


    if(this.props.deleted) {
      console.log('this should delete it')
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

    if(!this.props.deleted) {
      console.error("Uh-oh. We are in a NON-DELETED state");

                  if(!this.props.deleted) {
                      if (this.props.info.fields && this.props.info.tokens) {
                        // console.log(this.props.info.fields, 'fields');
                        // console.log(this.props.info.fields[0], 'fields 0');
                        // console.log(this.props.info.tokens, 'tokens');
                        // console.log(this.props.info.tokens[0], 'tokens 0');

                        var newTokenField = [];
                        var newObj = {};
                        // console.log("hello here")
                        for (var j = 0; j < this.props.info.fields.length; j++) {
                          // console.log("hello why aren'y ou going through my loop")
                          // console.log('iterating')
                          for (var i = 0; i < this.props.info.tokens.length; i++) {
                            console.log(this.props.info.tokens[i].tokenName, "tokenName");
                            console.log(this.props.info.fields[j].name, 'fieldName')
                            if (this.props.info.tokens[i].tokenName === this.props.info.fields[j].name) {
                              newObj = $.extend({}, this.props.info.fields[j], this.props.info.tokens[i])
                              newTokenField.push(newObj);
                              console.log(newObj.name, "splicedtokenField pushed")
                            }
                          }
                        };
                        console.log(newTokenField, 'newtokenfield')
                        var splicedTokenField = newTokenField;
                        console.log(splicedTokenField, 'splicedTokenField');
                      }
                    }



                  // console.log(this.props, "props for mySidePanel")
              		if ((this.props.info && Object.keys(this.props.info).length !== 0) || this.props.deleted) {
                        console.log(this.props.deleted, "deleted state and NOT EMPTY TAG DETAILS");
              			return (
                          <div data-toggle='validator' className="sidepanel background--faint">
                              <h2 className="push-double--bottom sp-headbig">TAG DETAILS</h2>
                                <div className="flex">
                                {this.state.info.logo ?
                                    <div> <img className='sidepanel-logo' src={this.state.info.logo}/> </div>
                                  :
                                    <div> <img className='sidepanel-logo' src="images/custom.png"/> </div>
                                }
                                <div className='flex flex-v-center'>
                                    <div className = 'sidepanel-displayname'> {this.state.info.displayName} </div>
                                </div>

                                </div>
                                <div className='sd-headsmall deschead'> DESCRIPTION </div>
                                  <div className='tagdesc'>{this.state.info.tagDescription}</div>
                                  <label className="label label--rule">
                                  </label>
                                  {this.props.info.name === "custom" ?
                                    <div>
                                      <button className="btn-uniform-add button button--highlight" onClick={this.openModal}> Edit Custom Code</button>

                                      <Modal
                                        isOpen={this.state.modalIsOpen}
                                        onAfterOpen={this.afterOpenModal}
                                        onRequestClose={this.closeModal}
                                        style={customStyles} >

                                        <h2 ref="subtitle">Update Custom Tag</h2>
                                        <div className='modaltext'>
                                          <div> Please update your Javascript code here. </div>
                                          <div className="editor">
                                            <AceEditor
                                              className="editablecustom"
                                              mode="javascript"
                                              theme="tomorrow"
                                              name="editablecustom"
                                              height="120px"
                                              width="620px"
                                              editorProps={{$blockScrolling: true}}
                                              value={this.state.changes}
                                              onChange={this.onChangeSnippet}
                                            />
                                          </div>
                                        </div>
                                        <div className='flex pushed-right'>
                                          <button className="button right-margin" onClick={this.closeModal}> Cancel </button>
                                          <button className="button button--highlight" onClick={this.updateCustom}> Update Custom Tag </button>
                                        </div>
                                      </Modal>
                                    </div>
                                    :
                                    <div> </div>
                                  }
                                {splicedTokenField.map(function(field, item) {
                                  var err = this.state.errors[field.name];
                                  return <MyInputFields key={item} error={err || false} field={field} value={this.state.fields[item].value} onChange={this.onChangeTokens.bind(this, item)}/>
                                }.bind(this))}
                                  <div className="flex">
                                     <div className="flex--1 sd-headsmall"> Called On: </div>
                                  </div>
                            <select className="form-control" name='trackingTrigger' onChange={this.onChange}>
                                  {this.state.triggerOptions.map((trigger) => {
                                    if (trigger === this.state.info.trackingTrigger) {
                                      return <option value={trigger} selected> {trigger} </option>
                                    }
                                    return <option value={trigger} >{trigger}</option>
                                    })
                                  }
                              </select>
                              <div className="flex togglebutton">
                                {this.state.info.active === true ?
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
                              <div>
                                <button className="btn-uniform-add button button--highlight" onClick={this.onUpdate}>Update Tag</button>
                              </div>
                              <div>
                                <button className="btn-uniform-del button button--highlight" onClick={this.onDelete}>Delete</button>
                              </div>
                          {this.state.clickUpdate ?
                            <div className="yellowbox">
                              This tag has now been updated. This change may take a couple of minutes before it is updated within your Optimizely tag.
                            </div>
                          :
                            <div>
                            </div>

                          }
              			  </div>
              			)
              		} else {
                    console.log(this.props.deleted, "deleted state and in EMPTY TAG DETAILS");
              			return (
                      <div className="sidepanel background--faint">
                        <h2 className="push-double--bottom sp-headbig">TAG DETAILS</h2>
                        <div> Select a Tag to view Details. </div>
                      </div>
                    )
              		}
                }
    }
})


module.exports = MySidePanel;
