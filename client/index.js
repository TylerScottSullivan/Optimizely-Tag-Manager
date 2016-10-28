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

  // updates selectedTab state if and only if a new tab is selected
  handleClick: function(index) {
    if (this.state.selectedTab != index) {
      this.setState({
        selectedTab: index
      })
    };

  },

  _getProjectTags: function() {
    this.setState({
      projectTags: tags
    })
  },

  // _getMasterTemplates: function() {
  //   return fetch('http://localhost:4001/master' + window.location.search)
  //   .then(function(response) { 
  //     if (response.ok) {
  //       response.json()
  //       .then(function(response) {
  //         return response;
  //       });
  //     } else {
  //       console.log('Network response was not ok.');
  //     }
  //   })
  //   .catch((e) => {
  //       console.log("Err: " , e);
  //   })
  // },

  componentDidMount: function() {

    // var masters = this._getMasterTemplates();

    // masters.then(function(value) {
    //   console.log("master templates", value)
    // });

    // .then(function(response) {
    //   console.log(response)
    // })

    // var p1 = new Promise(function(resolve, reject) {
    //   var masters = this._getMasterTemplates();
    //   if (masters) {
    //     fullfill(masters)
    //   }
    // }).bind(this);

    // p1.then(function(masters) {
    //   console.log("master templates", masters)
    // });
    // this._getMasterTemplates().then(function(response) {
    //   console.log("Master Templates", response)
    // })
    // console.log("Master Templates", masterTemplates);

    fetch('http://localhost:4001/master' + window.location.search)
    .then(function(response) { 
      if (response.ok) {
        response.json()
        .then(function(response) {
          return console.log("Yay");
        });
      } else {
        console.log('Network response was not ok.');
      }
    })
    .catch((e) => {
        console.log("Err: " , e);
    })
  },


  //given the tab selected, returns an array - [DisplayedPage, SidePanel]
  _displaySelectedTab: function(selectedTab) {
    if (selectedTab === 0) {
      return [<MTP/>, <MSP/>]
    } else if (selectedTab === 1) {
      return [<ATP/>, <ASP/>]
    } else if (selectedTab === 2) {
      return [<NTP/>, null]
    }
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
