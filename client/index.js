var React = require('react');
var ReactDOM = require('react-dom');
var moment = require('moment');
var _ = require('underscore');
import { Button, Table } from 'optimizely-oui';

var App = React.createClass({

  getInitialState: function() {
    return {
    	masters: [],
    	downloadedProject: [],
    	currentProject: "6668600890", //this needs to be fetched
    	splicedArray: [], //merge master templates and the downloaded project
    	sidePanel: {}
    }
  },

  onAddTag: function() {
    //save information for the tag
    // call POST '/'
  	return null
  },

  onSelect: function(item, rowinfo) {
  	this.setState({
  		sidePanel: rowinfo //this is an object
  	});
  	console.log(sidePanel);
  },

  onUpdate: function() {
    //save the updated information
    // POST'/updatetag/:tagid'
  	return null
  },

  onDelete: function() {
    //delete a tag
    // POST 'deletetag/:tagid'
  	return null
  },

  // componentDidUpdate: function(nextProps, nextState) {
  // },

  componentDidMount: function() {
  	fetch('http://localhost:4001/master')
    .then((response) => response.json())
    .then(response =>{
  		this.setState({
  			master: response
  		});
      console.log('master', response)
  	})
    .then(() => fetch('http://localhost:4001/download/' + this.state.currentProject))
    .then(response => response.json())
    .then((r) => {
      this.setState({
				downloadedProject: r
			})
			var newArray = [];
			var newObj = {};
			for (var i = 0; i < this.state.downloadedProject.length; i++) {
				for (var j = 0; j < this.state.master.length; j++) {
          console.log('i am here')
					console.log(this.state.downloadedProject[i].name, this.state.master[j].name)
					if (this.state.downloadedProject[i].name === this.state.master[j].name) {
						newObj = $.extend({}, this.state.master[j], this.state.downloadedProject[i])
						newArray.push(newObj);
					}
				}
			};
			console.log(newArray, "newArray");
			this.setState({
				splicedArray: newArray
			})
		}).catch((e) => {
      console.log("Err: " , e);
    })
  },

  render: function() {
    return (
    	<div>
			  <div className="tabs tabs--small tabs--sub" data-oui-tabs>
			    <ul className="tabs-nav soft-double--sides">
			      <li className="tabs-nav__item is-active" data-oui-tabs-nav-item>My Tags</li>
			      <li className="tabs-nav__item" data-oui-tabs-nav-item>Available Tags</li>
            <li className="tabs-nav__item" data-oui-tabs-nav-item>Create Tag</li>
			    </ul>
          <div className="flex height--1-1">
            <div className="flex--1 soft-double--sides">
              <ul className="flex push-double--ends">
                <li className="push-triple--right">
                  <div className="button-group">
                    <div> Need to put filter here </div>
                    <div className="search">
                      <input type="text" className="text-input text-input--search width--200" placeholder="Filter by Name"/>
                    </div>
                    <button className="button" type="button">Search</button>
                  </div>
                </li>
                <li className="anchor--right">
                  <button className="button button--highlight">Create Custom Tag</button>
                </li>
              </ul>

				      <h1 className='header1'> My Tags </h1>
				      <table className="table table--rule table--hover">
				        <thead>
				          <tr>
				            <th className = "cell-collapse">Logo</th>
				            <th>Name</th>
				            <th>Category</th>
				            <th>Called On</th>
				            <th className="cell-collapse">Status</th>
				          </tr>
				        </thead>
				        <tbody>
				        	{this.state.splicedArray.map(function(rowinfo, item) {
				        		return <TableColumnMyTags onClick={this.onSelect.bind(this, item, rowinfo)} key={item} name={rowinfo.name} called={rowinfo.trackingTrigger}/>
				        		}.bind(this))
				        	}
                </tbody>
              </table>
			      </div>
			    <SidePanelEditable/>
			  </div>
		  </div>
	</div>
    );
  }
});

var TableColumnMyTags = React.createClass({
	render: function() {
		return (
		         		 <tr>
				            <td>GA LOGO</td>
				            <td id="row-centered">{this.props.name}</td>
				            <td id="row-centered"> Analytics </td>
				            <td id="row-centered">{this.props.called} </td>
				            // <td id="row-centered"> 1 </td>
				            <td id="row-centered"> Enabled </td>
				         </tr>
      	)
	}
})

var TableColumnAvailable = React.createClass({
	render: function() {
		<div>
		</div>
	}
})


var SidePanelEditable = React.createClass({
	render: function() {
		return (
					<div className="sidepanel background--faint">
				      <h2 className="push-double--bottom">Experiment Details</h2>
				      <div> Logo and Name Here </div>
				      <label className="label label--rule">
				          <div className="flex">
				            <div className="flex--1">Description</div>
				          </div>
				        </label>
				        <div> Universal Analytics will make your site amazing please follow the instrucitons below. </div>
				        <label className="label label--rule">
				          <div className="flex">
				            <div className="flex--1">Field 1</div>
				          </div>
				        </label>
				        <div> This is the field for Universal Analytics please put your token here </div>
				        <input placeholder="Token here" />
				        <div> Whether its X or Y </div>
					    <select className="form-control" name='trackingTrigger'>
					      <option value='inHeader'>In header</option>
					      <option value='onPageLoad'>On page load</option>
					    </select>
				        <div> Rank Rank Rank</div>
				        <input placeholder="Rank here" />
				        <div> Enabled or Disabled? </div>
					    <select className="form-control" name='trackingTrigger'>
					      <option value='inHeader'>Enabled</option>
					      <option value='onPageLoad'>Disabled</option>
					    </select>
					  <button className="button button--highlight">Update</button>
					  <button className="button button--highlight">Delete</button>
				    </div>
				)
	}
})

var SidePanelAdding = React.createClass({
	render: function() {
		<div>
		</div>
	}
})



ReactDOM.render(<App />, document.getElementById('root'));
