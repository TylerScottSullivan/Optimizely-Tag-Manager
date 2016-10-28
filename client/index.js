var React = require('react');
var ReactDOM = require('react-dom');
var Modal = require('react-modal');

var _ = require('underscore');

// code editor 
var react = require('react-ace');

//code editor imports
import brace from 'brace';
import AceEditor from 'react-ace';
import 'brace/mode/javascript';
import 'brace/theme/github';
import 'brace/theme/tomorrow';

var ATP = require('./ATP');
var MTP = require('./MTP');
var NTP = require('./NTP');
var ActiveTab = require('./ActiveTab');
var NonActiveTabs = require('./NonActiveTabs');
var SearchAndCustom = require('./SearchAndCustom');
var ASP = require('./ASP');
var MSP = require('./MSP');

var App = React.createClass({

  getInitialState: function() {
    return {
    	masterTemplates: [],
    	projectTags: [],
      selectedTab: 0
    }
  },

  // function to refresh/update state when called in other components
  getProjectTags: function(tags) {
    this.setState({
      projectTags: tags
    })
  },

  // function to refresh/update state when called in other components
  getMasterTemplates: function(masters) {
    this.setState({
      masterTemplates: masters
    })
  },

  handleClick: function(index) {
    if (this.state.selectedTab != index) {
      this.setState({
        selectedTab: index
      })
    };

  },

  render: function() {
    var selectedTab = this.state.selectedTab;
    var TabNames = ['My Tags', 'Available Tags', 'Submit New Template'];
    var DisplayedPage;
    var SidePanel;

    if (selectedTab === 0) {
      DisplayedPage = <MTP/>
      SidePanel = <MSP/>
    } else if (selectedTab === 1) {
      DisplayedPage = <ATP/>
      SidePanel = <ASP/>
    } else if (selectedTab === 2) {
      DisplayedPage = <NTP/> 
      SidePanel = <div></div> 
    }


    console.log(this.state, "this state")

    return (
      <div className="tabs tabs--small tabs--sub" data-oui-tabs>
        <ul className="tabs-nav soft-double--sides">
          {TabNames.map((name, index) => {
              return (selectedTab === index) ? 
              <ActiveTab key={index} onClick={() => this.handleClick(index) } name={name} /> : <NonActiveTabs key={index} onClick={() => this.handleClick(index)} name={name}/>
          })}
        </ul>
        <div className="flex height--1-1">
          <div className="flex--1 soft-double--sides">
            <SearchAndCustom/>
            {DisplayedPage}
          </div>
          {SidePanel}
        </div> 
      </div>
    );
  }
});


ReactDOM.render(<App />, document.getElementById('root'));
