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
      completeTags: [],
      selectedTab: 0
    }
  },

  // updates selectedTab state if and only if a new tab is selected
  handleClick: function(index) {
    if (this.state.selectedTab != index) {
      this.setState({
        selectedTab: index
      })
    };

  },

  componentDidMount: function() {
    var masterTemplates;
    var projectTags;
    var completeTags;

    fetch('http://localhost:4001/master' + window.location.search)
    .then((response) => response.json())
    .then(response => {
      masterTemplates = response;
      console.log("response", response)}) 
    .then(() => fetch('http://localhost:4001/tag/' + window.location.search))
    .then(response => response.json())
    .then(response => {
      projectTags = response;
      console.log("tags", response)})
    .then(response => {
      completeTags = this._mergeMasterTemplatesWithProjectTags(masterTemplates, projectTags);
      this.setState({
        masterTemplates: masterTemplates,
        projectTags: projectTags,
        completeTags: completeTags
      })
    })
    .catch((e) => {
        console.log("Err: " , e);
    })


    $.ajax({
      url: '/options/57fe44354624defb9ba9f6ea' + window.location.search,
      type: 'GET',
      success: function(data) {
        console.log('get options successful', data);
      }.bind(this),
      error: function(err) {
        console.error("Err posting", err.toString());
      }
    });
    console.log('reaching')

    $.ajax({
      url: 'https://www.optimizelyapis.com/v2/pages?project_id=6919181723', 
      method: 'GET',
      headers: {
           "Authorization": "Bearer 2:614e8633VxEzlpqYYcFqkhhQFprGPF-p4wdgVtq93V_4PXVc4-g",
           "Content-Type": "application/json"
      },
      success: function(data) {
        console.log('get page Options successful', data);
      }.bind(this),
      error: function(err) {
        console.error("Err posting", err.toString());
      }
    });

  },


  //given the tab selected, returns an array - [DisplayedPage, SidePanel]
  _displaySelectedTab: function(selectedTab) {
    if (selectedTab === 0) {
      return [<MTP completeTags={this.state.completeTags}/>, <MSP/>]
    } else if (selectedTab === 1) {
      return [<ATP/>, <ASP/>]
    } else if (selectedTab === 2) {
      return [<NTP/>, null]
    }
  },

  _mergeMasterTemplatesWithProjectTags: function(masterTemplates, projectTags) {
    var completeTagsArray = [];
    var completeTag = {};
    var counter = 0;
    var paired;

    for (var i = 0; i < masterTemplates.length; i++) {
      // console.log("master i", masterTemplates[i].name)
      paired = false;
      for (var j = 0; j < projectTags.length; j++) {
        // console.log("project j", projectTags[j].name);
        if (masterTemplates[i].name === projectTags[j].name) {
          // console.log('joined');
          completeTag = $.extend({}, masterTemplates[i], projectTags[j]);
          completeTag.added = true;
          completeTagsArray.push(completeTag);
          paired = true;
        };
      }

      if (!paired) {
        completeTag = masterTemplates[i];
        completeTag.added = false;
        completeTagsArray.push(completeTag);
      }
    }

    return completeTagsArray;

  },

  render: function() {
    var selectedTab = this.state.selectedTab;
    var TabNames = ['My Tags', 'Available Tags', 'Submit New Template'];

    var DisplayedPage = this._displaySelectedTab(selectedTab)[0];
    var SidePanel = this._displaySelectedTab(selectedTab)[1];

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
