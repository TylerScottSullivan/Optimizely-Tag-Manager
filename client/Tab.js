var React = require('react');
import { Router, Route, IndexRoute, IndexRedirect, Link, IndexLink, hashHistory } from 'react-router'


var Tab = React.createClass({
  render: function() {
    return (
      <div className="tabs tabs--small tabs--sub" data-oui-tabs>
        <ul className="tabs-nav soft-double--sides">
          <Link to="/myTags" activeClassName="is-active" className="tabs-nav__item">
            <li className="tabs-nav__item" data-oui-tabs-nav-item> My Tags </li>
          </Link>
          <Link to="/availableTags" activeClassName="is-active" className="tabs-nav__item">
            <li className="tabs-nav__item" data-oui-tabs-nav-item>Available Tags</li>
          </Link>
          <Link to="/submitNewTemplate" activeClassName="is-active" className="tabs-nav__item">
            <li className="tabs-nav__item" data-oui-tabs-nav-item>Submit New Template</li>
          </Link>
        </ul>
      </div>
    )
  }
})

module.exports = Tab;
