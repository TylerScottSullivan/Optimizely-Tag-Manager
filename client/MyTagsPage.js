var React = require('react');
var MyTableContent = require('./MyTableContent');
var MySidePanel = require('./MySidePanel');

var MyTagsPage = React.createClass({
  getInitialState: function() {
    return {
      splicedArray: [], //merge master templates and the downloaded project
      sidePanel: {},
      currentProject: "6919181723",
      master: []
    }
  },
  componentDidMount: function() {
    fetch('http://localhost:4001/master')
    .then((response) => response.json())
    .then(response =>{
      this.setState({
        master: response
      });
      this.props.onMaster(response);
    })
    .then(() => fetch('http://localhost:4001/download/' + this.state.currentProject))
    .then(response => response.json())
    .then((r) => {
      this.setState({
        downloadedProject: r
      })
      this.props.onDownload(r);
      var newArray = [];
      var newObj = {};
      for (var i = 0; i < this.state.downloadedProject.length; i++) {
        //this is to render the custom tags
        for (var j = 0; j < this.state.master.length; j++) {
          if (this.state.downloadedProject[i].name === this.state.master[j].name) {
            newObj = $.extend({}, this.state.master[j], this.state.downloadedProject[i])
            newArray.push(newObj);
          }
        }
      };
      this.setState({
        splicedArray: newArray
      })
      console.log('newArrayyy', newArray)

    }).catch((e) => {
        console.log("Err: " , e);
    })
  },

  onSelect: function(item, rowinfo) {
    this.setState({
      sidePanel: rowinfo //this is an object
    });
  },

  render: function() {
    // console.log('splicedArray', this.state.splicedArray)
    // console.log('my sidepanelll', this.state.sidePanel)
    return (
      <div className="flex height--1-1">
        <MyTableContent splicedArray={this.state.splicedArray} onSelect={this.onSelect}/>
        <MySidePanel info={this.state.sidePanel} />
      </div>
    )
  }
})

module.exports = MyTagsPage;
