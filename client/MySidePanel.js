var React = require('react');
var MyInputFields = require('./MyInputFields');

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
    return {
      info: this.props.info,
      fields: this.props.info.fields,
      projectId: "6919181723",
      trackingTrigger: 'inHeader',
      active: 'true',
      tagId: this.props.info._id,
      errors: {},
      triggerOptions: null
    };
  },

  componentWillReceiveProps: function(nextProps) {
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

    // this.state.tokens.map((token) => {
    //   if (!token.value) {
    //     // Input validation
    //     errors[token.tokenDisplayName] = `${token.tokenDisplayName} is required`;
    //   }
    //   data[token.tokenName] = token.value;
    // })

    data.fields = JSON.stringify(this.state.fields.map(function(field){
      if (! field.value) {
        errors[field.name] = `${field.name} is required`;
      } else {
    	var returnfield = {};
    	returnfield.name = field.name;
      returnfield.value = field.value;
    	return returnfield;
      }
    }))
    data.active = this.state.active;
    data.trackingTrigger = this.state.trackingTrigger;
    data.projectId = this.state.projectId;

    if (Object.keys(errors).length === 0) {
      return $.ajax({
        url: '/updatetag/' + this.props.info._id,
        type: 'POST',
        data: data,
        success: function(data) {
          console.log('Update tag successful')},
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
      url: '/deletetag/' + this.props.info._id,
      type: 'POST',
      // data: {},
      success: function(data) {
        console.log('delete tag successful')},
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

	render: function() {
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
			        {splicedTokenField.map(function(field, item) {
                var err = this.state.errors[field.name];
			        	return <MyInputFields key={item} error={err || false} field={field} value={this.state.fields[item].value} onChange={this.onChangeTokens.bind(this, item)}/>
			        }.bind(this))}
		            <div className="flex">
		               <div className="flex--1 sd-headsmall"> Called On: </div>
		            </div>
<<<<<<< HEAD
				    <select className="form-control" name='trackingTrigger' value={this.props.info.trackingTrigger} onChange={this.onChange}>
				      <option value='inHeader'>In header</option>
				      <option value='onPageLoad'>On page load</option>
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
=======
                <select className="form-control" name='trackingTrigger' value={this.state.trackingTrigger} onChange={this.onChange}>
                  {this.state.triggerOptions.map((trigger) => {
                    return <option value={trigger}>{trigger}</option>
                    })
                  }
    				    </select>
		            <div className="flex">
		               <div className="flex--1 sd-headsmall"> Enabled or Disabled: </div>
		            </div>
			        <select className="form-control" name='active' value={this.state.active} onChange={this.onChange}>
			          <option value='true'>Enabled</option>
			          <option value='false'>Disabled</option>
			        </select>
>>>>>>> mojia
				    <div>
				    	<button className="btn-uniform-add button button--highlight" onClick={this.onUpdate}>Update Tag</button>
            </div>
            <div>
						  <button className="btn-uniform-del button button--highlight" onClick={this.onDelete}>Delete</button>
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
