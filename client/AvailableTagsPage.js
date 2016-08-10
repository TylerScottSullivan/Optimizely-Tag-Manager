var React = require('react');
var AvailableTableContent = require('./AvailableTableContent');
var AvailableSidePanel = require('./AvailableSidePanel');

var AvailableTagsPage = React.createClass({
  getInitialState: function() {
    return {
      splicedArray: [],
      sidePanel: {},
      currentProject: "6919181723",
      master: [],
      downloadedProject: []
    }
  },
  componentDidMount: function() {
  	// console.log('availabletagspage mounted')
  	// console.log(this.props, "props for availabletagspage")
    fetch('http://localhost:4001/master')
    .then((response) => response.json())
    .then(response => {
      this.setState({
        splicedArray: response
      })
	}).catch((e) => {
      console.log("Err: " , e);
    })
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
        <AvailableSidePanel info={this.state.sidePanel} />
      </div>
    )
  }
})



module.exports = AvailableTagsPage;
