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

      availSP: {},
      availSPIndex: null,

      searchInput: '',

      options: [],
      pages: [],
      events: []
    }
  },

  deleteTagFromProjectTags: function(tag) {
    console.log("GETS TO BEGINNING OF DELETED TAGS")
    var tagID = tag._id;
    var newProjectTags = [];
    var newCompleteTags = [];
    for (var i = 0; i < this.state.projectTags.length; i++) {
      if (this.state.projectTags[i]._id !== tagID) {
        newProjectTags.push(this.state.projectTags[i])
      }
    }
    console.log("GETS PAST FOUR LOOP")
    newCompleteTags = this._mergeMasterTemplatesWithProjectTags(this.state.masterTemplates, newProjectTags);
    if (tag.name === "custom") {
      console.log("GETS TO SETTING STATE INDEX")
      this.setState({
        projectTags: newProjectTags,
        completeTags: newCompleteTags
      })
    } else {
      console.log("GETS TO NON CUSTOM STATE HERE")
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

  addTagToProjectTags: function(tag) {
    var newProjectTags = [];
    var newCompleteTags = [];

    newProjectTags = this.state.projectTags.concat(tag)
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
    if (this.state.mySPIndex !== index || this.state.searchInput.length !== 0) {
      this.setState({
        mySP: addedTag,
        mySPIndex: index
      })
    }
    console.log("state", this.state)
  },

  changeAvailSidePanel: function(nonCustomTag, index) {
    console.log("tag selected", index, nonCustomTag);
    if (this.state.availSPIndex !== index || this.state.searchInput.length !== 0) {
      console.log("HIT SET STATE INDEX")
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

  _setTriggerOptionProp: function(pages, events, callbackTriggers) {
    var options = [];

    options.push([["onPageLoad", "On Page Load"], pages]);
    options.push([["onEvent", "On Event"], events]);
    options.push([["onTrigger", "On Callback"], callbackTriggers])

    return options
  },

  componentDidMount: function() {
    var token;
    var masterTemplates;
    var projectTags;
    var completeTags;
    var pages = [];
    var events = [];
    var callbackTriggers = [];
    var options = [];

    fetch('/getToken' + window.location.search)
    .then((response) => response.text())
    .then(response => {
      console.log("token response", response)
      token = response;
    })

    // fetch('/master' + window.location.search)
    // .then((response) => response.json())
    // .then(response => {
    //   masterTemplates = response;
    //   console.log("response", response)}) 
    // .then(() => fetch('/tag/' + window.location.search))
    // .then(response => response.json())
    // .then(response => {
    //   projectTags = response;
    //   console.log("tags", response)})
    // .then(response => {
    //   completeTags = this._mergeMasterTemplatesWithProjectTags(masterTemplates, projectTags);
    //   this.setState({
    //     token: token,
    //     masterTemplates: masterTemplates,
    //     projectTags: projectTags,
    //     completeTags: completeTags
    //   })
    // })
    // .catch((e) => {
    //     console.log("Err: " , e);
    // })
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

    //     fetch('/eventOptions' + window.location.search)
    // .then((response) => response.json())
    // .then(response => {
    //   console.log('alone event options', response)
    //   for (var i = 0; i < response.length; i++) {
    //     events.push(response[i].name)
    //   }
    //   console.log("event options filtered", events)
    // })

    //  fetch('/master' + window.location.search)
    // .then((response) => response.json())
    // .then(response => {
    //   masterTemplates = response;
    //   console.log("response", response)}) 
    // .then(() => fetch('/tag/' + window.location.search))
    // .then(response => response.json())
    // .then(response => {
    //   projectTags = response;
    //   console.log("tags", response)})
    // .then(() => fetch('/pageOptions' + window.location.search))
    // .then((response) => response.json())
    // .then(response => {
    //   console.log('pages', response)
    //   for (var i = 0; i < response.length; i++) {
    //     pages.push(response[i].name)
    //   }
    // }).then(() => fetch('/eventOptions' + window.location.search))
    // .then((response) => response.json())
    // .then(response => {
    //   for (var i = 0; i < response.length; i++) {
    //     events.push(response[i].name)
    //   }
    // }).then(response => {
    //   completeTags = this._mergeMasterTemplatesWithProjectTags(masterTemplates, projectTags);
    //   callbackTriggers = this._filterForCallbackTriggers(completeTags);
    //   console.log("callbackTriggers", callbackTriggers)

    //   this.setState({
    //     token: token,
    //     masterTemplates: masterTemplates,
    //     projectTags: projectTags,
    //     completeTags: completeTags,
    //     pages: pages,
    //     events: events,
    //     callbackTriggers: callbackTriggers
    //   })
    // })
    // .catch((e) => {
    //     console.log("Err: " , e);
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

    //  $.ajax({
    //   url: '/pageOptions' + window.location.search,
    //   type: 'GET',
    //   success: function(data) {
    //     console.log('get options successful', data);
    //   }.bind(this),
    //   error: function(err) {
    //     console.error("Err posting", err.toString());
    //   }
    // });   

    // console.log("this state before pages ajax", this.state)
    // $.ajax({
    //   url: 'https://www.optimizelyapis.com/v2/pages?project_id=6919181723', 
    //   method: 'GET',
    //   headers: {
    //        "Authorization": "Bearer " + "2:e9f48279X-k58liTfHe9l7QsHJpa3kuB0wAPx_WDrHxcz1hG_24",
    //        "Content-Type": "application/json"
    //   },
    //   success: function(data) {
    //     console.log('get page Options successful', data);
    //   }.bind(this),
    //   error: function(err) {
    //     console.error("Err posting", err.toString());
    //   }
    // });

  },

  _filterForCallbackTriggers: function(completeTags) {
    var callbackTriggers = [];

    for (var i = 0; i < completeTags.length; i++) {
      if (completeTags[i].added && completeTags[i].hasCallback) {
        callbackTriggers.push([completeTags[i].name, completeTags[i].displayName])
      }
    }

    return callbackTriggers;
  },


  //given the tab selected, returns an array - [DisplayedPage, SidePanel]
  _displaySelectedTab: function(selectedTab) {
    if (selectedTab === 0) {
      return [<MTP completeTags={this.state.completeTags} projectTags={this.state.projectTags} handleRowClick={this.changeMySidePanel} _filterForSearchInput={this._filterForSearchInput} searchInput={this.state.searchInput} />, 
              <MSP tag={this.state.mySP} options={this.state.options} deleteTagFromProjectTags={this.deleteTagFromProjectTags}/>]
    } else if (selectedTab === 1) {
      return [<ATP completeTags={this.state.completeTags} handleRowClick={this.changeAvailSidePanel} _filterForSearchInput={this._filterForSearchInput} searchInput={this.state.searchInput} />, 
              <ASP tag={this.state.availSP} options={this.state.options} addTagToProjectTags={this.addTagToProjectTags}/>]
    } else if (selectedTab === 2) {
      return [<NTP/>, null]
    }
  },

  _mergeMasterTemplatesWithProjectTags: function(masterTemplates, projectTags) {
    console.log("merging")
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
            <SearchAndCustom searchInput={this.state.searchInput} changeSearchInput={this.changeSearchInput} options={this.state.options} addTagToProjectTags={this.addTagToProjectTags}/>
            {DisplayedPage}
          </div>
          {SidePanel}
        </div> 
      </div>
    );
  }
});


ReactDOM.render(<App />, document.getElementById('root'));
