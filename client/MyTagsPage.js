var React = require('react');
var MyTableContent = require('./MyTableContent');
var MySidePanel = require('./MySidePanel');

var MyTagsPage = React.createClass({
  getInitialState: function() {
    return {
      splicedArray: [], //merge master templates and the downloaded project
      sidePanel: {},
      // currentProject: "6919181723",
      master: [],
      downloadedProject: []
    }
  },
  componentDidMount: function() {
    fetch('http://localhost:4001/master' + window.location.search)
    .then((response) => response.json())
    .then(response =>{
      this.props.onMaster(response);
    })
    .then(() => fetch('http://localhost:4001/download/' + window.location.search))
    .then(response => response.json())
    .then((r) => {
      this.props.onDownload(r);

    }).catch((e) => {
        console.log("Err: " , e);
    })
  },


  componentWillReceiveProps: function(nextProps) {
    this.setState({
      downloadedProject: nextProps.downloadedProject,
      master: nextProps.masters,
    })

    if(typeof this.state.sidePanelIndex !== "undefined") {
      this.setState({
         sidePanel: nextProps.downloadedProject[this.state.sidePanelIndex]
       })
    }

  },

  onSelect: function(item, rowinfo) {
    this.setState({
      sidePanel: rowinfo, //this is an object
      sidePanelIndex: item,
      sidePanelDeleted: false
    });
    console.log('this is the info passed on', this.state.sidePanel)
  },

  onDelete: function() {
    this.setState({
      sidePanelDeleted: true
    })
  },

  render: function() {

      var currentInfo = this.state.sidePanel;
      var currentIndex = this.state.sidePanelIndex;
      var newArray = [];
      var newObj = {};
      for (var i = 0; i < this.state.downloadedProject.length; i++) {
        //this is to render the custom tags
        console.log(this.state.downloadedProject[i].displayName, "Display Name DP")
        for (var j = 0; j < this.state.master.length; j++) {
          console.log(this.state.master[j].name, "looping through")
          if (this.state.downloadedProject[i].name === this.state.master[j].name) {
            console.log("pushing and combining")
            newObj = $.extend({}, this.state.master[j], this.state.downloadedProject[i])
            newArray.push(newObj);
          }
        }
      };

      var splicedArray = newArray;

    return (
      <div className="flex height--1-1">
        <MyTableContent splicedArray={splicedArray} onSelect={this.onSelect} {...this.props} />
        <MySidePanel info={currentInfo} index={currentIndex} downloaded={this.state.downloadedProject} splicedArray={splicedArray} deleted={this.state.sidePanelDeleted} onDelete={this.onDelete} {...this.props}/>
      </div>
    )
  }
})

module.exports = MyTagsPage;
