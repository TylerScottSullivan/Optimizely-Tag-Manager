var React = require('react');
var MyInputFields = require('./MyInputFields');
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
    height                : '280px',
    width                 : '700px'
  }
};

var MySidePanel = React.createClass({

  getInitialState: function() {
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
    // console.log('this is the info fields that i want', this.props.info)
    console.log('getting initial state')
    return {
      modalIsOpen: false,
      info: this.props.info,
      fields: this.props.info.fields,
      trackingTrigger: this.props.info.trackingTrigger,
      active: this.props.info.active,
      tagId: this.props.info._id,
      errors: {},
      triggerOptions: null
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

  componentWillReceiveProps: function(nextProps) {
    console.log("will receive props")
    if (nextProps.info) {
      this.setState({
        info: nextProps.info,
        fields: nextProps.info.fields
      })
    }
  },

  onUpdate: function() {
    var data = {};
    var errors = {}

    // data.fields = JSON.stringify(this.state.fields.map(function(field){
    //   if (! field.value) {
    //     errors[field.name] = `${field.name} is required`;
    //   } else {
    // 	var returnfield = {};
    // 	returnfield[field.name] = field.value;
    // 	return returnfield;
    //   }
    // }))
    this.state.fields.map(function(field){
      if (! field.value) {
        errors[field.name] = `${field.name} is required`;
      } else {
    	data[field.name] = field.value;
      }
    })
    console.log('here are the new fields', data)
    data.active = this.state.info.active;
    data.trackingTrigger = this.state.trackingTrigger;
    console.log(data, "data sent")
    if (Object.keys(errors).length === 0) {
      return $.ajax({
        url: '/updatetag/' + this.props.info._id + window.location.search,
        type: 'POST',
        data: data,
        success: function(data) {
          console.log('Update tag successful');
        },
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

  onDelete: function() {
    return $.ajax({
      url: '/deletetag/' + this.props.info._id + window.location.search,
      type: 'POST',
      // data: {},
      success: function(data) {
        console.log('delete tag successful');
        this.props.onDownload(this.props.downloaded.slice(0, this.props.index).concat(this.props.downloaded.slice(this.props.index + 1)))
      }.bind(this),

      error: function(err) {
        console.error("Err posting", err.toString());
      }
    });
  },

  onChangeTokens: function(field, e) {
    var newState = Object.assign({}, this.state);
    newState.fields[field].value = e.target.value;
    this.setState(newState);
  },

  //this change the enable and triggers
  onChange: function(e) {
    e.preventDefault();
    console.log(e.target, "e")
    console.log(this.state.active, 'state of active')
    console.log(this.props.info.active, 'props of info of active')
    console.log(this.state.info.active, "state of info of active")
    if (e.target.name === "active") {
      console.log("is this getting called")
      console.log(e.target.name, "target name")
      console.log(e.target.value, "target value")
      this.setState({info: Object.assign({}, this.state.info, {active: !this.state.info.active})})
    } else {
      var newState = Object.assign({}, this.state);
      newState[e.target.name] = e.target.value;
      this.setState(newState);
    }
  },

	render: function() {
    console.log(this.props, "props for MySidePanel --- shouldn't have the info it's displaying????")
    if (this.props.info.fields) {
      console.log(this.props.info.fields, 'fields');
      console.log(this.props.info.fields[0], 'fields 0');
      console.log(this.props.info.tokens, 'tokens');
      console.log(this.props.info.tokens[0], 'tokens 0');

      var newTokenField = [];
      var newObj = {};
      console.log("hello here")
      for (var j = 0; j < this.props.info.fields.length; j++) {
        console.log("hello why aren'y ou going through my loop")
        console.log('iterating')
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

    console.log(this.props, "props for mySidePanel")
		if (Object.keys(this.props.info).length !== 0) {
			return (
				<div data-toggle='validator' className="sidepanel background--faint">
			     	<h2 className="push-double--bottom sp-headbig">TAG DETAILS</h2>
			      	<div className="flex">
				    	<div> <img className='sidepanel-logo' src={this.state.info.logo}/> </div>
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
                            value={this.props.info.template}
                            onChange={this.onChangeSnippet}
                          />
                        </div>
                      </div>
                      <div className='flex space-between'>
                        <button className="button button--highlight"> Update Custom Tag-Not Functional </button>
                        <button className="button button--highlight" onClick={this.closeModal}> Cancel </button>
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
            <div className="redbox">
              <p> This tag has now been deleted. This change may take up to 10 minutes before it is updated within your Optimizely tag. </p>
              <p> To Re-Add this tag, go to your "Available Tags" tab. </p>
            </div>
            <div className="yellowbox">
              This tag has now been updated. This change may take up to 10 minutes before it is updated within your Optimizely tag.
            </div>
			  </div>
			)
		} else {
			return (
        <div className="sidepanel background--faint">
          <h2 className="push-double--bottom sp-headbig">TAG DETAILS</h2>
          <div> Select a Tag to view Details. </div>
        </div>
      )
		}
	}
})


module.exports = MySidePanel;
