var React = require('react');
var ReactDOM = require('react-dom');
var Modal = require('react-modal');

// code editor
var react = require('react-ace');

// react table that has not been implemented for sorting and filtering
var Reactable = require('reactable');
import { render } from 'react-dom';

//code editor imports
import brace from 'brace';
import AceEditor from 'react-ace';
import 'brace/mode/javascript';
import 'brace/theme/github';
import 'brace/theme/tomorrow';

// i don't think we use this either
import Toggle from 'react-toggle';

var _ = require('underscore');

// we don't use oui react components but here it is
import { Attention } from 'optimizely-oui';

// react router obviously
import { Router, Route, IndexRoute, IndexRedirect, Link, IndexLink, hashHistory } from 'react-router'

// tab routing with react router
var Tab = require('./Tab');
var SearchBar = require('./SearchBar');
var MyTagsPage = require('./MyTagsPage');
var AvailableTagsPage = require('./AvailableTagsPage');
var NewTemplate = require('./NewTemplate');
var SubmitNew = require('./SubmitNew');

// react table stuff we don't use
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
    	downloadedProject: []
    }
  },

  // function to refresh/update state when called in other components
  onDownload: function(projects) {
    this.setState({
      downloadedProject: projects
    })
  },

  // function to refresh/update state when called in other components but never called i think
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
        {/* passes functions into tabs as props*/}
        {React.cloneElement(this.props.children, Object.assign({}, this.state, {onDownload: this.onDownload, onMaster: this.onMaster}), null)}
      </div>
    );
  }
});

// styles for modal
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


// react router
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
