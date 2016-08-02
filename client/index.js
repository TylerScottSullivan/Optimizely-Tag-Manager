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
    	currentProject: "6668600890",
    	splicedArray: [],
    	sidePanel: {}
    }   
  },

  onAddTag: function() {
  	return null
  },

  onSelect: function(item, rowinfo) {
  	this.setState({
  		sidePanel: rowinfo
  	});
  	console.log(sidePanel);
  },

  onUpdate: function() {
  	return null
  },

  onDelete: function() {
  	return null
  },

  componentDidUpdate: function(nextProps, nextState) {
  },

  componentDidMount: function() {
  	console.log('mounted');
  	var that = this;
  	fetch('/master').then(function(response) {
  		return response.json();
  	}).then(function(r) {
  		console.log(r)
  		that.setState({
  			master: r
  		});
  		console.log(that.state.master)
  	}).catch(function(e) {
  		console.log("Err: ", e);
  	}).then(
		fetch('/download/' + that.state.currentProject).then(function(response) {
  			return response.json();
  		}).then(function(r) {
  			console.log(r, 'downloaded project')
  			that.setState({
  				downloadedProject: r
  			})
  			console.log(that.state.downloadedProject, 'from state')
  		}).catch(function(e) {
  			console.log("Err: " , e);
  		}).then(function(r) {
  			console.log("ere")
  			var newArray = [];
  			var newObj = {};
  			for (var i = 0; i < that.state.downloadedProject.length; i++) {
  				for (var j = 0; j < that.state.master.length; j++) {
  					console.log('here')
  					console.log(that.state.downloadedProject[i].name, that.state.master[j].name)
  					if (that.state.downloadedProject[i].name === that.state.master[j].name) {
  						newObj = $.extend({}, that.state.master[j], that.state.downloadedProject[i])
  						newArray.push(newObj);
  						console.log('merged');
  					}
  				}
  			};
  			console.log(newArray, "newArray");
  			that.setState({
  				splicedArray: newArray
  			})

  			console.log(that.state.splicedArray, "spliced array from state");
		})
	)
  	
  },

  render: function() {
    return (
    	<div> 
			  <div className="tabs tabs--small tabs--sub" data-oui-tabs>
			    <ul className="tabs-nav soft-double--sides">
			      <li className="tabs-nav__item is-active" data-oui-tabs-nav-item>My Tags</li>
			      <li className="tabs-nav__item" data-oui-tabs-nav-item>Available Tags</li>
			    </ul>



			    	//table one
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
				            <th>Experiment</th>
				            <th className="numerical">Numbers</th>
				            <th className="cell-collapse">Status</th>
				          </tr>
				        </thead>
				        <tbody>
				          <tr>
				            <td>Experiment name one</td>
				            <td className="numerical">258</td>
				            <td>Up</td>
				          </tr>
				          <tr className="table-row--active">
				            <td>Experiment name two that runs longer</td>
				            <td className="numerical">19</td>
				            <td>Down</td>
				          </tr>
				          <tr>
				            <td>Experiment name three</td>
				            <td className="numerical">400</td>
				            <td>Up</td>
				          </tr>
				        </tbody>
				      </table>


				      //table two
	  			      <h1 className='header1'> My Tags </h1>
				      <table className="table table--rule table--hover">
				        <thead>
				          <tr>
				            <th className = "cell-collapse">Logo</th>
				            <th>Name</th>
				            <th>Category</th>
				            <th>Called On</th>
				            <th className = "cell-collapse">Rank</th>
				            <th className="cell-collapse">Status</th>
				          </tr>
				        </thead>
				        <tbody>
				          <tr>
				            <td>GA LOGO</td>
				            <td id="row-centered">Universal Analytics</td>
				            <td id="row-centered"> Analytics </td>
				            <td id="row-centered"> Page Load </td>
				            <td id="row-centered"> 1 </td>
				            <td id="row-centered"> Enabled </td>
				          </tr>
				          <tr className="table-row--active">
				            <td>Experiment name two that runs longer</td>
				            <td className="numerical" id="row-centered">19</td>
				            <td id="row-centered">Down</td>
				          </tr>
				          <tr>
				            <td>Experiment name three</td>
				            <td className="numerical" id="row-centered">400</td>
				            <td id="row-centered">Up</td>
				          </tr>
				        </tbody>
				      </table>



				      //table three
				      <h1 className='header1'> My Tags </h1>
				      <table className="table table--rule table--hover">
				        <thead>
				          <tr>
				            <th className = "cell-collapse">Logo</th>
				            <th>Name</th>
				            <th>Category</th>
				            <th>Called On</th>
				            <th className = "cell-collapse">Rank</th>
				            <th className="cell-collapse">Status</th>
				          </tr>
				        </thead>
				        <tbody>
				        	{this.state.splicedArray.map(function(rowinfo, item) {
				        		return <TableColumnMyTags onClick={this.onSelect.bind(this, item, rowinfo)} key={item} name={rowinfo.name} called={rowinfo.trackingTrigger}/>
				        		}.bind(this))
				        	}
				          <tr className="table-row--active">
				            <td>Experiment name two that runs longer</td>
				            <td className="numerical" id="row-centered">19</td>
				            <td id="row-centered">Down</td>
				          </tr>
				          <tr>
				            <td>Experiment name three</td>
				            <td className="numerical" id="row-centered">400</td>
				            <td id="row-centered">Up</td>
				          </tr>
				        </tbody>
				      </table>


				      //table four
	  			      <h1 className='header1'> My Tags </h1>
				      <table className="table table--rule table--hover">
				        <thead>
				          <tr>
				            <th className = "cell-collapse">Logo</th>
				            <th>Name</th>
				            <th>Category</th>
				            <th>Called On</th>
				            <th className = "cell-collapse">Rank</th>
				            <th className="cell-collapse">Status</th>
				          </tr>
				        </thead>
				        <tbody>
				          <tr>
				            <td>GA LOGO</td>
				            <td id="row-centered">Universal Analytics</td>
				            <td id="row-centered"> Analytics </td>
				            <td id="row-centered"> Page Load </td>
				            <td id="row-centered"> 1 </td>
				            <td id="row-centered"> Enabled </td>
				          </tr>
				          <tr className="table-row--active">
				            <td>Experiment name two that runs longer</td>
				            <td className="numerical" id="row-centered">19</td>
				            <td id="row-centered">Down</td>
				          </tr>
				          <tr>
				            <td>Experiment name three</td>
				            <td className="numerical" id="row-centered">400</td>
				            <td id="row-centered">Up</td>
				          </tr>
				        </tbody>
				      </table>



				      //end of tables

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
				            <td id="row-centered"> 1 </td>
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