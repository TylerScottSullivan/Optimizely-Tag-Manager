var React = require('react');
var MyTableContent = require('./MyTableContent');
var MySidePanel = require('./MySidePanel');

var MyTagsPage = React.createClass({

  getInitialState: function() {
    return {
      splicedArray: [], //merge master templates and the downloaded tags (downloadedProject)
      sidePanel: {},
      master: [],
      downloadedProject: []
    }
  },

  componentDidMount: function() {
    // fetches master templates from backend
    fetch('http://localhost:4001/master' + window.location.search)
    .then((response) => response.json())
    .then(response =>{
      // sends masters up to App(index.js) to re-render other tabs/side panels
      this.props.onMaster(response);
    })
    // fetches tags from backend
    .then(() => fetch('http://localhost:4001/download/' + window.location.search))
    .then(response => response.json())
    .then((r) => {
      // sends tags up to App(index.js) to re-render other tabs/side panels
      this.props.onDownload(r);
    }).catch((e) => {
        console.log("Err: " , e);
    })
  },

  // re-renders with new information
  componentWillReceiveProps: function(nextProps) {
    this.setState({
      downloadedProject: nextProps.downloadedProject,
      master: nextProps.masters,
    })

    // sets selected side panel information correctly to be re-rendered with new information
    if(typeof this.state.sidePanelIndex !== "undefined") {
      this.setState({
         sidePanel: nextProps.downloadedProject[this.state.sidePanelIndex]
       })
    }

  },

  // selects a row and passes that row information into the rendered sidepanel
  onSelect: function(item, rowinfo) {
    this.setState({
      sidePanel: rowinfo, //this is an object
      sidePanelIndex: item,
      sidePanelDeleted: false
    });
  },

  // sets deleted state to true on delete button, passed into side panel
  onDelete: function() {
    this.setState({
      sidePanelDeleted: true
    })
  },

  render: function() {

    // loops through all tags (downloadedProject) and master templates
    // combines objects based off of matching name fields in order
    // to fully display information correctly

    var currentInfo = this.state.sidePanel;
    var currentIndex = this.state.sidePanelIndex;
    var newArray = [];
    var newObj = {};

    for (var i = 0; i < this.state.downloadedProject.length; i++) {
      for (var j = 0; j < this.state.master.length; j++) {
        if (this.state.downloadedProject[i].name === this.state.master[j].name) {
          newObj = $.extend({}, this.state.master[j], this.state.downloadedProject[i])
          newArray.push(newObj);
        }
      }
    };

    var splicedArray = newArray;

    return (
      <div className="flex height--1-1">
        {/*passes newly combined tags/master objects (splicedArray) into Table Content to display*/}
        <MyTableContent splicedArray={splicedArray} onSelect={this.onSelect} {...this.props} />
        {/*passes updated tag information, deleted tag information, and all other info
         to be displayed correctly in sidepanel after various button presses*/}
        <MySidePanel
          info={currentInfo}
          index={currentIndex}
          downloaded={this.state.downloadedProject}
          splicedArray={splicedArray}
          deleted={this.state.sidePanelDeleted}
          onDelete={this.onDelete}
          {...this.props}
        />
      </div>
    )
  // below brace closes render function
  }
})

module.exports = MyTagsPage;
