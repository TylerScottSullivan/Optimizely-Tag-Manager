var React = require('react');
var AvailableTableContent = require('./AvailableTableContent');
var AvailableSidePanel = require('./AvailableSidePanel');

var AvailableTagsPage = React.createClass({
  getInitialState: function() {
    return {
      sidePanel: {},
      currentProject: "6919181723",
      master: this.props.masters,
      downloadedProject: []
    }
  },

  componentWillReceiveProps: function(nextProps) {
    this.setState({
      downloadedProject: nextProps.downloadedProject,
      master: nextProps.masters
    })

  },

  componentDidMount: function() {
  },

  onSelect: function(item, rowinfo) {
    this.setState({
      sidePanel: rowinfo
    });
    // console.log(rowinfo, "rowinfo")
    // console.log(this.state.sidePanel, " sidePanel in state");
  },

  render: function() {
      var newArray = [];
      var newObj = {};
      var counter = 0;
      var currentInfo = this.state.sidePanel;
      console.log('running')
      for (var j = 0; j < this.state.master.length; j++) {
        console.log('in loop j')
        for (var i = 0; i < this.state.downloadedProject.length; i++) {
          console.log('in loop i')
          if (this.state.downloadedProject[i].name === this.state.master[j].name) {
            if (currentInfo.name === this.state.downloadedProject[i].name) {
              currentInfo.added = true;
            }
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

      var splicedArray = newArray;
      console.log(newArray, 'newArray');

    return (
      <div className="flex height--1-1">
        <AvailableTableContent splicedArray={splicedArray} onSelect={this.onSelect}/>
        <AvailableSidePanel info={currentInfo} {...this.props} />
      </div>
    )
  }
})



module.exports = AvailableTagsPage;
