var React = require('react');
var AvailableTableContent = require('./AvailableTableContent');
var AvailableSidePanel = require('./AvailableSidePanel');

var AvailableTagsPage = React.createClass({

  // sets state based on props passed down from index.js (App) after having been passed up from MyTagsPage ajax calls
  getInitialState: function() {
    return {
      sidePanel: {},
      master: this.props.masters,
      downloadedProject: this.props.downloadedProject
    }
  },

  //re-renders with new information
  componentWillReceiveProps: function(nextProps) {
    this.setState({
      downloadedProject: nextProps.downloadedProject,
      master: nextProps.masters
    })
  },

  // selects a row and passes that row information into the rendered sidepanel 
  onSelect: function(item, rowinfo) {
    this.setState({
      sidePanel: rowinfo
    });
  },


  render: function() {

    // loops through all tags (downloadedProject) and master templates
    // combines objects based off of matching name fields
    // if no master matches a tag, pushes master
    // this allows us to display in rows what tags have and have not been added

    var newArray = [];
    var newObj = {};
    var counter = 0;
    var currentInfo = this.state.sidePanel;

    // begins function
    for (var j = 0; j < this.state.master.length; j++) {

      // takes out custom master template from being rendered in rows
      if (this.state.master[j].name === 'custom') {
        continue;
      }

      //loops through all tags
      for (var i = 0; i < this.state.downloadedProject.length; i++) {

        // matches master and tag based on name field
        if (this.state.downloadedProject[i].name === this.state.master[j].name) {

          // allows currently selected tag to be rerendered correctly in sidepanel
          if (currentInfo.name === this.state.downloadedProject[i].name) {
            currentInfo.added = true;
          }

          //splices objects together and adds added property, pushes into new array
          newObj = $.extend({}, this.state.master[j], this.state.downloadedProject[i])
          newObj.added = true;
          newArray.push(newObj);

          //counter prevents looping issues with rendering masters more than once
          counter++;
        }
      }

      // pushes master to array if no tag has been matched once and only once
      if (counter === 0) {
          newArray.push(this.state.master[j]);
      }

      counter = 0;
    };
    // ends function

    // sets correct name
    var splicedArray = newArray;

    return (
      <div className="flex height--1-1">
        {/*passes newly combined tags/master objects (splicedArray) into Table Content to display*/}
        <AvailableTableContent splicedArray={splicedArray} onSelect={this.onSelect} {...this.props}/>
        {/*passes newly added tag to be displayed correctly in sidepanel after having pressed "Add" button*/}
        <AvailableSidePanel info={currentInfo} {...this.props} />
      </div>
    )
  }

})



module.exports = AvailableTagsPage;
