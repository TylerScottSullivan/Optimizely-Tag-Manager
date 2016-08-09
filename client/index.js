var React = require('react');
var ReactDOM = require('react-dom');
var Modal = require('react-modal');
var moment = require('moment');
var react = require('react-ace');
var Reactable = require('reactable');
import { render } from 'react-dom';
import brace from 'brace';
import AceEditor from 'react-ace';
import 'brace/mode/javascript';
import 'brace/theme/github';
import 'brace/theme/tomorrow';
import Toggle from 'react-toggle';

var _ = require('underscore');
import { Attention } from 'optimizely-oui';
import { Router, Route, IndexRoute, IndexRedirect, Link, IndexLink, hashHistory } from 'react-router'


var Table = Reactable.Table,
    Thead = Reactable.Thead,
    Th = Reactable.Th,
    Tr = Reactable.Tr,
    Td = Reactable.Td,
    unsafe = Reactable.unsafe;


var App = React.createClass({
  getInitialState: function() {
    return {
    	masters: [],
    	downloadedProject: [],
    	currentProject: "6668600890", //this needs to be fetched
    }
  },

  onDownload: function(projects) {
    this.setState({
      downloadedProject: projects
    })
  },

  onMaster: function(master) {
    this.setState({
      masters: master
    })
  },

//this.props.children is referring to the three tags
  render: function() {
    return (
    	<div>
        <Tab/>
        {React.cloneElement(this.props.children, Object.assign({}, this.state, {onDownload: this.onDownload, onMaster: this.onMaster}), null)}
      </div>
    );
  }
});


var Tab = React.createClass({

  render: function() {
    return (
      <div className="tabs tabs--small tabs--sub" data-oui-tabs>
        <ul className="tabs-nav soft-double--sides">
          <Link to="/myTags" activeClassName="is-active" className="tabs-nav__item" ><li className="tabs-nav__item" data-oui-tabs-nav-item>My Tags</li></Link>
          <Link to="/availableTags" activeClassName="is-active" className="tabs-nav__item"><li className="tabs-nav__item" data-oui-tabs-nav-item>Available Tags</li></Link>
          <Link to="/submitNewTemplate" activeClassName="is-active" className="tabs-nav__item"><li className="tabs-nav__item" data-oui-tabs-nav-item>Submit New Template</li></Link>
        </ul>
      </div>
    )
  }
})


const customStyles = {
  content : {
    top                   : '50%',
    left                  : '50%',
    right                 : 'auto',
    bottom                : 'auto',
    marginRight           : '-50%',
    transform             : 'translate(-50%, -50%)',
    height                : '550px',
    width                 : '700px'
  }
};


var SearchBar = React.createClass({
	  getInitialState: function() {
	  	console.log('got initial state')
	    return {
        modalIsOpen: false,
        name: '',
        tagDescription: '',
        fields: '',
        custom: '',
        trackingTrigger: 'inHeader',
        projectId: "6668600890",
        active: false
      };
	  },

	  openModal: function() {
	  	console.log('opened modal')
	    this.setState({modalIsOpen: true});
	  },

	  afterOpenModal: function() {
	    // references are now sync'd and can be accessed.
	    this.refs.subtitle.style.color = '#0081BA';
	  },

	  closeModal: function() {
	    this.setState({modalIsOpen: false});
	  },

    addCustomTag: function() {
      var data = {};
      data.active = this.state.active;
      data.trackingTrigger = this.state.trackingTrigger;
      data.projectId = this.state.projectId;
      data.name = this.state.name;
      data.tagDescription = this.state.tagDescription;
      data.custom = this.state.custom;
      this.setState({modalIsOpen: false});

      return $.ajax({
        url: '/customSnippet',
        type: 'POST',
        data: data,
        success: function(data) {
          console.log('Add custom tag successful')
        },
        error: function(err) {
          console.error("Err posting", err.toString());
        }
      });
    },

    onChange: function(e) {
      var newState = Object.assign({}, this.state);
      newState[e.target.name] = e.target.value;
      this.setState(newState);
    },

    onChangeSnippet: function(newVal) {
        this.setState({
          custom: newVal
        });
    },

	  render: function() {
	    return (
	    	<div>
	        <ul className="flex push-double--ends">
	          <li className="push-triple--right">
	            <div className="button-group">
	              <div> </div>
	              <div className="search">
	                <input type="text" className="text-input text-input--search width--200" placeholder="Filter by Name"/>
	              </div>
	              <button className="button" type="button">Search</button>
	            </div>
	          </li>
	          <li className="anchor--right">
	            <button className="button button--highlight" onClick={this.openModal}>Create Custom Tag</button>
				    <Modal
				      isOpen={this.state.modalIsOpen}
				      onAfterOpen={this.afterOpenModal}
				      onRequestClose={this.closeModal}
				      style={customStyles} >

				      <h2 ref="subtitle">Create Custom Tag</h2>
				      	<div className='modaltext'>
					      <div> Please create your own tag by inserting HTML or Javascript </div>
					      <div className="editor">
					        <AceEditor
					        	className="editor"
  							    mode="javascript"
  							    theme="tomorrow"
  							    name="custom"
  							    height="120px"
  							    width="620px"
  							    editorProps={{$blockScrolling: true}}
                    value={this.state.custom}
                    onChange={this.onChangeSnippet}
                  />
						  </div>
              <div className="flex">
                     <div className="flex--1 sd-headsmall"> Name</div>
                </div>
                <div className="flex--1"> Please add the name of your snippet. </div>
                <input name='name' value={this.state.name} onChange={this.onChange}/>
				   		  <div className="flex">
				               <div className="flex--1 sd-headsmall"> Description</div>
				          </div>
				          <div className="flex--1"> Please add the description of your tag below. </div>
				          <input name='tagDescription' value={this.state.tagDescription} onChange={this.onChange}/>
						    <div className="flex">
				               <div className="flex--1 sd-headsmall"> Called On: </div>
				            </div>
							    <select className="form-control" name='trackingTrigger' value={this.state.trackingTrigger} onChange={this.onChange}>
							      <option value='inHeader'>In header</option>
							      <option value='onPageLoad'>On page load</option>
							    </select>
				            <div className="flex">
				               <div className="flex--1 sd-headsmall"> Enabled or Disabled: </div>
				            </div>
						    <select className="form-control" name='active' value={this.state.active} onChange={this.onChange}>
						      <option value='inHeader'>Enabled</option>
						      <option value='onPageLoad'>Disabled</option>
						    </select>
						  </div>
						  <div className='flex space-between'>
							  <button className="button button--highlight" onClick={this.addCustomTag}> Add Custom Tag </button>
						    <button className="button button--highlight" onClick={this.closeModal}> Close </button>
					    </div>
				    </Modal>
	          </li>
	        </ul>
	      </div>
	    )
	  }
})

var MyTagsPage = React.createClass({
  getInitialState: function() {
    return {
      splicedArray: [], //merge master templates and the downloaded project
      sidePanel: {},
      currentProject: "6668600890",
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
        if (this.state.downloadedProject[i].name === 'custom') {
          newArray.push(this.state.downloadedProject[i])
        }
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
      console.log('newArrayyy', this.state.splicedArray)

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
    console.log('splicedArray', this.state.splicedArray)
    console.log('my sidepanelll', this.state.sidePanel)
    return (
      <div className="flex height--1-1">
        <MyTableContent splicedArray={this.state.splicedArray} onSelect={this.onSelect}/>
        <MySidePanel info={this.state.sidePanel} />
      </div>
    )
  }
})

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
    console.log(rowinfo, "rowinfo")
    console.log(this.state.sidePanel, " sidePanel in state");
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


var MyTableContent = React.createClass({

  componentDidMount: function() {
  	this.tableSort();
  },

  componentDidUpdate: function() {
  	this.tableSort();
  },

  tableSort: function() {
  	  	$(this.refs.myTable).tablesorter();
  },

  render: function() {
    console.log('my table content splicedArray', this.props.splicedArray)
    return (
     	<div className="flex--1 soft-double--sides">
     	<SearchBar value={this.props.splicedArray}/>
        <h1 className='header1'> My Tags </h1>
        <table className="table table--rule table--hover myTable" ref='myTable'>
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
            {//key is for adjacent elements in react to distinguish
              this.props.splicedArray.map((rowinfo, item) => {
                return <MyTableRow onSelect={() => this.props.onSelect(item, rowinfo)} key={item} rowinfo={rowinfo}/>
              })
            }
          </tbody>
        </table>
      </div>
    )
  }
})

var AvailableTableContent = React.createClass({

  componentDidMount: function() {
  	  	console.log('availabletablecontent mounted')
  	  	console.log(this.props, "props for availabltable content")
  	this.tableSort();
  },

  componentDidUpdate: function() {
  	this.tableSort();
  },

  tableSort: function() {
  	  	$(this.refs.AvTable).tablesorter();
  },

  render: function() {
  	console.log("[AvailableTableContent props]", this.props.splicedArray);
    return (
     	<div className="flex--1 soft-double--sides">
     	<SearchBar/>
        <h1 className='header1'> Available Tags </h1>
        <table className="table table--rule table--hover myTable" ref='AvTable'>
          <thead>
            <tr>
              <th className = "cell-collapse">Logo</th>
              <th>Name</th>
              <th>Category</th>
              <th className="cell-collapse">&nbsp;&nbsp;Status</th>
            </tr>
          </thead>
          <tbody>
            {//key is for adjacent elements in react to distinguish
              this.props.splicedArray.map((rowinfo, item) => {
                return <AvailableTableRow onSelect={() => this.props.onSelect(item, rowinfo)} key={item} rowinfo={rowinfo}/>
              })
            }
          </tbody>
        </table>
      </div>
    )
  }
})

var MyTableRow = React.createClass({
	render: function() {
		console.log(this.props, "props")
		return (
   		 <tr onClick={this.props.onSelect}>
          <td id="row-centered"> <img src={this.props.rowinfo.logo}/></td>
          <td id="row-centered">{this.props.rowinfo.displayName}</td>
          <td id="row-centered">{this.props.rowinfo.category} </td>
          <td id="row-centered">{this.props.rowinfo.called} </td>
          <td id="row-centered"> Enabled </td>
       </tr>
    )
	}
})

var AvailableTableRow = React.createClass({
	render: function() {
	  	console.log('availabletablerow mounted')
		console.log(this.props, "props for availabletablerow")
		return (
   		 <tr onClick={this.props.onSelect}>
          <td id="row-centered"> <img src={this.props.rowinfo.logo}/></td>
          <td id="row-centered">{this.props.rowinfo.displayName}</td>
          <td id="row-centered">{this.props.rowinfo.category} </td>
          {this.props.rowinfo.added ? 
            <td id="row-centered" align="center"> &nbsp; Added </td>
            :
            <td id="row-centered" align="center"> Unadded </td>
          }

       </tr>
    )
	}
})

var MySidePanel = React.createClass({

  getInitialState: function() {
    return {
      info: this.props.info,
      fields: this.props.info.fields,
      projectId: "6668600890",
      trackingTrigger: 'inHeader',
      active: 'true',
      tagId: this.props.info._id
    };
  },

  componentWillReceiveProps: function(nextProps) {
    if (nextProps.info) {
      this.setState({
        info: nextProps.info,
        fields: nextProps.info.fields
      })
    }
  },

  onUpdateTag: function() {
    var data = {};

    data.fields = this.state.fields.map(function(field){
    	var returnfield = {};
    	returnfield[field.name] = field.value;
    	return returnfield;
    })

    data.active = this.state.active;
    data.trackingTrigger = this.state.trackingTrigger;
    data.projectId = this.state.projectId;
    console.log('updating tag', data)

    return $.ajax({
      url: '/updatetag/' + this.props.info._id,
      type: 'POST',
      data: data,
      success: function(data) {
        console.log('Update tag successful')},
      error: function(err) {
        console.error("Err posting", err.toString());
      }
    });
  },

  onDelete: function() {
    return $.ajax({
      url: '/deletetag/' + this.props.info._id,
      type: 'POST',
      // data: {},
      success: function(data) {
        console.log('delete tag successful')},
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
			     	<h2 className="push-double--bottom sp-headbig">TAG DETAILS</h2>
			      	<div className="flex">
				    	<div> <img className='sidepanel-logo' src={this.state.info.logo}/> </div>
				    	<div className='flex flex-v-center'>
				      		<div className = 'sidepanel-displayname'> {this.state.info.displayName} </div>
				     	</div>
		        	</div>
		        	<div className='sd-headsmall deschead'> DESCRIPTION </div>
	            	<div className='tagdesc'>{this.state.tagDescription}</div>
	            	<label className="label label--rule">
	            	</label>
			        {this.state.fields.map(function(field, item) {
			        	return <MyInputFields key={item} field={field} value={this.state.fields[item].value} onChange={this.onChangeTokens.bind(this, item)}/>
			        }.bind(this))}
		            <div className="flex">
		               <div className="flex--1 sd-headsmall"> Called On: </div>
		            </div>
				    <select className="form-control" name='trackingTrigger' value={this.state.trackingTrigger} onChange={this.onChange}>
				      <option value='inHeader'>In header</option>
				      <option value='onPageLoad'>On page load</option>
				    </select>
		            <div className="flex">
		               <div className="flex--1 sd-headsmall"> Enabled or Disabled: </div>
		            </div>
            <select className="form-control" name='active' value={this.state.active} onChange={this.onChange}>
              <option value={true}>Enabled</option>
              <option value={false}>Disabled</option>
            </select>
				    <div>
				    	<button className="btn-uniform-add button button--highlight" onClick={this.onUpdateTag}>Update Tag</button>
					</div>
					<div>
						<button className="btn-uniform-del button button--highlight" onClick={this.onDelete}>Delete</button>
			  		</div>
			  </div>
			)
		} else {
			return <div> </div>;
		}
	}
})


var AvailableSidePanel = React.createClass({
  getInitialState: function() {
    return {
      info: this.props.info,
      tokens: this.props.info.tokens,
      projectId: "6668600890",
      trackingTrigger: 'inHeader',
      active: true
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

    this.state.tokens.map(function(token){
      data[token.tokenName] = token.value
    })
    data.active = this.state.active;
    data.trackingTrigger = this.state.trackingTrigger;
    data.projectId = this.state.projectId;
    data.type = this.props.info.name;
    data.tagDescription = this.props.info.tagDescription;
    data.custom = this.props.info.custom;
    data.hasCallback = this.props.info.hasCallback;
    data.callBacks = this.props.info.callBacks;
    console.log('dataaaaa', data)

    return $.ajax({
      url: '/' + window.location.search,
      type: 'POST',
      data: data,
      success: function(data) {
        console.log('Add tag successful');
        this.props.onDownload(this.props.downloadedProjects.concat(data));
      }.bind(this),
      error: function(err) {
        console.error("Err posting", err.toString());
      }
    });
  },

  onChangeTokens: function(index, e) {
    var tokens = this.state.tokens;
    tokens[index].value = e.target.value;
    this.setState({
    	tokens: tokens
    });
  },

//this change the enable and triggers
  onChange: function(e) {
    console.log(e, "e")
    if (e.target.name === "active") {
      if (this.state.active === false) {
        this.setState({
          active: true
        })
      } else if (this.state.active === true) {
        this.setState({
          active: false
        })
      } 
    } else {
      var newState = Object.assign({}, this.state);
      newState[e.target.name] = e.target.value;
      this.setState(newState);
    }
    console.log(this.state, "state of available panels page")
  },

	render: function() {
    console.log(this.props, "props for available side panel")
		if (Object.keys(this.props.info).length !== 0) {
			return (
				<div className="sidepanel background--faint">
			     	<h2 className="push-double--bottom sp-headbig">TAG DETAILS</h2>
			      	<div className="flex">
				    	<div> <img className='sidepanel-logo' src={this.props.info.logo}/> </div>
				    	<div className='flex flex-v-center'>
				      		<div className = 'sidepanel-displayname'> {this.props.info.displayName} </div>
				     	</div>
		        	</div>
		        	<div className='sd-headsmall deschead'> DESCRIPTION </div>
	            	<div className='tagdesc'>{this.props.info.tagDescription}</div>
	            	<label className="label label--rule">
	            	</label>
			        {this.state.tokens.map(function(token, item) {
			        	return <AvailableInputFields key={item} token={token} onChange={this.onChangeTokens.bind(this, item)}/>
			        }.bind(this))}
		            <div className="flex">
		               <div className="flex--1 sd-headsmall"> Called On: </div>
		            </div>
				    <select className="form-control" name='trackingTrigger' value={this.state.trackingTrigger} onChange={this.onChange}>
				      <option value='inHeader'>In header</option>
				      <option value='onPageLoad'>On page load</option>
				    </select>
            <div className="flex togglebutton">
  		        {this.state.active === true ?    
                  <div>      
                    <button className="button button--highlight" name='active' onClick={this.onChange}>Enabled</button>
                    <button className="button" name='active' onClick={this.onChange}>Disabled</button>
                  </div>
               :
                  <div>
                    <button className="button" name='active' onClick={this.onChange}>Enabled</button>
                    <button className="button button--highlight" name='active' onClick={this.onChange}>Disabled</button>
                  </div>
                }
            </div>
            {this.props.info.added === true ? 
                  <div> 
                    <div>
                      <button className="btn-uniform-add button button--highlight" disabled>Add Tag</button>
                    </div>
                    <div className="greenbox">
                      This tag has now been added to 'My Tags.' Go to 'My Tags' to Update, Delete, or Disable this tag.
                    </div>
                  </div>
              :
                  <div>
                    <button className="btn-uniform-add button button--highlight" onClick={this.onAddTag}>Add Tag</button>
                  </div>
            }
			  </div>
			)
		} else {
			return <div>

				<div className="sidepanel background--faint">
			     	<h2 className="push-double--bottom sp-headbig">TAG DETAILS</h2>
					<div> Select a Tag to add to My Tags. </div>
			  	</div>
			</div>;
		}
	}
})

var MyInputFields = React.createClass({
	render: function () {
		console.log(this.props, "props")
		return (
			<div>
	            <div className="flex">
	               <div className="flex--1 sd-headsmall">{this.props.field.tokenName}</div>
	            </div>
		        <div> {this.props.field.description} <a href={this.props.field.learnmorelink} target="_blank"> Learn More. </a> </div>
		        <input className='text-input width--200 text-input-styled' placeholder={this.props.field.placeholder} value={this.props.field.value} onChange={this.props.onChange}/>
		    </div>
		)
	}
})


var AvailableInputFields = React.createClass({
	render: function () {
		console.log(this.props, "props for available input fields")
		return (
			<div>
	          <div className="flex">
	               <div className="flex--1 sd-headsmall">{this.props.token.tokenDisplayName}</div>
	            </div>
		        <div> {this.props.token.tokenDescription} <a href={this.props.token.learnmorelink} target="_blank"> Learn More. </a> </div>
		        <input className='text-input width--200 text-input-styled' placeholder={this.props.token.placeholder} value={this.props.token.value} onChange={this.props.onChange}/>
		    </div>
		)
	}
})

var NewTemplate = React.createClass({
  getInitialState: function() {
    return {
      active: null,
      type: null,
      displayName: null,
      discription: null,
      tokenName: null,
      tokenDisplayName: null,
      tokenDescription: null,
      custom: null,
      hascallback: null,
      projectId: "6668600890",
    };
  },

  onChangeTokens: function(index, e) {
    var tokens = this.state.tokens;
    tokens[index].value = e.target.value;
    this.setState({
      tokens: tokens
    });
  },

//this change the enable and triggers
  onChange: function(e) {
    var newState = Object.assign({}, this.state);
    newState[e.target.name] = e.target.value;
    this.setState(newState);
  },

  onSubmit: function() {
    var data = {};
    // console.log("[state]", this.state);
    // console.log("[info]", this.props.info);
    this.state.tokens.map(function(token){
      data[token.tokenName] = token.value
    })
    data.active = this.state.active;
    data.trackingTrigger = this.state.trackingTrigger;
    data.projectId = this.state.projectId;
    data.type = this.props.info.name;
    data.tagDescription = this.props.info.tagDescription;
    data.custom = this.props.info.custom;
    data.hasCallback = this.props.info.hasCallback;
    data.callBacks = this.props.info.callBacks;
    console.log('dataaaaa', data)

    return $.ajax({
      url: '/' + window.location.search,
      type: 'POST',
      data: data,
      success: function(data) {
        console.log('Add tag successful');

      },
      error: function(err) {
        console.error("Err posting", err.toString());
      }
    })
  },

  //change the language later
	render: function () {
		return (
      <form method='post'>
       <div className="form-group">
         <div className="flex--1 sd-headsmall">Enter a name for snippet (please don not include spaces):</div>
         <input type="text" className="text-input width--200 text-input-styled" name='type' />
       </div>
       <div className="form-group">
         <div className="flex--1 sd-headsmall">Enter display name for snippet:</div>
         <input type="text" className="text-input width--200 text-input-styled" name='displayName'/>
       </div>
       <div className="form-group">
         <div className="flex--1 sd-headsmall">Enter description for snippet:</div>
         <input type="text" className="text-input width--200 text-input-styled" name='description'/>
       </div>
       <div className="form-group">
         <div className="flex--1 sd-headsmall">Enter a token name, code 123456789:</div>
         <input type="text" className="text-input width--200 text-input-styled" name='tokenName'/>
       </div>
       <div className="form-group">
         <div className="flex--1 sd-headsmall">Enter a token display name, code 123456789:</div>
         <input type="text" className="text-input width--200 text-input-styled" name='tokenDisplayName' />
       </div>
       <div className="form-group">
         <div className="flex--1 sd-headsmall">Enter a token description, code 123456789:</div>
         <input type="text" className="text-input width--200 text-input-styled" name='tokenDescription'/>
       </div>
       <div className="form-group">
         <div className="flex--1 sd-headsmall">Does your snippet take any callback?</div>
         <select className="form-control" name='hasCallback' value={this.state.hasCallback} onChange={this.onChange}>
           <option value='yes'>Yes</option>
           <option value='no'>No</option>
         </select>
       </div>
       <div className="form-group">
         <div className="flex--1 sd-headsmall">Your callback code is abcdefg:</div>
       </div>
       <div className="form-group">
       <div for="comment" className="flex--1 sd-headsmall">Enter your code</div>
         <div className="editor">
           <AceEditor
             className="editor text-input width--200 text-input-styled"
             mode="javascript"
             theme="tomorrow"
             name="custom"
             height="1000px"
             width="600px"
             editorProps={{$blockScrolling: true}}
             id="comment"
           />
        </div>
       </div>
       <button type="submit" onClick={this.onSubmit} className="btn-uniform-add button button--highlight">Submit</button>
      </form>
		)
	}
})


ReactDOM.render((
  <Router history={hashHistory}>
    <Route path="/" component={App}>
      <IndexRedirect to="/myTags" />
      <Route path="/myTags" component={MyTagsPage}/>
      <Route path="/availableTags" component={AvailableTagsPage}/>
      <Route path="/submitNewTemplate" component={NewTemplate}/>
    </Route>
  </Router>
), document.getElementById('root'))
