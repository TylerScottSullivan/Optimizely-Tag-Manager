var React = require('react');
var ReactDOM = require('react-dom');
var Modal = require('react-modal');
// var moment = require('moment');
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
var Tab = require('./Tab');
var SearchBar = require('./SearchBar');
var MyTagsPage = require('./MyTagsPage');
var AvailableTagsPage = require('./AvailableTagsPage');
var NewTemplate = require('./NewTemplate');

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
    	currentProject: "6919181723", //this needs to be fetched
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
