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
      token: null, 

    	masterTemplates: [],
    	projectTags: [],
      completeTags: [],
      selectedTab: 0,

      mySP: {},
      mySPIndex: null,
      mySPDeleted: false,

      availSP: {},
      availSPIndex: null,

      searchInput: ''
    }
  },

  // updates selectedTab state if and only if a new tab is selected
  changeTab: function(index) {
    if (this.state.selectedTab !== index) {
      this.setState({
        selectedTab: index
      })
    };
  },

  changeMySidePanel: function(addedTag, index) {
    console.log("tag selected", index, addedTag)
    if (this.state.mySPIndex !== index) {
      this.setState({
        mySP: addedTag,
        mySPIndex: index,
        mySPDeleted: false
      })
    }
    console.log("state", this.state)
  },

  changeAvailSidePanel: function(nonCustomTag, index) {
    console.log("tag selected", index, nonCustomTag);
    if (this.state.availSPIndex !== index) {
      this.setState({
        availSP: nonCustomTag,
        availSPIndex: index
      })
    }
  },

  changeSearchInput: function(newSearchInput) {
    this.setState({
      searchInput: newSearchInput
    })
  },

  _filterForSearchInput: function(searchInput, tags) {
    var displayedTags = [];
    var re = new RegExp(searchInput, 'i');

    for (var i = 0; i < tags.length; i++) {
      if (tags[i].displayName.search(re) > -1) {
        displayedTags.push(tags[i]);
      }
    }

    return displayedTags
  },

  // _boot: function (token) {
  //   var masterTemplates;
  //   var projectTags;
  //   var completeTags;

  //   fetch('/master' + window.location.search)
  //   .then((response) => response.json())
  //   .then(response => {
  //     masterTemplates = response;
  //     console.log("response", response)}) 
  //   .then(() => fetch('/tag/' + window.location.search))
  //   .then(response => response.json())
  //   .then(response => {
  //     projectTags = response;
  //     console.log("tags", response)})
  //   .then(response => {
  //     completeTags = this._mergeMasterTemplatesWithProjectTags(masterTemplates, projectTags);
  //     this.setState({
  //       masterTemplates: masterTemplates,
  //       projectTags: projectTags,
  //       completeTags: completeTags
  //     })
  //   })
  //   .catch((e) => {
  //       console.log("Err: " , e);
  //   })
  // },

  componentDidMount: function() {
    var token;
    var masterTemplates;
    var projectTags;
    var completeTags;

    fetch('/getToken' + window.location.search)
    .then((response) => response.text())
    .then(response => {
      console.log("token response", response)
      token = response;
    })
    // .then(this._boot(token))
    // .then(function(response) {
    //   console.log("hello right before response", response)
    //   return response.text();
    // }).then(function(j) {
    //   console.log("token response", j)
    // });


    //       => {
    //   console.log("token response", response);
    // }).then(() => 

    ///uncomment////
    fetch('/master' + window.location.search)
    .then((response) => response.json())
    .then(response => {
      masterTemplates = response;
      console.log("response", response)}) 
    .then(() => fetch('/tag/' + window.location.search))
    .then(response => response.json())
    .then(response => {
      projectTags = response;
      console.log("tags", response)})
    .then(response => {
      completeTags = this._mergeMasterTemplatesWithProjectTags(masterTemplates, projectTags);
      this.setState({
        token: token,
        masterTemplates: masterTemplates,
        projectTags: projectTags,
        completeTags: completeTags
      })
    })
    .catch((e) => {
        console.log("Err: " , e);
    })

    // $.ajax({
    //   url: '/getToken' + window.location.search,
    //   type: 'GET',
    //   success: function(data) {
    //     console.log('success', data)
    //   }.bind(this),
    //   error: function(err) {
    //     console.log("fail", err)
    //   }
    // })

    ////// uncomment this one///////////////////
    // $.ajax({
    //   url: '/options/57fe44354624defb9ba9f6ea' + window.location.search,
    //   type: 'GET',
    //   success: function(data) {
    //     console.log('get options successful', data);
    //   }.bind(this),
    //   error: function(err) {
    //     console.error("Err posting", err.toString());
    //   }
    // });
    // console.log('reaching')

    // $.ajax({
    //   url: '/pageOptions' + window.location.search,
    //   type: 'GET',
    //   success: function(data) {
    //     console.log('get options successful', data);
    //   }.bind(this),
    //   error: function(err) {
    //     console.error("Err posting", err.toString());
    //   }
    // });

    console.log("this state before pages ajax", this.state)
    $.ajax({
      url: 'https://www.optimizelyapis.com/v2/pages?project_id=6919181723', 
      method: 'GET',
      headers: {
           "Authorization": "Bearer " + "2:dceb9063sppewWI1uRuXo3tGxmdQvQo0tvzFCQtMnHIHZmGOc7E",
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
      return [<MTP completeTags={this.state.completeTags} projectTags={this.state.projectTags} handleRowClick={this.changeMySidePanel} _filterForSearchInput={this._filterForSearchInput} searchInput={this.state.searchInput} />, <MSP/>]
    } else if (selectedTab === 1) {
      return [<ATP completeTags={this.state.completeTags} projectTags={this.state.projectTags} handleRowClick={this.changeAvailSidePanel} _filterForSearchInput={this._filterForSearchInput} searchInput={this.state.searchInput} />, <ASP/>]
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
              <ActiveTab key={index} onClick={() => this.changeTab(index) } name={name} /> : <NonActiveTabs key={index} onClick={() => this.changeTab(index)} name={name}/>
          })}
        </ul>
        <div className="flex height--1-1">
          <div className="flex--1 soft-double--sides">
            <SearchAndCustom searchInput={this.state.searchInput} changeSearchInput={this.changeSearchInput}/>
            {DisplayedPage}
          </div>
          {SidePanel}
        </div> 
      </div>
    );
  }
});


ReactDOM.render(<App />, document.getElementById('root'));
