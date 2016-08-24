var React = require('react');
var AvailableInputFields = require('./AvailableInputFields');

var AvailableSidePanel = React.createClass({
  _reloadOptions: function() {
    // get the most updated options
    //also copied to MySidePanel and SearchBar
    $.ajax({
      url: '/options' + window.location.search,
      type: 'GET',
      success: function(data) {
        var options = {'inHeader': [], 'onDocumentReady': [], 'onPageLoad': [], 'onEvent': [], 'onTrigger': []};
        for (var i = 0; i < data.length; i ++) {
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

  getInitialState: function() {
    this._reloadOptions();
    //pass in info from AvailableTagsPage
    return {
      info: this.props.info,
      tokens: this.props.info.tokens,
      trackingTrigger: "inHeader",
      active: true,
      errors: {},
      triggerOptions: {'inHeader': [], 'onDocumentReady': [], 'onPageLoad': [], 'onEvent': [], 'onTrigger': []},
      specificTrigger: null,
      clicked: false
    };
  },

  componentWillReceiveProps: function(nextProps) {
    this._reloadOptions();
    this.setState({trackingTrigger: 'inHeader'})

    // resets information on sidepanel when new row is clicked
    if (Object.keys(nextProps.info).length > 0) {
      nextProps.info.tokens = nextProps.info.tokens.map((token) => {
        return Object.assign({}, token, {value: ''})
      })
      this.setState({
        info: nextProps.info,
        tokens: nextProps.info.tokens,
        clicked: false
      })
    }
  },

  //adds new tag, rendering on front end and sending ajax call to backend
  onAddTag: function(e) {
    // prevents Add button from screwing up
    var data = {};
    var errors = {}
    //set clicked to true indicating the user has clicked on add. The button will be immediately disabled.
    //prevent from double clicking
    this.setState({clicked: true});

    //sets tokens correctly to be handled on backend
    this.state.tokens.map((token) => {
      // Input validation
      if (!token.value) {
        errors[token.tokenDisplayName] = `${token.tokenDisplayName} is required`;
      }
      data[token.tokenName] = token.value;
    })

    //sets up all other info correctly to be handled on backend
    var trigger;
    if (this.state.trackingTrigger === 'onDocumentReady'||this.state.trackingTrigger === 'inHeader') {
      trigger = this.state.trackingTrigger + ',' + this.state.trackingTrigger;
    } else if (this.state.trackingTrigger === 'onPageLoad' || this.state.trackingTrigger === 'onEvent' || this.state.trackingTrigger === 'onTrigger') {
      trigger = this.state.trackingTrigger + ',' + this.state.specificTrigger;
    }
    data.active = this.state.active;
    data.trackingTrigger = trigger;
    data.name = this.props.info.name;
    data.tagDescription = this.props.info.tagDescription;
    data.template = this.props.info.template;
    data.hasCallback = this.props.info.hasCallback;
    data.callBacks = this.props.info.callBacks;
    console.log('This is the full data', data)
    //ajax call to add tag to backend
    if (Object.keys(errors).length === 0) {
      return $.ajax({
        url: '/' + window.location.search,
        type: 'POST',
        data: data,
        success: function(response) {
          // this function rerenders table and sidepanel with newly added tag, separate from ajax call but using the ajax data sent over
          this.props.onDownload(this.props.downloadedProject.concat(data))
          this.setState({clicked: false})
        }.bind(this),
        error: function(err) {
          console.error("Err posting", err.toString());
        }
      });
    } else {
      // error handling
      this.setState({
        errors: errors
      });
    }
  },

  onChangeTokens: function(index, e) {
    //error handling and changing state for token input values
    var tokens = this.state.tokens;
    var errors = this.state.errors;
    errors[e.target.name] = false;
    tokens[index].value = e.target.value;
    this.setState({
      tokens: tokens,
      errors: this.state.errors
    });
  },

  //error handling and changes state for enable/disable and triggers
  onChange: function(e) {
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

	render: function() {
    // if row has been selected, displays sidepanel information
		if (Object.keys(this.props.info).length !== 0) {

			return (
				<div className="sidepanel background--faint">

          <h2 className="push-double--bottom sp-headbig">TAG DETAILS</h2>
		      <div className="flex">
			    	<div>
              <img className='sidepanel-logo' src={this.props.info.logo}/>
            </div>
				    <div className='flex flex-v-center'>
				      	<div className = 'sidepanel-displayname'> {this.props.info.displayName} </div>
				    </div>
	        </div>

	        <div className='sd-headsmall deschead'> DESCRIPTION </div>
          <div className='tagdesc'>{this.props.info.tagDescription}</div>
        	<label className="label label--rule"> </label>

          {/* Renders each token input field */}
          {this.state.tokens.map((token, item) => {
            var err = this.state.errors[token.tokenDisplayName];
        	  return <AvailableInputFields key={item} error={err || false} token={token} onChange={this.onChangeTokens.bind(this, item)}/>
            }
          )}

          <div className="help-block with-errors"></div>

          <div className="flex">
            <div className="flex--1 sd-headsmall"> Called On: </div>
          </div>

          <select className="form-control" name='trackingTrigger' onChange={this.onChange}>
            {Object.keys(this.state.triggerOptions).map((option) => {
              return (this.state.trackingTrigger === option) ? <option value={option} selected> {option} </option>
            : <option value={option}> {option} </option>
            })
            }
          </select>

          {/* Renders each trigger option */}
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

          {/* displays message and disables add button if added, enabled button if not added yet*/}
          {this.props.info.added === true ?
            <div>
              <div>
                <button className="btn-uniform-add button button--highlight" disabled>Add Tag</button>
              </div>
              <div className="greenbox">
                <p> This tag has now been added to 'My Tags.' This change may take a couple of minutes to update. </p>
                <p> Go to 'My Tags' to Update, Delete, or Disable this tag. </p>
              </div>
            </div>
          :
            <div>
              {this.state.specificTrigger !== "Select a trigger" && !this.state.clicked ?
               <button className="btn-uniform-add button button--highlight" onClick={this.onAddTag}>Add Tag</button> :
               <button className="btn-uniform-add button button--highlight" disabled onClick={this.onAddTag}>Add Tag</button>}
            </div>
          }
        </div>
      )
    } else {
      // if no row has been selected, shows default information
      return (
        <div>
          <div className="sidepanel background--faint">
            <h2 className="push-double--bottom sp-headbig">TAG DETAILS</h2>
            <div> Select a Tag to add to My Tags. </div>
          </div>
        </div>
      )
    // below brace closes else statement
    }
  // below brace closes render function
  }
})

module.exports = AvailableSidePanel;
