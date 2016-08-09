var React = require('react');
var AvailableTableContent = require('./AvailableTableContent');
var AvailableSidePanel = require('./AvailableSidePanel');

var AvailableTagsPage = React.createClass({
  getInitialState: function() {
    return {
      splicedArray: this.props.masters,
      sidePanel: {},
      currentProject: "6668600890",
      master: this.props.masters,
      downloadedProject: this.props.downloadedProject
    }
  },
  componentDidMount: function() {
      var newArray = [];
      var newObj = {};
      var counter = 0;
      for (var j = 0; j < this.state.master.length; j++) {
        for (var i = 0; i < this.state.downloadedProject.length; i++) {
          if (this.state.downloadedProject[i].name === this.state.master[j].name) {
            newObj = $.extend({}, this.state.master[j], this.state.downloadedProject[i])
            newObj.added = true;
            newArray.push(newObj);
            counter++;
            console.log(newObj.name, "splicedarray pushed")
          } 
        }
        if (counter === 0) {
            newArray.push(this.state.master[j]);
            console.log(this.state.master[j].name, "master pushed")
        }
        counter = 0;
      };
      this.setState({
        splicedArray: newArray
      })
      console.log(newArray, 'newArray');
  },

  onSelect: function(item, rowinfo) {
    this.setState({
      sidePanel: rowinfo
    });
    // console.log(rowinfo, "rowinfo")
    // console.log(this.state.sidePanel, " sidePanel in state");
  },

  render: function() {
    return (
      <div className="flex height--1-1">
        <AvailableTableContent splicedArray={this.state.splicedArray} onSelect={this.onSelect}/>
        <AvailableSidePanel info={this.state.sidePanel} {...this.props} />
      </div>
    )
  }
})



module.exports = AvailableTagsPage;
