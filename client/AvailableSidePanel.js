var React = require('react');
var AvailableInputFields = require('./AvailableInputFields');

var AvailableSidePanel = React.createClass({
  getInitialState: function() {
    return {
      info: this.props.info,
      tokens: this.props.info.tokens,
      projectId: "6668600890",
      trackingTrigger: 'inHeader',
      active: true,
      errors: {}
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
      data[token.tokenName] = token.value;
    })
    data.active = this.state.active;
    data.trackingTrigger = this.state.trackingTrigger;
    data.projectId = this.state.projectId;
    data.name = this.props.info.name;
    data.tagDescription = this.props.info.tagDescription;
    data.custom = this.props.info.custom;
    data.hasCallback = this.props.info.hasCallback;
    data.callBacks = this.props.info.callBacks;


    // console.log("errors", Object.keys(errors))

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
    console.log(this.props, "props for available side panel")
    if (Object.keys(this.props.info).length !== 0) {
      return (
        <form data-toggle='validator' className="sidepanel background--faint">
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
                console.log(`${token.tokenDisplayName} has error: ${err}`);
                return <AvailableInputFields key={item} error={err || false} token={token} onChange={this.onChangeTokens.bind(this, item)} required/>
              })}
              <div className="help-block with-errors"></div>
                <div className="flex">
                   <div className="flex--1 sd-headsmall"> Called On: </div>
                </div>
            <select className="form-control" name='trackingTrigger' value={this.state.trackingTrigger} onChange={this.onChange}>
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
            {this.props.info.added === true ? 
                  <div> 
                    <div>
                      <button className="btn-uniform-add button button--highlight" disabled>Add Tag</button>
                    </div>
                    <div className="greenbox">
                      This tag has now been added to 'My Tags.' Go to 'My Tags' to Update, Delete, or Disable this tag.
                    </div>
                  </div>
              :
                  <div>
                    <button className="btn-uniform-add button button--highlight" onClick={this.onAddTag}>Add Tag</button>
                  </div>
            }
        </form>
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
