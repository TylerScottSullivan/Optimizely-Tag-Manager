var React = require('react');
var AvailableInputFields = require('./AvailableInputFields');

var AvailableSidePanel = React.createClass({
  getInitialState: function() {
    var triggerOptions;
    $.ajax({
      url: '/options' + window.location.search,
      type: 'GET',
      success: function(data) {
        console.log('get options successful');
        this.setState({triggerOptions: data})
      }.bind(this),
      error: function(err) {
        console.error("Err posting", err.toString());
      }
    });
    return {
      info: this.props.info,
      tokens: this.props.info.tokens,
      projectId: "6919181723",
      trackingTrigger: 'inHeader',
      active: true,
      errors: {},
      triggerOptions: null
    };
  },

  componentWillReceiveProps: function(nextProps) {
    if (nextProps.info) {
      this.setState({
        info: nextProps.info,
        tokens: nextProps.info.tokens
      })
    }
  },

  onAddTag: function(e) {
    e.preventDefault();
    var data = {};
    var errors = {}

    this.state.tokens.map((token) => {
      if (!token.value) {
        // Input validation
        errors[token.tokenDisplayName] = `${token.tokenDisplayName} is required`;
      }
      // data[token.tokenName] = token.value;
      var returnfield = {};
      returnfield.name = token.name;
      returnfield.value = token.value;
      return returnfield;
    })
    data.active = this.state.active;
    data.trackingTrigger = this.state.trackingTrigger;
    data.projectId = this.state.projectId;
    data.name = this.props.info.name;
    data.tagDescription = this.props.info.tagDescription;
    data.template = this.props.info.template;
    data.hasCallback = this.props.info.hasCallback;
    data.callBacks = this.props.info.callBacks;

    if (Object.keys(errors).length === 0) {
      return $.ajax({
        url: '/' + window.location.search,
        type: 'POST',
        data: data,
        success: function(response) {
          console.log('Add tag successful');
          console.log(data, "data");
          console.log(this.props.downloadedProject.concat(data), "concated downloadedProject")
          this.props.onDownload(this.props.downloadedProject.concat(data))
          console.log('datapushhhhhhhhhhhhhhhhhhhhhhhhhhhhhhhhhhhhhhhhhhhhhhhhhhhhhhhhhhhhhhhhhhhhhhhhhhhhhed')
        }.bind(this),
        error: function(err) {
          console.error("Err posting", err.toString());
          console.log('errrrrrrrrrrrrrrrrrrrrrrrrrrrrrrrrrrrrrrrrrrrrrrrr help')
        }
      });
    } else {
      console.log('there is an error omg');
      this.setState({
        errors: errors
      });
    }
  },

  onChangeTokens: function(index, e) {
    var tokens = this.state.tokens;
    tokens[index].value = e.target.value;
    this.setState({
      tokens: tokens
    });
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
    console.log(this.state, "state of available panels page")
  },

	render: function() {
		if (Object.keys(this.props.info).length !== 0) {
			return (
				<div className="sidepanel background--faint">
			     	<h2 className="push-double--bottom sp-headbig">TAG DETAILS</h2>
			      	<div className="flex">
				    	  <div> <img className='sidepanel-logo' src={this.props.info.logo}/> </div>
  				    	<div className='flex flex-v-center'>
  				      		<div className = 'sidepanel-displayname'> {this.props.info.displayName} </div>
  				     	</div>
		        	</div>
		        	<div className='sd-headsmall deschead'> DESCRIPTION </div>
	            	<div className='tagdesc'>{this.props.info.tagDescription}</div>
	            	<label className="label label--rule">
	            	</label>
			        {this.state.tokens.map((token, item) => {
                var err = this.state.errors[token.tokenDisplayName];
			        	return <AvailableInputFields key={item} error={err || false} token={token} onChange={this.onChangeTokens.bind(this, item)} required/>
			        })}
              <div className="help-block with-errors"></div>
		            <div className="flex">
		               <div className="flex--1 sd-headsmall"> Called On: </div>
		            </div>
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
				      <option value={true}>Enabled</option>
				      <option value={false}>Disabled</option>
				    </select>
				    <div>
				    	<button className="btn-uniform-add button button--highlight" onClick={this.onAddTag}>Add Tag</button>
					</div>
			  </div>
			)
		} else {
			return <div>

        <div className="sidepanel background--faint">
            <h2 className="push-double--bottom sp-headbig">TAG DETAILS</h2>
          <div> Select a Tag to add to My Tags. </div>
          </div>
      </div>;
    }
  }
})

module.exports = AvailableSidePanel;
