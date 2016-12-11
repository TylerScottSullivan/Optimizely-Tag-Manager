var React = require('react');
var ReactDOM = require('react-dom');
var Modal = require('react-modal');

// code editor 
var react = require('react-ace');

//code editor imports
import brace from 'brace';
import AceEditor from 'react-ace';
import 'brace/mode/javascript';
import 'brace/theme/tomorrow';

var AvailableTagsPage = require('./AvailableTags/AvailableTagsPage');
var MyTagsPage = require('./MyTags/MyTagsPage');
var NewTemplatePage = require('./SubmitNewTemplate/NewTemplatePage');
var ActiveTab = require('./Tabs/ActiveTab');
var NonActiveTabs = require('./Tabs/NonActiveTabs');
var SearchAndCustom = require('./SearchAndCustomBar/SearchAndCustom');
var AvailableSidePanel = require('./AvailableTags/AvailableSidePanel');
var MySidePanel = require('./MyTags/MySidePanel');

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

      availSP: {},
      availSPIndex: null,

      searchInput: '',

      options: [],
      pages: [],
      events: []
    }
  },

  // gets master and project tags from DB
  // gets pages and events from Optimizely user account
  // merges tags to get complete tags
  // gets callback triggers from complete tags
  // gets options from pages, events, and callback triggers
  // sets state
  componentDidMount: function() {
    var token;
    var masterTemplates;
    var projectTags;
    var completeTags;
    var pages = [];
    var events = [];
    var callbackTriggers = [];
    var options = [];

    var fetchMasterTemplates = fetch('/master' + window.location.search)
                              .then((response) => response.json())
                              .then(response => {
                                masterTemplates = response;
                              }) 

    var fetchTagsFromDB = fetch('/tag/' + window.location.search)
                         .then(response => response.json())
                         .then(response => {
                           projectTags = response;
                         })

    var fetchPageOptionsFromOpt = fetch('/pageOptions' + window.location.search)
                                 .then((response) => response.json())
                                 .then(response => {
                                   for (var i = 0; i < response.length; i++) {
                                      pages.push(response[i].name)
                                   }
                                  })

    var fetchEventOptionsFromOpt = fetch('/eventOptions' + window.location.search)
                                   .then((response) => response.json())
                                   .then(response => {
                                      for (var i = 0; i < response.length; i++) {
                                        events.push(response[i].name)
                                      }
                                    })

    Promise.all([fetchMasterTemplates, fetchTagsFromDB, fetchPageOptionsFromOpt, fetchEventOptionsFromOpt]).then(response => {
      completeTags = this._mergeMasterTemplatesWithProjectTags(masterTemplates, projectTags);
      callbackTriggers = this._filterForCallbackTriggers(completeTags);
      options = this._setTriggerOptionProp(pages, events, callbackTriggers);

      this.setState({
        token: token,
        masterTemplates: masterTemplates,
        projectTags: projectTags,
        completeTags: completeTags,
        options: options,
        pages: pages,
        events: events
      })     
    }).
    catch((e) => {
      console.log("Err:", e)
    })

  },

  // given master tags and proejct tags, returns the combination of matching tags (complete tags)
  _mergeMasterTemplatesWithProjectTags: function(masterTemplates, projectTags) {
    var completeTagsArray = [];
    var completeTag = {};
    var counter = 0;
    var paired;

    for (var i = 0; i < masterTemplates.length; i++) {
      paired = false;
      for (var j = 0; j < projectTags.length; j++) {
        if (masterTemplates[i].name === projectTags[j].name) {
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

  // returns callback triggers
  _filterForCallbackTriggers: function(completeTags) {
    var callbackTriggers = [];

    for (var i = 0; i < completeTags.length; i++) {
      if (completeTags[i].added && completeTags[i].hasCallback) {
        callbackTriggers.push([completeTags[i].name, completeTags[i].displayName])
      }
    }

    return callbackTriggers;
  },

  // sets correct call and trigger options given pages from Optimizely, events from Optimizely, and callbackTriggers from complete tags
  _setTriggerOptionProp: function(pages, events, callbackTriggers) {
    var options = [];

    options.push([["onPageLoad", "On Page Load"], pages]);
    options.push([["onEvent", "On Event"], events]);
    options.push([["onTrigger", "On Callback"], callbackTriggers])

    return options
  },

  // gets projectTags from DB again
  addTagToProjectTags: function(tag) {
    var newProjectTags = [];
    var newCompleteTags = [];

    var fetchTagsFromDB = fetch('/tag/' + window.location.search)
                         .then(response => response.json())
                         .then(response => {
                           newProjectTags = response;
                         })

    Promise.all([fetchTagsFromDB]).then(response => {
      // recombines tags and re-configuers options, then sets state
      newCompleteTags = this._mergeMasterTemplatesWithProjectTags(this.state.masterTemplates, newProjectTags);
      if (tag.name === "custom") {
        this.setState({
          projectTags: newProjectTags,
          completeTags: newCompleteTags
        })
      } else {
        var newCallbackTriggers = [];
        var newOptions = [];
        newCallbackTriggers = this._filterForCallbackTriggers(newCompleteTags);
        newOptions = this._setTriggerOptionProp(this.state.pages, this.state.events, newCallbackTriggers);
        this.setState({
          projectTags: newProjectTags,
          completeTags: newCompleteTags,
          options: newOptions
        })
      }
    }).
    catch((e) => {
      console.log("Err:", e)
    })
  },

  // removes deleted tag from State's project tags
  deleteTagFromProjectTags: function(tag) {
    var tagID = tag._id;
    var newProjectTags = [];
    var newCompleteTags = [];

    for (var i = 0; i < this.state.projectTags.length; i++) {
      if (this.state.projectTags[i]._id !== tagID) {
        newProjectTags.push(this.state.projectTags[i])
      }
    }

    newCompleteTags = this._mergeMasterTemplatesWithProjectTags(this.state.masterTemplates, newProjectTags);
    if (tag.name === "custom") {
      this.setState({
        projectTags: newProjectTags,
        completeTags: newCompleteTags
      })
    } else {
      // re-configures options and sets state
      var newCallbackTriggers = [];
      var newOptions = [];
      newCallbackTriggers = this._filterForCallbackTriggers(newCompleteTags);
      newOptions = this._setTriggerOptionProp(this.state.pages, this.state.events, newCallbackTriggers);
      this.setState({
        projectTags: newProjectTags,
        completeTags: newCompleteTags,
        options: newOptions
      })
    }

  },

  // updates mySidePanel state based on row click
  changeMySidePanel: function(addedTag, index) {
    if (this.state.mySPIndex !== index || this.state.searchInput.length !== 0) {
      this.setState({
        mySP: addedTag,
        mySPIndex: index
      })
    }
  },

  // updates available SidePanel state on row click
  changeAvailSidePanel: function(nonCustomTag, index) {
    if (this.state.availSPIndex !== index || this.state.searchInput.length !== 0) {
      this.setState({
        availSP: nonCustomTag,
        availSPIndex: index
      })
    }
  },

  // sets state to current search input
  changeSearchInput: function(newSearchInput) {
    this.setState({
      searchInput: newSearchInput
    })
  },

  // filters tags based on search input
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

  // updates selectedTab state if and only if a new tab is selected
  changeTab: function(index) {
    if (this.state.selectedTab !== index) {
      this.setState({
        selectedTab: index
      })
    };
  },

  //given the tab selected, returns an array - [DisplayedPage, SidePanel]
  _displaySelectedTab: function(selectedTab) {
    if (selectedTab === 0) {
      return [<MyTagsPage completeTags={this.state.completeTags} projectTags={this.state.projectTags} handleRowClick={this.changeMySidePanel} _filterForSearchInput={this._filterForSearchInput} searchInput={this.state.searchInput} options={this.state.options}/>, 
              <MySidePanel tag={this.state.mySP} options={this.state.options} addTagToProjectTags={this.addTagToProjectTags} deleteTagFromProjectTags={this.deleteTagFromProjectTags}/>]
    } else if (selectedTab === 1) {
      return [<AvailableTagsPage completeTags={this.state.completeTags} handleRowClick={this.changeAvailSidePanel} _filterForSearchInput={this._filterForSearchInput} searchInput={this.state.searchInput} />, 
              <AvailableSidePanel tag={this.state.availSP} options={this.state.options} addTagToProjectTags={this.addTagToProjectTags}/>]
    } else if (selectedTab === 2) {
      return [<NewTemplatePage/>, null]
    }
  },

  render: function() {

    // renders selected tabs, pagess, and sidepanels
    var selectedTab = this.state.selectedTab;
    var TabNames = ['My Tags', 'Available Tags', 'Submit New Template'];

    var DisplayedPage = this._displaySelectedTab(selectedTab)[0];
    var SidePanel = this._displaySelectedTab(selectedTab)[1];

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
            {this.state.selectedTab !== 2 ? <SearchAndCustom searchInput={this.state.searchInput} changeSearchInput={this.changeSearchInput} options={this.state.options} addTagToProjectTags={this.addTagToProjectTags}/> : null}
            {DisplayedPage}
          </div>
          {SidePanel}
        </div> 
      </div>
    );
  }
});


ReactDOM.render(<App />, document.getElementById('root'));
