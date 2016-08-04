var React = require('react');
var ReactDOM = require('react-dom');
var moment = require('moment');
var _ = require('underscore');
import { Button, Table } from 'optimizely-oui';
import { Router, Route, IndexRoute, Link, hashHistory } from 'react-router'

var App = React.createClass({
  getInitialState: function() {
    return {
    	masters: [],
    	downloadedProject: [],
    	currentProject: "6668600890", //this needs to be fetched
    }
  },

  onAddTag: function() {
    //save information for the tag
    // call POST '/'
  	return null
  },

  render: function() {

    return (
    	<div>
        <Tab/>
        <SearchBar/>
        {/* add this */}
        {this.props.children}
      </div>
    );
  }
});


var Tab = React.createClass({
  render: function() {
    return (
      <div className="tabs tabs--small tabs--sub" data-oui-tabs>
        <ul className="tabs-nav soft-double--sides">
          <Link to="/myTags" activeClassName="is-active" className="tabs-nav__item"><li className="tabs-nav__item" data-oui-tabs-nav-item>My Tags</li></Link>
          <Link to="/availableTags" activeClassName="is-active" className="tabs-nav__item"><li className="tabs-nav__item" data-oui-tabs-nav-item>Available Tags</li></Link>
          <Link to="/createTag" activeClassName="is-active" className="tabs-nav__item"><li className="tabs-nav__item" data-oui-tabs-nav-item>Create Tag</li></Link>
        </ul>
        {/* add this */}
        {this.props.children}
      </div>
    )
  }
})

var SearchBar = React.createClass({
  render: function() {
    return (
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
      </div>
    )
  }
})

var MyTagsPage = React.createClass({
  getInitialState() {
    return {
      splicedArray: [], //merge master templates and the downloaded project
    	sidePanel: {},
      currentProject: "6668600890",
      master: [],
    }
  },
  componentDidMount() {
    fetch('http://localhost:4001/master')
    .then((response) => response.json())
    .then(response =>{
  		this.setState({
  			master: response
  		});
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
					if (this.state.downloadedProject[i].name === this.state.master[j].name) {
						newObj = $.extend({}, this.state.master[j], this.state.downloadedProject[i])
						newArray.push(newObj);
					}
				}
			};
			this.setState({
				splicedArray: newArray
			})
      console.log('splicedArray', this.state.splicedArray)
		}).catch((e) => {
      		console.log("Err: " , e);
    })
  },

  onSelect: function(item, rowinfo) {
    this.setState({
      sidePanel: rowinfo //this is an object
    });
    console.log('sidePanel', this.state.sidePanel)
  },

  render: function() {
    return (
      <div className="flex height--1-1">
        <MyTableContent splicedArray={this.state.splicedArray} onSelect={this.onSelect}/>
        <MySidePanel info={this.state.sidePanel} />
      </div>
    )
  }
})

var AvailableTagsPage = React.createClass({
  getInitialState() {
    return {
      splicedArray: [],
    	sidePanel: {},
      currentProject: "6668600890",
      master: [],
      downloadedProject: []
    }
  },
  componentDidMount() {
    fetch('http://localhost:4001/master')
    .then((response) => response.json())
    .then(response => {
      this.setState({
        master: response
      })
		})
    .then(() => fetch('http://localhost:4001/download/' + this.state.currentProject))
    .then(response => response.json())
    .then((r) => {
      this.setState({
        downloadedProject: r
      })
      var availableTags = this.state.master.slice();
      for (var j = 0; j < this.state.downloadedProject.length; j++) {
        for (var i = 0; i < availableTags.length; i++) {
          if (availableTags[i].name === this.state.downloadedProject[j].name) {
            availableTags.splice(i, 1)
          }
        }
      };
      this.setState({
        splicedArray: availableTags
      })
    }).catch((e) => {
      console.log("Err: " , e);
    })
  },

  onSelect: function(item, rowinfo) {
    this.setState({
      sidePanel: rowinfo
    });
    console.log(rowinfo, "rowinfo")
    console.log(this.state.sidePanel, " sidePanel in state");
  },

  render() {
    return (
      <div className="flex height--1-1">
        <AvailableTableContent splicedArray={this.state.splicedArray} onSelect={this.onSelect}/>
        <AvailableSidePanel info={this.state.sidePanel} />
      </div>
    )
  }
})

var MyTableContent = React.createClass({

  render: function() {
    return (
      <div>
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
            {
              this.props.splicedArray.map((rowinfo, item) => {
                return <MyTableColumn onSelect={this.props.onSelect.bind(this, item, rowinfo)} key={item} name={rowinfo.name} called={rowinfo.trackingTrigger}/>
              })
            }
          </tbody>
        </table>
      </div>
    )
  }
})

var AvailableTableContent = React.createClass({

  render: function() {
    return (
      <div>
        <h1 className='header1'> Available Tags </h1>
        <table className="table table--rule table--hover">
          <thead>
            <tr>
              <th className = "cell-collapse">Logo</th>
              <th>Name</th>
              <th>Category</th>
              <th className="cell-collapse">Status</th>
            </tr>
          </thead>
          <tbody>
            {
              this.props.splicedArray.map((rowinfo, item) => {
                return <AvailableTableColumn onSelect={this.props.onSelect.bind(this, item, rowinfo)} key={item} name={rowinfo.name} called={rowinfo.trackingTrigger}/>
              })
            }
          </tbody>
        </table>
      </div>
    )
  }
})

var MyTableColumn = React.createClass({
	render: function() {
		return (
   		 <tr onClick={this.props.onSelect}>
          <td id="row-centered">GA LOGO</td>
          <td id="row-centered">{this.props.name}</td>
          <td id="row-centered"> Analytics </td>
          <td id="row-centered">{this.props.called} </td>
          <td id="row-centered"> Enabled </td>
       </tr>
    )
	}
})

var AvailableTableColumn = React.createClass({
	render: function() {
		return (
   		 <tr onClick={this.props.onSelect}>
          <td id="row-centered">GA LOGO</td>
          <td id="row-centered">{this.props.name}</td>
          <td id="row-centered"> Analytics </td>
          <td id="row-centered"> Enabled </td>
       </tr>
    )
	}
})


var MySidePanel = React.createClass({

  getInitialState: function() {
    return {
      info: null,
      tokens: [],
      projectId: "6668600890",
      trackingTrigger: 'inHeader',
      active: false,
      tagId: null
    };
  },

  componentWillReceiveProps: function(nextProps) {
    if (nextProps.info) {
      this.setState({
        info: nextProps.info,
        tokens: nextProps.info.tokens
      })
    }
  },

  onUpdateTag: function() {
    var data = {};
    this.state.tokens.map(function(token){
      data[token.tokenName] = token.value
    })
    data.active = this.state.active;
    data.trackingTrigger = this.state.trackingTrigger;
    data.name = this.props.info.name;
    data.tagDescription = this.props.info.tagDescription;
    data.custom = this.props.info.custom;
    data.projectId = this.state.projectId;
    data.hasCallback = this.props.info.hasCallback;
    data.callBacks = this.props.info.callBacks;
    data.approved = true;
    console.log('dataaaaa', data)

    return $.ajax({
      url: '/updatetag:' + this.state.tagId,
      type: 'POST',
      data: data,
      success: function(data) {
        console.log('Add tag successful')},
      error: function(err) {
        console.error("Err posting", err.toString());
      }
    });
  },

  onDelete: function() {
    //delete a tag
    // POST 'deletetag/:tagid'
    return $.ajax({
      url: '/',
      type: 'deletetag/' + this.state.tagId,
      data: data,
      success: function(data) {
        console.log('delete tag successful')},
      error: function(err) {
        console.error("Err posting", err.toString());
      }.bind(this)
    });
  },


  onChangeTokens: function(field, e) {
    var newState = Object.assign({}, this.state);
    newState.tokens[field].value = e.target.value;
    this.setState(newState);
  },

//this change the enable and triggers
  onChange: function(e) {
    var newState = Object.assign({}, this.state);
    newState[e.target.name] = e.target.value;
    this.setState(newState);
  },

  render: function() {
    if (Object.keys(this.props.info).length !== 0) {
      return (
        <div className="sidepanel background--faint">
            <h2 className="push-double--bottom">Experiment Details</h2>
            <div>{this.props.info.name} </div>
            <div>{this.props.info.tagDescription}</div>
            <label className="label label--rule">
            </label>
              {this.state.tokens.map(function(field, index) {
                return <MyInputFields key={index} field={field} onChange={this.onChangeTokens.bind(this, index)}/>
              }.bind(this))}
            <div>Called on: </div>
            <select className="form-control" name='trackingTrigger' value={this.state.trackingTrigger} onChange={this.onChange}>
              <option value='inHeader'>In header</option>
              <option value='onPageLoad'>On page load</option>
            </select>
            <div>Enabled or Disabled? </div>
            <select className="form-control" name='active' value={this.state.active} onChange={this.onChange}>
              <option value='Enabled'>Enabled</option>
              <option value='Disabled'>Disabled</option>
            </select>
          <button className="button button--highlight" onClick={this.onAddTag}>Add</button>
        </div>
      )
    } else {
      return <div> </div>;
    }
  }
});


var AvailableSidePanel = React.createClass({
  getInitialState: function() {
    return {
      info: null,
      tokens: [],
      projectId: "6668600890",
      trackingTrigger: 'inHeader',
      active: false
    };
  },

  componentWillReceiveProps: function(nextProps) {
    if (nextProps.info) {
      this.setState({
        info: nextProps.info,
        tokens: nextProps.info.tokens
      })
    }
  },

  onAddTag: function() {
    var data = {};
    console.log("[state]", this.state);
    console.log("[info]", this.props.info);
    this.state.tokens.map(function(token){
      data[token.tokenName] = token.value
    })
    data.active = this.state.active;
    data.trackingTrigger = this.state.trackingTrigger;
    data.name = this.props.info.name;
    data.tagDescription = this.props.info.tagDescription;
    data.custom = this.props.info.custom;
    data.projectId = this.state.projectId;
    data.hasCallback = this.props.info.hasCallback;
    data.callBacks = this.props.info.callBacks;
    data.approved = true;
    console.log('dataaaaa', data)

    return $.ajax({
      url: '/',
      type: 'POST',
      data: data,
      success: function(data) {
        console.log('Add tag successful')},
      error: function(err) {
        console.error("Err posting", err.toString());
      }
    });
  },

  onChangeTokens: function(field, e) {
    var newState = Object.assign({}, this.state);
    newState.tokens[field].value = e.target.value;
    this.setState(newState);
  },

//this change the enable and triggers
  onChange: function(e) {
    var newState = Object.assign({}, this.state);
    newState[e.target.name] = e.target.value;
    this.setState(newState);
  },

	render: function() {
		if (Object.keys(this.props.info).length !== 0) {
			return (
				<div className="sidepanel background--faint">
			      <h2 className="push-double--bottom">Experiment Details</h2>
			      <div>{this.props.info.name} </div>
            <div>{this.props.info.tagDescription}</div>
            <label className="label label--rule">
            </label>
			        {this.state.tokens.map(function(field, index) {
			        	return <AvailableInputFields key={index} field={field} onChange={this.onChangeTokens.bind(this, index)}/>
			        }.bind(this))}
			      <div>Called on: </div>
				    <select className="form-control" name='trackingTrigger' value={this.state.trackingTrigger} onChange={this.onChange}>
				      <option value='inHeader'>In header</option>
				      <option value='onPageLoad'>On page load</option>
				    </select>
			      <div>Enabled or Disabled? </div>
				    <select className="form-control" name='active' value={this.state.active} onChange={this.onChange}>
				      <option value='Enabled'>Enabled</option>
				      <option value='Disabled'>Disabled</option>
				    </select>
				  <button className="button button--highlight" onClick={this.onAddTag}>Add</button>
			  </div>
			)
		} else {
			return <div> </div>;
		}
	}
});

var MyInputFields = React.createClass({
	render: function () {
		return (
				<div>
				    <label className="label label--rule">
		            <div className="flex">
		               <div className="flex--1">{this.props.field.name}</div>
		            </div>
			        <div> {this.props.field.description} </div>
			        <input placeholder={this.props.field.value} />
              </label>
		    </div>
		)
	}
})

var AvailableInputFields = React.createClass({
	render: function () {
		return (
				<div>
				    <label className="label label--rule">
		            <div className="flex">
		               <div className="flex--1">{this.props.field.tokenName}</div>
		            </div>
			        <div> {this.props.field.description} </div>
			        <input value={this.props.field.value} onChange={this.props.onChange}/>
              </label>
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


ReactDOM.render((
  <Router history={hashHistory}>
    <Route path="/" component={App}>
      {/* make them children of `App` */}
      <Route path="/myTags" component={MyTagsPage}/>
      <Route path="/availableTags" component={AvailableTagsPage}/>
      <Route path="/createTag" component={AvailableTagsPage}/>
    </Route>
  </Router>
), document.getElementById('root'))
